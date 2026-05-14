import mondb from '../db/dbconn.js';

const jobServiceManagement = {

    getJobServiceList: async (searchType, keyword, app_id) => {
        let sql = `
            select T1.SVC_ID		as SVC_ID
                , T1.APP_ID		    as APP_ID
                , T1.SVC_URI		as SVC_URI
                , T1.SVC_KR_NM		as SVC_KR_NM
                , T1.SVC_EN_NM		as SVC_EN_NM
                , T1.SVC_KIND		as SVC_KIND
                , T1.SVC_MGR		as SVC_MGR
                , T1.CUMCNT		    as CUMCNT
                , T1.CRT_ID		    as CRT_ID
                , T1.CRT_DT		    as CRT_DT
                , T1.UDT_ID		    as UDT_ID
                , T1.UDT_DT 		as UDT_DT
            from aqt_service_tb T1 
            where 1=1   
        `;
        
        let params = [];

        if (app_id && app_id !== '') {
            sql += ` AND T1.APP_ID = ? `;
            params.push(app_id);
        }

        if (keyword) {
            if (searchType === 'SVC_KR_NM') {
                sql += ` AND T1.SVC_KR_NM LIKE ? `;
                params.push(`%${keyword}%`);
            } else if (searchType === 'SVC_EN_NM') {
                sql += ` AND T1.SVC_EN_NM LIKE ? `;
                params.push(`%${keyword}%`);
            } else if (searchType === 'SVC_URI') {
                sql += ` AND T1.SVC_URI LIKE ? `;
                params.push(`%${keyword}%`);
            } else if (searchType === 'all') {
                sql += ` AND (T1.SVC_KR_NM LIKE ? OR T1.SVC_EN_NM LIKE ? OR T1.SVC_URI LIKE ? OR T1.SVC_ID LIKE ?) `;
                params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
            }
        }

        sql += ` ORDER BY T1.APP_ID, T1.SVC_ID`;

        //console.log("##############################################################");
        //console.log("getJobServiceListapp_id : " + app_id);
        //console.log("getJobServiceList sql : " + sql);
        //console.log("##############################################################");

        const rows = await mondb.query(sql, params);
        return rows;
    },

    getJobServiceDetail: async (app_id) => {
        let sql = `
            select T1.SVC_ID		    as SVC_ID
                , T1.APP_ID		    as APP_ID
                , T1.SVC_URI		as SVC_URI
                , T1.SVC_KR_NM		as SVC_KR_NM
                , T1.SVC_EN_NM		as SVC_EN_NM
                , T1.SVC_KIND		as SVC_KIND
                , T1.SVC_MGR		as SVC_MGR
                , T1.CUMCNT		    as CUMCNT
                , T1.CRT_ID		    as CRT_ID
                , T1.CRT_DT		    as CRT_DT
                , T1.UDT_ID		    as UDT_ID
                , T1.UDT_DT 		as UDT_DT
            from aqt_service_tb T1 
            WHERE APP_ID = ?
            ORDER BY T1.SVC_ID DESC 
            LIMIT 1        
        `;

        //console.log("##############################################################");
        //console.log("getJobServiceDetail app_id : " + app_id);
        //console.log("getJobServiceDetail sql : " + sql);
        //console.log("##############################################################");

        const rows = await mondb.query(sql, [app_id]);

        return rows[0] || null;
    },

    saveJobServiceList: async (list) => {
        for (const item of list) {
            if (item.isNew) {
                const sql = `
                    INSERT INTO aqt_service_tb (APP_ID
                                            , SVC_URI, SVC_KR_NM, SVC_EN_NM
                                            , SVC_KIND, SVC_MGR, CUMCNT
                    ) VALUES (?
                            , ?, ?, ?
                            , ?, ?, ?)
                `;

                const params = [
                      item.APP_ID
                    , item.SVC_URI, item.SVC_KR_NM, item.SVC_EN_NM
                    , item.SVC_KIND , item.SVC_MGR, item.CUMCNT || 0
                    ,
                ];

                //console.log("##############################################################");
                //console.log("saveJobServiceList sql : " + sql);
                //console.log("##############################################################");

                await mondb.query(sql, params);
            } else {
                // UPDATE
                const sql = `
                    UPDATE aqt_service_tb 
                    SET APP_ID = ?
                    , SVC_URI = ?
                    , SVC_KR_NM = ?
                    , SVC_EN_NM = ?
                    , SVC_KIND = ?
                    , SVC_MGR = ?
                    , CUMCNT = ?
                    WHERE SVC_ID = ?
                `;

                const params = [
                    item.APP_ID
                    , item.SVC_URI, item.SVC_KR_NM, item.SVC_EN_NM
                    , item.SVC_KIND, item.SVC_MGR, item.CUMCNT || 0
                    , item.SVC_ID,
                ];

                //console.log("##############################################################");
                //console.log("saveJobServiceList sql : " + sql);
                //console.log("##############################################################");

                await mondb.query(sql, params);
            }
        }

        return { success: true };
    },

    deleteJobService: async (svc_id) => {
        //console.log("##############################################################");
        //console.log("svc_id : " + svc_id);
        //console.log("##############################################################");

        if (svc_id) {
            const sql = `DELETE FROM aqt_service_tb WHERE SVC_ID = ?`;

            //console.log("##############################################################");
            //console.log("deleteJobService sql : " + sql);
            //console.log("##############################################################");

            return await mondb.query(sql, [svc_id]);
        } else {
            return { success: true };
        }
    },

    getNextJobServiceId: async (prj_id, app_id) => {
        const sql = `
            SELECT MAX(SVC_ID) as maxId 
            FROM aqt_service_tb 
            WHERE PRJ_ID = ? 
            AND APP_ID = ?
        `;
        
        const rows = await mondb.query(sql, [prj_id, app_id]);
        
        let nextNum = 1;
        
        if (rows[0] && rows[0].maxId) {
            const currentMax = rows[0].maxId;
            const numericPart = currentMax.replace('COM', '');  // Expected format COM00000000001 (14 chars)

            if (!isNaN(numericPart)) {
                nextNum = parseInt(numericPart, 11) + 1;
            }
        }
        
        return 'COM' + String(nextNum).padStart(11, '0');
    },

    getNextJobServiceFieldId: async (prj_id, app_id, svc_hd_id) => {
        const sql = `
            SELECT MAX(SVC_ID) as maxId 
            FROM aqt_service_tb 
            WHERE PRJ_ID = ? 
            AND APP_ID = ? 
            AND SVC_ID = ?
        `;

        const rows = await mondb.query(sql, [prj_id, app_id, svc_hd_id]);

        let nextNum = 1;

        if (rows[0] && rows[0].maxId) {
            const currentMax = rows[0].maxId;
            const numericPart = currentMax.replace("FLD", "");  // Expected format FLD00000000001 (13 chars)

            if (!isNaN(numericPart)) {
                nextNum = parseInt(numericPart, 11) + 1;
            }
        }
        return "FLD" + String(nextNum).padStart(11, "0");
    },    
/////////////////////////////////////////////////////////////////////////////////////////////////
    getSvrServiceList: async (searchType, keyword, prj_id, app_id) => {
        let sql = `
            select T1.SVR_ID		    as SVR_ID
                , T1.APP_ID		    as APP_ID
                , T1.SVRNM          as SVRNM
                , T1.SVRKIND        as SVRKIND
                , T1.STATUS         as STATUS
                , T1.PROCID         as PROCID
                , T1.REQSTOP        as REQSTOP
                , T1.PORTNO         as PORTNO
                , T1.ALLOWIP        as ALLOWIP
                , T1.SRCNM          as SRCNM
                , T1.CRT_ID		    as CRT_ID
                , T1.CRT_DT		    as CRT_DT
                , T1.UDT_ID		    as UDT_ID
                , T1.UDT_DT 		as UDT_DT
            from aqt_tmocksvr_tb T1 
            where 1=1   
        `;
        
        let params = [];

        if (app_id && app_id !== '') {
            sql += ` AND T1.APP_ID = ? `;
            params.push(app_id);
        }

        if (keyword) {
            if (searchType === 'SVRNM') {
                sql += ` AND T1.SVRNM LIKE ? `;
                params.push(`%${keyword}%`);
            } else if (searchType === 'PORTNO') {
                sql += ` AND T1.PORTNO LIKE ? `;
                params.push(`%${keyword}%`);
            } else if (searchType === 'ALLOWIP') {
                sql += ` AND T1.ALLOWIP LIKE ? `;
                params.push(`%${keyword}%`);
            } else if (searchType === 'SRCNM') {
                sql += ` AND T1.SRCNM LIKE ? `;
                params.push(`%${keyword}%`);
            } else if (searchType === 'all') {
                sql += ` AND (T1.SVRNM LIKE ? OR T1.PORTNO LIKE ? OR T1.ALLOWIP LIKE ? OR T1.SRCNM LIKE ?) `;
                params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
            }
        }

        sql += ` ORDER BY T1.SVR_ID`;

        const rows = await mondb.query(sql, params);
        return rows;
    },

    getSvrServiceDetail: async (prj_id, app_id) => {
        let sql = `
            select T1.SVR_ID		    as SVR_ID
                , T1.APP_ID		    as APP_ID
                , T1.SVRNM          as SVRNM
                , T1.SVRKIND        as SVRKIND
                , T1.STATUS         as STATUS
                , T1.PROCID         as PROCID
                , T1.REQSTOP        as REQSTOP
                , T1.PORTNO         as PORTNO
                , T1.ALLOWIP        as ALLOWIP
                , T1.SRCNM          as SRCNM
                , T1.CRT_ID		    as CRT_ID
                , T1.CRT_DT		    as CRT_DT
                , T1.UDT_ID		    as UDT_ID
                , T1.UDT_DT 		as UDT_DT
            from aqt_tmocksvr_tb T1 
            WHERE APP_ID = ?
            ORDER BY T1.SVR_ID DESC 
        `;

        const rows = await mondb.query(sql, [prj_id, app_id]);

        return rows[0] || null;
    },

    saveSvrServiceList: async (list) => {
        for (const item of list) {
            //console.log("--------------------------------------------");
            //console.log("SVR_ID   : " + item.SVR_ID);
            //console.log("APP_ID   : " + item.APP_ID);
            //console.log("PRJ_ID   : " + item.PRJ_ID);
            //console.log("SVRNM    : " + item.SVRNM);
            //console.log("SVRKIND  : " + item.SVRKIND);
            //console.log("STATUS   : " + item.STATUS);
            //console.log("PROCID   : " + item.PROCID);
            //console.log("REQSTOP  : " + item.REQSTOP);
            //console.log("PORTNO   : " + item.PORTNO);
            //console.log("ALLOWIP  : " + item.ALLOWIP);
            //console.log("SRCNM    : " + item.SRCNM);
            //console.log("--------------------------------------------");

            if (item.isNew) {
                const sql = `
                    INSERT INTO aqt_tmocksvr_tb (APP_ID
                                                , SVRNM, SVRKIND, STATUS, PROCID
                                                , REQSTOP, PORTNO, ALLOWIP, SRCNM
                                                , CRT_ID, CRT_DT, UDT_ID, UDT_DT
                    ) VALUES (?
                        , ?, ?, ?, ?
                        , ?, ?, ?, ?
                        , 'monadmin', sysdate(), 'monadmin', sysdate())
                `;

                const params = [
                      item.APP_ID
                    , item.SVRNM, item.SVRKIND, item.STATUS || 0, item.PROCID || 0
                    , item.REQSTOP, item.PORTNO || 0, item.ALLOWIP, item.SRCNM,
                ];

            //console.log("--------------------------------------------");
            //console.log("sql       : " + sql);
            //console.log("--------------------------------------------");

                await mondb.query(sql, params);
            } else {
                // UPDATE
                const sql = `
                    UPDATE aqt_tmocksvr_tb 
                    SET APP_ID = ?
                    , SVRNM = ?
                    , SVRKIND = ?
                    , PROCID = ?
                    , REQSTOP = ?
                    , PORTNO = ?
                    , ALLOWIP = ?
                    , SRCNM = ?
                    WHERE SVR_ID = ?
                `;

                const params = [
                      item.APP_ID
                    , item.SVRNM, item.SVRKIND, item.PROCID
                    , item.REQSTOP, item.PORTNO || 0, item.ALLOWIP, item.SRCNM
                    , item.SVR_ID,
                ];

            //console.log("--------------------------------------------");
            //console.log("sql       : " + sql);
            //console.log("--------------------------------------------");

                await mondb.query(sql, params);
            }

        }

        return { success: true };
    },

    deleteSvrService: async (svr_id) => {
        const sql = `DELETE FROM aqt_tmocksvr_tb WHERE SVR_ID = ?`;

        //console.log("##############################################################");
        //console.log("deleteSvrService sql : " + sql);
        //console.log("##############################################################");

        return await mondb.query(sql, [svr_id]);
    },

    getNextSvrServiceId: async (prj_id, app_id) => {
        const sql = `
            SELECT MAX(SVR_ID) as maxId 
            FROM aqt_tmocksvr_tb 
            WHERE PRJ_ID = ? 
            AND APP_ID = ?
        `;
        
        const rows = await mondb.query(sql, [prj_id, app_id]);
        
        let nextNum = 1;
        
        if (rows[0] && rows[0].maxId) {
            const currentMax = rows[0].maxId;
            const numericPart = currentMax.replace('COM', '');  // Expected format COM00000000001 (14 chars)

            if (!isNaN(numericPart)) {
                nextNum = parseInt(numericPart, 11) + 1;
            }
        }
        
        return 'COM' + String(nextNum).padStart(11, '0');
    },

    getNextSvrServiceFieldId: async (prj_id, app_id, svr_hd_id) => {
        const sql = `
            SELECT MAX(SVR_ID) as maxId 
            FROM aqt_tmocksvr_tb 
            WHERE PRJ_ID = ? 
            AND APP_ID = ? 
            AND SVR_ID = ?
        `;

        const rows = await mondb.query(sql, [prj_id, app_id, svr_hd_id]);

        let nextNum = 1;

        if (rows[0] && rows[0].maxId) {
            const currentMax = rows[0].maxId;
            const numericPart = currentMax.replace("FLD", "");  // Expected format FLD00000000001 (13 chars)

            if (!isNaN(numericPart)) {
                nextNum = parseInt(numericPart, 11) + 1;
            }
        }
        return "FLD" + String(nextNum).padStart(11, "0");
    }
};

export default jobServiceManagement;