import express from 'express';
const router = express.Router();
import taqtprogDao from '../dao/taqtprogDao.js';
import texecprogDao from '../dao/texecprogDao.js' ;

router.get('/', function (req, res, next) {
  taqtprogDao.list()
    .then(rows => res.json(rows))
    .catch((e) => next(e) );
});

router.get('/exec/:jobid', function (req, res, next) {
  texecprogDao.list(req.params.jobid)
    .then(rows => res.json(rows))
    .catch((e) => next(e) );
});

router.post('/', async function (req, res, next) {
  let msg = {message:''} ;
  try {
    if (req.body.upd.length > 0) {
      const r = await taqtprogDao.update(req.body.upd);
      msg.message += r.affectedRows + " 건 수정되었습니다.\r";
    }

    if (req.body.ins.length > 0) {
      const r = await taqtprogDao.insert(req.body.ins);
      msg.message += r.affectedRows + " 건 등록되었습니다.";
    }
    res.json(msg);
  } catch (e) {
    next(e);
  }

});

router.post('/exec', async function (req, res, next) {
  let msg = {message:'수정 되었습니다.'} ;
  try {
    if (req.body.pkey) {
      await texecprogDao.delete(req.body.pkey) ;
    }

    if (req.body.ins.length > 0) {
      const r = await texecprogDao.update(req.body.ins);
      msg.message += r.affectedRows + " 건 등록되었습니다.";
    }
    res.json(msg);
  } catch (e) {
    next(e);
  }

});

router.delete('/', async function (req, res, next) {
  try {
    await texecprogDao.deleteByProg(req.body.prognos);
    const r = await taqtprogDao.delete(req.body.prognos);
    res.status(201).send(r);
  } catch (e) {
    next(e);
  }

});

export default router;
