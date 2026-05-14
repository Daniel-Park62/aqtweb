import express from 'express';
import pool from '../db/dbconn.js';
import jobs from '../model/jobs.js';
import { getSshConnection, executeSshCommand } from './sshManager.js';

const router = express.Router();

/**
 * find 명령어 출력의 한 줄을 파싱하여 파일 상세 정보 객체로 변환합니다.
 * @param {string} line - find 명령어 출력 중 한 줄
 * @param {string} delimiter - 구분자 (기본값: 공백)
 * @returns {object|null} 파싱된 파일 정보 객체 또는 null
 */
function parseFindOutputLine(line, delimiter) {
    if (!line) return null;

    let parts;
    if (delimiter === '\\t') {
        parts = line.trim().split('\t');
    } else if (delimiter && delimiter !== 'space' && delimiter !== ' ') {
        // Custom delimiter
        parts = line.trim().split(delimiter);
    } else {
        // Default: whitespace
        parts = line.trim().split(/\s+/);
    }

    // 빈 문자열 제거
    parts = parts.map(p => p.trim()).filter(p => p !== '');

    if (parts.length < 10) {
        console.warn('잘못된 형식의 라인 건너뛰기:', line);
        return null;
    }

    const modTimeStr = parts[2];
    // YYYYMMDDHHMMSS 형식의 문자열을 Date 객체로 변환
    let modTime = null;
    if (modTimeStr && modTimeStr.length === 14) {
        const year = modTimeStr.substring(0, 4);
        const month = modTimeStr.substring(4, 6) - 1; // JS 월은 0부터 시작
        const day = modTimeStr.substring(6, 8);
        const hour = modTimeStr.substring(8, 10);
        const minute = modTimeStr.substring(10, 12);
        const second = modTimeStr.substring(12, 14);
        modTime = new Date(year, month, day, hour, minute, second);
    }

    const result = {
        file_path: parts[0],
        file_type: parts[1],
        mod_time: modTime,
        file_size: isNaN(parseInt(parts[3], 10)) ? null : parseInt(parts[3], 10),
        owner_name: parts[4],
        owner_uid: isNaN(parseInt(parts[5], 10)) ? null : parseInt(parts[5], 10),
        group_name: parts[6],
        group_gid: isNaN(parseInt(parts[7], 10)) ? null : parseInt(parts[7], 10),
        permissions: parts[8], // permissions
        crc_value: isNaN(parseInt(parts[9], 10)) ? null : parseInt(parts[9], 10), // crc -> crc_value
    };

    return result;
}

/**
 * 명령어 주입 공격을 방지하기 위해 사용자 입력을 검증합니다.
 * 허용된 문자/패턴 외에는 모두 차단합니다.
 * @param {string} arg - 사용자가 입력한 programArg
 * @returns {boolean} - 유효하면 true, 아니면 false
 */
function isValidProgramArg(arg) {
    // 허용할 문자: 영숫자, 공백, 슬래시(/), 대시(-), 점(.), 별표(*), 작은따옴표('), 큰따옴표(")
    // 위험한 문자(;, |, &, $, <, >, ` 등)는 포함되지 않도록 합니다.
    const allowedPattern = /^[a-zA-Z0-9\s\/\-.*'"_#]+$/;
    return allowedPattern.test(arg);
}


/**
 * POST /save-file-info
 * 원격지 파일 정보를 찾아 데이터베이스에 저장합니다.
 */
router.post('/save-file-info', async (req, res) => {
    const { host, username, password, jobId, jobDescription, programArg, tableSelect, delimiter } = req.body;
    if (!host || !username || !password || !jobId || !jobDescription || !programArg || !tableSelect) {
        return res.status(400).json({ error: '필수 파라미터(host, username, password, jobId, jobDescription, programArg, tableSelect)가 누락되었습니다.' });
    }

    // 명령어 주입 방지를 위한 입력값 검증
    // if (!isValidProgramArg(programArg)) {
    //     return res.status(400).json({ error: 'Program Arguments에 허용되지 않는 문자가 포함되어 있습니다.' });
    // }

    try {
        // Job ID 중복 검사
        const exists = await jobs.checkJobIdExists(jobId);
        if (exists) {
            return res.status(409).json({ error: '이미 등록된 Job ID입니다. 다른 Job ID를 사용하세요.' });
        }

        // 요청받은 programArg를 사용하여 스크립트 실행 명령어를 구성합니다.
        const findCommand = `${programArg}`;

        const sshConn = await getSshConnection(req.body);
        const { output, code } = await executeSshCommand(sshConn, findCommand);

        if (code !== 0) {
            // 이 경우 500 대신 400번대 코드가 더 적절할 수 있습니다.
            return res.status(422).json({ error: `find 명령어 실행 실패 (종료 코드: ${code})`, output });
        }

        const lines = output.trim() ? output.trim().split('\n') : [];
        const fileDetails = lines.map(line => parseFindOutputLine(line, delimiter)).filter(Boolean); // null인 항목 제거

        // Transaction & Saving via Model
        let conn;
        try {
            conn = await pool.getConnection();
            await conn.beginTransaction();

            // Save Job Info
            const jobPkId = await jobs.saveJobInfo(conn, jobId, jobDescription, tableSelect, findCommand);

            if (fileDetails && fileDetails.length > 0) {
                // Get columns
                const tableColumns = await jobs.getTableColumns(tableSelect);

                // Filter insertable columns
                const fileDetailKeys = Object.keys(fileDetails[0]);
                const insertableColumns = fileDetailKeys.filter(key => tableColumns.includes(key));
                const allColumns = ['job_pk_id', ...insertableColumns.filter(c => c.toLowerCase() !== 'id')];

                // Prepare values flattened
                const values = fileDetails.flatMap(fd => [jobPkId, ...insertableColumns.map(col => fd[col] || null)]);

                await jobs.saveFileDetails(conn, tableSelect, allColumns, values);
            }

            await conn.commit();
            res.status(201).json({ message: '파일 정보가 성공적으로 저장되었습니다.', output: output });

        } catch (err) {
            if (conn) await conn.rollback();
            throw err;
        } finally {
            if (conn) conn.release();
        }

    } catch (error) {
        res.status(500).json({ message: '파일 정보 저장 중 오류가 발생했습니다.', error: error.message });
    }
});

export default router;
