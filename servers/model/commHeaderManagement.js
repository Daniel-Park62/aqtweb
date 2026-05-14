import mondb from '../db/dbconn.js';

const commHeaderManagement = {

    getCommHeaderList: async (searchType, keyword, app_id) => {
        let sql = `
            SELECT T1.COMMHDFLD_ID		as COMMHDFLD_ID
                , T1.APP_ID			    as APP_ID
                , T1.COMMHD_ID			as COMMHD_ID
                , T1.FLD_KR_NM			as FLD_KR_NM
                , T1.FLD_EN_NM			as FLD_EN_NM
                , T1.FLD_TYPE			as FLD_TYPE
                , T1.FLD_LEN			as FLD_LEN
                , T1.FLD_CMT			as FLD_CMT
                , T1.FLD_SGMT			as FLD_SGMT
                , T1.ST_POS			    as ST_POS
                , T1.FLD_ORDER			as FLD_ORDER
                , T1.ESSEN_YN			as ESSEN_YN
                , T1.DEFAULT_VAL		as DEFAULT_VAL
                , T1.FLD_FORMAT		    as FLD_FORMAT
                , T1.FLD_CDSET			as FLD_CDSET
                , T1.MASK_YN			as MASK_YN
                , T1.META_CONV_RULE	    as META_CONV_RULE
                , T1.CRT_ID			    as CRT_ID
                , T1.CRT_DT			    as CRT_DT
                , T1.UDT_ID			    as UDT_ID
                , T1.UDT_DT			    as UDT_DT
                , T2.COMMHD_KR_NM		as COMMHD_KR_NM
                , T2.COMMHD_EN_NM		as COMMHD_EN_NM
            FROM aqt_commheaderfield_tb T1
            JOIN aqt_commheader_tb T2 
                ON T1.APP_ID = T2.APP_ID 
                AND T1.COMMHD_ID = T2.COMMHD_ID
            WHERE 1=1         
        `;
        
        let params = [];

        if (app_id && app_id !== '') {
            sql += ` AND T1.APP_ID = ? `;
            params.push(app_id);
        }

        if (keyword) {
            if (searchType === 'FLD_KR_NM') {
                sql += ` AND T1.FLD_KR_NM LIKE ? `;
                params.push(`%${keyword}%`);
            } else if (searchType === 'FLD_EN_NM') {
                sql += ` AND T1.FLD_EN_NM LIKE ? `;
                params.push(`%${keyword}%`);
            } else if (searchType === 'FLD_DESC') {
                sql += ` AND T1.FLD_CMT LIKE ? `;
                params.push(`%${keyword}%`);
            } else if (searchType === 'all') {
                sql += ` AND (T1.FLD_KR_NM LIKE ? OR T1.FLD_EN_NM LIKE ? OR T1.FLD_CMT LIKE ? OR T1.COMMHD_ID LIKE ?) `;
                params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
            }
        }

        sql += ` ORDER BY T1.FLD_ORDER ASC`;

        //console.log("##############################################################");
        //console.log("app_id : " + app_id);
        //console.log("getCommHeaderList sql : " + sql);
        //console.log("##############################################################");

        const rows = await mondb.query(sql, params);
        return rows;
    },

    getCommHeaderDetail: async (app_id) => {
        let sql = `
            SELECT COMMHD_ID	    as COMMHD_ID
                , APP_ID			as APP_ID
                , COMMHD_KR_NM		as COMMHD_KR_NM
                , COMMHD_EN_NM		as COMMHD_EN_NM
                , MSG_TYPE			as MSG_TYPE
                , FORMAT_GB		    as FORMAT_GB
                , DIREC_GB			as DIREC_GB
                , TOT_LEN			as TOT_LEN
                , COMMENT			as COMMENT
            FROM aqt_commheader_tb
            WHERE APP_ID = ?
            ORDER BY COMMHD_ID DESC 
            LIMIT 1        
        `;

        //console.log("##############################################################");
        //console.log("app_id : " + app_id);
        //console.log("getCommHeaderDetail sql : " + sql);
        //console.log("##############################################################");

        const rows = await mondb.query(sql, [app_id]);

        return rows[0] || null;
    },

    saveCommHeader: async (data) => {
        if (data.comm_header_id) {
            // UPDATE
            const sql = `
                UPDATE aqt_commheader_tb 
                SET APP_ID = ?
                , COMMHD_KR_NM = ?
                , COMMHD_EN_NM = ?
                , MSG_TYPE = ?
                , FORMAT_GB = ?
                , DIREC_GB = ?
                , TOT_LEN = ?
                , COMMENT = ?
                , UDT_ID = 'monadmin'
                , UDT_DT = SYSDATE()
                WHERE COMMHD_ID = ?
            `;

            const params = [
                  data.job
                , data.comm_header_name_kr, data.comm_header_name_en
                , data.msg_type, data.format, data.direction
                , data.total_length, data.description
                , data.comm_header_id
            ];

            return await mondb.query(sql, params);
        } else {
            // INSERT
            const sql = `INSERT INTO aqt_commheader_tb (APP_ID
                                                      , COMMHD_KR_NM, COMMHD_EN_NM, MSG_TYPE
                                                      , FORMAT_GB, DIREC_GB, TOT_LEN, COMMENT) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [
                  data.job
                , data.comm_header_name_kr, data.comm_header_name_en, data.msg_type
                , data.format, data.direction, data.total_length, data.description
                ,
            ];

            return await mondb.query(sql, params);
        }
    },

    saveCommHeaderList: async (list) => {
        for (const item of list) {
            if (item.isNew) {
                // INSERT
                const sql = `INSERT INTO aqt_commheaderfield_tb (
                                    APP_ID, COMMHD_ID, 
                                    FLD_KR_NM, FLD_EN_NM, FLD_TYPE, FLD_LEN, FLD_CMT, 
                                    FLD_SGMT, ST_POS, FLD_ORDER, ESSEN_YN, DEFAULT_VAL, 
                                    FLD_FORMAT, FLD_CDSET, MASK_YN, META_CONV_RULE
                             ) VALUES (?, ?, 
                                    ?, ?, ?, ?, ?,
                                    ?, ?, ?, ?, ?,
                                    ?, ?, ?, ?)`;

                const params = [
                      item.APP_ID, item.COMMHD_ID
                    , item.FLD_KR_NM, item.FLD_EN_NM, item.FLD_TYPE, item.FLD_LEN || 0 , item.FLD_CMT
                    , item.FLD_SGMT || "N", item.ST_POS || 0, item.FLD_ORDER || 0, item.ESSEN_YN || "N", item.DEFAULT_VAL
                    , item.FLD_FORMAT, item.FLD_CDSET, item.MASK_YN || "N", item.META_CONV_RULE
                    ,
                ];

                await mondb.query(sql, params);
            } else {
                // UPDATE
                const sql = `
                    UPDATE aqt_commheaderfield_tb 
                    SET APP_ID = ?, COMMHD_ID = ?
                      , FLD_KR_NM = ?, FLD_EN_NM = ?, FLD_TYPE = ?, FLD_LEN = ?
                      , FLD_CMT = ?, FLD_SGMT = ?, ST_POS = ?, FLD_ORDER = ?
                      , ESSEN_YN = ?, DEFAULT_VAL = ?, FLD_FORMAT = ?, FLD_CDSET = ?
                      , MASK_YN = ?, META_CONV_RULE = ?
                    WHERE COMMHDFLD_ID = ?`;
                    
                const params = [
                      item.APP_ID, item.COMMHD_ID
                    , item.FLD_KR_NM, item.FLD_EN_NM, item.FLD_TYPE, item.FLD_LEN || 0
                    , item.FLD_CMT, item.FLD_SGMT || "N", item.ST_POS || 0, item.FLD_ORDER || 0
                    , item.ESSEN_YN || "N", item.DEFAULT_VAL, item.FLD_FORMAT, item.FLD_CDSET
                    , item.MASK_YN || "N", item.META_CONV_RULE
                    , item.COMMHDFLD_ID,
                ];

                await mondb.query(sql, params);
            }
        }

        return { success: true };
    },

    deleteCommHeader: async (commhdfld_id) => {
        const sql = `DELETE FROM aqt_commheaderfield_tb WHERE COMMHDFLD_ID = ?`;

        return await mondb.query(sql, [commhdfld_id]);
    },

    getNextCommHeaderId: async (app_id) => {
        const sql = `
            SELECT MAX(COMMHD_ID) as maxId 
            FROM aqt_commheader_tb 
            WHERE APP_ID = ?
        `;
        
        const rows = await mondb.query(sql, [app_id]);
        
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

    getNextCommHeaderFieldId: async (app_id, comm_hd_id) => {
        const sql = `
            SELECT MAX(COMMHDFLD_ID) as maxId 
            FROM aqt_commheaderfield_tb 
            WHERE APP_ID = ? 
            AND COMMHD_ID = ?
        `;

        const rows = await mondb.query(sql, [app_id, comm_hd_id]);

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

export default commHeaderManagement;