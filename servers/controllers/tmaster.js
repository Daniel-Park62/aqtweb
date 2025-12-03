const express = require('express');
const router = express.Router();
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
      res.status(201).send(r);
    })
    .catch( e => {
      next(e);
    }) 
    ;           

});

router.post('/',async function(req, res, next) {

  const parms = {
    code: req.body.code,
    appid: req.body.appid,
    lvl: req.body.lvl,
    desc1: req.body.desc1,
    cmpCode: req.body.cmpCode,
    tdate: req.body.tdate,
    endDate: req.body.endDate,
    tdir: req.body.tdir,
    tuser: req.body.tuser,
    thost: req.body.thost,
    tport: req.body.tport,
    tenv: req.body.tenv,
    pro: req.body.pro
   } ;
  tmasterDao.insertMaster(parms)
  .then(r => res.status(201).send({message: `${req.body.code}` + " 등록되었습니다."}) )
  .catch(e => next( e ) ) ;           

});

router.put('/',function(req, res, next) {
  const parms = {
    code: req.body.code,
    appid: req.body.appid,
    lvl: req.body.lvl,
    desc1: req.body.desc1,
    cmpCode: req.body.cmpCode,
    tdate: req.body.tdate,
    endDate: req.body.endDate,
    tdir: req.body.tdir,
    tuser: req.body.tuser,
    thost: req.body.thost,
    tport: req.body.tport,
    tenv: req.body.tenv,
    pro: req.body.pro
   } ;
  tmasterDao.updateMaster(parms)
  .then(r => res.status(201).send({message: `${req.body.code}` + " 수정되었습니다."}) )
  .catch(e =>  next( e )  ) ;           

});

router.delete('/',function(req, res, next) {
  const parms = { list: req.body.codes} ;

  tmasterDao.deleteMaster(parms)
  .then(r => res.status(201).send(r))
  .catch(e => next(e)) ;

});
router.put('/erasetr',function(req, res, next) {
  const parms = { list: req.body.codes} ;

  tmasterDao.eraseTr(parms)
  .then(r => res.status(201).send(r))
  .catch(e => next(e)) ;

});

module.exports = router;
