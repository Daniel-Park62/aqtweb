const express = require('express');
const router = express.Router();
const aqtdb = require('../db/dbconn') ;
 
router.get('/', function(req, res, next) {
  const cond = req.body?.cond ? "where " + req.body.cond : "";
  aqtdb.query("	SELECT a.pkey, jobkind, tcode, tdesc, tnum, dbskip, etc, in_file, limits, outlogdir, tuser, tdir, tenv, thost, tport, reqstartDt, exectype, resultstat, reqnum, repnum,  startDt, endDt, msg , b.tcnt,b.ccnt,b.ecnt " 
          + " from texecjob a left join texecing b on(a.pkey = b.pkey) " 
          + cond + " order by if(resultstat=3,1.5,resultstat) , startdt desc")
    .then( rows => res.json(rows) ) 
    .catch((e) => { return next(e) });
});

router.post('/',async function(req, res, next) {

  const qstr = 'INSERT INTO texecjob ' +
	             ' (jobkind, tcode, tdesc, tnum, dbskip, etc, in_file, reqstartDt, exectype, resultstat, reqnum, repnum,limits) ' +
               'VALUES (?, ?, ?, ?, ?,?,?,?, ?,?,?,?,? ) ' ;
  aqtdb.query(qstr, [
    req.body.jobkind, req.body.tcode, req.body.tdesc, req.body.tnum, 
    req.body.dbskip, req.body.etc, req.body.in_file, req.body.reqstartDt,
    req.body.exectype, req.body.resultstat, req.body.reqnum, req.body.repnum,req.body.limits
  ])
  .then(r => res.status(201).send({message: " 등록되었습니다."}) )
  .catch(e => { next( new Error(e.message) ) } ) ;           

});

router.put('/',function(req, res, next) {
  const qstr = `UPDATE texecjob SET 
	              tcode=?, tdesc=?, tnum=?, dbskip=?, etc=?, in_file=?, reqstartDt=?, exectype=?, 
                resultstat=?, reqnum=?, repnum=? , startDt=null, endDt=null ,msg='',limits=?
                WHERE pkey = ?`;
  aqtdb.query(qstr, [
    req.body.tcode, req.body.tdesc, req.body.tnum, 
    req.body.dbskip, req.body.etc, req.body.in_file, req.body.reqstartDt,
    req.body.exectype, req.body.resultstat, req.body.reqnum, req.body.repnum,req.body.limits,
    req.body.pkey
  ])
  .then(r => res.status(201).send({message: `${req.body.tcode}` + " 수정되었습니다."}) )
  .catch(e => { next( new Error(e.message) ) } ) ;           

});

router.delete('/',function(req, res, next) {

  const qstr = 'delete from texecjob where pkey = ?' ; 
  aqtdb.query(qstr, [req.body.pkey]) 
  .then(r => res.status(201).send(r))
  .catch(e => next(new Error(e.message))) ;

});

module.exports = router;
