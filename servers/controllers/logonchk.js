const express = require('express');
const router = express.Router();
const aqtdb = require('../db/dbconn');

async function getUser(uid, pass, ip) {
  // console.log(uid, pass, ip);
  const rows = await aqtdb.query({ sql: "select if( PASSWORD(?) = pass1, 1,0) c1, if(? like host,1,0) c2 FROM taqtuser where usrid = ? " }
    , [pass, ip, uid]);
  // .then(rows => {
  // console.log(rows[0]);
  if (rows[0]) {
    if (rows[0].c1 && rows[0].c2) return 1;
    if (rows[0].c1) return 2;
    if (rows[0].c2) return 3; else return 4;
  } else
    return 0;
  // })
  // .catch((e) => { return -1 });
}
router.get('/', async function (req, res, next) {
  if (!req.query.pass) {
    res.send([]);
    return;
  }
  aqtdb.query({ dateStrings: true, sql: "select if( PASSWORD(?) = pass1, 1,0) chk FROM tconfig " }, [req.query.pass])
    .then(rows => res.json(rows[0]))
    .catch((e) => { return next(e) });
});

router.post('/', async function (req, res, next) {
  // console.log(req.ip) ;
  const pass = Buffer.from(req.body.pass.substring(2), 'base64').toString('utf8');
  const usrid = Buffer.from(req.body.usrid.substring(1), 'base64').toString('utf8');
  // console.log(req.body, usrid, pass) ;

  aqtdb.query({ sql: "select if( PASSWORD(?) = pass1, 1,0) chk, admin, if(? like host,1,0) hg, apps FROM taqtuser where usrid = ? " }, [pass, req.ip, usrid])
    .then(rows => {
      if (rows[0])
        res.json(rows[0])
      else
        return next(new Error({ message: "not found" }))
    })
    .catch((e) => { return next(e) });
});

router.post('/cp', async function (req, res, next) {

  const opass = Buffer.from(req.body.opass.substring(2), 'base64').toString('utf8');
  const pass = Buffer.from(req.body.pass.substring(2), 'base64').toString('utf8');
  const usrid = Buffer.from(req.body.usrid.substring(1), 'base64').toString('utf8');
  const r = await getUser(usrid, opass, req.ip);
  // console.log("aa:", r);
  if (r !== 1) return res.status(200).send({ message: "권한이 없습니다.", err: 1 });

  aqtdb.query({ sql: "update taqtuser set pass1 =  PASSWORD(?)  where usrid = ? " }, [pass, usrid])
    .then(r => res.status(200).send({ message: `${usrid}` + " 변경 되었습니다." }))
    .catch(e => { next(new Error(e.message)) });
});

module.exports = router;
