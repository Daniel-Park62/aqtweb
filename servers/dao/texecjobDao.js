const aqtdb = require('../db/dbconn') ;
 
module.exports = {
  find : async () => {
      return await aqtdb.query(`	SELECT a.pkey, ppkey, jobkind, tcode, tdesc, tnum, dbskip, etc, in_file, limits,  tuser, tdir, tenv, 
                thost, tport,  reqstartDt reqstartDt2, left(date_format(reqstartDt,'%Y-%m-%dT%T'),16) reqstartDt,
                exectype, resultstat, reqnum, repnum,  startDt, endDt, msg , b.tcnt,b.ccnt,b.ecnt , 
                (select jdata from texecjson where pkey = a.pkey) jdata
           FROM texecjob a left join texecing b on(a.pkey = b.pkey)  
           order by if(resultstat=3,1.5,resultstat) , startdt desc `) ;
  },
  ing : async () => {
      return await aqtdb.query(` select a.pkey, b.tcnt,b.ccnt,b.qcnt 
        FROM texecjob a left join texecing b on(a.pkey = b.pkey)
        where resultstat = 1
        `);

  },
  insert: async (parms) => {
    const qstr = `INSERT INTO texecjob 
	              (jobkind, tcode, tdesc, tnum, dbskip, etc, in_file, reqstartDt, exectype, reqnum, repnum,thost,tport,limits,ppkey) 
               VALUES (?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,? ) ` ;
    return await aqtdb.query(qstr, [ parms.jobkind, parms.tcode, parms.tdesc, parms.tnum, 
                                  parms.dbskip, parms.etc, parms.in_file, parms.reqstartDt,
                                  parms.exectype, parms.reqnum, parms.repnum,parms.thost, parms.tport, parms.limits,parms.ppkey]);
  },
  async reqStop(jobid){
    // console.log("texecjobDao.reqStop:",jobid);
    return await aqtdb.query("UPDATE texecing SET reqkill='1' where pkey = ?",[jobid]) ;
  },
  async reRun (parms)  {
    const qstr = `UPDATE texecjob SET 
	              tcode=?, tdesc=?, tnum=?, dbskip=?, etc=?, in_file=?, reqstartDt=if(? < now(),now(),?), exectype=?, 
                resultstat=0, reqnum=?, repnum=? , startDt=null, endDt=null ,msg='',thost=?,tport=?,limits=?,ppkey=?
                WHERE pkey = ?`;
    return await aqtdb.query(qstr, [   parms.tcode, parms.tdesc, parms.tnum, 
                parms.dbskip, parms.etc, parms.in_file, parms.reqstartDt,parms.reqstartDt,
                parms.exectype, parms.reqnum, parms.repnum,parms.thost, parms.tport,parms.limits,parms.ppkey,
                parms.pkey  ]) ;
  },
  async delete(id) {
    return await aqtdb.query(`delete from texecjob where pkey = ?`, id) ;
  }
}


