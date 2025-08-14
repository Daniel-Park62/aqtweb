const express = require('express');
const router = express.Router();
const tapphostDao = require('../dao/tapphostDao') ;
 
router.get('/', async function(req, res, next) {

    tapphostDao.appList()
    .then( rows => res.json(rows) ) 
    .catch((e) => {  return next(e) });
  
});

router.post('/', async function(req, res, next) {
  tapphostDao.appSave(req.body.values)
  .then(r => { res.json({message: `등록되었습니다.`}) } )
  .catch(e => next(e)) ;           
  
});

router.post('/host', async function(req, res, next) {
  let msg = { message: '' };
  
  try {
    if (req.body.upd.length ) {
//      console.log('body.upd:',req.body.upd) ;
      const r = await tapphostDao.hostUpdate(req.body.upd);
      msg.message += r.affectedRows + " 건 수정되었음\n";
    }

    if (req.body.ins.length ) {
      
      const r = await tapphostDao.hostInsert(req.body.ins);
      msg.message += r.affectedRows + " 건 등록되었습니다.";
    }
    res.json(msg);
  } catch (e) {
    next(new Error(e.message));
  }
  
});

router.get('/host/:appid', async function(req, res, next) {
  tapphostDao.getHost([req.params.appid])
    .then( rows => res.json(rows) ) 
    .catch((e) => next(e) );
});

router.delete('/',async function(req, res, next) {
  tapphostDao.appDelete(req.body.values) 
  .then(r => res.json(r))
  .catch(e => next(new Error(e.message))) ;

});

router.delete('/host',async function(req, res, next) {
  tapphostDao.hostDelete(req.body.values) 
  .then(r => res.json(r))
  .catch(e => next(new Error(e.message))) ;

});

module.exports = router;
