const express = require('express');
const router = express.Router();
const aqtdb = require('../db/dbconn');

router.get('/', function (req, res, next) {
  const cond = req.body.cond ? "where " + req.body.cond : "";
  aqtdb.query({ rowsAsArray: true, sql: "SELECT '' , pkey, usrid, host, usrdesc, admin, apps, regdt FROM taqtuser a " + cond })
    .then(rows => res.json(rows))
    .catch((e) => { return next(e) });
});

router.post('/', async function (req, res, next) {
  
  let msg = { message: 'post:' };
  let qstr = 'UPDATE taqtuser ' +
    ' SET usrid=?, host=?, usrdesc=?, admin=?, apps=? WHERE pkey = ? ' ;
  try {
    if (req.body.upd.length > 0) {
      const r = await aqtdb.batch(qstr, req.body.upd);
      msg.message += r.affectedRows + " 건 수정되었음\r";
    }

    if (req.body.ins.length > 0) {
      qstr = 'INSERT INTO taqtuser ' +
        ' ( usrid, host, usrdesc, admin, apps ) ' +
        "VALUES ( ?, ?, ?, ?,?  ) ";
      const r = await aqtdb.batch(qstr, req.body.ins);
      msg.message += r.affectedRows + " 건 등록되었습니다.";
    }
    res.status(201).send(msg);
  } catch (e) {
    next(new Error(e.message));
  }


});

router.post('/pass', async function (req, res, next) {
  const qstr = 'update set pass1 = passwd(?) where pkey = ? and pass1 = ? ';
  aqtdb.query(qstr, req.body.data)
    .then(r => res.status(201).send(r))
    .catch(e => { next(new Error(e.message)) });
});

router.delete('/', function (req, res, next) {
  const qstr = 'delete from taqtuser where pkey in (?)';
  aqtdb.query(qstr, [req.body.pkeys])
    .then(r => res.status(201).send(r))
    .catch(e => next(new Error(e.message)));

});

module.exports = router;
