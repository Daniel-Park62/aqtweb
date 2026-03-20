import aqtdb from '../db/dbconn.js';

const tmocksvrDao = {

  one: async (pkey) => {
    return await aqtdb.query('SELECT a.* from tmocksvr a where pkey=?',[pkey]);
  },
  list: async () => {
    return await aqtdb.query('SELECT 0 chk, a.* from tmocksvr a');
  },
  update: async (parms) => {
    const qstr = `update tmocksvr set svrnm=?, svrkind=?,portno=?,allowip=?,srcnm=?
                  where pkey = ?`;
    const udata = parms.map(r => [r.svrnm,r.svrkind, r.portno, r.allowip, r.srcnm, r.pkey]) ;
    return await aqtdb.batch(qstr,udata);
  },
  insert: async (parms) => {
    const qstr = `insert into tmocksvr (svrnm, svrkind,portno, allowip,srcnm) values (?,?,?,?,?)`;
    const udata = parms.map(r => [r.svrnm,r.svrkind, r.portno, r.allowip, r.srcnm]) ;
    return await aqtdb.batch(qstr,udata);
  },
  delete: async (parms) => {
    const qstr = `delete from tmocksvr where pkey in (?)`;
    return await aqtdb.query(qstr,[parms]);
  },
  statusUpd: async (pkey,sts, pid=0) => {
    try {
      await aqtdb.query('update tmocksvr set status = ?,procid=? where pkey = ?',[sts,pid,pkey]) ;
      return await aqtdb.query('select status,procid,svrnm from tmocksvr where pkey = ?',[pkey]) ;
    } catch (error) {
      throw error ;
    }
  },
  getLogs: async (pkey) => {
    return await aqtdb.query('SELECT logs from tmocksvrlog a where pkey=?',[pkey]);
  },

  saveLogs: async (pkey,ldata) => {
    const row = await tmocksvrDao.getLogs(pkey);
    const logs = row.length ? row[0].logs.split("\n") : [] ;
    
    const cnt = logs.push(ldata.trimEnd()) ;
    if (cnt > 200) logs.splice(0, 1);
    const nlogs = logs.join("\n") ;
    return await aqtdb.query('insert into tmocksvrlog (pkey,logs) values (?,?) on duplicate key update logs=? ',[pkey,nlogs,nlogs]) ;
  }
}

export default tmocksvrDao;




