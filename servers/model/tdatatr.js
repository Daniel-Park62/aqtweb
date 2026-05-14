import mondb from '../db/dbconn.js';

const tdatatr = {
    /**
     * 모니터링 종합 적재 Data 검증 결과(최종)
     * BarChart
     */
    tdatatr_find: async () => {
        let rows = await mondb.query(`	select sum(b.tblAsis)       as tblasis
                                             , sum(b.tblTobe)       as tbltobe
                                             , sum(b.idxAsis)       as idxasis
                                             , sum(b.idxTobe)       as idxtobe
                                             , sum(b.objAsis)       as objasis
                                             , sum(b.objTobe)       as objtobe
                                             , sum(b.invalidAsis)   as invalidasis
                                             , sum(b.invalidTobe)   as invalidtobe
                                        from (select did    as did
                                                from tdatacode
                                                where (wdate, did) in (select substr(max(concat(wdate,did)), 1, 10)
                                                                            , substr(max(concat(wdate,did)), 11, 10) 
                                                                        from tdatacode)
                                            ) A
                                        join tdatatr B
                                            on a.did = b.did
                                    `);
        return (rows);
    },
    /**
     * 모니터링 종합 적재 Data 검증 결과(최종)
     * BarChart
     */
    tdatatr_verify: async () => {
        let rows = await mondb.query(`	select sum(b.tblTobe)                   as tbltobe
	                                         , sum(b.tblAsis)-sum(b.tblTobe)    as tblasistobesum
                                        from (select did    as did
		                                        from tdatacode
                                                where (wdate, did) in (select substr(max(concat(wdate,did)), 1, 10)
                                                                            , substr(max(concat(wdate,did)), 11, 10) 
                                                                        from tdatacode)
	                                         ) A
                                        join tdatatr B
	                                        on a.did = b.did
                                    `);
        return (rows);
    },
    /**
     * 데이타이관 적제 Data 검증 우측 상단
     * 구분, DB계정명
     * , ASIS Table수량, TOBE Table수량, ASIS Index수량, TOBE Index수량
     * , ASIS Object수량, TOBE Object수량, ASIS Invalid Object수량, TOBE Invalid Object수량
     */
    tdatachklist: async (args) => {
        // console.log("args.query.did : " + args.query.did);      

        let rows = await mondb.query(` select a.pkey			as pkey			-- pkey
                                            , a.did			    as did			-- 데이터이관ID
                                            , b.seq			    as seq			-- 차수
                                            , b.dname			as dname		-- 이관차수명
                                            , b.wdate			as wdate		-- 작업일
                                            , b.sf 			    as sf 			-- 특이사항 
                                            , a.dbname			as dbname		-- db명
                                            , a.dbuser			as dbuser		-- db계정
                                            , a.tblAsis		    as tblasis		-- table수 asis
                                            , a.tblTobe		    as tbltobe		-- table수 tobe
                                            , a.idxAsis		    as idxasis		-- index수 asis
                                            , a.idxTobe		    as idxtobe		-- index수 tobe
                                            , a.objAsis		    as objasis		-- 그외 obj수 asis
                                            , a.objTobe		    as objtobe		-- 그외 obj수 tobe
                                            , a.invalidAsis	    as invalidasis	-- Invaild obj수 asis
                                            , a.invalidTobe	    as invalidtobe	-- Invaild obj수 tobe
                                            , a.checkTbl		as checktbl		-- 값검증 대상 테이블
                                            , a.checkErr		as checkerr		-- 값검증 오류건수
                                        from tdatatr a
                                        join tdatacode b
                                            on a.did = b.did
                                        where a.did = ?
                                      `, [args.query.did]);
        return (rows);
    },
}

export default tdatatr;