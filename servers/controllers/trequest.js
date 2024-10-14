const express = require('express');
const router = express.Router();
const aqtdb = require('../db/dbconn');

router.post('/', async function (req, res, next) {
  // console.log(req.body) ;
  let msg = {message:''} ;
  let qstr =  'INSERT INTO trequest ' +
      ' ( pkey, cmpid,  tcode, requser) ' +
      'VALUES ( ?, ?, ?, ? ) ';
    aqtdb.batch(qstr, req.body.insdata)
      .then(r => {msg.message += r.affectedRows + " 건 등록되었습니다." ; res.status(201).send(msg)})
      .catch(e => { next(new Error(e.message)) });

});


module.exports = router;
