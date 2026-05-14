import pool from '../db/dbconn.js';

const commandHistory = {
    /**
     * 명령어 실행 기록 저장
     * @param {string} userId - 사용자 ID
     * @param {string} targetHost - 대상 호스트
     * @param {number} targetPort - 대상 포트
     * @param {string} command - 실행한 명령어
     * @param {string} output - 명령어 실행 결과 출력
     * @param {number} exitCode - 종료 코드
     */
    save: async (userId, targetHost, targetPort, command, output, exitCode) => {
        let conn;
        try {
            conn = await pool.getConnection();

            const query = `
                INSERT INTO command_history (user_id, target_host, target_port, command, output, exit_code)
                VALUES (?, ?, ?, ?, ?, ?);
            `;
            
            const params = [userId, targetHost, targetPort, command, output, exitCode];
            const result = await conn.query(query, params);
            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }
};

export default commandHistory;
