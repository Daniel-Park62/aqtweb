const aqtdb = require('../db/dbconn');

const tapphostDao = {
  appList : async () => {
    return await aqtdb.query({ rowsAsArray: true , sql: "select appid,appnm,manager from tapplication "
    });
  },
  appSave : async (parms) => {
      const qstr = `REPLACE INTO tapplication 
	               (appid,appnm,manager) VALUES (?, ?, ?) ` ;
      return await aqtdb.batch(qstr, parms ) ;
  },
  hostUpdate : async(parms) => {
      const qstr = `REPLACE INTO tapphosts 
	              (pkey, appid,thost,tport) VALUES (?, ?, ?, ?) ` ;
      return await aqtdb.batch(qstr, parms ) ;
  },
  hostInsert : async(parms) => {
      const qstr = `INSERT INTO tapphosts 
	              (appid,thost,tport)  VALUES ( ?, ?, ?)  ` ;
      return await aqtdb.batch(qstr, parms ) ;
  },
  getHost: async (parms) => {
    return await aqtdb.query({ rowsAsArray: true , 
      sql: "select pkey, appid,thost,tport from tapphosts where appid = ? "  },parms ) ;
  },
  appDelete: async (parms) => {
    await aqtdb.query('delete from tapphosts where appid in (?)', parms) ;
    const qstr = 'delete from tapplication where appid in (?)' ; 
    return await aqtdb.query(qstr, parms)  ;
  },
  hostDelete: async (parms) => {
    return await aqtdb.query('delete from tapphosts where pkey in (?)', parms) ;
  },

}

module.exports = tapphostDao;




