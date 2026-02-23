import aqtdb from '../db/dbconn.js' ;
 
export default {
  find : async (kind) => {
      const rows = await aqtdb.query(`	SELECT a.pkey, ppkey, jobkind, tcode, tdesc, tnum, dbskip, etc, in_file, limits,  tuser, tdir, tenv, 
                thost, tport,  reqstartDt reqstartDt2, left(date_format(reqstartDt,'%Y-%m-%dT%T'),16) reqstartDt,
                exectype, resultstat, reqnum, repnum,  startDt, endDt, msg , ifnull(b.tcnt,0) tcnt,ifnull(b.ccnt,0) ccnt,ifnull(b.ecnt,0) ecnt ,
                timediff(ifnull(endDt,now()),startdt) elapsed, jdata
           FROM texecjob a left join texecing b on(a.pkey = b.pkey) 
           WHERE a.jobkind = ?
           order by resultstat , startdt desc `,[kind]) ;
      if (kind === 9 ) return rows ;
      const nrows = [];
      for await (const r of rows ) { 
        const {jdata, ...nr} = r ;
        nrows.push({...nr,...jdata}) ;
      }
      return nrows ;
  },
  ing : async (kind) => {
      return await aqtdb.query(` select a.pkey, startDt,endDt, timediff(ifnull(endDt,now()),startdt) elapsed,
            ifnull(b.tcnt,0) tcnt,ifnull(b.ccnt,0) ccnt,b.qcnt , a.resultstat
        FROM texecjob a join texecing b on(a.pkey = b.pkey)  
        where a.jobkind = ?`,[kind]);

  },
  insert: async (parms) => {
    const qstr = `INSERT INTO texecjob 
	              (jobkind, tcode, tdesc, tnum, dbskip, etc, in_file, reqstartDt, exectype, 
                 reqnum, repnum,thost,tport,limits,ppkey,resultstat ) 
               VALUES (?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,? ,?) ` ;
    return await aqtdb.query(qstr, [ parms.jobkind, parms.tcode, parms.tdesc, parms.tnum, 
                                  parms.dbskip, parms.etc, parms.in_file, parms.reqstartDt,
                                  parms.exectype, parms.reqnum, parms.repnum,parms.thost, parms.tport, parms.limits,
                                  parms.ppkey,parms.resultstat]);
  },
  insertReal: async (parms) => {
    const {aqttype, ctype, ptype, dstf, immd, dstip, dstport, otherCond, otherOpt, norcv  } = parms ;
    const jdata = { aqttype, ctype, ptype, dstf, immd, dstip, dstport, otherCond, otherOpt, norcv } ;
    const qstr = `INSERT INTO texecjob 
	              (jobkind, tcode, tdesc, tnum, dbskip, etc, in_file, reqstartDt, exectype, 
                 reqnum, repnum,thost,tport,limits,ppkey,resultstat , jdata) 
               VALUES (?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,? ,?,?) ` ;
    return await aqtdb.query(qstr, [ parms.jobkind, parms.tcode, parms.tdesc, parms.tnum, 
                                  parms.dbskip, parms.etc, parms.in_file, parms.reqstartDt,
                                  parms.exectype, parms.reqnum, parms.repnum,parms.thost, parms.tport, parms.limits,
                                  parms.ppkey,parms.resultstat, JSON.stringify(jdata)]);
  },
  async reqStop(jobid){
    // console.log("texecjobDao.reqStop:",jobid);
    return await aqtdb.query("UPDATE texecing SET reqkill='1' where pkey = ?",[jobid]) ;
  },
  async reRun (parms)  {

    const qstr = `UPDATE texecjob SET 
	              tcode=?, tdesc=?, jobkind=?, tnum=?, dbskip=?, etc=?, in_file=?, reqstartDt=if(? < now(),now(),?), exectype=?, 
                resultstat=?, reqnum=?, repnum=? , startDt=null, endDt=null ,msg='',thost=?,tport=?,limits=?,ppkey=?
                WHERE pkey = ?`;
    return await aqtdb.query(qstr, [   parms.tcode, parms.tdesc,parms.jobkind, parms.tnum, 
                parms.dbskip, parms.etc, parms.in_file, parms.reqstartDt,parms.reqstartDt,
                parms.exectype, parms.resultstat, parms.reqnum, parms.repnum,parms.thost, parms.tport,parms.limits,parms.ppkey,
                parms.pkey  ]) ;
  },
  async reRunReal (parms)  {
    const {aqttype, ctype, ptype, dstf, immd, dstip, dstport, otherCond, otherOpt, norcv } = parms ;
    const jdata = { aqttype, ctype, ptype, dstf, immd, dstip, dstport, otherCond, otherOpt, norcv } ;
    
    const qstr = `UPDATE texecjob SET 
	              tcode=?, tdesc=?, jobkind=?, tnum=?, dbskip=?, etc=?, in_file=?, reqstartDt=if(? < now(),now(),?), exectype=?, 
                resultstat=?, reqnum=?, repnum=? , startDt=null, endDt=null ,msg='',thost=?,tport=?,limits=?,jdata=?
                WHERE pkey = ?`;
    return await aqtdb.query(qstr, [   parms.tcode, parms.tdesc,parms.jobkind, parms.tnum, 
                parms.dbskip, parms.etc, parms.in_file, parms.reqstartDt,parms.reqstartDt,
                parms.exectype, parms.resultstat, parms.reqnum, parms.repnum,parms.thost, parms.tport,
                parms.limits,JSON.stringify(jdata),    parms.pkey  ]) ;
  },
  async delete(id) {
    return await aqtdb.query(`delete from texecjob where pkey = ?`, id) ;
  }
}


