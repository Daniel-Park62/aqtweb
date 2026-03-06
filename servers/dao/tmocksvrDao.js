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
  statusUpd: async (pkey,sts) => {
    try {
      await aqtdb.query('update tmocksvr set status = ? where pkey = ?',[sts,pkey]) ;
      return await aqtdb.query('select status,procid from tmocksvr where pkey = ?',[pkey]) ;
    } catch (error) {
      throw error ;
    }
  }

}

export default tmocksvrDao;




