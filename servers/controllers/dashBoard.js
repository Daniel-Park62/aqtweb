const express = require('express');
const router = express.Router();
const trDao = require('../dao/trDao');

router.get('/list/:appid', function (req, res, next) {

  const pappid = req.params.appid || '.*' ;
  trDao.listVtrx({appid: pappid})
    .then(rows => res.json(rows) )
    .catch((e) => {  return next(e) }) ;
  
});

router.get('/summary', async function (req, res, next) {
  trDao.summary()
    .then(rows => res.json(rows) )
    .catch((e) => {  return next(e) }) ;
  });

module.exports = router;
