import express from 'express';
import commandHistory from '../model/commandHistory.js';
import { getSshConnection, executeSshCommand, disconnectSsh } from './sshManager.js';

const router = express.Router();

/**
 * POST /
 * 일반 SSH 명령어를 실행합니다.
 */
router.post('/', async (req, res) => {
    const { host, port, username, password, command } = req.body;
    if (!host || !username || !password || !command) {
        return res.status(400).json({ error: '필수 파라미터(host, username, password, command)가 누락되었습니다.' });
    }

    try {
        const sshConn = await getSshConnection(req.body);
        const { output, code, signal } = await executeSshCommand(sshConn, command);
        res.json({ output, code, signal });
    } catch (error) {
        res.status(500).json({ error: `명령어 실행 중 오류 발생: ${error.message}` });
    }
});

/**
 * POST /disconnect
 * 활성 SSH 연결을 종료합니다.
 */
router.post('/disconnect', (req, res) => {
    const { host, port = 22, username } = req.body;
    if (!host || !username) {
        return res.status(400).json({ error: '필수 파라미터(host, username)가 누락되었습니다.' });
    }

    const success = disconnectSsh({ host, port, username });

    if (success) {
        res.json({ message: '연결 종료가 시작되었습니다.' });
    } else {
        res.status(404).json({ error: '종료할 활성 연결을 찾을 수 없습니다.' });
    }
});

/**
 * POST /save
 * 명령어 실행 기록을 데이터베이스에 저장합니다.
 */
router.post('/save', async (req, res) => {
    const { userId, targetHost, targetPort, command, output, exitCode } = req.body;
    if (!userId || !targetHost || !targetPort || command === undefined) {
        return res.status(400).json({ message: '히스토리 저장을 위한 필수 필드가 누락되었습니다.' });
    }

    try {
        const insertedId = await commandHistory.save(userId, targetHost, targetPort, command, output, exitCode);
        res.status(201).json({ message: '명령어 히스토리가 성공적으로 저장되었습니다.', insertedId });
    } catch (error) {
        res.status(500).json({ message: '명령어 히스토리 저장에 실패했습니다.', error: error.message });
    }
});

export default router;
