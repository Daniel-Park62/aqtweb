import mondb from '../db/dbconn.js';

let fields = [];
let jobDataInstances = [];

const jobs = {
    /**
     * 전문 목록 조회
     * @param {Object} req - 요청 파라미터 (prj_id, app_id 등)
     */
    getMessageList: async (req) => {
        let conn;

        //console.log("----------------------------------------------------------------");
        //console.log("req.prj_id : " + req.prj_id);
        //console.log("req.search_keyword : " + req.search_keyword);

        try {
            conn = await mondb.getConnection();

            const params = [];

            let query = `
                    select a.SIO_ID         as SIO_ID
                        , a.SIO_NM          as SIO_NM
                        , a.SIO_OWNER       as SIO_OWNER
                        , a.SIO_ACTOR       as SIO_ACTOR
                        , a.SIO_REQID       as SIO_REQID
                        , a.SIO_ESTTM       as SIO_ESTTM
                        , a.SIO_EXEPHASE    as SIO_EXEPHASE
                        , a.SIO_LASTRDT     as SIO_LASTRDT
                        , a.SIO_DESC        as SIO_DESC
                        , a.CRT_ID          as CRT_ID
                        , a.CRT_DT          as CRT_DT
                        , a.UDT_ID          as UDT_ID 
                        , a.UDT_DT          as UDT_DT
                    from aqt_scenario_tb a
                    where 1=1
            `;

            // Field Search Keyword
            if (req.search_keyword) {
                query += ` AND (a.SIO_NM LIKE ? OR a.SIO_DESC LIKE ? OR a.SIO_OWNER LIKE ? OR a.SIO_ACTOR LIKE ? OR a.SIO_REQID LIKE ? OR a.SIO_ESTTM LIKE ? OR a.SIO_EXEPHASE LIKE ?)`;
                const keyword = `%${req.search_keyword}%`;
                params.push(keyword, keyword, keyword,keyword, keyword, keyword,keyword);
            }
            // 순서 정렬
            query += ` ORDER BY a.SIO_ID desc`;

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
    saveSinalio: async (param) => {
        const inputList = Array.isArray(param) ? param : [param];
        let savedCount = 0;
        let conn;

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            for (const item of inputList) {
                //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
                //console.log("item.SIO_ID : " + item.SIO_ID);
                //console.log("item.SIO_NM : " + item.SIO_NM);
                //console.log("item.SIO_OWNER : " + item.SIO_OWNER);
                //console.log("item.SIO_ACTOR : " + item.SIO_ACTOR);
                //console.log("item.SIO_REQID : " + item.SIO_REQID);
                //console.log("item.SIO_ESTTM : " + item.SIO_ESTTM);
                //console.log("item.SIO_EXEPHASE : " + item.SIO_EXEPHASE);
                //console.log("item.SIO_LASTRDT : " + item.SIO_LASTRDT);
                //console.log("item.SIO_DESC : " + item.SIO_DESC);
                //console.log("item.status : "+ item.status);
                //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

                const query = `
                    INSERT INTO aqt_scenario_tb (
                        SIO_ID,SIO_NM
                        ,SIO_OWNER,SIO_ACTOR,SIO_REQID
                        ,SIO_ESTTM,SIO_EXEPHASE,SIO_LASTRDT,SIO_DESC
                    ) VALUES (
                        ?, ?
                        , ?, ?, ?
                        , ?, ?, ?, ?
                    ) ON DUPLICATE KEY UPDATE
                        SIO_NM = VALUES(SIO_NM),
                        SIO_OWNER = VALUES(SIO_OWNER),
                        SIO_ACTOR = VALUES(SIO_ACTOR),
                        SIO_REQID = VALUES(SIO_REQID),
                        SIO_ESTTM = VALUES(SIO_ESTTM),
                        SIO_EXEPHASE = VALUES(SIO_EXEPHASE),
                        SIO_LASTRDT = VALUES(SIO_LASTRDT),
                        SIO_DESC = VALUES(SIO_DESC),
                        UDT_ID = 'monadmin',
                        UDT_DT = SYSDATE()
                `;

                const params = [
                    item.SIO_ID || null, // PKEY: 없으면 null (Auto Increment)
                    item.SIO_NM,
                    item.SIO_OWNER,
                    item.SIO_ACTOR,
                    item.SIO_REQID,
                    item.SIO_ESTTM,
                    item.SIO_EXEPHASE,
                    item.SIO_LASTRDT,                    
                    item.SIO_DESC,
                ];

                //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
                //console.log("saveSinalio query : " + query);
                //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

                await conn.query(query, params);
                savedCount++;
            }

            await conn.commit();
            return { count: savedCount, message: "Sinalio saved successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in saveSinalio:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    /**
     * 전문 삭제
     * @param {Array|Object} param - 저장할 전문 정보 리스트 또는 객체
     */
    deleteSinalio: async (param) => {
        const inputList = Array.isArray(param) ? param : [param];
        let deletedCount = 0;
        let conn;

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            for (const item of inputList) {

                //console.log("--------------------------------------------------------");
                //console.log("item.SIO_ID : " + item.SIO_ID);
                //console.log("--------------------------------------------------------");

                let query = `
                    delete from aqt_scenario_tb where SIO_ID = ?
                `;

                const params = [item.SIO_ID];

                //console.log("--------------------------------------------------------");
                //console.log("deleteSinalio query : " + query);
                //console.log("--------------------------------------------------------");

                await conn.query(query, params);
                deletedCount++;
            }

            await conn.commit();
            return { count: deletedCount, message: "Sinalio deleted successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in deleteSinalio:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    /**
     * 전문 목록 조회
     * @param {Object} req - 요청 파라미터 (prj_id, app_id 등)
     */
    getTestCaseList: async (req) => {
        let conn;

        //console.log("########################################################");
        //console.log("req.prj_id : " + req.prj_id);
        //console.log("req.app_id : " + req.app_id);
        //console.log("req.sio_id : " + req.sio_id);
        //console.log("req.search_keyword : " + req.search_keyword);
        //console.log("########################################################");

        try {
            conn = await mondb.getConnection();

            const params = [];

            let query = `
                select a.APP_ID			as APP_ID
                    , b.APPNM			as APPNM
                    , a.TC_ID			as TC_ID
                    , a.TC_NAME			as TC_NAME
                    , 0                 as SITC_ORD
            `;

            if (req.sio_id) {
                query += `, ?        as SIO_ID`;
                params.push(req.sio_id);
            } else {
                query += `, ''       as SIO_ID`;
            }

            query += `
                    , a.TC_GUBUN		as TC_GUBUN
                    , a.TC_WRITER		as TC_WRITER
                    , a.TC_WRTDT		as TC_WRTDT
                    , a.TC_BUSMGR		as TC_BUSMGR
                    , a.TC_ITMGR		as TC_ITMGR
                    , a.TC_SERVER		as TC_SERVER
                    , a.TC_PORT			as TC_PORT
                from aqt_testcase_tb a
                join aqt_business_tb b 
                    on b.app_id = a.app_id  
                where 1=1            
            `;

            if (req) {
                if (req.app_id) {
                    query += ` AND a.APP_ID = ?`;
                    params.push(req.app_id);
                }
            }

            // Field Search Keyword
            if (req.search_keyword) {
                query += ` AND (a.TC_NAME LIKE ? OR a.TC_WRITER LIKE ? OR a.TC_BUSMGR LIKE ? OR a.TC_ITMGR LIKE ? OR a.TC_SERVER LIKE ? OR a.TC_PORT LIKE ? or case a.TC_GUBUN when '0' then '단위테스트' when '1' then '통합테스트' when '3' then '성능테스트' else '기타' end LIKE ?)`;
                const keyword = `%${req.search_keyword}%`;
                params.push(keyword, keyword, keyword,keyword, keyword, keyword, keyword);
            }
            // 순서 정렬
            query += ` ORDER BY a.TC_ID ASC`;

            //console.log("########################################################");
            //console.log("getTestCaseList query : " + query);
            //console.log("########################################################");

            const rows = await conn.query(query, params);

            return rows;
        } catch (err) {
            console.error("Error in getTestCaseList:", err);
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
                SELECT a.PKEY               as PKEY
                     , a.COMMHDFLD_ID       as MSGFLD_ID
                     , a.PRJ_ID             as PRJ_ID
                     , a.APP_ID             as APP_ID
                     , b.APPNM              as APPNM
                     , a.COMMHD_ID          as MSG_ID
                     , a.FLD_KR_NM          as FLD_KR_NM
                     , a.FLD_EN_NM          as FLD_EN_NM
                     , a.FLD_TYPE           as FLD_TYPE
                     , a.FLD_LEN            as FLD_LEN
                     , a.FLD_CMT            as FLD_CMT
                     , a.FLD_SGMT           as FLD_SGMT
                     , a.ST_POS             as ST_POS
                     , 0                    as FLD_DEPTH
                     , 0                    as REPET_NUM
                     , a.FLD_ORDER          as FLD_ORDER
                     , a.ESSEN_YN           as ESSEN_YN
                     , a.DEFAULT_VAL        as DEFAULT_VAL
                     , a.FLD_FORMAT         as FLD_FORMAT
                     , a.FLD_CDSET          as FLD_CDSET
                     , a.MASK_YN            as MASK_YN
                     , a.META_CONV_RULE     as META_CONV_RULE
                FROM AQT_COMMHEADERFIELD_TB a
                join aqt_business_tb b 
                    on b.prj_id = a.prj_id 
                    and b.app_id = a.app_id
                WHERE 1=1
            `;

            const params = [];

            if (req) {
                if (req.prj_id) {
                    query += ` AND A.PRJ_ID = ?`;
                    params.push(req.prj_id);
                }
                if (req.app_id) {
                    query += ` AND A.APP_ID = ?`;
                    params.push(req.app_id);
                }

                // Field Search Keyword
                if (req.search_keyword) {
                    query += ` AND (A.FLD_KR_NM LIKE ? OR A.FLD_EN_NM LIKE ? OR A.FLD_TYPE LIKE ? OR A.FLD_LEN LIKE ? OR A.ESSEN_YN LIKE ?)`;
                    const keyword = `%${req.search_keyword}%`;
                    params.push(keyword, keyword, keyword, keyword, keyword);
                }
            }
            // 순서 정렬
            query += ` ORDER BY a.ST_POS ASC`;

            //console.log("--------------------------------------------------------------");
            //console.log("req.prj_id : " + req.prj_id);
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

            let query = `
                SELECT X.PKEY              AS PKEY
                    , A.COMMHDFLD_ID       AS MSGFLD_ID
                    , A.PRJ_ID             AS PRJ_ID
                    , A.APP_ID             AS APP_ID
                    , B.APPNM              AS APPNM
                    , A.COMMHD_ID          AS MSG_ID
                    , A.FLD_KR_NM          AS FLD_KR_NM
                    , A.FLD_EN_NM          AS FLD_EN_NM
                    , A.FLD_TYPE           AS FLD_TYPE
                    , A.FLD_LEN            AS FLD_LEN
                    , A.FLD_CMT            AS FLD_CMT
                    , A.FLD_SGMT           AS FLD_SGMT
                    , A.ST_POS             AS ST_POS
                    , 0                    AS FLD_DEPTH
                    , 0                    AS REPET_NUM
                    , A.FLD_ORDER          AS FLD_ORDER
                    , A.ESSEN_YN           AS ESSEN_YN
                    , A.DEFAULT_VAL        AS DEFAULT_VAL
                    , A.FLD_FORMAT         AS FLD_FORMAT
                    , A.FLD_CDSET          AS FLD_CDSET
                    , A.MASK_YN            AS MASK_YN
                    , A.META_CONV_RULE     AS META_CONV_RULE
                    , X.MSGDT_ID           AS MSGDT_ID 
                    , TRIM(NVL(SUBSTR(X.FIXEDLEN_VAL, NVL(A.ST_POS,0), NVL(A.FLD_LEN,0)),''))	AS FIXED_VAL
                FROM AQT_COMMHEADERFIELD_TB A
                JOIN AQT_BUSINESS_TB B 
                    ON B.PRJ_ID = A.PRJ_ID 
                    AND B.APP_ID = A.APP_ID
            `
        query += ` LEFT OUTER JOIN (SELECT PKEY, PRJ_ID, APP_ID, MSG_ID, MSGDT_ID, FIXEDLEN_VAL
					FROM AQT_MESSAGEDATA_TB 
					WHERE 1=1
                `

            const params = [];

            if (req) {
                if (req.prj_id) {
                    query += ` AND PRJ_ID = ?`;
                    params.push(req.prj_id);
                }
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

        query += `  				) X
                        ON A.PRJ_ID = X.PRJ_ID
                        AND A.APP_ID = X.APP_ID
                    WHERE 1=1
                `
            ;

            if (req) {
                if (req.prj_id) {
                    query += ` AND A.PRJ_ID = ?`;
                    params.push(req.prj_id);
                }
                if (req.app_id) {
                    query += ` AND A.APP_ID = ?`;
                    params.push(req.app_id);
                }

                // Field Search Keyword
                if (req.search_keyword) {
                    query += ` AND (A.FLD_KR_NM LIKE ? OR A.FLD_EN_NM LIKE ? OR A.FLD_LEN LIKE ? OR TRIM(NVL(SUBSTR(X.FIXEDLEN_VAL, NVL(A.ST_POS,0), NVL(A.FLD_LEN,0)),'')) LIKE ?)`;
                    const keyword = `%${req.search_keyword}%`;
                    params.push(keyword, keyword, keyword, keyword);
                }
            }
            // 순서 정렬
            query += ` ORDER BY A.ST_POS, A.PRJ_ID, A.APP_ID, A.COMMHD_ID `;

            //console.log("==============================================================");
            //console.log("req.prj_id : " + req.prj_id);
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
                SELECT X.PKEY               AS PKEY
                    , A.MSGFLD_ID          AS MSGFLD_ID
                    , A.PRJ_ID             AS PRJ_ID
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
                    , A.FLD_CDSET          AS FLD_CDSET
                    , A.MASK_YN            AS MASK_YN
                    , A.META_CONV_RULE     AS META_CONV_RULE
                    , X.MSGDT_ID           AS MSGDT_ID
                    , X.FIXEDLEN_VAL
                    , NVL(A.ST_POS,0)
                    , NVL(A.FLD_LEN,0)
                    , TRIM(NVL(SUBSTR(X.FIXEDLEN_VAL, NVL(A.ST_POS,0), NVL(A.FLD_LEN,0)),''))   AS FIXED_VAL
                FROM ( SELECT a.PKEY               as PKEY
                            , a.MSGFLD_ID          as MSGFLD_ID
                            , a.PRJ_ID             as PRJ_ID
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
                if (req.prj_id) {
                    query += ` AND PRJ_ID = ?`;
                    params.push(req.prj_id);
                }
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
                            , a.FLD_CDSET          as FLD_CDSET
                            , a.MASK_YN            as MASK_YN
                            , a.META_CONV_RULE     as META_CONV_RULE
                        from aqt_messagefield_tb a
                        where 1=1
            `;
            if (req) {
                if (req.prj_id) {
                    query += ` AND PRJ_ID = ?`;
                    params.push(req.prj_id);
                }
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
                    ) A        
                JOIN AQT_BUSINESS_TB B
                    ON B.PRJ_ID = A.PRJ_ID
                    AND B.APP_ID = A.APP_ID
                LEFT OUTER JOIN (SELECT PKEY, PRJ_ID, APP_ID, MSG_ID, MSGDT_ID, FIXEDLEN_VAL
                                    FROM AQT_MESSAGEDATA_TB
                                    WHERE 1=1
            `;
            if (req) {
                if (req.prj_id) {
                    query += ` AND PRJ_ID = ?`;
                    params.push(req.prj_id);
                }
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
                    ON A.PRJ_ID = X.PRJ_ID
                    AND A.APP_ID = X.APP_ID
                    AND case when A.MSG_ID like '%MSG%' then A.MSG_ID = X.MSG_ID else 1=1 end
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
            query += ` ORDER BY A.ST_POS, A.PRJ_ID, A.APP_ID, A.MSG_ID`;

            //console.log("-------------------------------------------------");
            //console.log("req.prj_id : " + req.prj_id);
            //console.log("req.app_id : " + req.app_id);
            //console.log("req.msg_id : " + req.msg_id);
            //console.log("req.msgdt_id : " + req.msgdt_id);
            //console.log("getMessListData query : " + query);
            //console.log("-------------------------------------------------");

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
    getMessList: async (req) => {
        let conn;
        try {
            conn = await mondb.getConnection();

            const params = [];

            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            //console.log("req.prj_id : " + req.prj_id);
            //console.log("req.app_id : " + req.app_id);
            //console.log("req.msg_id : " + req.msg_id);
            //console.log("req.search_keyword : " + req.search_keyword);
            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

            let query = `
                SELECT a.PKEY               as PKEY
                    , a.MSGFLD_ID          as MSGFLD_ID
                    , a.PRJ_ID             as PRJ_ID
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
                    , a.FLD_CDSET          as FLD_CDSET
                    , a.MASK_YN            as MASK_YN
                    , a.META_CONV_RULE     as META_CONV_RULE
                FROM ( SELECT a.PKEY               as PKEY
                            , a.MSGFLD_ID          as MSGFLD_ID
                            , a.PRJ_ID             as PRJ_ID
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
                            , a.FLD_CDSET          as FLD_CDSET
                            , a.MASK_YN            as MASK_YN
                            , a.META_CONV_RULE     as META_CONV_RULE
                        from aqt_messagefield_tb a
                        where 1=1
            `;
            if (req) {
                if (req.prj_id) {
                    query += ` AND A.PRJ_ID = ?`;
                    params.push(req.prj_id);
                }
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
                    on b.prj_id = a.prj_id
                    and b.app_id = a.app_id
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

            //console.log("----------------------------------------------------------------");
            //console.log("req.sio_id : " + req.sio_id);
            //console.log("req.stic_id : " + req.stic_id);

            let query = `
                    select 	a.SIO_ID					as SIO_ID
						, a.SITC_ID						as SITC_ID
                        , a.SITCD_ID					as SITCD_ID
                        , a.TC_SENDDT                   as TC_SENDDT
                        , a.TC_RECEIVEDT                as TC_RECEIVEDT
                        , a.TC_TIMETAKEN                as TC_TIMETAKEN
                        , a.TC_RESULT                   as TC_RESULT
                        , a.TC_RESPCODE                 as TC_RESPCODE
                        , a.TC_ERRLOG                   as TC_ERRLOG
                        , a.SVC_URI                     as SVC_URI
                        , a.PROTOCOL_GB                 as PROTOCOL_GB
                        , a.METHOD                      as METHOD
                        , nvl(cast(a.FIXEDLEN_VAL as char character set utf8),'') as FIXEDLEN_VAL
                        , a.HEADER_VAL                  as HEADER_VAL
                        , a.PARAM_VAL                   as PARAM_VAL
                        , a.srcip                       as srcip
                        , a.srcport                     as srcport
                        , a.o_dstip                     as o_dstip
                        , a.o_dstport                   as o_dstport
                        , a.dstip                       as dstip
                        , a.dstport                     as dstport
                        , a.origin                      as origin                         
                    from aqt_scenariotestcasedata_tb a
                    join (select SIO_ID,SIO_NM
                                ,SIO_DESC,SIO_OWNER,SIO_ACTOR,SIO_REQID
                                ,SIO_ESTTM,SIO_EXEPHASE,SIO_LASTRDT
                            from aqt_scenario_tb 
                            where 1=1
            `;
            if (req) {
                if (req.sio_id) {
                    query += ` AND SIO_ID = ?`;
                    params.push(req.sio_id);
                }
            }

            query += `	 ) b
                        on a.SIO_ID = b.SIO_ID 
                    join (select SIO_ID,SITC_ID
                                ,TC_ID,SITC_ORD,SITC_STDT,SITC_EDDT
                                ,SITC_DURTM,SITC_RESULT
                            from aqt_scenariotestcase_tb
                            where 1=1
            `;
            if (req) {
                if (req.sio_id) {
                    query += ` AND SIO_ID = ?`;
                    params.push(req.sio_id);
                }
                if (req.stic_id) {
                    query += ` AND SITC_ID = ?`;
                    params.push(req.stic_id);
                }
            }

            query += ` 	) c
                        on a.SIO_ID = c.SIO_ID 
                        and a.SITC_ID = c.SITC_ID 
                    where 1=1
            `;
            if (req) {
                if (req.sio_id) {
                    query += ` AND a.SIO_ID = ?`;
                    params.push(req.sio_id);
                }
                if (req.stic_id) {
                    query += ` AND a.SITC_ID = ?`;
                    params.push(req.stic_id);
                }
            }

            if (req) {
                if (req.search_keyword) {
                    query += ` AND (a.TC_SENDDT LIKE ? OR a.TC_RECEIVEDT LIKE ? OR a.TC_TIMETAKEN LIKE ? OR a.TC_RESULT LIKE ? OR a.TC_RESPCODE LIKE ? OR a.TC_ERRLOG LIKE ? OR nvl(cast(a.FIXEDLEN_VAL as char character set utf8),'') LIKE ?)`;
                    const keyword = `%${req.search_keyword}%`;
                    params.push(keyword, keyword, keyword, keyword, keyword, keyword, keyword);
                }
            }
            // 순서 정렬
            query += ` ORDER BY a.SIO_ID, a.SITC_ID, a.SITCD_ID`;

            //console.log("----------------------------------------------------------------");
            //console.log("getFieldListData query : " + query);
            //console.log("----------------------------------------------------------------");

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
        let itpkey = "";
        let itmsgfldid = "";
        let itstatus = "";
        let itprjid = "";
        let itappid = "";
        let itmsgid = "";
        let itmsgdtid = "";
        let fixedLenVal = "";
        let itcomment = "";

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            for (const item of inputList) {

                itpkey      = item.PKEY || null,
                itmsgfldid  = item.MSGFLD_ID;
                itstatus    = item.status;
                itprjid     = item.PRJ_ID;
                itappid     = item.APP_ID;
                itmsgid     = item.MSG_ID;
                itmsgdtid   = item.MSGDT_ID;
                fixedLenVal = fixedLenVal + item.FIXED_VAL;
                itcomment   = item.COMMENT;

                savedCount++;
            }

            // MSGFLD_ID 채번 (없거나 New인 경우) - Format: FLD + 11 digits
            if (!itmsgdtid) {
                const rows = await conn.query(`
                        SELECT LPAD(IFNULL(MAX(CAST(SUBSTRING(MSGDT_ID, 4) AS UNSIGNED)), 0) + 1, 11, '0') AS NEXT_SEQ 
                        FROM aqt_messagedata_tb 
                        WHERE PRJ_ID = ? 
                        AND APP_ID = ? 
                        AND MSG_ID = ?
                    `, [itprjid, itappid, itmsgid]
                );

                itpkey = null;
                itmsgdtid = 'MDT' + (rows[0].NEXT_SEQ || '00000000001');

                //console.log("~~~~~~~~~~~~~");
                //console.log("itpkey   : " + itmsgdtid);
                //console.log("itmsgdtid   : " + itmsgdtid);
                //console.log("~~~~~~~~~~~~~");
            }

            // MERGE Query
            const query = `
                INSERT INTO aqt_messagedata_tb (
                    PKEY, MSGDT_ID, PRJ_ID, APP_ID, MSG_ID, 
                    FIXEDLEN_VAL, COMMENT,
                    CRT_ID, CRT_DT, UDT_ID, UDT_DT
                ) VALUES (
                    ?, ?, ?, ?, ?, 
                    ?, ?,
                    'monadmin', SYSDATE(), 'monadmin', SYSDATE()
                ) ON DUPLICATE KEY UPDATE
                    FIXEDLEN_VAL = VALUES(FIXEDLEN_VAL),
                    UDT_ID = 'monadmin',
                    UDT_DT = SYSDATE()
            `;

            const params = [
                itpkey || null,
                itmsgdtid,
                itprjid,
                itappid,
                itmsgid,
                fixedLenVal,
                itcomment
            ];

            //console.log("--------------------------------------------");
            //console.log("itpkey      : " + itpkey);
            //console.log("itmsgdtid   : " + itmsgdtid);
            //console.log("itprjid     : " + itprjid);
            //console.log("itappid     : " + itappid);
            //console.log("itmsgid     : " + itmsgid);
            //console.log("fixedLenVal : " + fixedLenVal);
            //console.log("itcomment   : " + itcomment);
            //console.log("query       : " + query);
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
                SELECT a.PKEY               as PKEY
                    , a.MSGFLD_ID          as MSGFLD_ID
                    , a.PRJ_ID             as PRJ_ID
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
                    , a.FLD_CDSET          as FLD_CDSET
                    , a.MASK_YN            as MASK_YN
                    , a.META_CONV_RULE     as META_CONV_RULE
                FROM ( SELECT a.PKEY               as PKEY
                            , a.MSGFLD_ID          as MSGFLD_ID
                            , a.PRJ_ID             as PRJ_ID
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
                if (req.prj_id) {
                    query += ` AND PRJ_ID = ?`;
                    params.push(req.prj_id);
                }
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
                            , a.FLD_CDSET          as FLD_CDSET
                            , a.MASK_YN            as MASK_YN
                            , a.META_CONV_RULE     as META_CONV_RULE
                        from aqt_messagefield_tb a
                        where 1=1
            `;
            if (req) {
                if (req.prj_id) {
                    query += ` AND A.PRJ_ID = ?`;
                    params.push(req.prj_id);
                }
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
                        SELECT a.PKEY               as PKEY
                            , a.COMMHDFLD_ID       as MSGFLD_ID
                            , a.PRJ_ID             as PRJ_ID
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
                            , a.FLD_CDSET          as FLD_CDSET
                            , a.MASK_YN            as MASK_YN
                            , a.META_CONV_RULE     as META_CONV_RULE 
                        from aqt_commheaderfield_tb a
                        where 1=1
            `;
            if (req) {
                if (req.prj_id) {
                    query += ` AND a.PRJ_ID = ?`;
                    params.push(req.prj_id);
                }
                if (req.app_id) {
                    query += ` AND a.APP_ID = ?`;
                    params.push(req.app_id);
                }
            }

            query += ` ) a
                join aqt_business_tb b
                    on b.prj_id = a.prj_id
                    and b.app_id = a.app_id
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
            //console.log("item.MSGFLD_ID 1 : " + item.MSGFLD_ID);
            //console.log("item.status 1 : " + item.status);
            //console.log("##############################################################");

                // MSGFLD_ID 채번 (없거나 New인 경우) - Format: FLD + 11 digits
                if (!item.MSGFLD_ID || item.status === 'N') {
                    const rows = await conn.query(`
                            SELECT LPAD(IFNULL(MAX(CAST(SUBSTRING(MSGFLD_ID, 4) AS UNSIGNED)), 0) + 1, 11, '0') AS NEXT_SEQ 
                            FROM aqt_messagefield_tb 
                            WHERE PRJ_ID = ? 
                            AND APP_ID = ? 
                            AND MSG_ID = ? 
                            AND MSGFLD_ID LIKE 'FLD%'
                        `, [item.PRJ_ID, item.APP_ID, item.MSG_ID]
                    );

                    item.MSGFLD_ID = 'FLD' + (rows[0].NEXT_SEQ || '00000000001');
                }

            //console.log("##############################################################");
            //console.log("item.MSGFLD_ID 2 : " + item.MSGFLD_ID);
            //console.log("##############################################################");

                // MERGE Query
                const query = `
                    INSERT INTO aqt_messagefield_tb (
                        PKEY, MSGFLD_ID, PRJ_ID, APP_ID, MSG_ID, 
                        FLD_KR_NM, FLD_EN_NM, FLD_TYPE, FLD_LEN, FLD_CMT, 
                        FLD_SGMT, ST_POS, FLD_DEPTH, REPET_NUM, FLD_ORDER, 
                        ESSEN_YN, DEFAULT_VAL, FLD_FORMAT, FLD_CDSET, MASK_YN, META_CONV_RULE
                    ) VALUES (
                        ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, ?
                    ) ON DUPLICATE KEY UPDATE
                        MSGFLD_ID = VALUES(MSGFLD_ID),
                        PRJ_ID = VALUES(PRJ_ID),
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
                        FLD_CDSET = VALUES(FLD_CDSET),
                        MASK_YN = VALUES(MASK_YN),
                        META_CONV_RULE = VALUES(META_CONV_RULE)
                `;

                const params = [
                    item.PKEY || null,
                    item.MSGFLD_ID,
                    item.PRJ_ID,
                    item.APP_ID,
                    item.MSG_ID,
                    item.FLD_KR_NM,
                    item.FLD_EN_NM,
                    item.FLD_TYPE,
                    item.FLD_LEN || 0,
                    item.FLD_CMT,
                    item.FLD_SGMT || 'Root',
                    item.ST_POS || 0,
                    item.FLD_DEPTH || 0,
                    item.REPET_NUM || 1,
                    item.FLD_ORDER || 0,
                    item.ESSEN_YN || 'N',
                    item.DEFAULT_VAL,
                    item.FLD_FORMAT,
                    item.FLD_CDSET,
                    item.MASK_YN || 'N',
                    item.META_CONV_RULE
                ];

            //console.log("##############################################################");
            //console.log("item.PKEY : " + item.PKEY);
            //console.log("item.MSGFLD_ID : " + item.MSGFLD_ID);
            //console.log("item.PRJ_ID : " + item.PRJ_ID);
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
            //console.log("item.FLD_CDSET : " + item.FLD_CDSET);
            //console.log("item.MASK_YN  : " + item.MASK_YN);
            //console.log("item.META_CONV_RULE : " + item.META_CONV_RULE);
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
                // PKEY가 있으면 PKEY로 삭제
                if (item.PKEY) {
                    const query = `DELETE FROM aqt_messagefield_tb WHERE PKEY = ?`;

                    await conn.query(query, [item.PKEY]);
                    deletedCount++;
                }
                // PKEY가 없으면 Unique Key 조합으로 삭제 (PRJ_ID, APP_ID, MSG_ID, MSGFLD_ID)
                else if (item.PRJ_ID && item.APP_ID && item.MSG_ID && item.MSGFLD_ID) {
                    const query = `
                        DELETE FROM aqt_messagefield_tb 
                        WHERE PRJ_ID = ? AND APP_ID = ? AND MSG_ID = ? AND MSGFLD_ID = ?
                    `;
                    
                    await conn.query(query, [item.PRJ_ID, item.APP_ID, item.MSG_ID, item.MSGFLD_ID]);
                    deletedCount++;
                }
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
    /**
     * 시나리오 테스트케이스 저장 (▶)
     * @param {Array|Object} param - 저장할 전문 정보 리스트 또는 객체
     */
    saveMsgDatas: async (param) => {
        const inputList = Array.isArray(param) ? param : [param];
        let savedCount = 0;
        let conn;
        let sticId = "";

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            for (const item of inputList) {
                //console.log("********************************************");
                //console.log("item.PRJ_ID : " + item.PRJ_ID);
                //console.log("item.APP_ID : " + item.APP_ID);
                //console.log("item.SIO_ID : " + item.SIO_ID);
                //console.log("item.SITC_ID : " + item.SITC_ID);
                //console.log("item.TC_ID : " + item.TC_ID);
                //console.log("item.status : "+ item.status);

                const query_sitc = `
                    INSERT INTO aqt_scenariotestcase_tb (
                            SIO_ID,TC_ID,SITC_ORD
                    ) VALUES (
                        ?, ?, 0
                    )
                `;

                const params_sitc = [
                item.SIO_ID,
                item.TC_ID,
                item.SITC_ORD,
                ];

                //console.log("********************************************");
                //console.log("saveMsgDatas aqt_scenariotestcase_tb query : " + query_sitc);
                //console.log("********************************************");

                await conn.query(query_sitc, params_sitc);

                const query = `
                    INSERT INTO aqt_scenariotestcasedata_tb (SIO_ID,SITC_ID
                                        ,TC_O_SENDDT,TC_SENDDT,TC_RECEIVEDT,TC_TIMETAKEN,TC_RESULT,TC_RESPCODE,TC_ERRLOG
                                        ,SVC_URI,RHEADER_VAL,HEADER_VAL,PARAM_VAL,SLEN,RLEN,RFIXEDLEN_VAL,FIXEDLEN_VAL
                                        ,srcip,srcport,o_dstip,o_dstport,dstip,dstport,PROTOCOL_GB,origin,METHOD                    
                    )
                    select ?                    as SIO_ID
                        , NVL((select SITC_ID from aqt_scenariotestcase_tb where SIO_ID = ? and TC_ID = ? and SITC_ORD = 0 limit 1),0)    as SITC_ID
                        , a.TC_O_SENDDT         as TC_O_SENDDT
                        , a.TC_SENDDT           as TC_SENDDT
                        , a.TC_RECEIVEDT        as TC_RECEIVEDT
                        , a.TC_TIMETAKEN        as TC_TIMETAKEN
                        , a.TC_RESULT           as TC_RESULT
                        , a.TC_RESPCODE         as TC_RESPCODE
                        , a.TC_ERRLOG           as TC_ERRLOG
                        , a.SVC_URI             as SVC_URI
                        , a.RHEADER_VAL         as RHEADER_VAL
                        , a.HEADER_VAL          as HEADER_VAL
                        , a.PARAM_VAL           as PARAM_VAL
                        , a.SLEN                as SLEN
                        , a.RLEN                as RLEN
                        , a.RFIXEDLEN_VAL       as RFIXEDLEN_VAL
                        , a.FIXEDLEN_VAL        as FIXEDLEN_VAL
                        , a.srcip               as srcip
                        , a.srcport             as srcport
                        , a.o_dstip             as o_dstip
                        , a.o_dstport           as o_dstport
                        , a.dstip               as dstip
                        , a.dstport             as dstport
                        , a.PROTOCOL_GB         as PROTOCOL_GB
                        , a.origin              as origin
                        , a.METHOD              as METHOD
                    from aqt_testcasedata_tb a
                    join (select APP_ID,TC_ID,TC_NAME
                            from aqt_testcase_tb
                            WHERE 1=1
                            and TC_ID = ?
                        ) b
                        on a.APP_ID = b.APP_ID 
                        and a.TC_ID = b.TC_ID 
                `;

                const params = [
                    item.SIO_ID,
                    item.SIO_ID,
                    item.TC_ID,
                    item.TC_ID,
                ];

                //console.log("********************************************");
                //console.log("saveMsgDatas aqt_scenariotestcasedata_tb query : " + query);
                //console.log("********************************************");

                await conn.query(query, params);                
                savedCount++;
            }

            await conn.commit();
            return { count: savedCount, message: "Sinario testCase Search Data saved successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in saveMessage:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    /**
     * 시나리오 테스트케이스 삭제 (◀)
     * @param {Array|Object} param - 저장할 전문 정보 리스트 또는 객체
     */
    deleteMsgDatas: async (param) => {
        const inputList = Array.isArray(param) ? param : [param];
        let deletedCount = 0;
        let conn;

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            for (const item of inputList) {

                //console.log("--------------------------------------------------------");
                //console.log("item.SIO_ID : " + item.SIO_ID);
                //console.log("item.SITC_ID : " + item.SITC_ID);
                //console.log("item.SITC_ORD : " + item.SITC_ORD);
                //console.log("item.status : "+ item.status);
                //console.log("--------------------------------------------------------");

                let query = `
                    delete from aqt_scenariotestcase_tb where SITC_ID = ?
                `;

                const params = [item.SITC_ID];

                //console.log("--------------------------------------------------------");
                //console.log("deleteMsgDatas aqt_scenariotestcase_tb query : " + query);
                //console.log("--------------------------------------------------------");

                await conn.query(query, params);

                let query_dt = `
                    delete from aqt_scenariotestcasedata_tb
                    WHERE 1=1
                    AND SITC_ID = ?
                `;

                const params_dt = [
                    item.SITC_ID,
                ];

                //console.log("--------------------------------------------------------");
                //console.log("deleteMsgDatas aqt_scenariotestcasedata_tb query_dt : " + query_dt);
                //console.log("--------------------------------------------------------");

                await conn.query(query_dt, params_dt);
                deletedCount++;
            }

            await conn.commit();
            return { count: deletedCount, message: "Sinario Testcase Message Data deleted successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in deleteMessage:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    /**
     * 시나리오 테스트케이스 수행순서 저장
     * @param {Array|Object} param - 저장할 필드 정보
     */
    saveSiTCaseOrd: async (param) => {
        const inputList = Array.isArray(param) ? param : [param];
        let conn;
        let deletedCount = 0;

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            for (const item of inputList) {

                //console.log("#######################################");
                //console.log("item.SITC_ID : " + item.SITC_ID);
                //console.log("item.SITC_ORD : " + item.SITC_ORD);
                //console.log("item.status : "+ item.status);
                //console.log("#######################################");

                // PKEY로 삭제
                const query = `UPDATE aqt_scenariotestcase_tb SET SITC_ORD = ? WHERE SITC_ID = ?`;

                //console.log("##############################################################");
                //console.log("saveSiTCaseOrd query : " + query);
                //console.log("##############################################################");

                await conn.query(query, [item.SITC_ORD, item.SITC_ID]);
                deletedCount++;
                }

            await conn.commit();
            return { count: deletedCount, message: "Fields deleted successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in saveSiTCaseOrd:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    /**
     * 전문 데이터 조회 (JobData)
     * @param {Object} req - 요청 파라미터 (msg_id 등)
     */
    getDataList: async (req) => {
        let conn = null;

        try {
            conn = await mondb.getConnection();

            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            //console.log("req.sio_id : " + req.sio_id);

            let params = [];
            let query = `
                    select a.SITC_ID	    as SITC_ID
                        , a.SIO_ID			as SIO_ID
                        , a.TC_ID           as TC_ID			
                        , a.SITC_ORD		as SITC_ORD			
                        , a.SITC_STDT		as SITC_STDT		
                        , a.SITC_EDDT		as SITC_EDDT		
                        , a.SITC_DURTM		as SITC_DURTM		
                        , a.SITC_RESULT		as SITC_RESULT 		
                        , c.TC_NAME			as TC_NAME			
                        , c.TC_GUBUN		as TC_GUBUN			
                        , c.TC_WRITER		as TC_WRITER		
                        , c.TC_WRTDT		as TC_WRTDT			
                        , c.TC_BUSMGR		as TC_BUSMGR		
                        , c.TC_ITMGR		as TC_ITMGR			
                        , c.TC_SERVER		as TC_SERVER		
                        , c.TC_PORT			as TC_PORT			
                    from aqt_scenariotestcase_tb a
                    join (select SIO_ID,SIO_NM
                                ,SIO_OWNER,SIO_ACTOR,SIO_REQID
                                ,SIO_ESTTM,SIO_EXEPHASE,SIO_LASTRDT,SIO_DESC
                            from aqt_scenario_tb 
                            where 1=1
            `;

            if (req.sio_id) {
                query += ` AND SIO_ID = ?`;
                params.push(req.sio_id);
            }

            query += ` 	 ) b
                        on a.SIO_ID = b.SIO_ID 
                    left outer join (select APP_ID,TC_ID
                                ,TC_NAME,TC_GUBUN,TC_WRITER,TC_WRTDT
                                ,TC_BUSMGR,TC_ITMGR,TC_SERVER,TC_PORT
                            from aqt_testcase_tb
                            where 1=1
            `;

            query += ` 	 	) c
                            on a.TC_ID = c.TC_ID
                        where 1=1
            `;

            if (req.sio_id) {
                query += ` AND a.SIO_ID = ?`;
                params.push(req.sio_id);
            }
            
            // Field Search Keyword
            if (req.search_keyword) {
                query += ` AND (c.TC_NAME LIKE ? OR case c.TC_GUBUN when '0' then '단위테스트' when '1' then '통합테스트' when '2' then '성능테스트' else '기타' end LIKE ? OR c.TC_WRITER LIKE ? OR c.TC_BUSMGR LIKE ? OR c.TC_ITMGR LIKE ? OR c.TC_SERVER LIKE ? OR c.TC_PORT LIKE ? OR a.SITC_ORD LIKE ? OR a.SITC_STDT LIKE ? OR a.SITC_EDDT LIKE ? OR a.SITC_DURTM LIKE ? OR case a.SITC_RESULT when '1' then '정상' else '실패' end LIKE ?)`;
                const keyword = `%${req.search_keyword}%`;
                params.push(keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword);
            }
            // 순서 정렬
            query += ` ORDER BY a.SITC_ID desc`;

            //console.log("getDataList query : " + query);
            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

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
                // MSGDT_ID Generation (if missing or New) - Format: MDT + 11 digits
                if (!item.MSGDT_ID || item.status === 'N') {
                    const rows = await conn.query(`
                        SELECT LPAD(IFNULL(MAX(CAST(SUBSTRING(MSGDT_ID, 4) AS UNSIGNED)), 0) + 1, 11, '0') AS NEXT_SEQ 
                        FROM aqt_messagedata_tb 
                        WHERE PRJ_ID = ? 
                        AND APP_ID = ? 
                        AND MSG_ID = ?
                    `, [item.PRJ_ID || item.projectId, item.APP_ID || item.jobId, item.MSG_ID || item.messageId]
                    );

                    item.MSGDT_ID = 'MDT' + (rows[0].NEXT_SEQ || '00000000001');
                }

                const prjId = item.PRJ_ID || item.projectId;
                const appId = item.APP_ID || item.jobId;
                const msgId = item.MSG_ID || item.messageId;
                const fixedLenVal = item.FIXEDLEN_VAL || item.content || '';
                const comment = item.COMMENT || item.comment || '';

                //console.log("-------------------------------------------------------");
                //console.log("item.PKEY : " + item.PKEY);
                //console.log("item.MSGDT_ID : " + item.MSGDT_ID);
                //console.log("prjId : " + prjId);
                //console.log("appId : " + appId);
                //console.log("msgId : " + msgId);
                //console.log("fixedLenVal : " + fixedLenVal);
                //console.log("comment : " + comment);
                //console.log("-------------------------------------------------------");

                // MERGE Query
                const query = `
                    INSERT INTO aqt_messagedata_tb (
                        PKEY, MSGDT_ID, PRJ_ID, APP_ID, MSG_ID 
                        , FIXEDLEN_VAL, COMMENT
                        , CRT_ID, CRT_DT, UDT_ID, UDT_DT
                    ) VALUES (
                        ?, ?, ?, ?, ? 
                        , ?, ?
                        , 'monadmin', SYSDATE(), 'monadmin', SYSDATE()
                    ) ON DUPLICATE KEY UPDATE
                        MSGDT_ID = VALUES(MSGDT_ID),
                        PRJ_ID = VALUES(PRJ_ID),
                        APP_ID = VALUES(APP_ID),
                        MSG_ID = VALUES(MSG_ID),
                        FIXEDLEN_VAL = VALUES(FIXEDLEN_VAL),
                        COMMENT = VALUES(COMMENT),
                        UDT_ID = 'monadmin',
                        UDT_DT = SYSDATE()
                `;

                const params = [
                    item.PKEY || null,
                    item.MSGDT_ID,
                    prjId,
                    appId,
                    msgId,
                    fixedLenVal,
                    comment
                ];

                //console.log("-------------------------------------------------------");
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
