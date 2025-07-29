const express = require('express');
const router = express.Router();
const aqtdb = require('../db/dbconn') ;
// BigInt.prototype.toJSON = function() { return this.toString(); }

router.get('/list/:appid', function (req, res, next) {

  const pappid = req.params.appid || '.*' ;
  aqtdb.query({ dateStrings: true, sql: 'select * from vtrxlist where appid rlike ? order by tdate desc' },[pappid])
    .then(rows => res.json(rows) )
    .catch((e) => {  return next(e) }) ;
  
});

router.get('/summary', async function (req, res, next) {

  const result = {
    svccnt: 0, // 서비스 수
    rows: []
  } ;

  try {
    result.rows = await aqtdb.query({ dateStrings: true, 
                sql: 'select lvl, svc_cnt,data_cnt,scnt, if(data_cnt>0,round(scnt*100/data_cnt,2),0) srate from tlevel ' }) ;
    let row = await aqtdb.query('select count(1) as scnt from tservice') ;
    result.svccnt =  row[0].scnt || 0 ;

    res.json(result) ;
  } catch (e){
    console.error("summary:",e);
    return next(e) ;
  } ;
  
});

router.get('/testPassword', function (req, res, next) {
  aqtdb.query({ dateStrings: true, sql: 'select pass1 from tconfig' })
    .then(rows => res.json(rows) )
    .catch((e) => {  return next(e) }) ;
    
  
});

module.exports = router;
