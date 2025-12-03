const express = require('express');
const router = express.Router();
const texecjobDao = require('../dao/texecjobDao') ;
 
router.get('/', function(req, res, next) {
//  const cond = req.body?.cond ? "where " + req.body.cond : "";
  texecjobDao.find()
    .then( rows => res.json(rows) ) 
    .catch((e) =>next(e));
});
router.get('/ing', function(req, res, next) {
  texecjobDao.ing()
    .then( rows => res.json(rows) ) 
    .catch((e) =>next(e));
});

router.post('/',async function(req, res, next) {

  texecjobDao.insert(req.body)
  .then( res.json({message: `${req.body.tdesc} 등록되었습니다.`}) )
  .catch(e => next(e) ) ;           
});

router.put('/',function(req, res, next) {
  texecjobDao.reRun(req.body)
  .then(r => res.json({message: `${req.body.tdesc}` + " 수정되었습니다."}) )
  .catch(e => next(e) ) ;           

});

router.delete('/',function(req, res, next) {
  texecjobDao.delete(req.body.pkey) 
  .then(r => res.json({message:'삭제되었습니다.'}))
  .catch(e => next(e)) ;
});

module.exports = router;
