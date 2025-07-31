const express = require('express');
const router = express.Router();
const aqtdb = require('../db/dbconn') ;

const tmasterDao = require('../dao/tmasterDao') ;
// uid 별 접근가능 app 에 해당하는 tmaster list 
router.get('/tsellist/:uid', function(req, res, next) {
  let usrid = req.params.uid || '';
  tmasterDao.listByUid(usrid)
    .then( rows => res.json(rows) ) 
    .catch((e) => {  next(e) });

});
// tmaster 전체 목록
router.get('/', function(req, res, next) {
  // const cond = req.body?.cond ? "where " + req.body.cond : "";
  tmasterDao.listAll()
    .then( rows => res.json(rows) ) 
    .catch((e) => { next(e) });
});
// 테스트데이터 원본 -> 작업영역 복제 (tloaddata -> ttcppacket)
router.post('/copyTr', function(req, res, next) {
  let parms = {
    srccode : req.body.srccode,
    dstcode : req.body.dstcode,
    cond : (req.body.uri > '' ? "uri rlike '" + req.body.uri + "' and "  : '')  + req.body.cond,
    cnt : req.body.cnt
  };
  // console.log(parms) ;
  tmasterDao.copyTr(parms)
    .then( r => {
      console.log("h:",r)
      res.status(201).send(r);
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
