const express = require('express');
const router = express.Router();
const aqtdb = require('../db/dbconn');

router.post('/part', function (req, res, next) {
  aqtdb.query({ rowsAsArray: true, 
                sql: "SELECT '' , pkey, appid, svcid,  svckor, svceng, task, manager, svckind FROM tservice a \
                      where appid rlike ? and svcid rlike ?" },[req.body.apid, req.body.svcid])
    .then(rows => res.json(rows))
    .catch((e) => { return next(e) });
});

router.post('/', async function (req, res, next) {
  let msg = {message:''} ;
  let qstr = 'REPLACE INTO tservice ' +
    ' (pkey, appid, svcid,  svckor, svceng, task, manager, svckind) ' +
    'VALUES (?, ?, ?, ?, ?,?,?,? ) ';
  if (req.body.upd.length > 0) {
    aqtdb.batch(qstr, req.body.upd)
      .then(r => msg.message = r.affectedRows + " 건 수정되었음\r")
      .catch(e => { next(new Error(e.message)) });
  }
  if (req.body.ins.length > 0) {
    qstr = 'INSERT INTO tservice ' +
      ' ( appid, svcid,  svckor, svceng, task, manager, svckind) ' +
      'VALUES ( ?, ?, ?, ?,?,?,? ) ';
    aqtdb.batch(qstr, req.body.ins)
      .then(r => {msg.message += r.affectedRows + " 건 등록되었습니다." ; res.status(201).send(msg)})
      .catch(e => { next(new Error(e.message)) });
  } else {
    res.status(201).send(msg);
  }

});

router.delete('/', function (req, res, next) {
  const pkeys = "(" + req.body.pkeys.join(",") + ")";
  // console.log(pkeys);
  const qstr = 'delete from tservice where pkey in (?)';
  aqtdb.query(qstr, [req.body.pkeys])
    .then(r => res.status(201).send(r))
    .catch(e => next(new Error(e.message)));

});

module.exports = router;
