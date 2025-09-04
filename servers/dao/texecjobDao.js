const aqtdb = require('../db/dbconn') ;
 
module.exports = {
  find : async (parms) => {
      return await aqtdb.query(`	SELECT a.pkey, jobkind, tcode, tdesc, tnum, dbskip, etc, in_file, limits,  tuser, tdir, tenv, 
                thost, tport, reqstartDt, exectype, resultstat, reqnum, repnum,  startDt, endDt, msg , b.tcnt,b.ccnt,b.ecnt 
           FROM texecjob a left join texecing b on(a.pkey = b.pkey)  
           ${parms}  order by if(resultstat=3,1.5,resultstat) , startdt desc `) ;
  },
  insert: async (parms) => {
    const qstr = `INSERT INTO texecjob 
	              (jobkind, tcode, tdesc, tnum, dbskip, etc, in_file, reqstartDt, exectype, reqnum, repnum,limits) 
               VALUES (?,?,?,?, ?,?,?,?, ?,?,?,? ) ` ;
    return await aqtdb.query(qstr, [ parms.jobkind, parms.tcode, parms.tdesc, parms.tnum, 
                                  parms.dbskip, parms.etc, parms.in_file, parms.reqstartDt,
                                  parms.exectype, parms.reqnum, parms.repnum,parms.limits]);
  },
  async reRun (parms)  {
    const qstr = `UPDATE texecjob SET 
	              tcode=?, tdesc=?, tnum=?, dbskip=?, etc=?, in_file=?, reqstartDt=?, exectype=?, 
                resultstat=0, reqnum=?, repnum=? , startDt=null, endDt=null ,msg='',limits=?
                WHERE pkey = ?`;
    return await aqtdb.query(qstr, [   parms.tcode, parms.tdesc, parms.tnum, 
                parms.dbskip, parms.etc, parms.in_file, parms.reqstartDt,
                parms.exectype, parms.reqnum, parms.repnum,parms.limits,
                parms.pkey  ]) ;
  },
  async delete(id) {
    return await aqtdb.query(`delete from texecjob where pkey = ?`, id) ;
  }
}


