import mondb from '../db/dbconn.js' ;

const tperftest = {
    /**
     * 모니터링 종합 성능테스트 결과(최종)
     * BarChart
     */
    tperftest_find : async () => {
        let rows = await mondb.query(` with t as
                                            (select a.sid               as sid
                                                , avg(a.svctime)        as svctime
                                                , avg(a.svctime_asis)   as svctimeasis
                                                , sum(a.sflag)		    as sflag
                                                , max(b.gb)	as gb
                                            from tperftest a
                                            join tperfcode b
                                                on a.tid = b.tid
                                            where a.tid in (select tid
                                                                from tperfcode
                                                                where (lastDt, gb) in (select max(lastDt), min(gb) 
                                                                                        from tperfcode 
                                                                                        where lastDt in (select max(lastDt) from tperfcode)
                                                                                    )
                                                            )
                                            group by a.sid)
                                        select x.apnm 																			as apnm		-- 업무명
                                            , x.tcnt 																			as tcnt		-- 총건수
                                            , case x.gb when '3' then x.impr else x.suss end 									as scnt		-- 향상/성공건수
                                            , x.nocnt 																			as nocnt	-- 미수행건수
                                            , case x.gb when '3' then x.tcnt-(x.nocnt+x.impr) else x.tcnt-(x.nocnt+x.suss) end	as delay	-- 지연/실패건수
                                            , NVL(x.gb, lag(x.gb) over (order by x.apnm))										as gb 		-- 구분(3:성능, 그외:테스트)
                                        from (
                                                select a.apnm 																as apnm
                                                    , count(1) 															    as tcnt
                                                    , sum(if(t.sid is null,1,0)) 											as nocnt
                                                    , sum(if(t.svctime < t.svctimeasis,1,0)) 								as impr
                                                    , sum(case when t.sid is not null and t.sflag = 0 then 1 else 0 end) 	as suss
                                                    , t.gb
                                                from tsid s
                                                join tapid a
                                                    on s.apid = a.apid
                                                left join t
                                                    on s.sid = t.sid
                                                group by a.apnm
                                            ) x
                                        order by x.apnm
                                    `) ;
        return(rows) ;
    },
    /**
     * 모니터링 종합 성능테스트 결과(최종)
     * PieChart
     */
    tperftest_result : async () => {
        let rows = await mondb.query(`  with t as
                                            (select a.sid               as sid
                                                , avg(a.svctime)        as svctime
                                                , avg(a.svctime_asis)   as svctimeasis
                                                , sum(a.sflag)		    as sflag
                                                , max(b.gb)	as gb
                                            from tperftest a
                                            join tperfcode b
                                                on a.tid = b.tid
                                            where a.tid in (select tid
                                                                from tperfcode
                                                                where (lastDt, gb) in (select max(lastDt), min(gb) 
                                                                                        from tperfcode 
                                                                                        where lastDt in (select max(lastDt) from tperfcode)
                                                                                    )
                                                            )
                                            group by a.sid)
                                        select x.tcnt 																			as tcnt		-- 총건수
                                            , case x.gb when '3' then x.impr else x.suss end 									as scnt		-- 향상/성공건수
                                            , x.nocnt 																			as nocnt	-- 미수행건수
                                            , case x.gb when '3' then x.tcnt-(x.nocnt+x.impr) else x.tcnt-(x.nocnt+x.suss) end	as delay	-- 지연/실패건수
                                            , x.gb																				as gb 		-- 구분(3:성능, 그외:테스트)
                                        from (
                                                select count(1) 															as tcnt
                                                    , sum(if(t.sid is null,1,0)) 											as nocnt
                                                    , sum(if(t.svctime < t.svctimeasis,1,0)) 								as impr
                                                    , sum(case when t.sid is not null and t.sflag = 0 then 1 else 0 end) 	as suss
                                                    , max(nvl(t.gb,''))													as gb
                                                from tsid s
                                                join tapid a
                                                    on s.apid = a.apid
                                                left join t
                                                    on s.sid = t.sid
                                            ) x
                                    `) ;
        return(rows) ;
    },    
    /**
     * 성능 우측 성능테스트 결과
     * BarChart
     */
    tperfchklist : async (args) => {
      // console.log("args.query.tid : " + args.query.tid);

      let rows = await mondb.query(` with t as
                                        (select sid                 as sid
                                            , avg(svctime)        as svctime
                                            , avg(svctime_asis)   as svctimeasis
                                        from tperftest
                                        where tid in (select max(tid) as tid
                                                        from tperfcode
                                                        where gb = '3'
                                                        and tid = ?
                                                     )
                                        group by sid)
                                    select x.apnm                   as apnm
                                        , x.tcnt                    as tcnt
                                        , x.scnt                    as scnt
                                        , x.nocnt                   as nocnt
                                        , x.tcnt-(x.nocnt+x.scnt)   as delay
                                    from (
                                            select a.apnm                                as apnm
                                                , count(1)                               as tcnt
                                                , sum(if(t.sid is null,1,0))             as nocnt
                                                , sum(if(t.svctime < t.svctimeasis,1,0)) as scnt
                                            from tsid s
                                            join tapid a
                                                on s.apid = a.apid
                                            left join t
                                                on s.sid = t.sid
                                            group by a.apnm
                                        ) x
                                    `, [args.query.tid] ) ;
        return(rows) ;
      },    
    /**
     * 성능 우측 성능테스트 결과
     * PieChart
     */
    tperfchkresult : async (args) => {
      // console.log("args.query.tid : " + args.query.tid);

      let rows = await mondb.query(` with t as
                                            (select sid				    as sid
                                                  , avg(svctime) 	    as svctime
                                                  , avg(svctime_asis)   as svctimeasis
                                            from tperftest
                                            where tid in (select max(tid) as tid
                                                            from tperfcode
                                                            where gb='3'
                                                            and tid = ?
                                                         )
                                            group by sid)
                                            select tcnt						as tcnt
                                                , improve					as scnt
                                                , notperf					as nocnt
                                                , tcnt-(notperf+improve) 	as delay
                                            from (
                                                    select count(1)                                 as tcnt
                                                         , sum(if(t.sid is null,1,0))               as notperf
                                                         , sum(if(t.svctime < t.svctimeasis,1,0))   as improve
                                                    from tsid s
                                                    left join t
                                                        on s.sid = t.sid
                                                ) x
                                            limit 1
                                    `, [args.query.tid] ) ;
        return(rows) ;
      },     
    /**
     * 성능 우측 성능테스트 세부 내용
     * 수행차수, 테스트일시, 시작시간, 종료시간, 소요시간, ASIS시작시간, ASIS종료시간, ASIS소요시간, 등록시간
     */
    tperfdelist : async (args) => {
      // console.log("args.query.tid : " + args.query.tid);

      let rows = await mondb.query(` with t as
                                            (select sid			        as sid
                                                , tstime		        as tstime
                                                , stime			        as stime
                                                , etime			        as etime
                                                , truncate(svctime,3)   as svctime
                                                , stime_asis	        as stimeasis
                                                , etime_asis	        as etimeasis
                                                , svctime_asis	        as svctimeasis
                                                , regdt  		        as regdt
                                            from tperftest
                                            where tid in (select max(tid) as tid
                                                            from tperfcode
                                                            where gb='3'
                                                            and tid = ?
                                                        )
                                            group by sid)
                                        select x.apnm                   					as apnm			-- 업무명
                                            , case when x.scnt=1 and x.nocnt=0 then '향상' 
                                                when x.scnt=0 and x.nocnt=1 then '미수행'
                                                else '지연' end 							as gubun		-- 구분
                                            , NVL(x.svcnm,'')								as svcnm		-- 서비스명
                                            , NVL(x.tstime,'')							    as tstime		-- 테스트일시
                                            , NVL(x.stime,'')							    as stime		-- 시작시간 
                                            , NVL(x.etime,'')							    as etime		-- 종료시간
                                            , NVL(x.svctime,'')								as svctime		-- 소요시간
                                            , NVL(x.stimeasis,'')						    as stimeasis	-- ASIS시작시간
                                            , NVL(x.etimeasis,'')						    as etimeasis	-- ASIS종료시간
                                            , NVL(x.svctimeasis,'')							as svctimeasis	-- ASIS소요시간
                                            , NVL(x.regdt,'')  								as regdt        -- 등록시간
                                        from (
                                                select a.apnm                           as apnm
                                                	, s.svcnm							as svcnm
                                                    , 1									as tcnt
                                                    , if(t.svctime < t.svctimeasis,1,0)	as scnt
                                                    , if(t.sid is null,1,0)		        as nocnt
                                                    , t.tstime							as tstime
                                                    , t.stime							as stime
                                                    , t.etime							as etime
                                                    , t.svctime							as svctime
                                                    , t.stimeasis						as stimeasis
                                                    , t.etimeasis						as etimeasis
                                                    , t.svctimeasis						as svctimeasis
                                                    , t.regdt  							as regdt
                                                from tsid s
                                                join tapid a
                                                    on s.apid = a.apid
                                                left join t
                                                    on s.sid = t.sid
                                            ) x
                                    `, [args.query.tid] ) ;
        return(rows) ;
      },  
    /**
     * 테스트 우측 테스트 결과
     * BarChart
     */
    ttestchklist : async (args) => {
        // console.log("args.query.tid : " + args.query.tid);

        let rows = await mondb.query(` with t as
                                        (select sid                 as sid				
                                              , avg(svctime)        as svctime			 
                                              , avg(svctime_asis)	as svctimeasis
                                              , sum(sflag)		    as sflag
                                        from tperftest
                                        where tid in (select max(tid) as tid
                                                        from tperfcode
                                                        where gb <> '3'
                                                        and tid = ?
                                                      )
                                            group by sid)
                                        select x.apnm					as apnm		-- 업무명
                                             , x.tcnt					as tcnt		-- 총건수
                                             , x.nocnt					as nocnt	-- 미수행건수
                                             , x.suss					as scnt		-- 성공건수
                                             , x.tcnt-(x.nocnt+x.suss)	as fcnt		-- 실패건수
                                        from (
                                                select a.apnm                                								as apnm
                                                    , count(1)                               								as tcnt
                                                    , sum(if(t.sid is null,1,0))             								as nocnt
                                                    , sum(case when t.sid is not null and t.sflag = 0 then 1 else 0 end) 	as suss
                                                from tsid s
                                                join tapid a
                                                    on s.apid = a.apid
                                                left join t
                                                    on s.sid = t.sid
                                                group by a.apnm
                                            ) x
                                      `, [args.query.tid] ) ;
          return(rows) ;
        },    
      /**
       * 테스트 우측 테스트 결과
       * PieChart
       */
      ttestchkresult : async (args) => {
        // console.log("args.query.tid : " + args.query.tid);

        let rows = await mondb.query(` with t as
                                        (select sid                 as sid				
                                                , avg(svctime)      as svctime			 
                                                , avg(svctime_asis)	as svctimeasis
                                                , sum(sflag)		as sflag
                                        from tperftest
                                        where tid in (select max(tid) as tid
                                                        from tperfcode
                                                        where gb <> '3'
                                                        and tid = ?
                                                    )
                                            group by sid)
                                        select x.tcnt					as tcnt		-- 총건수
                                            , x.nocnt					as nocnt	-- 미수행건수
                                            , x.suss					as scnt		-- 성공건수
                                            , x.tcnt-(x.nocnt+x.suss)	as fcnt		-- 실패건수
                                        from (
                                                select count(1)                               								as tcnt
                                                    , sum(if(t.sid is null,1,0))             								as nocnt
                                                    , sum(case when t.sid is not null and t.sflag = 0 then 1 else 0 end) 	as suss
                                                from tsid s
                                                left join t
                                                    on s.sid = t.sid
                                            ) x
                                        limit 1
                                      `, [args.query.tid] ) ;
          return(rows) ;
        },     
      /**
       * 테스트 우측 테스트 세부내용
       * 수행차수, 테스트일시, 시작시간, 종료시간, 소요시간, ASIS시작시간, ASIS종료시간, ASIS소요시간, 등록시간
       */
      ttestdelist : async (args) => {
        // console.log("args.query.tid : " + args.query.tid);

          let rows = await mondb.query(` with t as
                                            (select sid			        as sid		
                                                  , tstime		        as tstime
                                                  , stime			    as stime 
                                                  , etime			    as etime
                                                  , sflag			    as sflag
                                                  , truncate(svctime,3) as svctime
                                                  , stime_asis	        as stimeasis
                                                  , etime_asis	        as etimeasis
                                                  , svctime_asis	    as svctimeasis
                                                  , regdt  		        as regdt
                                            from tperftest
                                            where tid in (select max(tid) as tid
                                                            from tperfcode
                                                            where gb<>'3'
                                                            and tid = ?
                                                        )
                                            group by sid)
                                        select x.apnm                   					    as apnm			-- 업무명
                                             , case when x.sflag=0 and x.nocnt=0 then '성공' 
                                                    when x.sflag=0 and x.nocnt=1 then '미수행'
                                                    when x.sflag=1 and x.nocnt=1 then '미수행'
                                                    else '실패' end 							as gubun		-- 구분
                                             , NVL(x.svcnm,'')								    as svcnm		-- 서비스명
                                             , NVL(x.tstime,'')							        as tstime		-- 테스트일시
                                             , NVL(x.stime,'')								    as stime		-- 시작시간 
                                             , NVL(x.etime,'')								    as etime		-- 종료시간
                                             , NVL(x.svctime,'')							    as svctime		-- 소요시간
                                             , NVL(x.stimeasis,'')							    as stimeasis	-- ASIS시작시간
                                             , NVL(x.etimeasis,'')							    as etimeasis	-- ASIS종료시간
                                             , NVL(x.svctimeasis,'')						    as svctimeasis	-- ASIS소요시간
                                             , NVL(x.regdt,'')  							    as regdt        -- 등록시간
                                        from (
                                                select a.apnm                           							as apnm
                                                	, s.svcnm							                            as svcnm
                                                    , 1																as tcnt
                                                    , case when t.sid is not null and t.sflag = 0 then 0 else 1 end	as sflag
                                                    , if(t.sid is null,1,0)		        							as nocnt
                                                    , t.tstime														as tstime
                                                    , t.stime														as stime 
                                                    , t.etime														as etime
                                                    , t.svctime														as svctime
                                                    , t.stimeasis													as stimeasis
                                                    , t.etimeasis													as etimeasis
                                                    , t.svctimeasis													as svctimeasis
                                                    , t.regdt  														as regdt
                                                from tsid s
                                                join tapid a
                                                    on s.apid = a.apid
                                                left join t
                                                    on s.sid = t.sid
                                            ) x
                                      `, [args.query.tid] ) ;
          return(rows) ;
        },          
}
 
export default tperftest ;