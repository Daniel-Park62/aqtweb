const aqtdb = require('../db/dbconn');

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
  }

}

module.exports = tmocksvrDao;




