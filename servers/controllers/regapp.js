const express = require('express');
const router = express.Router();
const aqtdb = require('../db/dbconn') ;
const tapphostDao = require('../dao/tapphostDao') ;
 
router.get('/', async function(req, res, next) {

    tapphostDao.appList()
    .then( rows => res.json(rows) ) 
    .catch((e) => {  return next(e) });
  
});

router.post('/', async function(req, res, next) {
  tapphostDao.appUpdate(req.body.values)
  .then(r => res.json({message: `${r.affectedRows} 건 등록되었습니다.`}) )
  .catch(e => next(e)) ;           
  
});

router.post('/host', async function(req, res, next) {
  const qstr = 'REPLACE INTO tapphosts ' +
	             ' (pkey, appid,thost,tport) ' +
               'VALUES (?, ?, ?, ?) ' ;
  await aqtdb.batch(qstr, req.body.values ) 
  .then(r => res.status(201).send({message: " 수정 되었습니다."}) )
  .catch(e => { next( new Error(e.message) ) } ) ;           
  
});

router.get('/host/:appid', async function(req, res, next) {
  aqtdb.query({ rowsAsArray: true , sql: "select pkey, appid,thost,tport from tapphosts where appid = ? "
    },[req.params.appid ])
    .then( rows => res.json(rows) ) 
    .catch((e) => { next(e) });
  
});

router.delete('/',async function(req, res, next) {
  // console.log("delete",req.body.values) ;
  await aqtdb.query('delete from tapphosts where appid in (?)', [req.body.values]) ;
  const qstr = 'delete from tapplication where appid in (?)' ; 
  aqtdb.query(qstr, [req.body.values]) 
  .then(r => res.status(201).send(r))
  .catch(e => next(new Error(e.message))) ;

});

router.delete('/host',async function(req, res, next) {
  // console.log("delete",req.body.values) ;
  await aqtdb.query('delete from tapphosts where pkey in (?)', [req.body.values]) 
  .then(r => res.status(201).send(r))
  .catch(e => next(new Error(e.message))) ;

});

module.exports = router;
