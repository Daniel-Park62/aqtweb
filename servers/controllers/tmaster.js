const express = require('express');
const router = express.Router();
const aqtdb = require('../db/dbconn') ;
 
router.get('/tsellist/:uid', function(req, res, next) {
  let usrid = req.params.uid || '';

  aqtdb.query("	SELECT code, desc1 name, cmpcode,enddate  from tmaster m join \
             (select apps from taqtuser where usrid = ?) u where m.appid rlike u.apps",[usrid])
    .then( rows => res.json(rows) ) 
    .catch((e) => {  next(e) });
  
});

router.get('/', function(req, res, next) {
  const cond = req.body?.cond ? "where " + req.body.cond : "";
  aqtdb.query("	SELECT a.*, a.desc1 name, 0 as chk from tmaster a " + cond)
    .then( rows => res.json(rows) ) 
    .catch((e) => { next(e) });
});

router.post('/copyTr', function(req, res, next) {
  let parms = [
    req.body.srccode,
    req.body.dstcode,
    (req.body.uri > '' ? "uri rlike '" + req.body.uri + "' and "  : '')  + req.body.cond,
    req.body.cnt
  ] ;
  // console.log(parms) ;
  const qstr = req.body.cnt > 0 ? 'call sp_loaddata2(?,?,?,?) ' : 'call sp_loaddata(?,?,?) ';
  aqtdb.query(qstr, parms) 
    .then(r => {
      // console.log("ok:",r[0]) ;
      res.status(201).send(r[0] );
      aqtdb.query('call sp_summary(?)',[req.body.dstcode]) ;
    })
    .catch( e => {
      next(e);
    }) 
    ;           

});

router.post('/',async function(req, res, next) {
  const row = await aqtdb.query("	SELECT count(1) cnt from tmaster where code = ?",[req.body.code]) ;
  if (row[0].cnt > 0 ) {
    next(new Error(`이미 존재하는 코드입니다(${req.body.code})`)) ;
    return ;
  }
  let parms = [
    req.body.code,
    req.body.appid,
    req.body.lvl,
    req.body.desc1,
    req.body.cmpCode,
    req.body.tdate,
    req.body.endDate,
    req.body.tdir,
    req.body.tuser,
    req.body.thost,
    req.body.tport,
    req.body.tenv,
    req.body.pro
  ] ;
  const qstr = 'INSERT INTO tmaster ' +
	             ' (code, appid, lvl, desc1, cmpCode, tdate, endDate, tdir, tuser, thost, tport, tenv,pro) ' +
               'VALUES (?, ?, ?, ?, ?,?,?,?, ?,?,?,? ,?) ; commit ;' ;
  aqtdb.query(qstr, parms)
  .then(r => res.status(201).send({message: `${req.body.code}` + " 등록되었습니다."}) )
  .catch(e => { next( e ) } ) ;           

});

router.put('/',function(req, res, next) {
  let parms = [
    req.body.appid,
    req.body.lvl,
    req.body.desc1,
    req.body.cmpCode,
    req.body.tdate,
    req.body.endDate,
    req.body.tdir,
    req.body.tuser,
    req.body.thost,
    req.body.tport,
    req.body.tenv,
    req.body.pro,
    req.body.code
  ] ;
  const qstr = 'UPDATE tmaster SET ' +
	             ' `appid`=?, lvl=?, desc1=?, cmpCode=?, tdate=?, endDate=?, tdir=?, tuser=?, thost=?, tport=?, tenv=?,pro=? ' +
               ' WHERE CODE = ? ; commit;';
  aqtdb.query(qstr, parms)
  .then(r => res.status(201).send({message: `${req.body.code}` + " 수정되었습니다."}) )
  .catch(e =>  next( e )  ) ;           

});

router.delete('/',function(req, res, next) {
  const codes = "('" + req.body.codes.join("', '") + "')" ;
  // console.log(codes) ;
  const qstr = 'delete from tmaster where code in (?)' ; // + codes;
  aqtdb.query(qstr, [req.body.codes]) 
  .then(r => res.status(201).send(r))
  .catch(e => next(e)) ;

});
router.put('/erasetr',function(req, res, next) {
  const codes = "('" + req.body.codes.join("', '") + "')" ;

  const qstr = 'delete from ttcppacket where tcode in (?)' 
  aqtdb.query(qstr, [req.body.codes])
  .then(r => res.status(201).send(r))
  .catch(e => next(e)) ;

});

module.exports = router;
