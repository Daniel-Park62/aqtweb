import express from 'express';
const router = express.Router();
import trDao from '../dao/trDao.js';

router.get('/', async function (req, res, next) {

  trDao.tasksum()
    .then(rows => res.json(rows))
    .catch((e) => next(e));
});

router.post('/', async function(req, res, next) {
  
  // const parms = { 
  //   task : req.body.task ,
  //   lvl : req.body.lvl
  // }
  const parms = req.body ;
  trDao.sumByService(parms)
    .then( rows => res.json(rows) ) 
    .catch((e) => next(e) );

});

export default router;
