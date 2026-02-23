import aqtdb from '../db/dbconn.js';

const tmocksvrDao = {

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
  startsvr: async (pkey) => {
    try {
      const row = (await aqtdb.query('select status from tmocksvr where pkey = ?',[pkey]))[0] ;
      if ( row.status == 0 || row.status == 3 ) {
        await aqtdb.query('update tmocksvr set status = 1 where pkey = ?',[pkey]) ;
      } else {
        await aqtdb.query('update tmocksvr set reqstop = 1 where pkey = ?',[pkey]) ;
      }
      return aqtdb.query('select status,reqstop,procid from tmocksvr where pkey = ?',[pkey]) ;
    } catch (error) {
      throw error ;
    }

  }

}

export default tmocksvrDao;




