const express = require('express');
const router = express.Router();
const tmocksvrDao = require('../dao/tmocksvrDao');

router.get('/', function (req, res, next) {
  tmocksvrDao.list()
    .then(rows => res.json(rows))
    .catch((e) => next(e) );
});

router.post('/', async function (req, res, next) {
  let msg = {message:''} ;
  try {
    if (req.body.upd.length > 0) {
      const r = await tmocksvrDao.update(req.body.upd);
      msg.message += r.affectedRows + " 건 수정되었습니다.\r";
    }

    if (req.body.ins.length > 0) {
      const r = await tmocksvrDao.insert(req.body.ins);
      msg.message += r.affectedRows + " 건 등록되었습니다.";
    }
    res.json(msg);
  } catch (e) {
    next(e);
  }

});

router.delete('/', function (req, res, next) {
  tmocksvrDao.delete(req.body.pkeys)
    .then(r => res.status(201).send(r))
    .catch(e => next(e));

});

module.exports = router;
