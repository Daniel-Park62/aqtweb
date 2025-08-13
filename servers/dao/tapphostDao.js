const aqtdb = require('../db/dbconn');
const mapper = require('mybatis-mapper');
mapper.createMapper(['servers/mappers/aqtdb.xml']);
const NSPACE = 'aqtdb';

const tapphostDao = {
  appList : async () => {
    return await aqtdb.query({ rowsAsArray: true , sql: "select appid,appnm,manager from tapplication "
    });
  },
  appUpdate : async (parms) => {
      const qstr = 'REPLACE INTO tapplication ' +
	             ' (appid,appnm,manager) ' +
               'VALUES (?, ?, ?) ' ;
      return await aqtdb.batch(qstr, parms ) ;
  },
  list: async (parms) => {
    const sql = mapper.getStatement(NSPACE, 'tservice_List',parms);
    return await aqtdb.query({ rowsAsArray: false,sql:sql});
  },
  update: async (parms) => {
    const qstr = mapper.getStatement(NSPACE, "tservice_Upd", {list:parms});
    return await aqtdb.query(qstr);
  },
  insert: async (parms) => {
    const qstr = mapper.getStatement(NSPACE, "tservice_Ins", {list:parms});
    return await aqtdb.query(qstr);
  },
  delete: async (parms) => {
    const qstr = mapper.getStatement(NSPACE, 'tservice_Del', {list:parms});
    return await aqtdb.query(qstr);
  }

}

module.exports = tapphostDao;




