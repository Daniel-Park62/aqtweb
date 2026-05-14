import mondb from '../db/dbconn.js';

const commonModel = {
    /**
     * 프로젝트 목록 조회
     */
    getProjectList: async () => {
        let conn;
        try {
            conn = await mondb.getConnection();
            const rows = await conn.query(`SELECT  PRJ_ID
                                                  ,PRJ_NM
                                                  ,ENC_VAL
                                                  ,DIFFC_COND
                                                  ,VIRT_COL1
                                                  ,VIRT_COL2
                                                  ,TCODE
                                                  ,PROTO_COL
                                                  ,COMPR_YN
                                                  FROM aqt_project_tb`);
            // Map database columns to expected object structure
            return rows;
        } catch (err) {
            console.error("Error in getProjectList:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },

    /**
     * 업무 목록 조회
     * @param {Object} req - Express request object
     */
    getJobList: async (req) => {
        let conn;
        try {
            conn = await mondb.getConnection();

            let query = `SELECT (select PRJ_ID from aqt_project_tb limit 1) as PRJ_ID, APP_ID, APPNM, MAIN_MGR, GUBUN, SCNT, HOST_IP, HOST_PORT, CRT_ID, CRT_DT, UDT_ID, UDT_DT
                         FROM aqt_business_tb
                         WHERE 1=1 
                         `;

            const params = [];

            // 순서 정렬
            query += ` ORDER BY APP_ID desc`;

            const rows = await conn.query(query, params);

            return rows;
        } catch (err) {
            console.error("Error in getJobList:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },



};

export default commonModel;
