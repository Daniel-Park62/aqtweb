const aqtdb = require('../db/dbconn');
const mapper = require('mybatis-mapper');
mapper.createMapper(['servers/mappers/aqtdb.xml']);
const NSPACE = 'aqtdb';

const tmasterDao = {

  listAll: async () => {
    const sql = mapper.getStatement(NSPACE, 'taqtuser_All');
    return await aqtdb.query({ rowsAsArray: false,sql:sql});
  },
  update: async (parms) => {
    const qstr = mapper.getStatement(NSPACE, "taqtuser_Upd", {list:parms});
    return await aqtdb.query(qstr);
  },
  insert: async (parms) => {
    const qstr = mapper.getStatement(NSPACE, "taqtuser_Ins", {list:parms});
    return await aqtdb.query(qstr);
  },
  delete: async (parms) => {
    const qstr = mapper.getStatement(NSPACE, 'taqtuser_Del', {list:parms});
    return await aqtdb.query(qstr);
  }

}

module.exports = tmasterDao;




