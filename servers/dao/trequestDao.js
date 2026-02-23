import aqtdb from '../db/dbconn.js' ;
 
export default {
  insert: async (parms) => {
    const rows = await aqtdb.query('select admin from taqtuser where usrid=? order by admin desc',[parms[0][3]] );
    if (rows[0].admin != 1) {
      throw new Error('재전송 권한이 없습니다.');
    }
    return await aqtdb.batch(`INSERT INTO trequest 
         ( pkey, cmpid,  tcode, requser) 
         VALUES ( ?, ?, ?, ? ) ` , parms ) ;
  } 
}


