import mondb from '../db/dbconn.js';

const projectManagement = {

    /**
     * Get all projects (Joined with CapInfo)
     * Note: This gets the "Definition" of projects.
     * Use a separate query or join for Business items if needed for the grid.
     * Currently assuming list shows Projects.
     */
    getProjectList: async (searchType, keyword) => {
        let sql = `SELECT
        P.PRJ_ID, P.PRJ_NM, P.ENC_VAL, P.TCODE AS TCODE, P.PROTO_COL, P.COMPR_YN,
            P.VIRT_COL1, P.VIRT_COL2, P.DIFFC_COND, P.CRT_ID, P.CRT_DT, P.UDT_ID, P.UDT_DT,
            C.AQTTYPE, C.CONN, C.PTYPE, C.DSTF, C.DSTV, C.OTHEROPT,
                C.TCODE AS T_CODE, C.DSTIP, C.DSTPORT,C.SVCID, C.ORDEROPT, C.OTHERCOND,
                        C.NORCV, C.DBSKIP, C.MAXCNT, C.JOBID, C.SCRIP
            FROM aqt_project_tb  P
            LEFT JOIN aqt_capinfo_tb C ON P.PRJ_ID = C.PRJ_ID
            `;
        let params = [];

        if (keyword) {
            if (searchType === 'PRJ_NM') {
                sql += ` WHERE p.PRJ_NM LIKE ? `;
                params.push(`%${keyword}%`);
            } else if (searchType === 'all') {
                sql += ` WHERE p.PRJ_NM LIKE ? `;
                params.push(`%${keyword}%`);
            }
        }

        sql += ` ORDER BY p.PRJ_ID DESC`;

        const rows = await mondb.query(sql, params);
        console.log("Debug: getProjectList rows:", rows); // Debugging
        return rows;
    },

    /**
     * Save a project (Insert or Update) - Transactional-like
     * Updates aqt_project_tb AND aqt_capinfo_tb
     */
    /**
     * Save a project (Insert or Update) - Transactional-like
     * Updates aqt_project_tb AND aqt_capinfo_tb
     */
    saveProject: async (projectData) => {
        let projectId = projectData.prj_id; // Frontend should send prj_id
        const no_rcv_val = (projectData.norcv == '1' || projectData.norcv === 1) ? 1 : 0;
        let max_cnt_val = parseInt(projectData.maxcnt);
        if (isNaN(max_cnt_val)) max_cnt_val = null;

        let conn;
        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            if (projectId && projectId !== '자동생성' && projectId !== '') {
                // UPDATE
                await conn.query(`
                    UPDATE aqt_project_tb SET
                        PRJ_NM = ?, ENC_VAL = ?, TCODE = ?, PROTO_COL = ?, COMPR_YN = ?,
                        VIRT_COL1 = ?, VIRT_COL2 = ?, DIFFC_COND = ?
                    WHERE PRJ_ID = ?
                    `, [
                    projectData.prj_nm, projectData.enc_val, projectData.tcode, projectData.proto_col, projectData.compr_yn,
                    projectData.virt_col1, projectData.virt_col2, projectData.diffic_cond,
                    projectId
                ]);

                // Check if capinfo exists
                const capCheck = await conn.query("SELECT pkey FROM aqt_capinfo_tb WHERE PRJ_ID = ?", [projectId]);
                if (capCheck.length > 0) {
                    await conn.query(`
                        UPDATE aqt_capinfo_tb SET
                        AQTTYPE = ?, PTYPE = ?, DSTF = ?, OTHEROPT = ?, TCODE = ?, DSTIP = ?, DSTPORT = ?,
                        SVCID = ?, OTHERCOND = ?, NORCV = ?, DBSKIP = ?, MAXCNT = ?,
                        DSTV = ?, JOBID = ?, ORDEROPT = ?, SCRIP = ?, CONN = ?
                        WHERE PRJ_ID = ?
                    `, [
                        projectData.aqttype, projectData.ptype, projectData.dstf, projectData.otheropt, projectData.t_code, projectData.dstlp, projectData.dstport,
                        projectData.svcid, projectData.othercond, no_rcv_val, projectData.dbskip, max_cnt_val,
                        projectData.immd, projectData.job_id, projectData.order_opt, projectData.scrip, projectData.ctype,
                        projectId
                    ]);
                } else {
                    await conn.query(`
                        INSERT INTO aqt_capinfo_tb(
                            PRJ_ID, AQTTYPE, PTYPE, DSTF, OTHEROPT, TCODE, DSTIP, DSTPORT,
                            SVCID, OTHERCOND, NORCV, DBSKIP, MAXCNT, DSTV, JOBID, ORDEROPT, SCRIP, CONN
                        ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `, [
                        projectId,
                        projectData.aqttype, projectData.ptype, projectData.dstf, projectData.otheropt, projectData.t_code, projectData.dstlp, projectData.dstport,
                        projectData.svcid, projectData.othercond, no_rcv_val, projectData.dbskip, max_cnt_val,
                        projectData.immd, projectData.job_id, projectData.order_opt, projectData.scrip, projectData.ctype
                    ]);
                }
            } else {
                // INSERT
                const resProject = await conn.query(`
                    INSERT INTO aqt_project_tb(
                        PRJ_NM, ENC_VAL, TCODE, PROTO_COL, COMPR_YN,
                        VIRT_COL1, VIRT_COL2, DIFFC_COND
                    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?)
                            `, [
                    projectData.prj_nm, projectData.default_encoding, projectData.test_id, projectData.proto_col, projectData.compression,
                    projectData.virtual_col1, projectData.virtual_col2, projectData.diffic_cond
                ]);

                projectId = resProject.insertId;

                await conn.query(`
                    INSERT INTO aqt_capinfo_tb(
                        PRJ_ID, AQTTYPE, PTYPE, DSTF, OTHEROPT, TCODE, DSTIP, DSTPORT,
                        SVCID, OTHERCOND, NORCV, DBSKIP, MAXCNT, DSTV, JOBID, ORDEROPT, SCRIP, CONN
                    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    projectId,
                    projectData.aqttype, projectData.ptype, projectData.dstf, projectData.otheropt, projectData.t_code, projectData.dstlp, projectData.dstport,
                    projectData.svcid, projectData.othercond, no_rcv_val, projectData.dbskip, max_cnt_val,
                    projectData.immd, projectData.job_id, projectData.order_opt, projectData.scrip, projectData.ctype
                ]);
            }

            await conn.commit();
            return { affectedRows: 1, insertId: projectId };
        } catch (err) {
            if (conn) await conn.rollback();
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },

    /**
     * Delete a project
     * Cascades to other tables due to Foreign Keys
     */
    deleteProject: async (id) => {
        const sql = `DELETE FROM aqt_project_tb WHERE PRJ_ID = ? `;
        const result = await mondb.query(sql, [id]);
        return result;
    },

    /**
     * Get Business List (filtered by Search Type/Keyword)
     * Optional: filtered by projectId if needed, but currently "All" or "Search"
     */
    getBusinessList: async (searchType, keyword, projectId) => {
        // Updated query to match the fields required by the format
        // Columns: pkey, id (Application ID), project_id, c_target_sys_c, c_application_c, c_module_c ...
        let sql = `
           SELECT PKEY, APP_ID, PRJ_ID, APPNM, MAIN_MGR, GUBUN, SCNT, HOST_IP, HOST_PORT, SVC_URI, SVC_KR_NM, SVC_EN_NM, SVC_KIND, CUMCNT, CRT_ID, CRT_DT, UDT_ID, UDT_DT
 			FROM aqt_business_tb
            WHERE 1=1
        `;
        let params = [];

        if (projectId) {
            sql += ` AND PRJ_ID = ? `;
            params.push(projectId);
        }

        if (keyword) {
            // Adjust search logic as needed
            if (searchType === 'project_id') {
                // If searchType is project_id, but we already filtered by projectId, they should match or this might be redundant.
                // However, keep it for compatibility if searchType='project_id' is used without keyword filter elsewhere.
                sql += ` AND PRJ_ID = ? `;
                params.push(keyword);
            } else if (searchType === 'all') {
                sql += ` AND (APPNM LIKE ? OR SVC_URI LIKE ? OR SVC_KR_NM LIKE ? OR SVC_EN_NM LIKE ?) `;
                params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
            } else if (['APPNM', 'SVC_URI', 'SVC_KR_NM', 'SVC_EN_NM'].includes(searchType)) {
                sql += ` AND ${searchType} LIKE ? `;
                params.push(`%${keyword}%`);
            } else {
                // Default fallback
                sql += ` AND APPNM LIKE ? `;
                params.push(`%${keyword}%`);
            }
        }
        sql += ` ORDER BY pkey DESC`;
        return await mondb.query(sql, params);
    },

    /**
     * Save Business Item (Insert or Update)
     */
    saveBusiness: async (data) => {
        // data.pkey determines insert vs update
        if (data.pkey) {
            // UPDATE
            const sql = `
                UPDATE aqt_business_tb SET
                    APP_ID = ?, PRJ_ID = ?, APPNM = ?, MAIN_MGR = ?, GUBUN = ?, SCNT = ?,
                    HOST_IP = ?, HOST_PORT = ?, SVC_URI = ?, SVC_KR_NM = ?, SVC_EN_NM = ?, SVC_KIND = ?, CUMCNT = ?
                WHERE PKEY = ?
                    `;
            const params = [
                data.app_id, data.prj_id, data.appnm, data.main_mgr, data.gubun, data.scnt,
                data.host_ip, data.host_port,
                data.svc_uri, data.svc_kr_nm, data.svc_en_nm, data.svc_kind, data.cumcnt,
                data.pkey
            ];
            await mondb.query(sql, params);
            return { affectedRows: 1 };
        } else {
            // INSERT
            const sql = `
                INSERT INTO aqt_business_tb(
                        APP_ID, PRJ_ID, APPNM, MAIN_MGR, GUBUN, SCNT,
                        HOST_IP, HOST_PORT, SVC_URI, SVC_KR_NM, SVC_EN_NM, SVC_KIND, CUMCNT
                    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                data.app_id, data.prj_id, data.appnm, data.main_mgr, data.gubun, data.scnt,
                data.host_ip, data.host_port,
                data.svc_uri, data.svc_kr_nm, data.svc_en_nm, data.svc_kind, data.cumcnt
            ];
            const res = await mondb.query(sql, params);
            return { insertId: res.insertId };
        }
    },

    /**
     * Get Next APP_ID
     */
    getNextAppId: async () => {
        const sql = `
           select case concat('APP'+max(substr(APP_ID, 5, 14))) when 0 then concat('APP_','0000000001')
            else replace(concat('APP', max(substr(APP_ID, 5, 14)) + 100000000001),'APP1', 'APP') end as APP_ID 
            from aqt_business_tb
        `;
        const res = await mondb.query(sql);
        return res[0]?.APP_ID || 'APP00000000001';
    },

    /**
     * Delete Business Item
     */
    deleteBusiness: async (pkey) => {
        const sql = `DELETE FROM aqt_business_tb WHERE PKEY = ? `;
        return await mondb.query(sql, [pkey]);
    },
};

export default projectManagement;
