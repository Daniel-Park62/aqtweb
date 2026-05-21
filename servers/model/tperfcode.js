import mondb from '../db/dbconn.js' ;

const tperfcode = {
    /**모니터링 종합 최신 성능 결과, 적재 Data 검증 최신 결과
     * 년월일, 테스트제목
     */
    find : async () => {
        let rows = await mondb.query(` select max(udate) as performdt from TPROGRESS
                                    ` ) ;                                               
        return(rows) ;
    },
}
 
export default tperfcode ;