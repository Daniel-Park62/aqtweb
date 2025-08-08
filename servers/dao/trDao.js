const aqtdb = require('../db/dbconn');
const mapper = require('mybatis-mapper');
mapper.createMapper(['servers/mappers/aqtdb.xml']);
const NSPACE = 'aqtdb';

const trDao = {
  tasksum: async () => {
    const sql = mapper.getStatement(NSPACE, 'tasksum_sel');
    return await aqtdb.query({dateStrings: true,sql:sql});
  },
  sumByService: async (parms) => {
    const sql = mapper.getStatement(NSPACE, 'vtr_SumByService', parms);
    return await aqtdb.query({dateStrings: true,sql:sql});
  },

  listVtrx: async (parms) => {
    const sql = mapper.getStatement(NSPACE, 'vtrxlist_sel',parms);
    return await aqtdb.query(sql);
  },
  summary: async () => {
    const result = {
        svccnt: 0, // 서비스 수
        rows: []
      } ;

    try {
      const sql = mapper.getStatement(NSPACE, 'tlevel_sel');
      result.rows = await aqtdb.query(sql) ;
      let row = await aqtdb.query('select count(1) as scnt from tservice') ;
      result.svccnt =  row[0].scnt || 0 ;
      return result ;
    } catch (e){
      throw e ;
    } ;
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

module.exports = trDao;




