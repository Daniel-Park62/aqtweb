import aqtdb from '../db/dbconn.js';

const taqtprogDao = {

  one: async (progno) => {
    return await aqtdb.query('SELECT a.* from taqtprog a where progno=?',[progno]);
  },
  list: async () => {
    return await aqtdb.query('SELECT a.* from taqtprog a order by pgb,progno');
  },
  update: async (parms) => {
    const qstr = `update taqtprog set pgb=?, pgkind=?,nm=?,src=?
                  where progno = ?`;
    const udata = parms.map(r => [r.pgb,r.pgkind, r.nm, r.src, r.progno]) ;
    return await aqtdb.batch(qstr,udata);
  },
  insert: async (parms) => {
    const qstr = `insert into taqtprog (pgb, pgkind,nm, src) values (?,?,?,?)`;
    const udata = parms.map(r => [r.pgb,r.pgkind, r.nm, r.src, r.progno]) ;
    return await aqtdb.batch(qstr,udata);
  },
  delete: async (parms) => {
    const qstr = `delete from taqtprog where progno in (?)`;
    return await aqtdb.query(qstr,[parms]);
  },
}

export default taqtprogDao;
