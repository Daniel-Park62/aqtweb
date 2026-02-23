import express from 'express';
const router = express.Router();
import trDao from '../dao/trDao.js';

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

export default router;
