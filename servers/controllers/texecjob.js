const express = require('express');
const router = express.Router();
const texecjobDao = require('../dao/texecjobDao') ;
 
router.get('/:kind', async function(req, res, next) {
  const rows = await texecjobDao.find(req.params.kind) ;
  res.json(rows);
});
router.get('/ing/:kind', function(req, res, next) {
  texecjobDao.ing(req.params.kind)
    .then( rows => res.json(rows) ) 
    .catch((e) =>next(e));
});

router.get('/reqStop/:jobid', function(req, res, next) {
  texecjobDao.reqStop(req.params.jobid)
    .then( rows => res.json(rows) ) 
    .catch((e) =>next(e));
});

router.post('/',async function(req, res, next) {
  const insfunc = req.body.jobkind === 8 ? texecjobDao.insertReal : texecjobDao.insert ;
  insfunc(req.body)
  .then( res.json({message: `${req.body.tdesc} 등록되었습니다.`}) )
  .catch(e => next(e) ) ;           
});

router.put('/',function(req, res, next) {
  const runfunc = req.body.jobkind === 8 ? texecjobDao.reRunReal : texecjobDao.reRun ;
  runfunc(req.body)
  .then(r => res.json({message: `${req.body.tdesc}` + " 수정되었습니다."}) )
  .catch(e => next(e) ) ;           

});

router.delete('/',function(req, res, next) {
  texecjobDao.delete(req.body.pkey) 
  .then(r => res.json({message:'삭제되었습니다.'}))
  .catch(e => next(e)) ;
});

module.exports = router;
