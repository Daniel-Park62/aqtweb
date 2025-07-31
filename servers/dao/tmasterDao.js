const aqtdb = require('../db/dbconn');
const mapper = require('mybatis-mapper');
mapper.createMapper(['servers/mappers/aqtdb.xml']);
const NSPACE = 'aqtdb';

const tmasterDao = {
  listByUid : async (uid) => {
    const sql = mapper.getStatement(NSPACE,'tmaster_ListUid',{uid}) ;
    return await aqtdb.query(sql) ;
  },

  listAll: async () => {
    const sql = mapper.getStatement(NSPACE,'tmaster_ListAll') ;
    console.log(process.cwd(),sql);
    return await aqtdb.query(sql) ;
  },
  copyTr : async (parms) => {
    const qstr = parms.cnt > 0 ? 'call sp_loaddata2(?,?,?,?) ' : 'call sp_loaddata(?,?,?) ';
    try {
      const r = await aqtdb.query(qstr, [parms.srccode,parms.dstcode,parms.cond,parms.cnt]) ;
        aqtdb.query('call sp_summary(?)',[parms.dstcode]) ;
        console.log("ok2:",r[0]) ;
        return r[0] ;
    } catch( e ) {
        throw e;
      }
      ;           
  },
  save : async (values) => {
  const qstr = 'REPLACE INTO thostmap ' +
	             ' (pkey,  tcode, thost, tport, thost2, tport2 ) ' +
               'VALUES (?, ?, ?, ?, ?) ' ;
    return await aqtdb.batch(qstr, values ) ;
  }
}

module.exports = tmasterDao ;




