import mondb from '../db/dbconn.js';

let fields = [];
let jobDataInstances = [];

const jobs = {
    /**
     * 통합테스트 시나리오 목록 조회
     */
    getTestCaseList: async (req) => {
        let conn;

        //console.log("--------------------------------------------------------");
        //console.log("req.app_id : " + req.app_id);
        //console.log("--------------------------------------------------------");

        try {
            conn = await mondb.getConnection();

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
                    ORDER BY a.SIO_ID desc
            `;

            const params = [];

            //console.log("--------------------------------------------------------");
            //console.log("getTestCaseList query : " + query);
            //console.log("--------------------------------------------------------");

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
     * 통합테스트 목록 조회
     */
    getUnitTestList: async (searchType, keyword, app_id) => {
        let params = [];

        //console.log("##############################################################");
        //console.log("searchType : " + searchType);
        //console.log("keyword : " + keyword);
        //console.log("app_id : " + app_id);
        //console.log("##############################################################");

        let sql = `
            SELECT 'AP000'                                         as APP_ID 
                , a.pkey 											as pkey
                , a.tcode 											as tcode
                , a.tdesc 											as tdesc
                , a.tnum 											as tnum
                , a.resultstat 										as resultstat
                , a.startDt 										as startDt
                , a.endDt 											as endDt
                , timediff(ifnull(a.endDt,now()),startdt) 			as elapsed
                , a.ppkey 											as ppkey
                , a.dbskip 											as dbskip
                , a.repnum 											as repnum
                , a.limits 											as limits
                , a.exectype 										as exectype
                , a.reqnum 											as reqnum
                , a.thost 											as thost
                , a.tport 											as tport
                , left(date_format(a.reqstartDt,'%Y-%m-%dT'),10) 	as reqstartDt
                , a.etc 											as etc
                , a.msg  											as msg
                , b.reqkill 										as reqkill
                , a.jobkind 										as jobkind
                , a.in_file 										as in_file
                , a.tuser 											as tuser
                , a.tdir 											as tdir
                , a.tenv 											as tenv
                , a.reqstartDt 										as reqstartDt2
                , ifnull(b.tcnt,0) 									as tcnt
                , ifnull(b.ccnt,0) 									as ccnt
                , ifnull(b.ecnt,0) 									as ecnt 
                , a.jdata 											as jdata
            FROM texecjob a 
            left join texecing b 
                on a.pkey = b.pkey 
            left outer join AQT_BUSTEXECJOB_TB d
                on a.pkey = d.TEXECJOB_PKEY
            WHERE 1=1
            and d.APP_ID = 'AP000'
        `;

        if (searchType && searchType !== '') {
            sql += ` AND a.resultstat = ? `;
            params.push(`${searchType}`);
        }

        if (keyword && keyword !== '') {
            sql += ` AND (a.tcode LIKE ? OR a.tdesc LIKE ? OR a.thost LIKE ? OR a.tport LIKE ? OR a.etc LIKE ? OR a.msg LIKE ?) `;
            params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
        }

        sql += ` order by a.resultstat, a.startdt desc`;

        //console.log("##############################################################");
        //console.log("getUnitTestList sql : " + sql);
        //console.log("##############################################################");

        const rows = await mondb.query(sql, params);
        return rows;
    },
    /**
     * 통합테스트 host, port 조회
     */
    tsellistTestCase: async (req) => {
        let conn;

        //console.log("--------------------------------------------------------");
        //console.log("req.tcode : " + req.tcode);
        //console.log("--------------------------------------------------------");

        try {
            conn = await mondb.getConnection();

            const params = [];
            let query = `
                SELECT SIO_ID as tcode, SIO_NM as name, SIO_LASTRDT as enddate, '1' as lvl, '' as thost, 0 as tport  
                from aqt_scenario_tb
                where 1=1
            `;

            if (req) {
                if (req.tcode) {
                    query += ` AND SIO_ID = ?`;
                    params.push(req.tcode);
                }
            }

            //console.log("--------------------------------------------------------");
            //console.log("tsellistTestCase query : " + query);
            //console.log("--------------------------------------------------------");

            const rows = await conn.query(query, params);

            return rows;
        } catch (err) {
            console.error("Error in tsellistTestCase:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    /**
     * 통합테스트 목록 삭제(하단 그리드)
     */
    deleteTestCase: async (pkey) => {
        //const sql = `DELETE FROM texecjob WHERE pkey = ?`;
        //return await mondb.query(sql, [pkey]);
        let deletedCount = 0;
        let conn;

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            //console.log("--------------------------------------------------------");
            //console.log("pkey : " + pkey);
            //console.log("--------------------------------------------------------");

            const params = [pkey];

            let query = `
                DELETE FROM texecjob WHERE pkey = ? AND resultstat <> 2
            `;

            let query2 = `
                UPDATE texecing AS t1
                INNER JOIN texecjob AS t2 
                    ON t1.pkey = t2.pkey
                SET t1.reqkill='1'
                WHERE t1.pkey = ?
                AND resultstat = 2
            `;

            let query3 = `
                DELETE FROM texecing 
                WHERE pkey = (SELECT b.pkey 
                                FROM texecjob a
                                JOIN texecing b
                                    ON a.pkey = b.pkey
                                WHERE a.pkey = ?
                                AND a.resultstat <> 2
                            )
            `;

            let query4 = `
                DELETE FROM AQT_BUSTEXECJOB_TB WHERE TEXECJOB_PKEY = ?
            `;

            //console.log("--------------------------------------------------------");
            //console.log("deleteTestCase query : " + query);
            //console.log("deleteTestCase query2 : " + query2);
            //console.log("deleteTestCase query3 : " + query3);
            //console.log("deleteTestCase query4 : " + query4);
            //console.log("--------------------------------------------------------");

            await conn.query(query2, params);
            await conn.query(query3, params);
            await conn.query(query, params);
            await conn.query(query4, params);

            deletedCount++;

            await conn.commit();
            return { count: deletedCount, message: "Testcase deleted successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in deleteTestCase:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    /**
     * 통합테스트 저장 (추가 및 수정)
     * @param {Array|Object} param - 저장할 전문 정보 리스트 또는 객체
     */
    saveUnitTest: async (param) => {
        const inputList = Array.isArray(param) ? param : [param];
        let savedCount = 0;
        let conn;
        let m_resultstat = 0;
        let m_jobkind = 9;
        let m_startDt = null;
        let m_endDt = null;

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            for (const item of inputList) {
                //console.log("--------------------------------------------------------");
                //console.log("item.job : " + item.job);       // 업무ID
                //console.log("item.pkey : " + item.pkey);       // JobID
                //console.log("item.tcode : " + item.tcode);       // 테스트케이스ID
                //console.log("item.tdesc : " + item.tdesc);       // 설명
                //console.log("item.tnum : " + item.tnum);       // 작업개수
                //console.log("item.ppkey : " + item.ppkey);       // 선행JobID
                //console.log("item.dbskip : " + item.dbskip);       // 수행결과(0:저장, 1:저장하지않음)
                //console.log("item.repnum : " + item.repnum);       // 반복횟수
                //console.log("item.limits : " + item.limits);       // 처리건수
                //console.log("item.exectype : " + item.exectype);       // 작업방법(0:즉시실행, 1:원본송신간격)
                //console.log("item.reqnum : " + item.reqnum);       // 송신간격(ms)
                //console.log("item.thost : " + item.thost);       // Host
                //console.log("item.tport : " + item.tport);       // Port
                //console.log("item.reqstartDt : " + item.reqstartDt);       // 작업요청일시
                //console.log("item.etc : " + item.etc);       // 대상선택조건
                //console.log("item.msg : " + item.msg);       // 작업메세지
                //console.log("item.regkill : " + item.regkill);       // 작업중지요청
                //console.log("--------------------------------------------------------");

                const query = `
                    INSERT INTO texecjob (
                        pkey,tcode,tdesc,tnum
                        ,ppkey,dbskip,repnum,limits,exectype
                        ,reqnum,thost,tport,reqstartDt,etc
                        ,resultstat,jobkind
                        ,startDt,endDt,msg
                    ) VALUES (
                          ?, ?, ?, ?
                        , ?, ?, ?, ?, ?
                        , ?, ?, ?, ?, ?
                        , ?, ?
                        , ?, ?, ?
                    ) ON DUPLICATE KEY UPDATE
                        tcode = VALUES(tcode),
                        tdesc = VALUES(tdesc),
                        tnum = VALUES(tnum),
                        ppkey = VALUES(ppkey),
                        dbskip = VALUES(dbskip),
                        repnum = VALUES(repnum),
                        limits = VALUES(limits),
                        exectype = VALUES(exectype),
                        reqnum = VALUES(reqnum),
                        thost = VALUES(thost),
                        tport = VALUES(tport),
                        reqstartDt = VALUES(reqstartDt),
                        etc = VALUES(etc),
                        resultstat = VALUES(resultstat),
                        jobkind = VALUES(jobkind),
                        startDt = VALUES(startDt),
                        endDt =  VALUES(endDt),
                        msg =  VALUES(msg)
                `;

                const params = [
                    item.pkey || null,
                    item.tcode,
                    item.tdesc,
                    item.tnum,
                    item.ppkey,
                    item.dbskip,
                    item.repnum,
                    item.limits,
                    item.exectype,
                    item.reqnum,
                    item.thost,
                    item.tport,
                    item.reqstartDt,
                    item.etc,
                    m_resultstat,
                    m_jobkind,
                    m_startDt,
                    m_endDt,
                    item.msg,
                ];

                //console.log("--------------------------------------------------------");
                //console.log("saveUnitTest query : " + query);
                //console.log("--------------------------------------------------------");

                await conn.query(query, params);

                const query1 = `
                    INSERT INTO AQT_BUSTEXECJOB_TB (
                        TEXECJOB_PKEY, APP_ID
                    ) VALUES (
                          (select max(pkey) from texecjob), ?
                    ) ON DUPLICATE KEY UPDATE
                        APP_ID = VALUES(APP_ID)
                `;

                const params1 = [
                    item.job,
                ];

                //console.log("--------------------------------------------------------");
                //console.log("saveUnitTest query1 : " + query1);
                //console.log("--------------------------------------------------------");

                await conn.query(query1, params1);
                savedCount++;
            }

            await conn.commit();
            return { count: savedCount, message: "UnitTest saved successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in saveUnitTest:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    ///////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////
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
                //console.log("item.TC_ID : " + item.TC_ID);
                //console.log("--------------------------------------------------------");

                let query = `
                    delete from aqt_testcase_tb where TC_ID = ?
                `;

                const params = [item.TC_ID];

                //console.log("--------------------------------------------------------");
                //console.log("deleteMessage query : " + query);
                //console.log("--------------------------------------------------------");

                await conn.query(query, params);
                deletedCount++;
            }

            await conn.commit();
            return { count: deletedCount, message: "Testcase deleted successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in deleteMessage:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    ///////////////////////////////////////////////////////////////////////////////////////
    /**
     * 공통 필드 목록 조회
     * @param {Object} req - 요청 파라미터
     */
    getCommList: async (req) => {
        let conn;
        try {
            conn = await mondb.getConnection();

            let query = `
                SELECT a.COMMHDFLD_ID       as MSGFLD_ID
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
                    on b.app_id = a.app_id
                WHERE 1=1
            `;

            const params = [];

            if (req) {
                if (req.app_id) {
                    query += ` AND a.APP_ID = ?`;
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
                SELECT A.COMMHDFLD_ID       AS MSGFLD_ID
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
                    ON B.APP_ID = A.APP_ID
            `
            query += ` LEFT OUTER JOIN (SELECT APP_ID, MSG_ID, MSGDT_ID, nvl(cast(FIXEDLEN_VAL as char character set utf8),'') as FIXEDLEN_VAL
					FROM AQT_MESSAGEDATA_TB 
					WHERE 1=1
                `

            const params = [];

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

            query += `  				) X
                        ON A.APP_ID = X.APP_ID
                    WHERE 1=1
                `
                ;

            if (req) {
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
            query += ` ORDER BY A.ST_POS, A.APP_ID, A.COMMHD_ID `;

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
                            , a.FLD_CDSET          as FLD_CDSET
                            , a.MASK_YN            as MASK_YN
                            , a.META_CONV_RULE     as META_CONV_RULE
                        from aqt_messagefield_tb a
                        where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND a.APP_ID = ?`;
                    params.push(req.app_id);
                }
                if (req.msg_id) {
                    query += ` AND a.MSG_ID = ?`;
                    params.push(req.msg_id);
                }
            }

            query += `
                    ) A        
                JOIN AQT_BUSINESS_TB B
                    ON B.APP_ID = a.APP_ID
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
                    ON a.APP_ID = X.APP_ID
                    AND case when a.MSG_ID like '%MSG%' then a.MSG_ID = X.MSG_ID else 1=1 end
                WHERE 1=1
            `;

            if (req) {
                // Field Search Keyword
                if (req.search_keyword) {
                    query += ` AND (a.FLD_KR_NM LIKE ? OR a.FLD_EN_NM LIKE ? OR a.FLD_TYPE LIKE ? OR a.FLD_LEN LIKE ? OR a.ESSEN_YN LIKE ? OR TRIM(NVL(SUBSTR(X.FIXEDLEN_VAL, NVL(a.ST_POS,0), NVL(a.FLD_LEN,0)),'')) LIKE ?)`;
                    const keyword = `%${req.search_keyword}%`;
                    params.push(keyword, keyword, keyword, keyword, keyword, keyword);
                }
            }
            // 순서 정렬
            query += ` ORDER BY a.ST_POS, a.APP_ID, a.MSG_ID`;

            //console.log("-------------------------------------------------");
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
                    , a.FLD_CDSET          as FLD_CDSET
                    , a.MASK_YN            as MASK_YN
                    , a.META_CONV_RULE     as META_CONV_RULE
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
                            , a.FLD_CDSET          as FLD_CDSET
                            , a.MASK_YN            as MASK_YN
                            , a.META_CONV_RULE     as META_CONV_RULE
                        from aqt_messagefield_tb a
                        where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND a.APP_ID = ?`;
                    params.push(req.app_id);
                }
                if (req.msg_id) {
                    query += ` AND a.MSG_ID = ?`;
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

            //console.log("-------------------------------------------------");
            //console.log("getMessList query : " + query);
            //console.log("-------------------------------------------------");

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

            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            //console.log("req.app_id : " + req.app_id);
            //console.log("req.tc_id : " + req.tc_id);
            //console.log("req.search_id : " + req.search_id);
            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

            let query = `
                    select a.APP_ID			        as APP_ID
                        , a.TC_ID			        as TC_ID
                        , b.TC_NAME			        as TC_NAME
                        , a.TCDT_ID			        as TCDT_ID
                        , a.SEARCH_ID		        as SEARCH_ID
                        , c.SEARCH01_NM		        as SEARCH01_NM
                        , a.TC_SENDDT		        as TC_SENDDT
                        , a.TC_RECEIVEDT	        as TC_RECEIVEDT
                        , a.TC_TIMETAKEN	        as TC_TIMETAKEN
                        , a.TC_RESULT		        as TC_RESULT
                        , a.TC_RESPCODE		        as TC_RESPCODE
                        , a.TC_ERRLOG 		        as TC_ERRLOG
                        , a.SVC_URI                 as SVC_URI
                        , a.PROTOCOL_GB             as PROTOCOL_GB
                        , a.METHOD                  as METHOD
                        , a.MSG_ID  		        as MSG_ID
                        , nvl(cast(a.FIXEDLEN_VAL as char character set utf8),'') as FIXEDLEN_VAL
                        , a.HEADER_VAL  		    as HEADER_VAL
                        , a.PARAM_VAL  		        as PARAM_VAL
                        , a.srcip  		            as srcip
                        , a.srcport  		        as srcport
                        , a.o_dstip  		        as o_dstip
                        , a.o_dstport  		        as o_dstport
                        , a.dstip  		            as dstip
                        , a.dstport  		        as dstport
                        , a.origin                  as origin 
                    from aqt_testcasedata_tb a
                    join (select APP_ID, TC_ID
                                , TC_NAME, TC_GUBUN, TC_WRITER, TC_WRTDT
                                , TC_BUSMGR, TC_ITMGR, TC_SERVER, TC_PORT
                            from aqt_testcase_tb 
                            where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND APP_ID = ?`;
                    params.push(req.app_id);
                }
                if (req.tc_id) {
                    query += ` AND TC_ID = ?`;
                    params.push(req.tc_id);
                }
            }

            query += `
                        ) b
                        on a.APP_ID = b.APP_ID 
                        and a.TC_ID = b.TC_ID
                    left outer join (select APP_ID, TC_ID
                                , SEARCH_ID, MSG_ID
                                , MSGFLD01_ID, SEARCH01_NM
                                , MSGFLD02_ID, SEARCH02_NM
                                , MSGFLD03_ID, SEARCH03_NM
                                , MSGFLD04_ID, SEARCH04_NM
                                , SEARCH_CNT
                            from aqt_testcasesearch_tb 
                            where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND APP_ID = ?`;
                    params.push(req.app_id);
                }
                if (req.tc_id) {
                    query += ` AND TC_ID = ?`;
                    params.push(req.tc_id);
                }
                if (req.search_id) {
                    query += ` AND SEARCH_ID = ?`;
                    params.push(req.search_id);
                }
            }

            query += `
                                    ) c
                        on a.APP_ID = c.APP_ID 
                        and a.TC_ID = c.TC_ID
                        and a.SEARCH_ID = c.SEARCH_ID 
                    where 1=1
            `;
            if (req) {
                if (req.app_id) {
                    query += ` AND a.APP_ID = ?`;
                    params.push(req.app_id);
                }
                if (req.tc_id) {
                    query += ` AND a.TC_ID = ?`;
                    params.push(req.tc_id);
                }
            }

            if (req) {
                // Field Search Keyword
                if (req.search_keyword) {
                    query += ` AND (c.SEARCH01_NM LIKE ? OR a.TC_SENDDT LIKE ? OR a.TC_RECEIVEDT LIKE ? OR a.TC_TIMETAKEN LIKE ? OR a.TC_RESULT LIKE ? OR a.TC_RESPCODE LIKE ? OR a.TC_ERRLOG LIKE ? OR nvl(cast(a.FIXEDLEN_VAL as char character set utf8),'') LIKE ?)`;
                    const keyword = `%${req.search_keyword}%`;
                    params.push(keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword);
                }
            }
            // 순서 정렬
            query += ` ORDER BY a.APP_ID, a.TC_ID, a.TCDT_ID`;

            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            //console.log("getFieldListData query : " + query);
            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

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

                itmsgfldid = item.MSGFLD_ID || null;
                itstatus = item.status;
                itappid = item.APP_ID;
                itmsgid = item.MSG_ID;
                itmsgdtid = item.MSGDT_ID;
                fixedLenVal = fixedLenVal + item.FIXED_VAL;
                itcomment = item.COMMENT;

                savedCount++;
            }

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

                //console.log("~~~~~~~~~~~~~");
                //console.log("itpkey   : " + itmsgdtid);
                //console.log("itmsgdtid   : " + itmsgdtid);
                //console.log("~~~~~~~~~~~~~");
            }

            // MERGE Query
            const query = `
                INSERT INTO aqt_messagedata_tb (
                    MSGDT_ID, APP_ID, MSG_ID, 
                    FIXEDLEN_VAL, COMMENT,
                    CRT_ID, CRT_DT, UDT_ID, UDT_DT
                ) VALUES (
                    ?, ?, ?,
                    ?, ?,
                    'monadmin', SYSDATE(), 'monadmin', SYSDATE()
                ) ON DUPLICATE KEY UPDATE
                    FIXEDLEN_VAL = VALUES(FIXEDLEN_VAL),
                    UDT_ID = 'monadmin',
                    UDT_DT = SYSDATE()
            `;

            const params = [
                itmsgdtid || null,
                itappid,
                itmsgid,
                fixedLenVal,
                itcomment
            ];

            //console.log("--------------------------------------------");
            //console.log("itmsgdtid   : " + itmsgdtid);
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
                    , a.FLD_CDSET          as FLD_CDSET
                    , a.MASK_YN            as MASK_YN
                    , a.META_CONV_RULE     as META_CONV_RULE
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
                            , a.FLD_CDSET          as FLD_CDSET
                            , a.MASK_YN            as MASK_YN
                            , a.META_CONV_RULE     as META_CONV_RULE
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
                            , a.FLD_CDSET          as FLD_CDSET
                            , a.MASK_YN            as MASK_YN
                            , a.META_CONV_RULE     as META_CONV_RULE 
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
                            WHERE APP_ID = ? 
                            AND MSG_ID = ? 
                            AND MSGFLD_ID LIKE 'FLD%'
                        `, [item.APP_ID, item.MSG_ID]
                    );

                    item.MSGFLD_ID = 'FLD' + (rows[0].NEXT_SEQ || '00000000001');
                }

                //console.log("##############################################################");
                //console.log("item.MSGFLD_ID 2 : " + item.MSGFLD_ID);
                //console.log("##############################################################");

                // MERGE Query
                const query = `
                    INSERT INTO aqt_messagefield_tb (
                        MSGFLD_ID, APP_ID, MSG_ID, 
                        FLD_KR_NM, FLD_EN_NM, FLD_TYPE, FLD_LEN, FLD_CMT, 
                        FLD_SGMT, ST_POS, FLD_DEPTH, REPET_NUM, FLD_ORDER, 
                        ESSEN_YN, DEFAULT_VAL, FLD_FORMAT, FLD_CDSET, MASK_YN, META_CONV_RULE
                    ) VALUES (
                        ?, ?, ?, 
                        ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, ?
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
                        FLD_CDSET = VALUES(FLD_CDSET),
                        MASK_YN = VALUES(MASK_YN),
                        META_CONV_RULE = VALUES(META_CONV_RULE)
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
                    const query = `DELETE FROM aqt_messagefield_tb WHERE MSGFLD_ID = ?`;

                    await conn.query(query, [item.MSGFLD_ID]);
                    deletedCount++;
                }
                // PKEY가 없으면 Unique Key 조합으로 삭제 (PRJ_ID, APP_ID, MSG_ID, MSGFLD_ID)
                else if (item.APP_ID && item.MSG_ID && item.MSGFLD_ID) {
                    const query = `
                        DELETE FROM aqt_messagefield_tb 
                        WHERE APP_ID = ? AND MSG_ID = ? AND MSGFLD_ID = ?
                    `;

                    await conn.query(query, [item.APP_ID, item.MSG_ID, item.MSGFLD_ID]);
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
     * 전문데이터 저장 (▶)
     * @param {Array|Object} param - 저장할 전문 정보 리스트 또는 객체
     */
    saveMsgDatas: async (param) => {
        const inputList = Array.isArray(param) ? param : [param];
        let savedCount = 0;
        let conn;
        let searchId = "";
        let countKey = 0;

        try {
            conn = await mondb.getConnection();
            await conn.beginTransaction();

            for (const item of inputList) {
                /*
                console.log("--------------------------------------------------------");
                console.log("item.APP_ID : " + item.APP_ID);
                console.log("item.MSG_ID : " + item.MSG_ID);
                console.log("item.tc_id : " + item.TC_ID);
                console.log("item.search_CountKeyword : " + item.search_CountKeyword);
                console.log("item.search_selectedMessage : " + item.search_selectedMessage);
                console.log("item.search_selectedField01 : " + item.search_selectedField01);
                console.log("item.search_selectedField02 : " + item.search_selectedField02);
                console.log("item.search_selectedField03 : " + item.search_selectedField03);
                console.log("item.search_selectedField04 : " + item.search_selectedField04);
                console.log("item.search_Field01Keyword : " + item.search_Field01Keyword);
                console.log("item.search_Field02Keyword : " + item.search_Field02Keyword);
                console.log("item.search_Field03Keyword : " + item.search_Field03Keyword);
                console.log("item.search_Field04Keyword : " + item.search_Field04Keyword);
                console.log("item.MSG_KR_NM : " + item.MSG_KR_NM);
                console.log("item.MSGDT_ID : " + item.MSGDT_ID);
                console.log("item.SVC_URI : " + item.SVC_URI);
                console.log("item.FIXEDLEN_VAL : " + item.FIXEDLEN_VAL);
                console.log("item.status : "+ item.status);
                console.log("savedCount : "+ savedCount);
                console.log("--------------------------------------------------------");
                */

                if (savedCount === 0) {
                    // SEARCH_ID 신규 채번
                    const rows01 = await conn.query(`
                            SELECT MAX(SEARCH_ID)+1 AS NEXT_SEQ 
                            FROM aqt_testcasesearch_tb 
                            WHERE 1=1
                        `, []
                    );

                    item.SEARCH_ID = rows01[0].NEXT_SEQ;
                    searchId = item.SEARCH_ID;

                    if (!item.search_CountKeyword || item.search_CountKeyword == "") {
                        countKey = 0;
                    } else {
                        countKey = item.search_CountKeyword;
                    }

                    const query_search = `
                        INSERT INTO aqt_testcasesearch_tb (
                                        SEARCH_ID,APP_ID,TC_ID,MSG_ID
                                        ,MSGFLD01_ID,SEARCH01_NM,MSGFLD02_ID,SEARCH02_NM
                                        ,MSGFLD03_ID,SEARCH03_NM,MSGFLD04_ID,SEARCH04_NM
                                        ,SEARCH_CNT
                        ) VALUES (
                            ?, ?, ?, ?,
                            ?, ?, ?, ?,
                            ?, ?, ?, ?,
                            ?
                        )
                    `;

                    const params_search = [
                        item.SEARCH_ID,
                        item.APP_ID,
                        item.TC_ID,
                        item.MSG_ID,
                        item.search_selectedField01 || 0,
                        item.search_Field01Keyword,
                        item.search_selectedField02 || 0,
                        item.search_Field02Keyword,
                        item.search_selectedField03 || 0,
                        item.search_Field03Keyword,
                        item.search_selectedField04 || 0,
                        item.search_Field04Keyword,
                        countKey
                    ];

                    //console.log("--------------------------------------------------------");
                    //console.log("saveMsgDatas aqt_testcasesearch_tb query : " + query_search);
                    //console.log("--------------------------------------------------------");

                    await conn.query(query_search, params_search);
                }

                /*
                    // TCDT_ID 신규 채번
                    const rows02 = await conn.query(`
                            SELECT LPAD(IFNULL(MAX(CAST(SUBSTRING(TCDT_ID, 4) AS UNSIGNED)), 0) + 1, 11, '0') AS NEXT_SEQ 
                            FROM aqt_testcasedata_tb 
                            WHERE PRJ_ID = ? 
                            AND APP_ID = ? 
                            AND TC_ID = ?  
                        `, [item.PRJ_ID, item.APP_ID, item.TC_ID]
                    );
                    item.TCDT_ID = 'TCD' + rows02[0].NEXT_SEQ;
                */

                const query = `
                    INSERT INTO aqt_testcasedata_tb (APP_ID, TC_ID, SEARCH_ID, MSG_ID, SVC_URI
                            , PROTOCOL_GB, METHOD, HEADER_VAL, PARAM_VAL
                            , srcip, srcport, o_dstip, o_dstport, dstip, dstport, origin
                            ,FIXEDLEN_VAL
                    ) VALUES (
                          ?, ?, ?, ?, ?
                        , ?, ?, ?, ?
                        , ?, ?, ?, ?, ?, ?, ?
                        , ?
                    )
                `;

                const params = [
                    item.APP_ID, item.TC_ID, searchId, item.MSG_ID || 0, item.SVC_URI
                    , item.PROTOCOL_GB, item.METHOD, item.HEADER_VAL, item.PARAM_VAL
                    , item.srcip, item.srcport, item.o_dstip, item.o_dstport, item.dstip, item.dstport, item.origin
                    , item.FIXEDLEN_VAL
                ];

                //console.log("--------------------------------------------------------");
                //console.log("saveMsgDatas aqt_testcasedata_tb query : " + query);
                //console.log("--------------------------------------------------------");

                await conn.query(query, params);
                savedCount++;
            }

            await conn.commit();
            return { count: savedCount, message: "testCase Search Data saved successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in saveMsgDatas:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },
    /**
     * 전문 삭제 (◀)
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
                //console.log("item.APP_ID : " + item.APP_ID);
                //console.log("item.TC_ID : " + item.TC_ID);
                //console.log("item.TCDT_ID : " + item.TCDT_ID);
                //console.log("--------------------------------------------------------");

                let query = `
                    delete from aqt_testcasedata_tb where TCDT_ID = ?
                `;

                const params = [item.TCDT_ID];

                //console.log("--------------------------------------------------------");
                //console.log("deleteMsgDatas query : " + query);
                //console.log("--------------------------------------------------------");

                await conn.query(query, params);
                deletedCount++;
            }

            await conn.commit();
            return { count: deletedCount, message: "Testcase Message Data deleted successfully" };

        } catch (err) {
            if (conn) await conn.rollback();
            console.error("Error in deleteMsgDatas:", err);
            throw err;
        } finally {
            if (conn) conn.release();
        }
    },

    //////////////////// --- 데이터 검색조건(JobData) --- ////////////////////
    /**
     * 데이터 검색조건 조회 (JobData)
     * @param {Object} req - 요청 파라미터 (msg_id 등)
     */
    getTestCaseSearchList: async (req) => {
        let conn = null;

        try {
            conn = await mondb.getConnection();

            let params = [];

            //console.log("---------------------------------------------------------------");
            //console.log("req.app_id : " + req.app_id);
            //console.log("req.tc_id : " + req.tc_id);
            //console.log("req.search_keyword : " + req.search_keyword);
            //console.log("---------------------------------------------------------------");

            let query = `
                select a.APP_ID				as APP_ID
                    , a.TC_ID				as TC_ID
                    , b.TC_NAME				as TC_NAME
                    , a.SEARCH_ID			as SEARCH_ID
                    , a.MSG_ID				as MSG_ID
                    , nvl(c.MSG_KR_NM,'')	as MSG_KR_NM
                    , a.MSGFLD01_ID			as MSGFLD01_ID
                    , nvl(d.FLD_KR_NM,'')	as MSGFLD01_NM
                    , a.SEARCH01_NM			as SEARCH01_NM
                    , a.MSGFLD02_ID			as MSGFLD02_ID
                    , nvl(e.FLD_KR_NM,'')	as MSGFLD02_NM
                    , a.SEARCH02_NM			as SEARCH02_NM
                    , a.MSGFLD03_ID			as MSGFLD03_ID
                    , nvl(f.FLD_KR_NM,'')	as MSGFLD03_NM
                    , a.SEARCH03_NM			as SEARCH03_NM
                    , a.MSGFLD04_ID			as MSGFLD04_ID
                    , nvl(g.FLD_KR_NM,'')	as MSGFLD04_NM
                    , a.SEARCH04_NM			as SEARCH04_NM
                    , a.SEARCH_CNT 			as SEARCH_CNT
                from aqt_testcasesearch_tb a
                join aqt_testcase_tb b
                    on a.APP_ID = b.APP_ID 
                    and a.TC_ID = b.TC_ID
                left outer join (select APP_ID, MSG_ID, MSG_KR_NM
                                    from aqt_message_tb
                                    where 1=1 
            `

            if (req.app_id) {
                query += ` AND APP_ID = ?`;
                params.push(req.app_id);
            }

            query += `
                                ) c
                    on a.APP_ID = c.APP_ID
                    and a.MSG_ID = c.MSG_ID
                left outer join (select APP_ID, MSG_ID, MSGFLD_ID, FLD_KR_NM
                                    from aqt_messagefield_tb
                                    where 1=1 
            `

            if (req.app_id) {
                query += ` AND APP_ID = ?`;
                params.push(req.app_id);
            }

            query += `
                                ) d
                    on a.APP_ID = d.APP_ID
                    and a.MSG_ID = d.MSG_ID
                    and a.MSGFLD01_ID = d.MSGFLD_ID
                left outer join (select APP_ID, MSG_ID, MSGFLD_ID, FLD_KR_NM
                                    from aqt_messagefield_tb
                                    where 1=1 
            `

            if (req.app_id) {
                query += ` AND APP_ID = ?`;
                params.push(req.app_id);
            }

            query += `
                                ) e
                    on a.APP_ID = e.APP_ID
                    and a.MSG_ID = e.MSG_ID
                    and a.MSGFLD02_ID = e.MSGFLD_ID
                left outer join (select APP_ID, MSG_ID, MSGFLD_ID, FLD_KR_NM
                                    from aqt_messagefield_tb
                                    where 1=1 
            `

            if (req.app_id) {
                query += ` AND APP_ID = ?`;
                params.push(req.app_id);
            }

            query += `
                                ) f
                    on a.APP_ID = f.APP_ID
                    and a.MSG_ID = f.MSG_ID
                    and a.MSGFLD03_ID = f.MSGFLD_ID
                left outer join (select APP_ID, MSG_ID, MSGFLD_ID, FLD_KR_NM
                                    from aqt_messagefield_tb
                                    where 1=1 
            `

            if (req.app_id) {
                query += ` AND APP_ID = ?`;
                params.push(req.app_id);
            }

            query += `
                                ) g
                    on a.APP_ID = g.APP_ID
                    and a.MSG_ID = g.MSG_ID
                    and a.MSGFLD04_ID = g.MSGFLD_ID
                where 1=1 
            `;

            if (req.app_id) {
                query += ` AND a.APP_ID = ?`;
                params.push(req.app_id);
            }

            if (req.tc_id) {
                query += ` AND a.TC_ID = ?`;
                params.push(req.tc_id);
            }

            // Field Search Keyword
            if (req.search_keyword) {
                query += ` AND (c.MSG_KR_NM LIKE ? 
                                OR d.FLD_KR_NM LIKE ? 
                                OR e.FLD_KR_NM LIKE ? 
                                OR f.FLD_KR_NM LIKE ? 
                                OR g.FLD_KR_NM LIKE ? 
                                OR a.SEARCH01_NM LIKE ? 
                                OR a.SEARCH02_NM LIKE ? 
                                OR a.SEARCH03_NM LIKE ? 
                                OR a.SEARCH04_NM LIKE ?)`;
                const keyword = `%${req.search_keyword}%`;
                params.push(keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword);
            }
            // 순서 정렬
            query += ` ORDER BY a.TC_ID DESC`;

            //console.log("---------------------------------------------------------------");
            //console.log("getTestCaseSearchList query : " + query);
            //console.log("---------------------------------------------------------------");

            const rows = await conn.query(query, params);

            return rows;
        } catch (error) {
            console.error('getTestCaseSearchList error:', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    },

    /**
     * 테스트케이스 전문데이터 조건전송
     * @param {Object} req - 요청 파라미터 (msg_id 등)
     */
    getTestCaseNoChedkedSave: async (req) => {
        let conn = null;
        let savedCount = 0;
        let searchId = 0;
        let tcDataId = "";
        let countKey = 0;

        try {
            conn = await mondb.getConnection();

            let params = [];

            //console.log("---------------------------------------------------------------");
            //console.log("req.app_id : " + req.app_id);
            //console.log("req.tc_id : " + req.tc_id);
            //console.log("req.search_CountKeyword : " + req.search_CountKeyword);
            //console.log("req.search_selectedMessage : " + req.search_selectedMessage);
            //console.log("req.search_selectedField01 : " + req.search_selectedField01);
            //console.log("req.search_selectedField02 : " + req.search_selectedField02);
            //console.log("req.search_selectedField03 : " + req.search_selectedField03);
            //console.log("req.search_selectedField04 : " + req.search_selectedField04);
            //console.log("req.search_Field01Keyword : " + req.search_Field01Keyword);
            //console.log("req.search_Field02Keyword : " + req.search_Field02Keyword);
            //console.log("req.search_Field03Keyword : " + req.search_Field03Keyword);
            //console.log("req.search_Field04Keyword : " + req.search_Field04Keyword);
            //console.log("---------------------------------------------------------------");

            // SEARCH_ID 신규 채번
            const rows01 = await conn.query(`
                    SELECT MAX(SEARCH_ID)+1 AS NEXT_SEQ 
                    FROM aqt_testcasesearch_tb 
                    WHERE 1=1
                `, []
            );

            searchId = rows01[0].NEXT_SEQ;

            if (!req.search_CountKeyword || req.search_CountKeyword == "") {
                countKey = 0;
            } else {
                countKey = req.search_CountKeyword;
            }

            const query_search = `
                INSERT INTO aqt_testcasesearch_tb (
                                SEARCH_ID, APP_ID,TC_ID,MSG_ID
                                ,MSGFLD01_ID,SEARCH01_NM,MSGFLD02_ID,SEARCH02_NM
                                ,MSGFLD03_ID,SEARCH03_NM,MSGFLD04_ID,SEARCH04_NM
                                ,SEARCH_CNT
                ) VALUES (
                    ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?
                )
            `;

            const params_search = [
                searchId,
                req.app_id,
                req.tc_id,
                req.search_selectedMessage,
                req.search_selectedField01,
                req.search_Field01Keyword,
                req.search_selectedField02,
                req.search_Field02Keyword,
                req.search_selectedField03,
                req.search_Field03Keyword,
                req.search_selectedField04,
                req.search_Field04Keyword,
                countKey
            ];

            //console.log("--------------------------------------------------------");
            //console.log("getTestCaseNoChedkedSave aqt_testcasesearch_tb query : " + query_search);
            //console.log("--------------------------------------------------------");

            await conn.query(query_search, params_search);

            let query = `
                INSERT INTO aqt_testcasedata_tb (APP_ID,TC_ID,SEARCH_ID,MSG_ID, SVC_URI
                        , PROTOCOL_GB, METHOD, HEADER_VAL, PARAM_VAL
                        , srcip, srcport, o_dstip, o_dstport, dstip, dstport, origin
                        ,FIXEDLEN_VAL)
                select X.APP_ID                          										 as APP_ID
            `
            if (req.tc_id) {
                query += ` , ?  as TC_ID`;
                params.push(req.tc_id);
            } else {
                query += ` , ''  as TC_ID`;
            }

            if (searchId) {
                query += ` , ?  as SEARCH_ID`;
                params.push(searchId);
            } else {
                query += ` , 1  as SEARCH_ID`;
            }

            query += `
                    , X.MSG_ID				                                                    as MSG_ID
                    , X.SVC_URI                                                                 as SVC_URI
                    , X.PROTOCOL_GB                                                             as PROTOCOL_GB
                    , X.METHOD                                                                  as METHOD
                    , X.HEADER_VAL                                                              as HEADER_VAL
                    , X.PARAM_VAL                                                               as PARAM_VAL
                    , X.srcip                                                                   as srcip
                    , X.srcport                                                                 as srcport
                    , X.o_dstip                                                                 as o_dstip
                    , X.o_dstport                                                               as o_dstport
                    , X.dstip                                                                   as dstip
                    , X.dstport                                                                 as dstport
                    , X.origin                                                                  as origin
                    , X.FIXEDLEN_VAL 		                                                    as FIXEDLEN_VAL
                from (	select (SELECT IFNULL(MAX(CAST(SUBSTRING(TCDT_ID, 4) AS UNSIGNED)), 0) as SEQ
                                FROM aqt_testcasedata_tb 
                                WHERE 1=1
                                AND APP_ID = a.APP_ID
            `
            query += ` AND TC_ID = ?`;
            params.push(req.tc_id);

            query += `
                                ) as SEQ
                            , a.APP_ID													as APP_ID
                            , a.MSG_ID													as MSG_ID
                            , b.MSG_KR_NM 												as MSG_KR_NM
                            , a.MSGDT_ID												as MSGDT_ID
                            , a.SVC_URI                                                 as SVC_URI
                            , a.PROTOCOL_GB                                             as PROTOCOL_GB
                            , a.METHOD                                                  as METHOD
                            , a.HEADER_VAL                                              as HEADER_VAL
                            , a.PARAM_VAL                                               as PARAM_VAL
                            , a.srcip                                                   as srcip
                            , a.srcport                                                 as srcport
                            , a.o_dstip                                                 as o_dstip
                            , a.o_dstport                                               as o_dstport
                            , a.dstip                                                   as dstip
                            , a.dstport                                                 as dstport
                            , a.origin                                                  as origin
                            , a.FIXEDLEN_VAL 											as FIXEDLEN_VAL
                            , SUBSTR(a.FIXEDLEN_VAL, NVL(c.ST_POS,0), NVL(c.FLD_LEN,0)) as FLD_SEARCH1
                            , SUBSTR(a.FIXEDLEN_VAL, NVL(d.ST_POS,0), NVL(d.FLD_LEN,0)) as FLD_SEARCH2
                            , SUBSTR(a.FIXEDLEN_VAL, NVL(e.ST_POS,0), NVL(e.FLD_LEN,0)) as FLD_SEARCH3
                            , SUBSTR(a.FIXEDLEN_VAL, NVL(f.ST_POS,0), NVL(f.FLD_LEN,0)) as FLD_SEARCH4
                        from (
                                SELECT APP_ID, MSG_ID, MSGDT_ID
                                    , SVC_URI
                                    , PROTOCOL_GB
                                    , METHOD                    
                                    , HEADER_VAL
                                    , PARAM_VAL
                                    , srcip
                                    , srcport
                                    , o_dstip
                                    , o_dstport
                                    , dstip
                                    , dstport
                                    , origin
                                    , FIXEDLEN_VAL, COMMENT
                                    , CRT_ID, CRT_DT, UDT_ID, UDT_DT    
                                FROM (
                                        SELECT APP_ID, MSG_ID, MSGDT_ID
                                            , SVC_URI
                                            , PROTOCOL_GB
                                            , METHOD                    
                                            , HEADER_VAL
                                            , PARAM_VAL
                                            , srcip
                                            , srcport
                                            , o_dstip
                                            , o_dstport
                                            , dstip
                                            , dstport
                                            , origin
                                            , nvl(cast(FIXEDLEN_VAL as char character set utf8),'') as FIXEDLEN_VAL, COMMENT
                                            , CRT_ID, CRT_DT, UDT_ID, UDT_DT    
                                            , ROW_NUMBER() OVER (PARTITION BY SVC_URI ORDER BY APP_ID, MSG_ID, MSGDT_ID DESC) AS rn
                                        FROM aqt_messagedata_tb
                                        WHERE 1=1
            `

            if (req.app_id) {
                query += ` AND APP_ID = ?`;
                params.push(req.app_id);
            }

            if (req.search_selectedMessage) {
                query += ` AND MSG_ID = ?`;
                params.push(req.search_selectedMessage);
            }

            query += `
                                ) AS ranked_data
            `

            if (req.search_CountKeyword) {
                query += ` WHERE case ? when 0 then rn >= 0 `;
                params.push(Number(req.search_CountKeyword));
            }

            if (req.search_CountKeyword) {
                query += ` else rn <= ? end `;
                params.push(Number(req.search_CountKeyword));
            }

            query += `
                            ) a
                        left outer join (select APP_ID, MSG_ID, MSG_KR_NM
                                from aqt_message_tb 
                                where 1=1
            `
            query += ` AND APP_ID = ?`;
            params.push(req.app_id);

            query += ` AND MSG_ID = ?`;
            params.push(req.search_selectedMessage);

            query += `
                            ) b
                            on a.APP_ID  = b.APP_ID
                            and a.MSG_ID  = b.MSG_ID
                        left outer join (select APP_ID, MSG_ID, MSGFLD_ID, ST_POS, FLD_LEN 
                                            from aqt_messagefield_tb
                                            where 1=1
            `
            query += ` AND APP_ID = ?`;
            params.push(req.app_id);

            query += ` AND MSG_ID = ?`;
            params.push(req.search_selectedMessage);

            query += ` AND MSGFLD_ID = ?`;
            params.push(req.search_selectedField01);

            query += `
                                        ) c
                            on a.APP_ID  = c.APP_ID
                            and a.MSG_ID = c.MSG_ID 
                        left outer join (select APP_ID, MSG_ID, MSGFLD_ID, ST_POS, FLD_LEN 
                                            from aqt_messagefield_tb
                                            where 1=1
            `;

            query += ` AND APP_ID = ?`;
            params.push(req.app_id);

            query += ` AND MSG_ID = ?`;
            params.push(req.search_selectedMessage);

            query += ` AND MSGFLD_ID = ?`;
            params.push(req.search_selectedField02);

            query += `
                                        ) d
                            on a.APP_ID  = d.APP_ID
                            and a.MSG_ID = d.MSG_ID 
                        left outer join (select APP_ID, MSG_ID, MSGFLD_ID, ST_POS, FLD_LEN 
                                            from aqt_messagefield_tb
                                            where 1=1
            `;

            query += ` AND APP_ID = ?`;
            params.push(req.app_id);

            query += ` AND MSG_ID = ?`;
            params.push(req.search_selectedMessage);

            query += ` AND MSGFLD_ID = ?`;
            params.push(req.search_selectedField03);

            query += `
                                        ) e
                            on a.APP_ID  = e.APP_ID
                            and a.MSG_ID = e.MSG_ID 
                        left outer join (select APP_ID, MSG_ID, MSGFLD_ID, ST_POS, FLD_LEN 
                                            from aqt_messagefield_tb
                                            where 1=1
            `;

            query += ` AND APP_ID = ?`;
            params.push(req.app_id);

            query += ` AND MSG_ID = ?`;
            params.push(req.search_selectedMessage);

            query += ` AND MSGFLD_ID = ?`;
            params.push(req.search_selectedField04);

            query += `
                                        ) f
                            on a.APP_ID  = f.APP_ID
                            and a.MSG_ID = f.MSG_ID 
                        where 1=1
            `;

            if (req.app_id) {
                query += ` AND a.APP_ID = ?`;
                params.push(req.app_id);
            }

            if (req.search_selectedMessage) {
                query += ` AND a.MSG_ID = ?`;
                params.push(req.search_selectedMessage);
            }

            // 순서 정렬
            query += ` ORDER BY a.APP_ID, a.MSG_ID, a.MSGDT_ID
                    ) X
                where 1=1
            `;

            if (req.search_Field01Keyword && req.search_selectedField01) {
                query += ` and X.FLD_SEARCH1 like ?`;
                const keyword = `%${req.search_Field01Keyword}%`;
                params.push(keyword);
            }

            if (req.search_Field02Keyword && req.search_selectedField02) {
                query += ` and X.FLD_SEARCH2 like ?`;
                const keyword = `%${req.search_Field02Keyword}%`;
                params.push(keyword);
            }

            if (req.search_Field03Keyword && req.search_selectedField03) {
                query += ` and X.FLD_SEARCH3 like ?`;
                const keyword = `%${req.search_Field03Keyword}%`;
                params.push(keyword);
            }

            if (req.search_Field04Keyword && req.search_selectedField04) {
                query += ` and X.FLD_SEARCH4 like ?`;
                const keyword = `%${req.search_Field04Keyword}%`;
                params.push(keyword);
            }

            //console.log("---------------------------------------------------------------");
            //console.log("getTestCaseNoChedkedSave query : " + query);
            //console.log("---------------------------------------------------------------");

            const rows = await conn.query(query, params);

            // return rows;

            savedCount++;
            return { count: savedCount, message: "Condition Testcase Data saved successfully" };

        } catch (error) {
            console.error('getTestCaseNoChedkedSave error:', error);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    },

    /**
     * 테스트케이스 등록 전문데이터 조회 (JobData)
     * @param {Object} req - 요청 파라미터 (msg_id 등)
     */
    getTestCaseMsgDataList: async (req) => {
        let conn = null;

        try {
            conn = await mondb.getConnection();

            let params = [];

            /*
            console.log("---------------------------------------------------------------");
            console.log("req.app_id : " + req.app_id);
            console.log("req.tc_id : " + req.tc_id);
            console.log("req.search_CountKeyword : " + req.search_CountKeyword);
            console.log("req.search_selectedMessage : " + req.search_selectedMessage);
            console.log("req.search_selectedField01 : " + req.search_selectedField01);
            console.log("req.search_selectedField02 : " + req.search_selectedField02);
            console.log("req.search_selectedField03 : " + req.search_selectedField03);
            console.log("req.search_selectedField04 : " + req.search_selectedField04);
            console.log("req.search_Field01Keyword : " + req.search_Field01Keyword);
            console.log("req.search_Field02Keyword : " + req.search_Field02Keyword);
            console.log("req.search_Field03Keyword : " + req.search_Field03Keyword);
            console.log("req.search_Field04Keyword : " + req.search_Field04Keyword);
            */

            let query = `
                select X.APP_ID				    as APP_ID
                    , X.MSG_ID				    as MSG_ID
                    , NVL(X.MSG_KR_NM,'전체') 	as MSG_KR_NM
                    , X.MSGDT_ID			    as MSGDT_ID
                    , X.SVC_URI                 as SVC_URI
                    , X.PROTOCOL_GB             as PROTOCOL_GB
                    , X.METHOD                  as METHOD
                    , X.HEADER_VAL              as HEADER_VAL
                    , X.PARAM_VAL               as PARAM_VAL
                    , X.srcip                   as srcip
                    , X.srcport                 as srcport
                    , X.o_dstip                 as o_dstip
                    , X.o_dstport               as o_dstport
                    , X.dstip                   as dstip
                    , X.dstport                 as dstport
                    , X.origin                  as origin
                    , X.FIXEDLEN_VAL 		    as FIXEDLEN_VAL
            `
            if (req.tc_id) {
                query += ` , ?  as TC_ID`;
                params.push(req.tc_id);
            } else {
                query += ` , ''  as TC_ID`;
            }

            if (req.search_CountKeyword) {
                query += ` , ?  as search_CountKeyword`;
                params.push(req.search_CountKeyword);
            } else {
                query += ` , ''  as search_CountKeyword`;
            }

            if (req.search_selectedMessage) {
                query += ` , ?  as search_selectedMessage`;
                params.push(req.search_selectedMessage);
            } else {
                query += ` , ''  as search_selectedMessage`;
            }

            if (req.search_selectedField01) {
                query += ` , ?  as search_selectedField01`;
                params.push(req.search_selectedField01);
            } else {
                query += ` , ''  as search_selectedField01`;
            }

            if (req.search_selectedField02) {
                query += ` , ?  as search_selectedField02`;
                params.push(req.search_selectedField02);
            } else {
                query += ` , ''  as search_selectedField02`;
            }

            if (req.search_selectedField03) {
                query += ` , ?  as search_selectedField03`;
                params.push(req.search_selectedField03);
            } else {
                query += ` , ''  as search_selectedField03`;
            }

            if (req.search_selectedField04) {
                query += ` , ?  as search_selectedField04`;
                params.push(req.search_selectedField04);
            } else {
                query += ` , ''  as search_selectedField04`;
            }

            if (req.search_Field01Keyword) {
                query += ` , ?  as search_Field01Keyword`;
                params.push(req.search_Field01Keyword);
            } else {
                query += ` , ''  as search_Field01Keyword`;
            }

            if (req.search_Field02Keyword) {
                query += ` , ?  as search_Field02Keyword`;
                params.push(req.search_Field02Keyword);
            } else {
                query += ` , ''  as search_Field02Keyword`;
            }

            if (req.search_Field03Keyword) {
                query += ` , ?  as search_Field03Keyword`;
                params.push(req.search_Field03Keyword);
            } else {
                query += ` , ''  as search_Field03Keyword`;
            }

            if (req.search_Field04Keyword) {
                query += ` , ?  as search_Field04Keyword`;
                params.push(req.search_Field04Keyword);
            } else {
                query += ` , ''  as search_Field04Keyword`;
            }

            query += `
                from (	select a.APP_ID													as APP_ID
                            , a.MSG_ID													as MSG_ID
                            , b.MSG_KR_NM 												as MSG_KR_NM
                            , a.MSGDT_ID												as MSGDT_ID
                            , a.SVC_URI                                                 as SVC_URI
                            , a.PROTOCOL_GB                                             as PROTOCOL_GB
                            , a.METHOD                                                  as METHOD
                            , a.HEADER_VAL                                              as HEADER_VAL
                            , a.PARAM_VAL                                               as PARAM_VAL
                            , a.srcip                                                   as srcip
                            , a.srcport                                                 as srcport
                            , a.o_dstip                                                 as o_dstip
                            , a.o_dstport                                               as o_dstport
                            , a.dstip                                                   as dstip
                            , a.dstport                                                 as dstport
                            , a.origin                                                  as origin
                            , a.FIXEDLEN_VAL 											as FIXEDLEN_VAL
                            , SUBSTR(a.FIXEDLEN_VAL, NVL(c.ST_POS,0), NVL(c.FLD_LEN,0)) as FLD_SEARCH1
                            , SUBSTR(a.FIXEDLEN_VAL, NVL(d.ST_POS,0), NVL(d.FLD_LEN,0)) as FLD_SEARCH2
                            , SUBSTR(a.FIXEDLEN_VAL, NVL(e.ST_POS,0), NVL(e.FLD_LEN,0)) as FLD_SEARCH3
                            , SUBSTR(a.FIXEDLEN_VAL, NVL(f.ST_POS,0), NVL(f.FLD_LEN,0)) as FLD_SEARCH4
                        from (
                                SELECT APP_ID, MSG_ID, MSGDT_ID
                                    , SVC_URI
                                    , PROTOCOL_GB
                                    , METHOD                                        
                                    , HEADER_VAL
                                    , PARAM_VAL
                                    , srcip
                                    , srcport
                                    , o_dstip
                                    , o_dstport
                                    , dstip
                                    , dstport
                                    , origin
                                    , FIXEDLEN_VAL, COMMENT
                                    , CRT_ID, CRT_DT, UDT_ID, UDT_DT    
                                FROM (
                                    SELECT APP_ID, MSG_ID, MSGDT_ID
                                        , SVC_URI
                                        , PROTOCOL_GB
                                        , METHOD                                        
                                        , HEADER_VAL
                                        , PARAM_VAL
                                        , srcip
                                        , srcport
                                        , o_dstip
                                        , o_dstport
                                        , dstip
                                        , dstport
                                        , origin
                                        , nvl(cast(FIXEDLEN_VAL as char character set utf8),'') as FIXEDLEN_VAL, COMMENT
                                        , CRT_ID, CRT_DT, UDT_ID, UDT_DT    
                                        , ROW_NUMBER() OVER (PARTITION BY SVC_URI ORDER BY APP_ID, MSG_ID, MSGDT_ID DESC) AS rn
                                    FROM aqt_messagedata_tb
                                    WHERE 1=1
            `

            if (req.app_id) {
                query += ` AND APP_ID = ?`;
                params.push(req.app_id);
            }

            if (req.search_selectedMessage) {
                query += ` AND MSG_ID = ?`;
                params.push(req.search_selectedMessage);
            }

            query += `
                                ) AS ranked_data
            `

            if (req.search_CountKeyword) {
                query += ` WHERE case ? when 0 then rn >= 0 `;
                params.push(Number(req.search_CountKeyword));
            }

            if (req.search_CountKeyword) {
                query += ` else rn <= ? end `;
                params.push(Number(req.search_CountKeyword));
            }

            query += `
                            ) a
                        left outer join (select APP_ID, MSG_ID, MSG_KR_NM
                                from aqt_message_tb 
                                where 1=1
            `

            if (req.app_id) {
                query += ` AND APP_ID = ?`;
                params.push(req.app_id);
            }

            if (req.search_selectedMessage) {
                query += ` AND MSG_ID = ?`;
                params.push(req.search_selectedMessage);
            }

            query += `
                            ) b
                            on a.APP_ID  = b.APP_ID
                            and a.MSG_ID  = b.MSG_ID
                        left outer join (select APP_ID, MSG_ID, MSGFLD_ID, ST_POS, FLD_LEN 
                                            from aqt_messagefield_tb
                                            where 1=1
            `
            query += ` AND APP_ID = ?`;
            params.push(req.app_id);

            query += ` AND MSG_ID = ?`;
            params.push(req.search_selectedMessage);

            query += ` AND MSGFLD_ID = ?`;
            params.push(req.search_selectedField01);

            query += `
                                        ) c
                            on a.APP_ID  = c.APP_ID
                            and a.MSG_ID = c.MSG_ID 
                        left outer join (select APP_ID, MSG_ID, MSGFLD_ID, ST_POS, FLD_LEN 
                                            from aqt_messagefield_tb
                                            where 1=1
            `;

            query += ` AND APP_ID = ?`;
            params.push(req.app_id);

            query += ` AND MSG_ID = ?`;
            params.push(req.search_selectedMessage);

            query += ` AND MSGFLD_ID = ?`;
            params.push(req.search_selectedField02);

            query += `
                                        ) d
                            on a.APP_ID  = d.APP_ID
                            and a.MSG_ID = d.MSG_ID 
                        left outer join (select APP_ID, MSG_ID, MSGFLD_ID, ST_POS, FLD_LEN 
                                            from aqt_messagefield_tb
                                            where 1=1
            `;

            query += ` AND APP_ID = ?`;
            params.push(req.app_id);

            query += ` AND MSG_ID = ?`;
            params.push(req.search_selectedMessage);

            query += ` AND MSGFLD_ID = ?`;
            params.push(req.search_selectedField03);

            query += `
                                        ) e
                            on a.APP_ID  = e.APP_ID
                            and a.MSG_ID = e.MSG_ID 
                        left outer join (select APP_ID, MSG_ID, MSGFLD_ID, ST_POS, FLD_LEN 
                                            from aqt_messagefield_tb
                                            where 1=1
            `;

            query += ` AND APP_ID = ?`;
            params.push(req.app_id);

            query += ` AND MSG_ID = ?`;
            params.push(req.search_selectedMessage);

            query += ` AND MSGFLD_ID = ?`;
            params.push(req.search_selectedField04);


            query += `
                                        ) f
                            on a.APP_ID  = f.APP_ID
                            and a.MSG_ID = f.MSG_ID 
                        where 1=1
            `;

            if (req.app_id) {
                query += ` AND a.APP_ID = ?`;
                params.push(req.app_id);
            }

            if (req.search_selectedMessage) {
                query += ` AND a.MSG_ID = ?`;
                params.push(req.search_selectedMessage);
            }
            query += `
                    ) X
                where 1=1
            `;

            if (req.search_Field01Keyword && req.search_selectedField01) {
                query += ` and X.FLD_SEARCH1 like ?`;
                const keyword = `%${req.search_Field01Keyword}%`;
                params.push(keyword);
            }

            if (req.search_Field02Keyword && req.search_selectedField02) {
                query += ` and X.FLD_SEARCH2 like ?`;
                const keyword = `%${req.search_Field02Keyword}%`;
                params.push(keyword);
            }

            if (req.search_Field03Keyword && req.search_selectedField03) {
                query += ` and X.FLD_SEARCH3 like ?`;
                const keyword = `%${req.search_Field03Keyword}%`;
                params.push(keyword);
            }

            if (req.search_Field04Keyword && req.search_selectedField04) {
                query += ` and X.FLD_SEARCH4 like ?`;
                const keyword = `%${req.search_Field04Keyword}%`;
                params.push(keyword);
            }

            // 순서 정렬
            query += ` ORDER BY X.APP_ID, X.MSG_ID, X.MSGDT_ID`;

            //console.log("---------------------------------------------------------------");
            //console.log("getTestCaseMsgDataList query : " + query);
            //console.log("---------------------------------------------------------------");

            const rows = await conn.query(query, params);

            return rows;
        } catch (error) {
            console.error('getTestCaseMsgDataList error:', error);
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
                        WHERE APP_ID = ? 
                        AND MSG_ID = ?
                    `, [item.APP_ID || item.jobId, item.MSG_ID || item.messageId]
                    );

                    item.MSGDT_ID = 'MDT' + (rows[0].NEXT_SEQ || '00000000001');
                }

                const appId = item.APP_ID || item.jobId;
                const msgId = item.MSG_ID || item.messageId;
                const fixedLenVal = item.FIXEDLEN_VAL || item.content || '';
                const comment = item.COMMENT || item.comment || '';

                //console.log("-------------------------------------------------------");
                //console.log("item.MSGDT_ID : " + item.MSGDT_ID);
                //console.log("appId : " + appId);
                //console.log("msgId : " + msgId);
                //console.log("fixedLenVal : " + fixedLenVal);
                //console.log("comment : " + comment);
                //console.log("-------------------------------------------------------");

                // MERGE Query
                const query = `
                    INSERT INTO aqt_messagedata_tb (
                        MSGDT_ID, APP_ID, MSG_ID 
                        , FIXEDLEN_VAL, COMMENT
                        , CRT_ID, CRT_DT, UDT_ID, UDT_DT
                    ) VALUES (
                        ?, ?, ?
                        , ?, ?
                        , 'monadmin', SYSDATE(), 'monadmin', SYSDATE()
                    ) ON DUPLICATE KEY UPDATE
                        APP_ID = VALUES(APP_ID),
                        MSG_ID = VALUES(MSG_ID),
                        FIXEDLEN_VAL = VALUES(FIXEDLEN_VAL),
                        COMMENT = VALUES(COMMENT),
                        UDT_ID = 'monadmin',
                        UDT_DT = SYSDATE()
                `;

                const params = [
                    item.MSGDT_ID || null,
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
                if (item.MSGDT_ID) {
                    await conn.query(`DELETE FROM aqt_messagedata_tb WHERE MSGDT_ID = ?`, [item.MSGDT_ID]);
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
