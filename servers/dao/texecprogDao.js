import aqtdb from '../db/dbconn.js';

const texecprogDao = {

  one: async (jobid) => {
    return await aqtdb.query('SELECT a.pkey,a.progno,b.pgb,b.nm from texecprog a join taqtprog b on a.progno = b.progno where a.pkey=?',[jobid]);
  },
  list: async (jobid) => {
    return await aqtdb.query(`SELECT a.progno,pgb,pgkind,nm, left(a.src,100) as src, ifnull(b.pkey, 0) as pkey
          from taqtprog a left join texecprog b on (a.progno = b.progno and b.pkey = ? )
          order by progno`,[jobid]);
  },
  update: async (parms) => {
    const qstr = `replace into texecprog (pkey, progno) values (?,?)` ;
    const udata = parms.map(r => [r.pkey, r.progno]) ;
    return await aqtdb.batch(qstr,udata);
  },

  delete: async (jobid) => {
    const qstr = `delete from texecprog where pkey = ? `;
    return await aqtdb.query(qstr,[jobid]);
  },
  deleteByProg: async (progs) => {
    const qstr = `delete from texecprog where progno in (?) `;
    return await aqtdb.query(qstr,[progs]);
  },
}

export default texecprogDao;
