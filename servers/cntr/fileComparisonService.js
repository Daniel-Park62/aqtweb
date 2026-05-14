import express from 'express';
import jobs from '../model/jobs.js';
import { getSshConnection, executeSshCommand } from './sshManager.js';

const router = express.Router();

/**
 * GET /jobs/ids
 * 저장된 모든 고유 job_id 목록을 반환합니다.
 */
router.get('/jobs/ids', async (req, res) => {
    try {
        const results = await jobs.getAllJobIds();
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Job ID 목록 조회 중 오류 발생', error: error.message });
    }
});

/**
 * GET /jobs/dates
 * 특정 job_id에 대한 실행 날짜 목록(id 포함)을 반환합니다.
 */
router.get('/jobs/dates', async (req, res) => {
    const { jobId } = req.query;
    if (!jobId) {
        return res.status(400).json({ message: 'jobId 파라미터가 필요합니다.' });
    }

    try {
        const rows = await jobs.getJobDates(jobId);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: '실행 날짜 조회 중 오류 발생', error: error.message });
    }
});

/**
 * GET /jobs/compare
 * 두 job 실행(jobId1, jobId2) 간의 파일 변경 사항을 비교합니다.
 */
router.get('/jobs/compare', async (req, res) => {
    const { jobId1, tableSelect1, jobId2, tableSelect2 } = req.query;
    if (!jobId1 || !tableSelect1 || !jobId2 || !tableSelect2) {
        return res.status(400).json({ message: '비교할 두 개의 job ID와 각각의 테이블 이름(jobId1, tableSelect1, jobId2, tableSelect2)이 필요합니다.' });
    }

    try {
        const [files1, files2] = await Promise.all([
            jobs.getFilesForComparison(tableSelect1, jobId1),
            jobs.getFilesForComparison(tableSelect2, jobId2)
        ]);

        res.json({ files1, files2 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '파일 비교 중 오류 발생', error: error.message });
    }
});

/**
 * POST /get-file-content
 * 원격 서버의 파일 내용을 가져옵니다.
 */
router.post('/get-file-content', async (req, res) => {
    const { host, port, username, password, filePath } = req.body;
    if (!host || !username || !password || !filePath) {
        return res.status(400).json({ error: '필수 파라미터(host, username, password, filePath)가 누락되었습니다.' });
    }

    // 보안을 위해 filePath에 ../ 같은 경로 조작 문자가 있는지 확인
    if (filePath.includes('..')) {
        return res.status(400).json({ error: '잘못된 파일 경로입니다.' });
    }

    try {
        const sshConn = await getSshConnection(req.body);
        const { output, code } = await executeSshCommand(sshConn, `cat "${filePath}"`);
        if (code !== 0) throw new Error(`파일 내용을 읽는 데 실패했습니다 (종료 코드: ${code}).`);
        res.json({ content: output });
    } catch (error) {
        res.status(500).json({ error: `파일 내용 조회 중 오류 발생: ${error.message}` });
    }
});

/**
 * POST /download-files
 * 원격 서버의 파일들을 압축(tar.gz)하여 스트리밍 다운로드합니다.
 */
router.post('/download-files', async (req, res) => {
    const { host, port, username, password, filePaths } = req.body;

    if (!host || !username || !password || !filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
        return res.status(400).json({ error: '필수 파라미터(host, username, password, filePaths)가 누락되었거나 유효하지 않습니다.' });
    }

    try {
        const sshConn = await getSshConnection(req.body);

        const tarCommand = 'tar -czf - -T -';

        sshConn.exec(tarCommand, (err, stream) => {
            if (err) throw err;

            res.setHeader('Content-Type', 'application/gzip');
            res.setHeader('Content-Disposition', 'attachment; filename="Patch_files.tar.gz"');

            stream.pipe(res);

            stream.on('close', (code, signal) => {
                if (code !== 0) {
                    console.error(`Tar command failed with code ${code}`);
                }
                res.end();
            });

            stream.stderr.on('data', (data) => {
                console.error('STDERR: ' + data);
            });

            const fileListInput = filePaths.join('\n');
            stream.write(fileListInput);
            stream.end();
        });

    } catch (error) {
        console.error('Download error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: `파일 다운로드 중 오류 발생: ${error.message}` });
        }
    }
});

/**
 * POST /get-bulk-file-contents
 * 여러 파일의 내용을 JSON 형태로 반환합니다. (텍스트 파일 가정)
 */
router.post('/get-bulk-file-contents', async (req, res) => {
    const { host, port, username, password, filePaths } = req.body;

    if (!host || !username || !password || !filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
        return res.status(400).json({ error: '필수 파라미터(host, username, password, filePaths)가 누락되었거나 유효하지 않습니다.' });
    }

    const uniquePaths = [...new Set(filePaths)];
    const results = {};

    try {
        const conn = await getSshConnection(req.body);

        for (const filePath of uniquePaths) {
            if (filePath.includes('..')) {
                results[filePath] = "Error: Invalid path";
                continue;
            }

            try {
                const cmd = `cat "${filePath}"`;
                const { output, code } = await executeSshCommand(conn, cmd);

                if (code === 0) {
                    results[filePath] = output;
                } else {
                    results[filePath] = `Error: Read failed (code ${code})`;
                }
            } catch (e) {
                results[filePath] = `Error: ${e.message}`;
            }
        }

        res.json({ results });

    } catch (error) {
        console.error('Bulk fetch error:', error);
        res.status(500).json({ error: `파일 내용 조회 중 오류 발생: ${error.message}` });
    }
});

export default router;
