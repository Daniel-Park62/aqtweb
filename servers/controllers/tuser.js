const express = require('express');
const router = express.Router();
const aqtdb = require('../db/dbconn');
const userDao = require('../dao/taqtuserDao');

router.get('/', function (req, res, next) {
  userDao.listAll()
    .then(rows => res.json(rows))
    .catch((e) => next(e) );
});

router.post('/', async function (req, res, next) {
  
  let msg = { message: 'post:' };
  
  try {
    if (req.body.upd.length > 0) {
//      console.log('body.upd:',req.body.upd) ;
      const r = await userDao.update(req.body.upd);
      msg.message += r.affectedRows + " 건 수정되었음\r";
    }

    if (req.body.ins.length > 0) {
      
      const r = await userDao.insert(req.body.ins);
      msg.message += r.affectedRows + " 건 등록되었습니다.";
    }
    res.status(201).send(msg);
  } catch (e) {
    next(new Error(e.message));
  }


});

router.delete('/', function (req, res, next) {
  userDao.delete(req.body.pkeys)
    .then(r => res.status(201).send(r))
    .catch(e => next(e));

});

module.exports = router;
