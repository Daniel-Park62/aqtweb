import mondb from '../db/dbconn.js' ;

const tperfcode = {
    /**모니터링 종합 최신 성능 결과, 적재 Data 검증 최신 결과
     * 년월일, 테스트제목
     */
    find : async () => {
        let rows = await mondb.query(` select substr(max(X.performdt), 1, 10)         as performdt      
                                        , trim(substr(max(X.performdt), 12, 500))     as performnm
                                        , substr(max(X.dataverifydt), 1, 10)          as dataverifydt
                                        , trim(substr(max(X.dataverifydt), 11, 500))  as dataverifynm
                                        , trim(max(pjtname))                          as pjtname
                                        , trim(max(corpnm))                           as corpnm
                                        , trim(max(startDt))                          as startdt
                                        , trim(max(endDt))                            as enddt
                                        , trim(max(intl))                             as intl
                                        , trim(max(vtotday))                          as vtotday
                                        , trim(max(vrday))                            as vrday
                                        , trim(substr(max(X.performdt), 11, 1))       as gb
                                      from (
                                          select concat(concat(lastDt,gb),tname) 		as performdt
                                            , ''                                      as dataverifydt
                                            , ''                                      as pjtname
                                            , ''                                      as corpnm
                                            , ''                                      as startdt
                                            , ''                                      as enddt
                                            , ''                                      as intl
                                            , ''                                      as vtotday
                                            , ''                                      as vrday
                                          from tperfcode
                                          where tid in (select tid
                                                        from tperfcode
                                                          where (lastDt, gb) in (select max(lastDt), min(gb) 
                                                                                      from tperfcode 
                                                                                      where lastDt in (select max(lastDt) from tperfcode)
                                                                                  )
                                                          )
                                            union all
                                            select ''                                   as performdt
                                              , max(concat(wdate,dname))                as dataverifydt
                                              , ''                                      as pjtname
                                              , ''                                      as corpnm
                                              , ''                                      as startdt
                                              , ''                                      as enddt
                                              , ''                                      as intl
                                              , ''                                      as vtotday
                                              , ''                                      as vrday
                                            from tdatacode
                                            union all
                                            select ''                                   as performdt
                                              , ''                                      as dataverifydt
                                              , pjt_name                                as pjtname
                                              , corpnm                                  as corpnm
                                              , startDt                                 as startdt
                                              , endDt                                   as enddt
                                              , intl                                    as intl
                                              , vtotday                                 as vtotday
                                              , vrday                                   as vrday
                                            from tprojenv
                                            where pkey=1
                                        ) X 
                                    ` ) ;                                               
        return(rows) ;
    },
    /**
     * 성능 좌측 list
     * 차수, ASIS 년월일, TOBE 년월일, 제목
     */
    tperflist : async () => {
      let rows = await mondb.query(` select tid					      as tid			-- 테스트코드
                                          , concat(seq,'차')  as seq			-- 수행차수
                                          , trim(tname)       as tname		-- 특이사항
                                          , gb					      as gb			  -- 테스트구분(3:성능테스트, 그외:주제테스트(통테, 단테등))
                                          , startdt				    as startdt	-- 시작일
                                          , asisDt				    as asisdt		-- asis수행일
                                          , lastDt 				    as tobedt		-- 종료일
                                      from tperfcode
                                      where gb = '3'
                                      order by gb asc, seq desc, lastDt desc
                                  ` ) ;                                               
      return(rows) ;
    },    
    /**
     * 성능 우측 상단
     * 제목, 년월일
     */
    tperftitle : async (args) => {
      // console.log("args.query.tid : " + args.query.tid);

      let rows = await mondb.query(` select tname       as tname
                                          , lastDt 			as tobedt
                                        from tperfcode
                                        where gb = '3'
                                        and tid = ?
                                        limit 1
                                    `, [args.query.tid] ) ;
      return(rows) ;
    },    
    /**
     * 테스트 좌측 list
     * 차수, ASIS 년월일, TOBE 년월일, 제목
     */
    ttestlist : async () => {
      let rows = await mondb.query(`select tid					      as tid			-- 테스트코드
                                          , concat(seq,'차')  as seq			-- 수행차수
                                          , trim(tname)       as tname		-- 특이사항
                                          , gb					      as gb			  -- 테스트구분(3:성능테스트, 그외:주제테스트(통테, 단테등))
                                          , startdt				    as startdt	-- 시작일
                                          , asisDt				    as asisdt		-- asis수행일
                                          , lastDt 				    as tobedt		-- 종료일
                                      from tperfcode
                                      where gb <> '3'
                                      order by gb asc, seq desc, lastDt desc
                                  ` ) ;                                               
      return(rows) ;
    },    
    /**
     * 테스트 우측 
     * 제목, 년월일
     */
    ttesttitle : async (args) => {
      // console.log("args.query.tid : " + args.query.tid);

      let rows = await mondb.query(` select trim(tname)   as tname
                                          , lastDt 				as tobedt
                                        from tperfcode
                                        where gb <> '3'
                                        and tid = ?
                                        limit 1
                                    `, [args.query.tid] ) ;
      return(rows) ;
    },       
}
 
export default tperfcode ;