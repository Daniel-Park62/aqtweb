import mondb from '../db/dbconn.js' ;

const tperftest = {
    /**
     * BarChart
     */
    tperftest_find : async () => {
        let rows = await mondb.query(` SELECT APPID                                                                     as apnm
                                            , COUNT(PGID) 																as tcnt
                                            , SUM(IF(TRANSSTATUS=9,1,0))												as scnt
                                            , COUNT(PGID) - SUM(IF(TRANSSTATUS=9,1,0)) 	                                as delay
                                            , SUM(IF(TRANSSTATUS=8,1,0)) 												as nocnt
                                            , 0																			as gb
                                        FROM TPROGRESS
                                        GROUP BY APPID
                                    `) ;
        return(rows) ;
    },
    /**
     * PieChart
     */
    tperftest_result : async () => {
        let rows = await mondb.query(` SELECT COUNT(PGID) 																as tcnt
                                            , SUM(IF(TRANSSTATUS=9,1,0))												as scnt
                                            , COUNT(PGID) - SUM(IF(TRANSSTATUS=9,1,0))                               	as delay
                                            , SUM(IF(TRANSSTATUS=8,1,0)) 												as nocnt
                                            , 0																			as gb
                                        FROM TPROGRESS
                                    `) ;
        return(rows) ;
    },    
    /**
     * BarChart
     */
    tperftest_find2 : async () => {
        let rows = await mondb.query(` SELECT APPID                                                                     as apnm
                                            , COUNT(TRCODE) 															as tcnt
                                            , SUM(IF(TESTSTATUS=9,1,0))													as scnt
                                            , COUNT(TRCODE) - SUM(IF(TESTSTATUS=9,1,0))                              	as delay
                                            , SUM(IF(TESTSTATUS=8,1,0)) 												as nocnt
                                            , 0																			as gb
                                        FROM TPROGRESS
                                        GROUP BY APPID
                                    `) ;
        return(rows) ;
    },
    /**
     * PieChart
     */
    tperftest_result2 : async () => {
        let rows = await mondb.query(` SELECT COUNT(TRCODE) 															as tcnt
                                            , SUM(IF(TESTSTATUS=9,1,0))													as scnt
                                            , COUNT(TRCODE) - SUM(IF(TESTSTATUS=9,1,0))                              	as delay
                                            , SUM(IF(TESTSTATUS=8,1,0)) 												as nocnt
                                            , 0																			as gb
                                        FROM TPROGRESS
                                    `) ;
        return(rows) ;
    },     
}
 
export default tperftest ;