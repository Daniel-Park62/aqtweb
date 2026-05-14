import mondb from '../db/dbconn.js';

let fields = [];
let jobDataInstances = [];

const jobs = {
    /**
     * CommHeaderList 목록 조회
     */
    getCommHeaderList: async (req) => {
        let conn;

        //console.log("--------------------------------------------------------");
        //console.log("req.app_id : " + req.app_id);
        //console.log("req.search_keyword : " + req.search_keyword);
        //console.log("--------------------------------------------------------");

        try {
            conn = await mondb.getConnection();

            let query = `
                select a.COMMHD_ID
                    , a.APP_ID
                    , a.COMMHD_KR_NM
                    , a.COMMHD_EN_NM
                    , a.MSG_TYPE
                    , a.FORMAT_GB
                    , a.DIREC_GB
                    , a.TOT_LEN
                    , a.COMMENT
                from aqt_commheader_tb a
                where 1=1
            `;

            const params = [];

            if (req) {
                if (req.app_id) {
                    query += ` AND a.APP_ID = ?`;
                    params.push(req.app_id);
                }
            }
            // 순서 정렬
            query += ` ORDER BY a.COMMHD_ID`;

            //console.log("--------------------------------------------------------");
            //console.log("getCommHeaderList query : " + query);
            //console.log("--------------------------------------------------------");

            const rows = await conn.query(query, params);

            return rows;
        } catch (err) {
            console.error("Error in getCommHeaderList:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    /**
     * getRelMsgList 목록 조회
     */
    getRelMsgList: async (req) => {
        let conn;

        //console.log("--------------------------------------------------------");
        //console.log("req.app_id : " + req.app_id);
        //console.log("req.search_keyword : " + req.search_keyword);
        //console.log("--------------------------------------------------------");

        try {
            conn = await mondb.getConnection();

            let query = `
                select a.MSG_ID
                    , a.APP_ID
                    , a.COMMHD_ID
                    , a.MSG_KR_NM
                    , a.MSG_EN_NM
                    , a.REL_MSG_ID
                    , a.MSG_TYPE
                    , a.FORMAT_GB
                    , a.DIREC_GB
                    , a.TOT_LEN
                    , a.COMMENT
                from aqt_message_tb a
                where 1=1
            `;

            const params = [];

            if (req) {
                if (req.app_id) {
                    query += ` AND a.APP_ID = ?`;
                    params.push(req.app_id);
                }
            }
            // 순서 정렬
            query += ` ORDER BY a.MSG_ID`;

            //console.log("--------------------------------------------------------");
            //console.log("getRelMsgList query : " + query);
            //console.log("--------------------------------------------------------");

            const rows = await conn.query(query, params);

            return rows;
        } catch (err) {
            console.error("Error in getRelMsgList:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },    
    /**
     * SVC/URI 목록 조회
     * @param {Object} req - 요청 파라미터 (app_id 등)
     */
    getSvcUriList: async (req) => {
        let conn;

        //console.log("--------------------------------------------------------");
        //console.log("req.app_id : " + req.app_id);
        //console.log("req.search_keyword : " + req.search_keyword);
        //console.log("--------------------------------------------------------");

        try {
            conn = await mondb.getConnection();

            let query = `
                select a.SVC_ID			as SVC_ID
                    , a.APP_ID			as APP_ID
                    , a.SVC_URI			as SVC_URI
                    , a.SVC_KR_NM		as SVC_KR_NM
                    , a.SVC_EN_NM		as SVC_EN_NM
                    , a.SVC_KIND		as SVC_KIND
                    , a.SVC_MGR			as SVC_MGR
                    , a.CUMCNT			as CUMCNT
                from aqt_service_tb a
                where 1=1
            `;

            const params = [];

            if (req) {
                if (req.app_id) {
                    query += ` AND a.APP_ID = ?`;
                    params.push(req.app_id);
                }
            }
            // 순서 정렬
            query += ` ORDER BY a.SVC_ID`;

            //console.log("--------------------------------------------------------");
            //console.log("getSvcUriList query : " + query);
            //console.log("--------------------------------------------------------");

            const rows = await conn.query(query, params);

            return rows;
        } catch (err) {
            console.error("Error in getSvcUriList:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },    
    /**
     * 전문 목록 조회
     * @param {Object} req - 요청 파라미터 (app_id 등)
     */
    getMessageList: async (req) => {
        let conn;

        //console.log("--------------------------------------------------------");
        //console.log("req.app_id : " + req.app_id);
        //console.log("req.search_keyword : " + req.search_keyword);
        //console.log("--------------------------------------------------------");

        try {
            conn = await mondb.getConnection();

            let query = `
                select (select PRJ_ID from aqt_project_tb limit 1) as PRJ_ID
                    , a.MSG_ID
                    , a.APP_ID
                    , a.COMMHD_ID as COMMHD_ID
                    -- , (select COMMHD_KR_NM from aqt_commheader_tb where COMMHD_ID = a.COMMHD_ID) as COMMHD_ID
                    , a.MSG_KR_NM
                    , a.MSG_EN_NM
                    , a.REL_MSG_ID as REL_MSG_ID
                    -- , (select MSG_KR_NM from aqt_message_tb where MSG_ID = a.REL_MSG_ID) as REL_MSG_ID
                    , a.MSG_TYPE
                    , a.FORMAT_GB
                    , a.DIREC_GB
                    , a.TOT_LEN
                    , a.COMMENT                    
                from aqt_message_tb a
                where 1=1
            `;

            const params = [];

            if (req) {
                if (req.app_id) {
                    query += ` AND a.APP_ID = ?`;
                    params.push(req.app_id);
                }
            }

            // Field Search Keyword
            if (req.search_keyword) {
                query += ` AND (a.MSG_KR_NM LIKE ? OR a.MSG_EN_NM LIKE ? OR a.TOT_LEN LIKE ?)`;
                const keyword = `%${req.search_keyword}%`;
                params.push(keyword, keyword, keyword);
            }
            // 순서 정렬
            query += ` ORDER BY a.MSG_ID`;

            //console.log("--------------------------------------------------------");
            //console.log("getMessageList query : " + query);
            //console.log("--------------------------------------------------------");

            const rows = await conn.query(query, params);

            return rows;
        } catch (err) {
            console.error("Error in getMessageList:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    /**
     * 전문 저장 (추가 및 수정)
     * @param {Array|Object} param - 저장할 전문 정보 리스트 또는 객체
     */
    saveMessage: async (param) => {
        const inputList = Array.isArray(param) ? param : [param];
        let savedCount = 0;
        let conn;

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            for (const item of inputList) {
                //console.log("--------------------------------------------------------");
                //console.log("item.APP_ID : " + item.APP_ID);
                //console.log("item.MSG_ID : " + item.MSG_ID);
                //console.log("item.COMMHD_ID : " + item.COMMHD_ID);
                //console.log("item.MSG_KR_NM : " + item.MSG_KR_NM);
                //console.log("item.MSG_EN_NM : " + item.MSG_EN_NM);
                //console.log("item.MSG_TYPE : " + item.MSG_TYPE);
                //console.log("item.FORMAT_GB : " + item.FORMAT_GB);
                //console.log("item.DIREC_GB : " + item.DIREC_GB);
                //console.log("item.TOT_LEN : " + item.TOT_LEN);
                //console.log("item.COMMENT : " + item.COMMENT);
                //console.log("item.status : "+ item.status);
                //console.log("--------------------------------------------------------");

                const query = `
                    INSERT INTO aqt_message_tb (
                        MSG_ID, APP_ID, COMMHD_ID, MSG_KR_NM, MSG_EN_NM, 
                        REL_MSG_ID, MSG_TYPE, FORMAT_GB, DIREC_GB, TOT_LEN, COMMENT
                    ) VALUES (
                        ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, ?
                    ) ON DUPLICATE KEY UPDATE
                        APP_ID = VALUES(APP_ID),
                        COMMHD_ID = VALUES(COMMHD_ID),
                        MSG_KR_NM = VALUES(MSG_KR_NM),
                        MSG_EN_NM = VALUES(MSG_EN_NM),
                        REL_MSG_ID = VALUES(REL_MSG_ID),
                        MSG_TYPE = VALUES(MSG_TYPE),
                        FORMAT_GB = VALUES(FORMAT_GB),
                        DIREC_GB = VALUES(DIREC_GB),
                        TOT_LEN = VALUES(TOT_LEN),
                        COMMENT = VALUES(COMMENT)
                `;

                const params = [
                    item.MSG_ID || null, // MSG_ID: 없으면 null (Auto Increment)
                    item.APP_ID,
                    item.COMMHD_ID,
                    item.MSG_KR_NM,
                    item.MSG_EN_NM,
                    item.REL_MSG_ID,
                    item.MSG_TYPE,
                    item.FORMAT_GB,
                    item.DIREC_GB,
                    item.TOT_LEN || 0,
                    item.COMMENT
                ];

                //console.log("--------------------------------------------------------");
                //console.log("saveMessage query : " + query);
                //console.log("--------------------------------------------------------");

                await conn.query(query, params);
                savedCount++;
            }

            await conn.commit();
            return { count: savedCount, message: "Messages saved successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in saveMessage:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    /**
     * 전문 삭제
     * @param {Array|Object} param - 저장할 전문 정보 리스트 또는 객체
     */
    deleteMessage: async (param) => {
        const inputList = Array.isArray(param) ? param : [param];
        let deletedCount = 0;
        let conn;

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            for (const item of inputList) {

                //console.log("--------------------------------------------------------");
                //console.log("item.APP_ID : " + item.APP_ID);
                //console.log("item.MSG_ID : " + item.MSG_ID);
                //console.log("--------------------------------------------------------");

                let query = `
                    delete from aqt_message_tb where MSG_ID = ?
                `;

                const params = [item.MSG_ID];

                //console.log("--------------------------------------------------------");
                //console.log("deleteMessage query : " + query);
                //console.log("--------------------------------------------------------");

                await conn.query(query, params);
                deletedCount++;
            }

            await conn.commit();
            return { count: deletedCount, message: "Messages deleted successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in deleteMessage:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
        /**
     * 공통 필드 목록 조회
     * @param {Object} req - 요청 파라미터
     */
    getCommList: async (req) => {
        let conn;
        try {
            conn = await mondb.getConnection();

            let query = `
	    SELECT a.MSGFLD_ID       	as MSGFLD_ID
	         , a.APP_ID             as APP_ID
	         , a.APPNM              as APPNM
	         , a.MSG_ID          	as MSG_ID
	         , a.FLD_KR_NM          as FLD_KR_NM
	         , a.FLD_EN_NM          as FLD_EN_NM
	         , a.FLD_TYPE           as FLD_TYPE
	         , a.FLD_LEN            as FLD_LEN
	         , a.FLD_CMT            as FLD_CMT
	         , a.FLD_SGMT           as FLD_SGMT
	         , a.ST_POS             as ST_POS
	         , a.FLD_DEPTH          as FLD_DEPTH
	         , a.REPET_NUM          as REPET_NUM
	         , a.FLD_ORDER          as FLD_ORDER
	         , a.ESSEN_YN           as ESSEN_YN
	         , a.DEFAULT_VAL        as DEFAULT_VAL
	         , a.FLD_FORMAT         as FLD_FORMAT
	         , a.FLD_CDSET          as FLD_CDSET
	         , a.MASK_YN            as MASK_YN
	         , a.META_CONV_RULE     as META_CONV_RULE
             , ''                   as MSGDT_ID
             , ''        		    as SVC_URI
             , ''       		    as FIXED_VAL
		from (
			    SELECT 1 as MSGFLD_ID, '' as APP_ID, '' as APPNM, '' as MSG_ID 
			    	 ,'서비스/URI'  as FLD_KR_NM, 'Service/URI' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
				union ALL
			    SELECT 2 as MSGFLD_ID, '' as APP_ID, '' as APPNM, '' as MSG_ID 
			    	 ,'프로토콜'  as FLD_KR_NM, 'Protocol' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
				union ALL
			    SELECT 3 as MSGFLD_ID, '' as APP_ID, '' as APPNM, '' as MSG_ID 
			    	 ,'Method'  as FLD_KR_NM, 'Method' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
				union ALL
			    SELECT 4 as MSGFLD_ID, '' as APP_ID, '' as APPNM, '' as MSG_ID 
			    	 ,'헤더'  as FLD_KR_NM, 'Header' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
				union ALL
			    SELECT 5 as MSGFLD_ID, '' as APP_ID, '' as APPNM, '' as MSG_ID 
			    	 ,'파라메터(GET)'  as FLD_KR_NM, 'Paramter(GET)' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
				union ALL
			    SELECT 6 as MSGFLD_ID, '' as APP_ID, '' as APPNM, '' as MSG_ID 
			    	 ,'소스 IP'  as FLD_KR_NM, 'SourceIP' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
				union ALL
			    SELECT 7 as MSGFLD_ID, '' as APP_ID, '' as APPNM, '' as MSG_ID 
			    	 ,'소스 Port'  as FLD_KR_NM, 'SourcePort' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
				union ALL
			    SELECT 8 as MSGFLD_ID, '' as APP_ID, '' as APPNM, '' as MSG_ID 
			    	 ,'원본 목적지 IP'  as FLD_KR_NM, 'O_DestinationIP' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
				union ALL
			    SELECT 9 as MSGFLD_ID, '' as APP_ID, '' as APPNM, '' as MSG_ID 
			    	 ,'원본 목적지 Port'  as FLD_KR_NM, 'O_DestinationPort' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
				union ALL
			    SELECT 10 as MSGFLD_ID, '' as APP_ID, '' as APPNM, '' as MSG_ID 
			    	 ,'목적지 IP'  as FLD_KR_NM, 'DestinationIP' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
				union ALL
			    SELECT 11 as MSGFLD_ID, '' as APP_ID, '' as APPNM, '' as MSG_ID 
			    	 ,'목적지 Port'  as FLD_KR_NM, 'DestinationPort' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
				union ALL
			    SELECT 12 as MSGFLD_ID, '' as APP_ID, '' as APPNM, '' as MSG_ID 
			    	 ,'원본구분'  as FLD_KR_NM, 'OriginalClassification' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
            `;

            const params = [];
            // 순서 정렬
            query += `) a ORDER BY a.ST_POS, a.MSGFLD_ID ASC`;

            //console.log("--------------------------------------------------------------");
            //console.log("req.app_id : " + req.app_id);
            //console.log("req.search_keyword : " + req.search_keyword);
            //console.log("getCommList query : " + query);
            //console.log("--------------------------------------------------------------");

            const rows = await conn.query(query, params);
            return rows;

        } catch (err) {
            console.error("Error in getCommList:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },    
    /**
     * 공통필드 데이터 목록 조회
     * @param {Object} req - 요청 파라미터
     */
    getCommListData: async (req) => {
        let conn;
        try {
            conn = await mondb.getConnection();

            const params = [];

            let query = `
        SELECT A.MSGFLD_ID         AS MSGFLD_ID
            , A.APP_ID             AS APP_ID
            , A.APPNM	           AS APPNM
            , A.MSG_ID             AS MSG_ID
            , A.FLD_KR_NM          AS FLD_KR_NM
            , A.FLD_EN_NM          AS FLD_EN_NM
            , A.FLD_TYPE           AS FLD_TYPE
            , A.FLD_LEN            AS FLD_LEN
            , A.FLD_CMT            AS FLD_CMT
            , A.FLD_SGMT           AS FLD_SGMT
            , A.ST_POS             AS ST_POS
            , A.FLD_DEPTH          AS FLD_DEPTH
            , A.REPET_NUM          AS REPET_NUM
            , A.FLD_ORDER          AS FLD_ORDER
            , A.ESSEN_YN           AS ESSEN_YN
            , A.DEFAULT_VAL        AS DEFAULT_VAL
            , A.FLD_FORMAT         AS FLD_FORMAT
            , A.FLD_CDSET          AS FLD_CDSET
            , A.MASK_YN            AS MASK_YN
            , A.META_CONV_RULE     AS META_CONV_RULE
            , A.MSGDT_ID           AS MSGDT_ID
            , ''        		   AS SVC_URI
            , A.FIXED_VAL		   AS FIXED_VAL
        from (
			    SELECT 1 as MSGFLD_ID, A.APP_ID as APP_ID, '' as APPNM, A.MSG_ID as MSG_ID 
			    	 ,'서비스/URI'  as FLD_KR_NM, 'Service/URI' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
                     ,A.MSGDT_ID AS MSGDT_ID,A.SVC_URI AS FIXED_VAL
                FROM AQT_MESSAGEDATA_TB A
                WHERE 1=1
                `
            if (req) {
                    if (req.app_id) {
                        query += ` AND A.APP_ID = ?`;
                        params.push(req.app_id);
                    }
                    if (req.msg_id) {
                        query += ` AND A.MSG_ID = ?`;
                        params.push(req.msg_id);
                    }
                    if (req.msgdt_id) {
                        query += ` AND A.MSGDT_ID = ?`;
                        params.push(req.msgdt_id);
                    }
            }
            query += `
				union all 
			    SELECT 2 as MSGFLD_ID, A.APP_ID as APP_ID, '' as APPNM, A.MSG_ID as MSG_ID 
			    	 ,'프로토콜'  as FLD_KR_NM, 'Protocol' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
                     ,A.MSGDT_ID AS MSGDT_ID,A.PROTOCOL_GB AS FIXED_VAL
                FROM AQT_MESSAGEDATA_TB A
                WHERE 1=1
                `
            if (req) {
                    if (req.app_id) {
                        query += ` AND A.APP_ID = ?`;
                        params.push(req.app_id);
                    }
                    if (req.msg_id) {
                        query += ` AND A.MSG_ID = ?`;
                        params.push(req.msg_id);
                    }
                    if (req.msgdt_id) {
                        query += ` AND A.MSGDT_ID = ?`;
                        params.push(req.msgdt_id);
                    }
            }
            query += `
				union all 
			    SELECT 3 as MSGFLD_ID, A.APP_ID as APP_ID, '' as APPNM, A.MSG_ID as MSG_ID 
			    	 ,'Method'  as FLD_KR_NM, 'Method' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
                     ,A.MSGDT_ID AS MSGDT_ID,A.METHOD AS FIXED_VAL
                FROM AQT_MESSAGEDATA_TB A
                WHERE 1=1
                `
            if (req) {
                    if (req.app_id) {
                        query += ` AND A.APP_ID = ?`;
                        params.push(req.app_id);
                    }
                    if (req.msg_id) {
                        query += ` AND A.MSG_ID = ?`;
                        params.push(req.msg_id);
                    }
                    if (req.msgdt_id) {
                        query += ` AND A.MSGDT_ID = ?`;
                        params.push(req.msgdt_id);
                    }
            }
            query += `
				union all 
			    SELECT 4 as MSGFLD_ID, A.APP_ID as APP_ID, '' as APPNM, A.MSG_ID as MSG_ID 
			    	 ,'헤더'  as FLD_KR_NM, 'Header' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
                     ,A.MSGDT_ID AS MSGDT_ID,A.HEADER_VAL AS FIXED_VAL
                FROM AQT_MESSAGEDATA_TB A
                WHERE 1=1
                `
            if (req) {
                    if (req.app_id) {
                        query += ` AND A.APP_ID = ?`;
                        params.push(req.app_id);
                    }
                    if (req.msg_id) {
                        query += ` AND A.MSG_ID = ?`;
                        params.push(req.msg_id);
                    }
                    if (req.msgdt_id) {
                        query += ` AND A.MSGDT_ID = ?`;
                        params.push(req.msgdt_id);
                    }
            }
            query += `
				union all 
			    SELECT 5 as MSGFLD_ID, A.APP_ID as APP_ID, '' as APPNM, A.MSG_ID as MSG_ID 
			    	 ,'파라메터(GET)'  as FLD_KR_NM, 'Paramter(GET)' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
                     ,A.MSGDT_ID AS MSGDT_ID,A.PARAM_VAL AS FIXED_VAL
                FROM AQT_MESSAGEDATA_TB A
                WHERE 1=1
                `
            if (req) {
                    if (req.app_id) {
                        query += ` AND A.APP_ID = ?`;
                        params.push(req.app_id);
                    }
                    if (req.msg_id) {
                        query += ` AND A.MSG_ID = ?`;
                        params.push(req.msg_id);
                    }
                    if (req.msgdt_id) {
                        query += ` AND A.MSGDT_ID = ?`;
                        params.push(req.msgdt_id);
                    }
            }
            query += `
				union all 
			    SELECT 6 as MSGFLD_ID, A.APP_ID as APP_ID, '' as APPNM, A.MSG_ID as MSG_ID 
			    	 ,'소스 IP'  as FLD_KR_NM, 'SourceIP' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
                     ,A.MSGDT_ID AS MSGDT_ID,A.srcip AS FIXED_VAL
                FROM AQT_MESSAGEDATA_TB A
                WHERE 1=1
                `
            if (req) {
                    if (req.app_id) {
                        query += ` AND A.APP_ID = ?`;
                        params.push(req.app_id);
                    }
                    if (req.msg_id) {
                        query += ` AND A.MSG_ID = ?`;
                        params.push(req.msg_id);
                    }
                    if (req.msgdt_id) {
                        query += ` AND A.MSGDT_ID = ?`;
                        params.push(req.msgdt_id);
                    }
            }
            query += `
				union all 
			    SELECT 7 as MSGFLD_ID, A.APP_ID as APP_ID, '' as APPNM, A.MSG_ID as MSG_ID 
			    	 ,'소스 Port'  as FLD_KR_NM, 'SourcePort' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
                     ,A.MSGDT_ID AS MSGDT_ID,A.srcport AS FIXED_VAL
                FROM AQT_MESSAGEDATA_TB A
                WHERE 1=1
                `
            if (req) {
                    if (req.app_id) {
                        query += ` AND A.APP_ID = ?`;
                        params.push(req.app_id);
                    }
                    if (req.msg_id) {
                        query += ` AND A.MSG_ID = ?`;
                        params.push(req.msg_id);
                    }
                    if (req.msgdt_id) {
                        query += ` AND A.MSGDT_ID = ?`;
                        params.push(req.msgdt_id);
                    }
            }
            query += `
				union all 
			    SELECT 8 as MSGFLD_ID, A.APP_ID as APP_ID, '' as APPNM, A.MSG_ID as MSG_ID 
			    	 ,'원본 목적지 IP'  as FLD_KR_NM, 'O_DestinationIP' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
                     ,A.MSGDT_ID AS MSGDT_ID,A.o_dstip AS FIXED_VAL
                FROM AQT_MESSAGEDATA_TB A
                WHERE 1=1
                `
            if (req) {
                    if (req.app_id) {
                        query += ` AND A.APP_ID = ?`;
                        params.push(req.app_id);
                    }
                    if (req.msg_id) {
                        query += ` AND A.MSG_ID = ?`;
                        params.push(req.msg_id);
                    }
                    if (req.msgdt_id) {
                        query += ` AND A.MSGDT_ID = ?`;
                        params.push(req.msgdt_id);
                    }
            }
            query += `
				union all 
			    SELECT 9 as MSGFLD_ID, A.APP_ID as APP_ID, '' as APPNM, A.MSG_ID as MSG_ID 
			    	 ,'원본 목적지 Port'  as FLD_KR_NM, 'O_DestinationPort' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
                     ,A.MSGDT_ID AS MSGDT_ID,A.o_dstport AS FIXED_VAL
                FROM AQT_MESSAGEDATA_TB A
                WHERE 1=1
                `
            if (req) {
                    if (req.app_id) {
                        query += ` AND A.APP_ID = ?`;
                        params.push(req.app_id);
                    }
                    if (req.msg_id) {
                        query += ` AND A.MSG_ID = ?`;
                        params.push(req.msg_id);
                    }
                    if (req.msgdt_id) {
                        query += ` AND A.MSGDT_ID = ?`;
                        params.push(req.msgdt_id);
                    }
            }
            query += `
				union all 
			    SELECT 10 as MSGFLD_ID, A.APP_ID as APP_ID, '' as APPNM, A.MSG_ID as MSG_ID 
			    	 ,'목적지 IP'  as FLD_KR_NM, 'DestinationIP' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
                     ,A.MSGDT_ID AS MSGDT_ID,A.dstip AS FIXED_VAL
                FROM AQT_MESSAGEDATA_TB A
                WHERE 1=1
                `
            if (req) {
                    if (req.app_id) {
                        query += ` AND A.APP_ID = ?`;
                        params.push(req.app_id);
                    }
                    if (req.msg_id) {
                        query += ` AND A.MSG_ID = ?`;
                        params.push(req.msg_id);
                    }
                    if (req.msgdt_id) {
                        query += ` AND A.MSGDT_ID = ?`;
                        params.push(req.msgdt_id);
                    }
            }
            query += `
				union all 
			    SELECT 11 as MSGFLD_ID, A.APP_ID as APP_ID, '' as APPNM, A.MSG_ID as MSG_ID 
			    	 ,'목적지 Port'  as FLD_KR_NM, 'DestinationPort' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
                     ,A.MSGDT_ID AS MSGDT_ID,A.dstport AS FIXED_VAL
                FROM AQT_MESSAGEDATA_TB A
                WHERE 1=1
                `
            if (req) {
                    if (req.app_id) {
                        query += ` AND A.APP_ID = ?`;
                        params.push(req.app_id);
                    }
                    if (req.msg_id) {
                        query += ` AND A.MSG_ID = ?`;
                        params.push(req.msg_id);
                    }
                    if (req.msgdt_id) {
                        query += ` AND A.MSGDT_ID = ?`;
                        params.push(req.msgdt_id);
                    }
            }
            query += `
				union all 
			    SELECT 12 as MSGFLD_ID, A.APP_ID as APP_ID, '' as APPNM, A.MSG_ID as MSG_ID 
			    	 ,'원본구분'  as FLD_KR_NM, 'OriginalClassification' as FLD_EN_NM
			         ,'' as FLD_TYPE,'' as FLD_LEN,'' as FLD_CMT,'' as FLD_SGMT,0 as ST_POS, 0 as FLD_DEPTH, 0 as REPET_NUM
			         ,'' as FLD_ORDER,'' as ESSEN_YN,'' as DEFAULT_VAL,'' as FLD_FORMAT,'' as FLD_CDSET,'' as MASK_YN,'' as META_CONV_RULE
                     ,A.MSGDT_ID AS MSGDT_ID,A.origin AS FIXED_VAL
                FROM AQT_MESSAGEDATA_TB A
                WHERE 1=1
                `
            if (req) {
                    if (req.app_id) {
                        query += ` AND A.APP_ID = ?`;
                        params.push(req.app_id);
                    }
                    if (req.msg_id) {
                        query += ` AND A.MSG_ID = ?`;
                        params.push(req.msg_id);
                    }
                    if (req.msgdt_id) {
                        query += ` AND A.MSGDT_ID = ?`;
                        params.push(req.msgdt_id);
                    }
            }

            // 순서 정렬
            query += ` ) A ORDER BY A.ST_POS, A.APP_ID, A.MSG_ID, A.MSGFLD_ID `;

            //console.log("==============================================================");
            //console.log("req.app_id : " + req.app_id);
            //console.log("req.msg_id : " + req.msg_id);
            //console.log("req.msgdt_id : " + req.msgdt_id);
            //console.log("req.search_keyword : " + req.search_keyword);
            //console.log("getCommListData query : " + query);
            //console.log("==============================================================");

            const rows = await conn.query(query, params);

            return rows;

        } catch (err) {
            console.error("Error in getCommListData:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },    
    /**
     * 업무 양식+데이터 목록 조회
     * @param {Object} req - 요청 파라미터
     */
    getMessListData: async (req) => {
        let conn;
        try {
            conn = await mondb.getConnection();

            const params = [];

            let query = `
                SELECT A.MSGFLD_ID          AS MSGFLD_ID
                    , A.APP_ID             AS APP_ID
                    , B.APPNM              AS APPNM
                    , A.MSG_ID             AS MSG_ID
                    , X.MSGDT_ID           AS MSGDT_ID
                    , A.FLD_KR_NM          AS FLD_KR_NM
                    , A.FLD_EN_NM          AS FLD_EN_NM
                    , A.FLD_TYPE           AS FLD_TYPE
                    , NVL(A.FLD_LEN,0)     AS FLD_LEN
                    , A.FLD_CMT            AS FLD_CMT
                    , A.FLD_SGMT           AS FLD_SGMT
                    , NVL(A.ST_POS,0)      AS ST_POS
                    , A.FLD_DEPTH          AS FLD_DEPTH
                    , A.REPET_NUM          AS REPET_NUM
                    , A.FLD_ORDER          AS FLD_ORDER
                    , A.ESSEN_YN           AS ESSEN_YN
                    , A.DEFAULT_VAL        AS DEFAULT_VAL
                    , A.FLD_FORMAT         AS FLD_FORMAT
                    , TRIM(NVL(SUBSTR(X.FIXEDLEN_VAL, NVL(A.ST_POS,0), NVL(A.FLD_LEN,0)),''))   AS FIXED_VAL
                    , ""                   AS PROTOCOL_GB
                    , ""                   AS METHOD
                    , ""                   AS HEADER_VAL
                    , ""                   AS PARAM_VAL
                    , ""                   AS FIXEDLENVAL
                    , ""                   AS srcip
                    , 0                    AS srcport
                    , ""                   AS o_dstip
                    , 0                    AS o_dstport
                    , ""                   AS dstip
                    , 0                    AS dstport
                    , ""                   AS origin
                FROM ( SELECT a.MSGFLD_ID          as MSGFLD_ID
                            , a.APP_ID             as APP_ID
                            , a.MSG_ID             as MSG_ID
                            , a.FLD_KR_NM          as FLD_KR_NM
                            , a.FLD_EN_NM          as FLD_EN_NM
                            , a.FLD_TYPE           as FLD_TYPE
                            , a.FLD_LEN            as FLD_LEN
                            , a.FLD_CMT            as FLD_CMT
                            , a.FLD_SGMT           as FLD_SGMT
                            , a.ST_POS + (select sum(fld_len) 
                                            from aqt_commheaderfield_tb 
                                            where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND APP_ID = ?`;
                    params.push(req.app_id);
                }
            }

            query += `
                                        )	as ST_POS
                            , a.FLD_DEPTH          as FLD_DEPTH
                            , a.REPET_NUM          as REPET_NUM
                            , a.FLD_ORDER          as FLD_ORDER
                            , a.ESSEN_YN           as ESSEN_YN
                            , a.DEFAULT_VAL        as DEFAULT_VAL
                            , a.FLD_FORMAT         as FLD_FORMAT
                        from aqt_messagefield_tb a
                        where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND APP_ID = ?`;
                    params.push(req.app_id);
                }
                if (req.msg_id) {
                    query += ` AND MSG_ID = ?`;
                    params.push(req.msg_id);
                }
            }

            query += `
                        union all
                        SELECT a.COMMHDFLD_ID       as MSGFLD_ID
                            , a.APP_ID             as APP_ID
                            , a.COMMHD_ID          as MSG_ID
                            , a.FLD_KR_NM          as FLD_KR_NM
                            , a.FLD_EN_NM          as FLD_EN_NM
                            , a.FLD_TYPE           as FLD_TYPE
                            , a.FLD_LEN            as FLD_LEN
                            , a.FLD_CMT            as FLD_CMT
                            , a.FLD_SGMT           as FLD_SGMT
                            , a.ST_POS             as ST_POS
                            , 0			           as FLD_DEPTH
                            , 0          		   as REPET_NUM
                            , a.FLD_ORDER          as FLD_ORDER
                            , a.ESSEN_YN           as ESSEN_YN
                            , a.DEFAULT_VAL        as DEFAULT_VAL
                            , a.FLD_FORMAT         as FLD_FORMAT
                        from aqt_commheaderfield_tb a
                        where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND a.APP_ID = ?`;
                    params.push(req.app_id);
                }
            }

            query += `
                    ) A        
                JOIN AQT_BUSINESS_TB B
                    ON B.APP_ID = A.APP_ID
                LEFT OUTER JOIN (SELECT APP_ID, MSG_ID, MSGDT_ID, nvl(cast(FIXEDLEN_VAL as char character set utf8),'') as FIXEDLEN_VAL
                                    FROM AQT_MESSAGEDATA_TB
                                    WHERE 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND APP_ID = ?`;
                    params.push(req.app_id);
                }
                if (req.msg_id) {
                    query += ` AND MSG_ID = ?`;
                    params.push(req.msg_id);
                }
                if (req.msgdt_id) {
                    query += ` AND MSGDT_ID = ?`;
                    params.push(req.msgdt_id);
                }
            }

            query += `

                                ) X
                    ON A.APP_ID = X.APP_ID
                WHERE 1=1
            `;

            if (req) {
                // Field Search Keyword
                if (req.search_keyword) {
                    query += ` AND (A.FLD_KR_NM LIKE ? OR A.FLD_EN_NM LIKE ? OR A.FLD_TYPE LIKE ? OR A.FLD_LEN LIKE ? OR A.ESSEN_YN LIKE ? OR TRIM(NVL(SUBSTR(X.FIXEDLEN_VAL, NVL(A.ST_POS,0), NVL(A.FLD_LEN,0)),'')) LIKE ?)`;
                    const keyword = `%${req.search_keyword}%`;
                    params.push(keyword, keyword, keyword, keyword, keyword, keyword);
                }
            }
            // 순서 정렬
            query += ` ORDER BY A.ST_POS, A.APP_ID, A.MSG_ID`;

            console.log("-------------------------------------------------");
            console.log("req.app_id : " + req.app_id);
            console.log("req.msg_id : " + req.msg_id);
            console.log("req.msgdt_id : " + req.msgdt_id);
            console.log("getMessListData query : " + query);
            console.log("-------------------------------------------------");

            const rows = await conn.query(query, params);

            return rows;

        } catch (err) {
            console.error("Error in getMessListData:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    /**
     * 업무 양식 목록 조회
     * @param {Object} req - 요청 파라미터
     */
    getMessListMess: async (req) => {
        let conn;
        try {
            conn = await mondb.getConnection();

            const params = [];

            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            //console.log("req.app_id : " + req.app_id);
            //console.log("req.msg_id : " + req.msg_id);
            //console.log("req.search_keyword : " + req.search_keyword);
            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

            let query = `
                SELECT a.MSGFLD_ID          as MSGFLD_ID
                    , a.APP_ID             as APP_ID
                    , b.APPNM              as APPNM
                    , a.MSG_ID             as MSG_ID
                    , a.FLD_KR_NM          as FLD_KR_NM
                    , a.FLD_EN_NM          as FLD_EN_NM
                    , a.FLD_TYPE           as FLD_TYPE
                    , a.FLD_LEN            as FLD_LEN
                    , a.FLD_CMT            as FLD_CMT
                    , a.FLD_SGMT           as FLD_SGMT
                    , a.ST_POS             as ST_POS
                    , a.FLD_DEPTH          as FLD_DEPTH
                    , a.REPET_NUM          as REPET_NUM
                    , a.FLD_ORDER          as FLD_ORDER
                    , a.ESSEN_YN           as ESSEN_YN
                    , a.DEFAULT_VAL        as DEFAULT_VAL
                    , a.FLD_FORMAT         as FLD_FORMAT
                    , case a.DY_YN when '0' then false else true end              as DY_YN
                    , a.DY_KIND            as DY_KIND
                FROM ( SELECT a.MSGFLD_ID          as MSGFLD_ID
                            , a.APP_ID             as APP_ID
                            , a.MSG_ID             as MSG_ID
                            , a.FLD_KR_NM          as FLD_KR_NM
                            , a.FLD_EN_NM          as FLD_EN_NM
                            , a.FLD_TYPE           as FLD_TYPE
                            , a.FLD_LEN            as FLD_LEN
                            , a.FLD_CMT            as FLD_CMT
                            , a.FLD_SGMT           as FLD_SGMT
                            , a.ST_POS             as ST_POS
                            , a.FLD_DEPTH          as FLD_DEPTH
                            , a.REPET_NUM          as REPET_NUM
                            , a.FLD_ORDER          as FLD_ORDER
                            , a.ESSEN_YN           as ESSEN_YN
                            , a.DEFAULT_VAL        as DEFAULT_VAL
                            , a.FLD_FORMAT         as FLD_FORMAT
                            , a.DY_YN              as DY_YN
                            , a.DY_KIND            as DY_KIND
                        from aqt_messagefield_tb a
                        where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND A.APP_ID = ?`;
                    params.push(req.app_id);
                }
                if (req.msg_id) {
                    query += ` AND A.MSG_ID = ?`;
                    params.push(req.msg_id);
                }
            }

            query += ` ) a
                join aqt_business_tb b
                    on b.app_id = a.app_id
                WHERE 1=1
            `;

                // Field Search Keyword
                if (req.search_keyword) {
                    query += ` AND (a.FLD_KR_NM LIKE ? OR a.FLD_EN_NM LIKE ? OR a.FLD_TYPE LIKE ? OR a.FLD_LEN LIKE ? OR a.ESSEN_YN LIKE ?)`;
                    const keyword = `%${req.search_keyword}%`;
                    params.push(keyword, keyword, keyword, keyword, keyword);
                }

            // 순서 정렬
            query += ` ORDER BY a.ST_POS ASC`;

            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            //console.log("getMessListMess query : " + query);
            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

            const rows = await conn.query(query, params);
            return rows;

        } catch (err) {
            console.error("Error in getMessListMess:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },    
    /**
     * 업무 양식 목록 조회
     * @param {Object} req - 요청 파라미터
     */
    getMessList: async (req) => {
        let conn;
        try {
            conn = await mondb.getConnection();

            const params = [];

            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            //console.log("req.app_id : " + req.app_id);
            //console.log("req.msg_id : " + req.msg_id);
            //console.log("req.search_keyword : " + req.search_keyword);
            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

            let query = `
                SELECT a.MSGFLD_ID          as MSGFLD_ID
                    , a.APP_ID             as APP_ID
                    , b.APPNM              as APPNM
                    , a.MSG_ID             as MSG_ID
                    , a.FLD_KR_NM          as FLD_KR_NM
                    , a.FLD_EN_NM          as FLD_EN_NM
                    , a.FLD_TYPE           as FLD_TYPE
                    , a.FLD_LEN            as FLD_LEN
                    , a.FLD_CMT            as FLD_CMT
                    , a.FLD_SGMT           as FLD_SGMT
                    , a.ST_POS             as ST_POS
                    , a.FLD_DEPTH          as FLD_DEPTH
                    , a.REPET_NUM          as REPET_NUM
                    , a.FLD_ORDER          as FLD_ORDER
                    , a.ESSEN_YN           as ESSEN_YN
                    , a.DEFAULT_VAL        as DEFAULT_VAL
                    , a.FLD_FORMAT         as FLD_FORMAT
                    , case a.DY_YN when '0' then false else true end              as DY_YN
                    , a.DY_KIND            as DY_KIND
                FROM ( SELECT a.MSGFLD_ID          as MSGFLD_ID
                            , a.APP_ID             as APP_ID
                            , a.MSG_ID             as MSG_ID
                            , a.FLD_KR_NM          as FLD_KR_NM
                            , a.FLD_EN_NM          as FLD_EN_NM
                            , a.FLD_TYPE           as FLD_TYPE
                            , a.FLD_LEN            as FLD_LEN
                            , a.FLD_CMT            as FLD_CMT
                            , a.FLD_SGMT           as FLD_SGMT
                            , a.ST_POS + (select sum(fld_len) 
                                            from aqt_commheaderfield_tb 
                                            where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND APP_ID = ?`;
                    params.push(req.app_id);
                }
            }

            query += `                             
                                            )	as ST_POS
                            , a.FLD_DEPTH          as FLD_DEPTH
                            , a.REPET_NUM          as REPET_NUM
                            , a.FLD_ORDER          as FLD_ORDER
                            , a.ESSEN_YN           as ESSEN_YN
                            , a.DEFAULT_VAL        as DEFAULT_VAL
                            , a.FLD_FORMAT         as FLD_FORMAT
                            , a.DY_YN              as DY_YN
                            , a.DY_KIND            as DY_KIND
                        from aqt_messagefield_tb a
                        where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND A.APP_ID = ?`;
                    params.push(req.app_id);
                }
                if (req.msg_id) {
                    query += ` AND A.MSG_ID = ?`;
                    params.push(req.msg_id);
                }
            }

            query += `                             
                        union all
                        SELECT a.COMMHDFLD_ID       as MSGFLD_ID
                            , a.APP_ID             as APP_ID
                            , a.COMMHD_ID          as MSG_ID
                            , a.FLD_KR_NM          as FLD_KR_NM
                            , a.FLD_EN_NM          as FLD_EN_NM
                            , a.FLD_TYPE           as FLD_TYPE
                            , a.FLD_LEN            as FLD_LEN
                            , a.FLD_CMT            as FLD_CMT
                            , a.FLD_SGMT           as FLD_SGMT
                            , a.ST_POS             as ST_POS
                            , 0			        as FLD_DEPTH
                            , 0          			as REPET_NUM
                            , a.FLD_ORDER          as FLD_ORDER
                            , a.ESSEN_YN           as ESSEN_YN
                            , a.DEFAULT_VAL        as DEFAULT_VAL
                            , a.FLD_FORMAT         as FLD_FORMAT
                            , '0'                  as DY_YN
                            , ''                   as DY_KIND
                        from aqt_commheaderfield_tb a
                        where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND a.APP_ID = ?`;
                    params.push(req.app_id);
                }
            }

            query += ` ) a
                join aqt_business_tb b
                    on b.app_id = a.app_id
                WHERE 1=1
            `;

                // Field Search Keyword
                if (req.search_keyword) {
                    query += ` AND (a.FLD_KR_NM LIKE ? OR a.FLD_EN_NM LIKE ? OR a.FLD_TYPE LIKE ? OR a.FLD_LEN LIKE ? OR a.ESSEN_YN LIKE ?)`;
                    const keyword = `%${req.search_keyword}%`;
                    params.push(keyword, keyword, keyword, keyword, keyword);
                }

            // 순서 정렬
            query += ` ORDER BY a.APP_ID, a.MSG_ID, a.ST_POS ASC`;

            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            //console.log("getMessList query : " + query);
            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

            const rows = await conn.query(query, params);
            return rows;

        } catch (err) {
            console.error("Error in getMessList:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    /**
     * 필드 데이터 목록 조회
     * @param {Object} req - 요청 파라미터
     */
    getFieldListData: async (req) => {
        let conn;
        try {
            conn = await mondb.getConnection();

            const params = [];

            let query = `
                SELECT A.MSGFLD_ID          AS MSGFLD_ID
                    , A.APP_ID             AS APP_ID
                    , B.APPNM              AS APPNM
                    , A.MSG_ID             AS MSG_ID
                    , A.FLD_KR_NM          AS FLD_KR_NM
                    , A.FLD_EN_NM          AS FLD_EN_NM
                    , A.FLD_TYPE           AS FLD_TYPE
                    , A.FLD_LEN            AS FLD_LEN
                    , A.FLD_CMT            AS FLD_CMT
                    , A.FLD_SGMT           AS FLD_SGMT
                    , A.ST_POS             AS ST_POS
                    , A.FLD_DEPTH          AS FLD_DEPTH
                    , A.REPET_NUM          AS REPET_NUM
                    , A.FLD_ORDER          AS FLD_ORDER
                    , A.ESSEN_YN           AS ESSEN_YN
                    , A.DEFAULT_VAL        AS DEFAULT_VAL
                    , A.FLD_FORMAT         AS FLD_FORMAT
                    , X.MSGDT_ID           AS MSGDT_ID
                    , X.FIXEDLEN_VAL
                    , NVL(A.ST_POS,0)
                    , NVL(A.FLD_LEN,0)
                    , TRIM(NVL(SUBSTR(X.FIXEDLEN_VAL, NVL(A.ST_POS,0), NVL(A.FLD_LEN,0)),''))   AS FIXED_VAL
                FROM ( SELECT a.MSGFLD_ID          as MSGFLD_ID
                            , a.APP_ID             as APP_ID
                            , a.MSG_ID             as MSG_ID
                            , a.FLD_KR_NM          as FLD_KR_NM
                            , a.FLD_EN_NM          as FLD_EN_NM
                            , a.FLD_TYPE           as FLD_TYPE
                            , a.FLD_LEN            as FLD_LEN
                            , a.FLD_CMT            as FLD_CMT
                            , a.FLD_SGMT           as FLD_SGMT
                            , a.ST_POS + (select sum(fld_len) 
                                            from aqt_commheaderfield_tb 
                                            where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND APP_ID = ?`;
                    params.push(req.app_id);
                }
            }

            query += `
                                        )	as ST_POS
                            , a.FLD_DEPTH          as FLD_DEPTH
                            , a.REPET_NUM          as REPET_NUM
                            , a.FLD_ORDER          as FLD_ORDER
                            , a.ESSEN_YN           as ESSEN_YN
                            , a.DEFAULT_VAL        as DEFAULT_VAL
                            , a.FLD_FORMAT         as FLD_FORMAT
                        from aqt_messagefield_tb a
                        where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND APP_ID = ?`;
                    params.push(req.app_id);
                }
                if (req.msg_id) {
                    query += ` AND MSG_ID = ?`;
                    params.push(req.msg_id);
                }
            }

            query += `
                        union all
                        SELECT a.COMMHDFLD_ID       as MSGFLD_ID
                            , a.APP_ID             as APP_ID
                            , a.COMMHD_ID          as MSG_ID
                            , a.FLD_KR_NM          as FLD_KR_NM
                            , a.FLD_EN_NM          as FLD_EN_NM
                            , a.FLD_TYPE           as FLD_TYPE
                            , a.FLD_LEN            as FLD_LEN
                            , a.FLD_CMT            as FLD_CMT
                            , a.FLD_SGMT           as FLD_SGMT
                            , a.ST_POS             as ST_POS
                            , 0			           as FLD_DEPTH
                            , 0          		   as REPET_NUM
                            , a.FLD_ORDER          as FLD_ORDER
                            , a.ESSEN_YN           as ESSEN_YN
                            , a.DEFAULT_VAL        as DEFAULT_VAL
                            , a.FLD_FORMAT         as FLD_FORMAT
                        from aqt_commheaderfield_tb a
                        where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND a.APP_ID = ?`;
                    params.push(req.app_id);
                }
            }

            query += `
                    ) A        
                JOIN AQT_BUSINESS_TB B
                    ON B.APP_ID = A.APP_ID
                LEFT OUTER JOIN (SELECT APP_ID, MSG_ID, MSGDT_ID, nvl(cast(FIXEDLEN_VAL as char character set utf8),'') as FIXEDLEN_VAL
                                    FROM AQT_MESSAGEDATA_TB
                                    WHERE 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND APP_ID = ?`;
                    params.push(req.app_id);
                }
                if (req.msg_id) {
                    query += ` AND MSG_ID = ?`;
                    params.push(req.msg_id);
                }
                if (req.msgdt_id) {
                    query += ` AND MSGDT_ID = ?`;
                    params.push(req.msgdt_id);
                }
            }

            query += `

                                ) X
                    ON A.APP_ID = X.APP_ID
                WHERE 1=1
            `;

            if (req) {
                // Field Search Keyword
                if (req.search_keyword) {
                    query += ` AND (A.FLD_KR_NM LIKE ? OR A.FLD_EN_NM LIKE ? OR A.FLD_TYPE LIKE ? OR A.FLD_LEN LIKE ? OR A.ESSEN_YN LIKE ? OR TRIM(NVL(SUBSTR(X.FIXEDLEN_VAL, NVL(A.ST_POS,0), NVL(A.FLD_LEN,0)),'')) LIKE ?)`;
                    const keyword = `%${req.search_keyword}%`;
                    params.push(keyword, keyword, keyword, keyword, keyword, keyword);
                }
            }
            // 순서 정렬
            query += ` ORDER BY A.ST_POS, A.APP_ID, A.MSG_ID`;

            //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            //console.log("req.app_id : " + req.app_id);
            //console.log("req.msg_id : " + req.msg_id);
            //console.log("req.msgdt_id : " + req.msgdt_id);
            //console.log("getFieldListData query : " + query);
            //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

            const rows = await conn.query(query, params);

            return rows;

        } catch (err) {
            console.error("Error in getFieldListData:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    /**
     * 필드 데이터 저장 (추가 및 수정)
     * @param {Array|Object} param - 저장할 필드 정보
     */
    saveFieldData: async (param) => {
        const inputList = Array.isArray(param) ? param : [param];

        let savedCount = 0;
        let conn;
        let itappid = "";
        let itmsgid = "";
        let itmsgfldid = "";
        let itmsgdtid = "";
        let itstatus = "";
        let fixedlenval = "";
        let svcuri = "";
        let protocolgbval = "";
        let methodval = "";
        let headerval = "";
        let paramval = "";
        let srcipval = "";
        let srcportval = "";
        let odstipval = "";
        let odstportval = "";
        let dstipval = "";
        let dstportval = "";
        let originval = "";

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            for (const item of inputList) {
                //console.log("--------------------------------------------");
                //console.log("savedCount      : " + savedCount);

                if (savedCount == 0){
                    fixedlenval = item.FIXEDLENVAL;
                    svcuri = item.SVC_URI;
                    protocolgbval = item.PROTOCOL_GB;
                    methodval = item.METHOD;
                    headerval = item.HEADER_VAL;
                    paramval = item.PARAM_VAL;
                    srcipval = item.srcip;
                    srcportval = item.srcport;
                    odstipval = item.o_dstip;
                    odstportval = item.o_dstport;
                    dstipval = item.dstip;
                    dstportval = item.dstport;
                    originval = item.origin;
                }

                itappid     = item.APP_ID;
                itmsgid     = item.MSG_ID;
                itmsgfldid  = item.MSGFLD_ID;
                itmsgdtid   = item.MSGDT_ID;
                itstatus    = item.status;

                savedCount++;
            }

            /*
                // MSGFLD_ID 채번 (없거나 New인 경우) - Format: FLD + 11 digits
                if (!itmsgdtid) {
                    const rows = await conn.query(`
                            SELECT LPAD(IFNULL(MAX(CAST(SUBSTRING(MSGDT_ID, 4) AS UNSIGNED)), 0) + 1, 11, '0') AS NEXT_SEQ 
                            FROM aqt_messagedata_tb 
                            WHERE APP_ID = ? 
                            AND MSG_ID = ?
                        `, [itappid, itmsgid]
                    );

                    itpkey = null;
                    itmsgdtid = 'MDT' + (rows[0].NEXT_SEQ || '00000000001');
                }
            */

            const query = `
                INSERT INTO aqt_messagedata_tb (
                    MSGDT_ID, APP_ID, MSG_ID 
                    , SVC_URI, PROTOCOL_GB, METHOD, HEADER_VAL
                    , PARAM_VAL
                    , FIXEDLEN_VAL
                    , CRT_ID, CRT_DT, UDT_ID, UDT_DT
                    , srcip, srcport, o_dstip, o_dstport, dstip, dstport, origin            
                ) VALUES (
                    ?, ?, ?
                    , ?, ?, ?, ?
                    , ?
                    , ?
                    , 'monadmin', SYSDATE(), 'monadmin', SYSDATE()
                    , ?, ?, ?, ?, ?, ?, ?
                ) ON DUPLICATE KEY UPDATE
                    SVC_URI = VALUES(SVC_URI)
                    , PROTOCOL_GB = VALUES(PROTOCOL_GB)
                    , METHOD = VALUES(METHOD)
                    , HEADER_VAL = VALUES(HEADER_VAL)
                    , PARAM_VAL = VALUES(PARAM_VAL)
                    , FIXEDLEN_VAL = VALUES(FIXEDLEN_VAL)
                    , UDT_ID = 'monadmin'
                    , UDT_DT = SYSDATE()
                    , srcip = VALUES(srcip)
                    , srcport = VALUES(srcport)
                    , o_dstip = VALUES(o_dstip)
                    , o_dstport = VALUES(o_dstport)
                    , dstip = VALUES(dstip)
                    , dstport = VALUES(dstport)
                    , origin   = VALUES(origin)
            `;

            const params = [
                itmsgdtid || null
                , itappid
                , itmsgid
                , svcuri
                , protocolgbval
                , methodval
                , headerval
                , paramval
                , fixedlenval
                , srcipval
                , srcportval
                , odstipval
                , odstportval
                , dstipval
                , dstportval
                , originval
            ];

            //console.log("--------------------------------------------");
            //console.log("itmsgdtid        : " + itmsgdtid);
            //console.log("itappid          : " + itappid);
            //console.log("itmsgid          : " + itmsgid);
            //console.log("svcuri           : " + svcuri);
            //console.log("protocolgbval    : " + protocolgbval);
            //console.log("methodval        : " + methodval);
            //console.log("headerval        : " + headerval);
            //console.log("paramval         : " + paramval);
            //console.log("fixedlenval      : " + fixedlenval);
            //console.log("srcipval         : " + srcipval);
            //console.log("srcportval       : " + srcportval);
            //console.log("odstipval        : " + odstipval);
            //console.log("odstportval      : " + odstportval);
            //console.log("dstipval         : " + dstipval);
            //console.log("dstportval       : " + dstportval);
            //console.log("originval        : " + originval);
            //console.log("saveFieldData query       : " + query);
            //console.log("--------------------------------------------");

            await conn.query(query, params);            
            await conn.commit();
            
            return { count: savedCount, message: "saveFieldData successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in saveFieldData :", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },    
    /**
     * 필드 목록 조회
     * @param {Object} req - 요청 파라미터
     */
    getFieldList: async (req) => {
        let conn;
        try {
            conn = await mondb.getConnection();

            const params = [];

            let query = `
                SELECT a.MSGFLD_ID          as MSGFLD_ID
                    , a.APP_ID             as APP_ID
                    , b.APPNM              as APPNM
                    , a.MSG_ID             as MSG_ID
                    , a.FLD_KR_NM          as FLD_KR_NM
                    , a.FLD_EN_NM          as FLD_EN_NM
                    , a.FLD_TYPE           as FLD_TYPE
                    , a.FLD_LEN            as FLD_LEN
                    , a.FLD_CMT            as FLD_CMT
                    , a.FLD_SGMT           as FLD_SGMT
                    , a.ST_POS             as ST_POS
                    , a.FLD_DEPTH          as FLD_DEPTH
                    , a.REPET_NUM          as REPET_NUM
                    , a.FLD_ORDER          as FLD_ORDER
                    , a.ESSEN_YN           as ESSEN_YN
                    , a.DEFAULT_VAL        as DEFAULT_VAL
                    , a.FLD_FORMAT         as FLD_FORMAT
                FROM ( SELECT a.MSGFLD_ID          as MSGFLD_ID
                            , a.APP_ID             as APP_ID
                            , a.MSG_ID             as MSG_ID
                            , a.FLD_KR_NM          as FLD_KR_NM
                            , a.FLD_EN_NM          as FLD_EN_NM
                            , a.FLD_TYPE           as FLD_TYPE
                            , a.FLD_LEN            as FLD_LEN
                            , a.FLD_CMT            as FLD_CMT
                            , a.FLD_SGMT           as FLD_SGMT
                            , a.ST_POS + (select sum(fld_len) 
                                            from aqt_commheaderfield_tb 
                                            where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND APP_ID = ?`;
                    params.push(req.app_id);
                }
            }

            query += `                             
                                            )	as ST_POS
                            , a.FLD_DEPTH          as FLD_DEPTH
                            , a.REPET_NUM          as REPET_NUM
                            , a.FLD_ORDER          as FLD_ORDER
                            , a.ESSEN_YN           as ESSEN_YN
                            , a.DEFAULT_VAL        as DEFAULT_VAL
                            , a.FLD_FORMAT         as FLD_FORMAT
                        from aqt_messagefield_tb a
                        where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND A.APP_ID = ?`;
                    params.push(req.app_id);
                }
                if (req.msg_id) {
                    query += ` AND A.MSG_ID = ?`;
                    params.push(req.msg_id);
                }
            }

            query += `                             
                        union all
                        SELECT a.COMMHDFLD_ID       as MSGFLD_ID
                            , a.APP_ID             as APP_ID
                            , a.COMMHD_ID          as MSG_ID
                            , a.FLD_KR_NM          as FLD_KR_NM
                            , a.FLD_EN_NM          as FLD_EN_NM
                            , a.FLD_TYPE           as FLD_TYPE
                            , a.FLD_LEN            as FLD_LEN
                            , a.FLD_CMT            as FLD_CMT
                            , a.FLD_SGMT           as FLD_SGMT
                            , a.ST_POS             as ST_POS
                            , 0			        as FLD_DEPTH
                            , 0          			as REPET_NUM
                            , a.FLD_ORDER          as FLD_ORDER
                            , a.ESSEN_YN           as ESSEN_YN
                            , a.DEFAULT_VAL        as DEFAULT_VAL
                            , a.FLD_FORMAT         as FLD_FORMAT
                        from aqt_commheaderfield_tb a
                        where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND a.APP_ID = ?`;
                    params.push(req.app_id);
                }
            }

            query += ` ) a
                join aqt_business_tb b
                    on b.app_id = a.app_id
                WHERE 1=1
            `;

                // Field Search Keyword
                if (req.search_keyword) {
                    query += ` AND (a.FLD_KR_NM LIKE ? OR a.FLD_EN_NM LIKE ? OR a.FLD_TYPE LIKE ? OR a.FLD_LEN LIKE ? OR a.ESSEN_YN LIKE ?)`;
                    const keyword = `%${req.search_keyword}%`;
                    params.push(keyword, keyword, keyword, keyword, keyword);
                }

            // 순서 정렬
            query += ` ORDER BY a.ST_POS ASC`;

            //console.log("##############################################################");
            //console.log("req.app_id : " + req.app_id);
            //console.log("req.msg_id : " + req.msg_id);
            //console.log("req.msgdt_id : " + req.msgdt_id);
            //console.log("getFieldList query : " + query);
            //console.log("##############################################################");

            const rows = await conn.query(query, params);
            return rows;

        } catch (err) {
            console.error("Error in getFieldList:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    /**
     * 필드 저장 (추가 및 수정)
     * @param {Array|Object} param - 저장할 필드 정보
     */
    saveField: async (param) => {
        const inputList = Array.isArray(param) ? param : [param];
        let savedCount = 0;
        let conn;

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            for (const item of inputList) {

                //console.log("##############################################################");
                //console.log("item.MSGFLD_ID : " + item.MSGFLD_ID);
                //console.log("item.APP_ID : " + item.APP_ID);
                //console.log("item.MSG_ID : " + item.MSG_ID);
                //console.log("item.FLD_KR_NM : " + item.FLD_KR_NM);
                //console.log("item.FLD_EN_NM : " + item.FLD_EN_NM);
                //console.log("item.FLD_TYPE : " + item.FLD_TYPE);
                //console.log("item.FLD_LEN : " + item.FLD_LEN);
                //console.log("item.FLD_CMT : " + item.FLD_CMT);
                //console.log("item.FLD_SGMT : " + item.FLD_SGMT);
                //console.log("item.ST_POS : " + item.ST_POS);
                //console.log("item.FLD_DEPTH : " + item.FLD_DEPTH);
                //console.log("item.REPET_NUM : " + item.REPET_NUM);
                //console.log("item.FLD_ORDER : " + item.FLD_ORDER);
                //console.log("item.ESSEN_YN : " + item.ESSEN_YN);
                //console.log("item.DEFAULT_VAL : " + item.DEFAULT_VAL);
                //console.log("item.FLD_FORMAT : " + item.FLD_FORMAT);
                //console.log("item.DY_YN : " + item.DY_YN);
                //console.log("item.DY_KIND : " + item.DY_KIND);

                const query = `
                    INSERT INTO aqt_messagefield_tb (
                        MSGFLD_ID, APP_ID, MSG_ID, 
                        FLD_KR_NM, FLD_EN_NM, FLD_TYPE, FLD_LEN, FLD_CMT, 
                        FLD_SGMT, ST_POS, FLD_DEPTH, REPET_NUM, FLD_ORDER, 
                        ESSEN_YN, DEFAULT_VAL, FLD_FORMAT, DY_YN, DY_KIND
                    ) VALUES (
                        ?, ?, ?,
                        ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?
                    ) ON DUPLICATE KEY UPDATE
                        APP_ID = VALUES(APP_ID),
                        MSG_ID = VALUES(MSG_ID),
                        FLD_KR_NM = VALUES(FLD_KR_NM),
                        FLD_EN_NM = VALUES(FLD_EN_NM),
                        FLD_TYPE = VALUES(FLD_TYPE),
                        FLD_LEN = VALUES(FLD_LEN),
                        FLD_CMT = VALUES(FLD_CMT),
                        FLD_SGMT = VALUES(FLD_SGMT),
                        ST_POS = VALUES(ST_POS),
                        FLD_DEPTH = VALUES(FLD_DEPTH),
                        REPET_NUM = VALUES(REPET_NUM),
                        FLD_ORDER = VALUES(FLD_ORDER),
                        ESSEN_YN = VALUES(ESSEN_YN),
                        DEFAULT_VAL = VALUES(DEFAULT_VAL),
                        FLD_FORMAT = VALUES(FLD_FORMAT),
                        DY_YN = VALUES(DY_YN),
                        DY_KIND = VALUES(DY_KIND)
                `;

                const params = [
                    item.MSGFLD_ID || null,
                    item.APP_ID,
                    item.MSG_ID,
                    item.FLD_KR_NM,
                    item.FLD_EN_NM,
                    item.FLD_TYPE,
                    item.FLD_LEN || 0,
                    item.FLD_CMT,
                    item.FLD_SGMT,
                    item.ST_POS || 0,
                    item.FLD_DEPTH || 0,
                    item.REPET_NUM || 1,
                    item.FLD_ORDER || 0,
                    item.ESSEN_YN || 'N',
                    item.DEFAULT_VAL,
                    item.FLD_FORMAT,
                    item.DY_YN,
                    item.DY_KIND,
                ];

            //console.log("saveField query : " + query);
            //console.log("##############################################################");

                await conn.query(query, params);
                savedCount++;
            }

            await conn.commit();
            return { count: savedCount, message: "Fields saved successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in saveField:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    /**
     * 필드 삭제
     * @param {Array|Object} param - 삭제할 필드 정보
     */
    deleteField: async (param) => {
        const inputList = Array.isArray(param) ? param : [param];
        let conn;
        let deletedCount = 0;

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            for (const item of inputList) {
                const query = `DELETE FROM aqt_messagefield_tb WHERE MSGFLD_ID = ?`;

                await conn.query(query, [item.MSGFLD_ID]);
                deletedCount++;
            }

            //console.log("##############################################################");
            //console.log("deleteField query : " + query);
            //console.log("##############################################################");

            await conn.commit();
            return { count: deletedCount, message: "Fields deleted successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in deleteField:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
//////////////////// --- 업무전문 데이터(JobData) --- ////////////////////
    /**
     * 전문 데이터 조회 (JobData)
     * @param {Object} req - 요청 파라미터 (msg_id 등)
     */
    getDataList: async (req) => {
        let conn = null;

        try {
            conn = await mondb.getConnection();

            let params = [];

            //console.log("##############################################################");
            //console.log("req.app_id : " + req.app_id);
            //console.log("req.msg_id : " + req.msg_id);
            //console.log("req.search_keyword : " + req.search_keyword);
           
            let query = `
                SELECT a.MSGDT_ID           as MSGDT_ID
                    , a.APP_ID              as APP_ID
                    , a.MSG_ID              as MSG_ID
                    , a.PROTOCOL_GB         as PROTOCOL_GB
                    , a.METHOD              as METHOD
                    , a.SVC_URI			    as SVC_URI
                    , a.HEADER_VAL          as HEADER_VAL
                    , a.PARAM_VAL           as PARAM_VAL
                    , nvl(cast(a.FIXEDLEN_VAL as char character set utf8),'') as FIXEDLEN_VAL
                    , a.COMMENT             as COMMENT
                    , srcip                 as srcip
                    , srcport               as srcport
                    , o_dstip               as o_dstip
                    , o_dstport             as o_dstport
                    , dstip                 as dstip
                    , dstport               as dstport
                    , origin                as origin
                    , rcode                 as rcode
                    , RHEADER_VAL           as RHEADER_VAL
                    , nvl(cast(a.RFIXEDLEN_VAL as char character set utf8),'') as RFIXEDLEN_VAL
                FROM aqt_messagedata_tb a 
                WHERE 1=1
            `;

            if (req.app_id) {
                query += ` AND a.APP_ID = ?`;
                params.push(req.app_id);
            }

            if (req.msg_id) {
                query += ` AND a.MSG_ID = ?`;
                params.push(req.msg_id);
            }

            // Field Search Keyword
            if (req.search_keyword) {
                query += ` AND (nvl(cast(a.FIXEDLEN_VAL as char character set utf8),'') LIKE ? OR a.COMMENT LIKE ?)`;
                const keyword = `%${req.search_keyword}%`;
                params.push(keyword, keyword);
            }
            // 순서 정렬
            query += ` ORDER BY MSGDT_ID`;

            //console.log("getDataList query : " + query);
            //console.log("##############################################################");

            const rows = await conn.query(query, params);
            
            return rows;
        } catch (error) {
            console.error('getDataList error:', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    },

    /**
     * 전문 데이터 저장 (추가 및 수정)
     * @param {Array|Object} param - 저장할 데이터 리스트 또는 객체
     */
    saveData: async (param) => {
        const inputList = Array.isArray(param) ? param : [param];
        let savedCount = 0;
        let conn;

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            for (const item of inputList) {
                /*
                if (!item.MSGDT_ID || item.status === 'N') {
                    const rows = await conn.query(`
                        SELECT LPAD(IFNULL(MAX(CAST(SUBSTRING(MSGDT_ID, 4) AS UNSIGNED)), 0) + 1, 11, '0') AS NEXT_SEQ 
                        FROM aqt_messagedata_tb 
                        WHERE APP_ID = ? 
                        AND MSG_ID = ?
                    `, [item.APP_ID || item.jobId, item.MSG_ID || item.messageId]
                    );

                    item.MSGDT_ID = 'MDT' + (rows[0].NEXT_SEQ || '00000000001');
                }
                */

                //console.log("-------------------------------------------------------");
                //console.log("item.APP_ID : " + item.APP_ID);
                //console.log("item.MSG_ID : " + item.MSG_ID);
                //console.log("item.PROTOCOL_GB : " + item.PROTOCOL_GB);
                //console.log("item.METHOD : " + item.METHOD);
                //console.log("item.SVC_URI : " + item.SVC_URI);
                //console.log("item.HEADER_VAL : " + item.HEADER_VAL);
                //console.log("item.PARAM_VAL : " + item.PARAM_VAL);
                //console.log("item.FIXEDLEN_VAL : " + item.FIXEDLEN_VAL);
                //console.log("item.COMMENT : " + item.COMMENT);
                //console.log("item.srcip : " + item.srcip);
                //console.log("item.srcport : " + item.srcport);
                //console.log("item.o_dstip : " + item.o_dstip);
                //console.log("item.o_dstport : " + item.o_dstport);
                //console.log("item.dstip : " + item.dstip);
                //console.log("item.dstport : " + item.dstport);
                //console.log("item.origin : " + item.origin);
                //console.log("item.rcode : " + item.rcode);
                //console.log("item.RHEADER_VAL : " + item.RHEADER_VAL);
                //console.log("item.RFIXEDLEN_VAL : " + item.RFIXEDLEN_VAL);
                //console.log("-------------------------------------------------------");

                // MERGE Query
                const query = `
                    INSERT INTO aqt_messagedata_tb (
                        MSGDT_ID, APP_ID, MSG_ID 
                        , PROTOCOL_GB, METHOD, SVC_URI
                        , HEADER_VAL, PARAM_VAL, FIXEDLEN_VAL, COMMENT
                        , srcip, srcport, o_dstip, o_dstport, dstip
                        , dstport, origin, rcode, RHEADER_VAL, RFIXEDLEN_VAL
                        , CRT_ID, CRT_DT, UDT_ID, UDT_DT
                    ) VALUES (
                        ?, ?, ?
                        , ?, ?, ?
                        , ?, ?, ?, ?
                        , ?, ?, ?, ?, ?
                        , ?, ?, ?, ?, ?
                        , 'monadmin', SYSDATE(), 'monadmin', SYSDATE()
                    ) ON DUPLICATE KEY UPDATE
                        APP_ID = VALUES(APP_ID),
                        MSG_ID = VALUES(MSG_ID),
                        PROTOCOL_GB = VALUES(PROTOCOL_GB),
                        METHOD = VALUES(METHOD),
                        SVC_URI = VALUES(SVC_URI),
                        HEADER_VAL = VALUES(HEADER_VAL),
                        PARAM_VAL = VALUES(PARAM_VAL),
                        FIXEDLEN_VAL = VALUES(FIXEDLEN_VAL),
                        COMMENT = VALUES(COMMENT),
                        srcip = VALUES(srcip),
                        srcport = VALUES(srcport),
                        o_dstip = VALUES(o_dstip),
                        o_dstport = VALUES(o_dstport),
                        dstip = VALUES(dstip),
                        dstport = VALUES(dstport),
                        origin = VALUES(origin),
                        rcode = VALUES(rcode),
                        RHEADER_VAL = VALUES(RHEADER_VAL),
                        RFIXEDLEN_VAL = VALUES(RFIXEDLEN_VAL),
                        UDT_ID = 'monadmin',
                        UDT_DT = SYSDATE()
                `;

                const params = [
                    item.MSGDT_ID || null,
                    item.APP_ID,
                    item.MSG_ID,
                    item.PROTOCOL_GB,
                    item.METHOD,
                    item.SVC_URI,
                    item.HEADER_VAL,
                    item.PARAM_VAL,
                    item.FIXEDLEN_VAL,
                    item.COMMENT,
                    item.srcip,
                    item.srcport,
                    item.o_dstip,
                    item.o_dstport,
                    item.dstip,
                    item.dstport,
                    item.origin,
                    item.rcode,
                    item.RHEADER_VAL,
                    item.RFIXEDLEN_VAL,                    
                ];

                //console.log("saveData query : " + query);
                //console.log("-------------------------------------------------------");

                await conn.query(query, params);
                savedCount++;
            }

            await conn.commit();
            return { count: savedCount, message: "Message Data saved successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in saveData:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },

    /**
     * 전문 데이터 삭제
     * @param {Array|Object} param - 삭제할 데이터 리스트 또는 객체
     */
    deleteData: async (param) => {
        const inputList = Array.isArray(param) ? param : [param];
        let deletedCount = 0;
        let conn;

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            for (const item of inputList) {
                if (item.PKEY) {
                    await conn.query(`DELETE FROM aqt_messagedata_tb WHERE PKEY = ?`, [item.PKEY]);
                    deletedCount++;
                }
            }

            await conn.commit();
            return { count: deletedCount, message: "Message Data deleted successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in deleteData:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }
};

export default jobs;
