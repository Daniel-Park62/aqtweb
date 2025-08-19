const aqtdb = require('../db/dbconn') ;
 
module.exports = {
  insert: async (parms) => {
    return await aqtdb.batch(`INSERT INTO trequest 
         ( pkey, cmpid,  tcode, requser) 
         VALUES ( ?, ?, ?, ? ) ` , parms ) ;
  } 
}


