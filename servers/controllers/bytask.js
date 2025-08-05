const express = require('express');
const router = express.Router();
const trDao = require('../dao/trDao');

router.get('/', async function (req, res, next) {

  trDao.tasksum()
    .then(rows => res.json(rows))
    .catch((e) => next(e));

});

router.get('/:task/:lvl', async function(req, res, next) {
  
  const parms = { 
    task : req.params.task == 'EMPTY' ? '':req.params.task ,
    lvl : req.params.lvl
  }
  trDao.sumByService(parms)
    .then( rows => res.json(rows) ) 
    .catch((e) => next(e) );

});

router.post('/', async function(req, res, next) {
  
  const parms = { 
    task : req.body.task ,
    lvl : req.body.lvl
  }
  trDao.sumByService(parms)
    .then( rows => res.json(rows) ) 
    .catch((e) => next(e) );

});

module.exports = router;
