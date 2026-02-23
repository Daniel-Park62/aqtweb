import express from 'express';
const router = express.Router();
import tserviceDao from '../dao/tserviceDao.js';

router.post('/part', function (req, res, next) {
  tserviceDao.list(req.body)
    .then(rows => res.json(rows))
    .catch((e) => next(e) );
});

router.post('/', async function (req, res, next) {
  let msg = {message:''} ;
  try {
    if (req.body.upd.length > 0) {
//      console.log('body.upd:',req.body.upd) ;
      const r = await tserviceDao.update(req.body.upd);
      msg.message += r.affectedRows + " 건 수정되었습니다.\r";
    }

    if (req.body.ins.length > 0) {
      const r = await tserviceDao.insert(req.body.ins);
      msg.message += r.affectedRows + " 건 등록되었습니다.";
    }
    res.json(msg);
  } catch (e) {
    next(e);
  }

});

router.delete('/', function (req, res, next) {
  tserviceDao.delete(req.body.pkeys)
    .then(r => res.status(201).send(r))
    .catch(e => next(e));

});

export default router;
