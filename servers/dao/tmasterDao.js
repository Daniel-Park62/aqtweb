const aqtdb = require('../db/dbconn');
const mapper = require('mybatis-mapper');
mapper.createMapper(['servers/mappers/aqtdb.xml']);
const NSPACE = 'aqtdb';

module.exports = {
  listByUid: async (uid) => {
    const sql = mapper.getStatement(NSPACE, 'tmaster_ListUid', { uid });
    return await aqtdb.query(sql);
  },

  listAll: async () => {
    const sql = mapper.getStatement(NSPACE, 'tmaster_ListAll');
    // console.log(process.cwd(), sql);
    return await aqtdb.query(sql);
  },
  copyTr: async (parms) => {
    const qstr = parms.cnt > 0 ? 'call sp_loaddata2(?,?,?,?) ' : 'call sp_loaddata(?,?,?) ';
    try {
      const r = await aqtdb.query(qstr, [parms.srccode, parms.dstcode, parms.cond, parms.cnt]);
      aqtdb.query('call sp_summary(?)', [parms.dstcode]);
      console.log("ok2:", r[0]);
      return r[0];
    } catch (e) {
      throw e;
    }
    ;
  },
  insertMaster: async (parms) => {
    const row = await aqtdb.query("	SELECT count(1) cnt from tmaster where code = ?", [parms.code]);
    if (row[0].cnt > 0) {
      throw Error(`이미 존재하는 코드입니다(${parms.code})`);
    }
    const qstr = mapper.getStatement(NSPACE, 'tmaster_Ins', parms);
    return await aqtdb.query(qstr);
  },
  updateMaster: async (parms) => {
    const qstr = mapper.getStatement(NSPACE, 'tmaster_Upd', parms);
    return await aqtdb.query(qstr);
  },
  deleteMaster: async (parms) => {
    const qstr = mapper.getStatement(NSPACE, 'tmaster_Del', parms);
    console.log("deleteMaster:" ,qstr);
    return await aqtdb.query(qstr);
  },
  eraseTr: async (parms) => {
    const qstr = mapper.getStatement(NSPACE, 'ttcppacket_Erase', parms);
    console.log("eraseTr:" ,qstr);
    return await aqtdb.query(qstr);
  },

}




