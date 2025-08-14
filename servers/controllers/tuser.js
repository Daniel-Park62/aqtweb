const express = require('express');
const router = express.Router();
const userDao = require('../dao/taqtuserDao');

router.get('/', function (req, res, next) {
  userDao.listAll()
    .then(rows => res.json(rows))
    .catch((e) => next(e) );
});

router.post('/', async function (req, res, next) {
  
  let msg = { message: '' };
  
  try {
    if (req.body.upd.length > 0) {
//      console.log('body.upd:',req.body.upd) ;
      const r = await userDao.update(req.body.upd);
      msg.message += r.affectedRows + " 건 수정되었음\n";
    }

    if (req.body.ins.length > 0) {
      
      const r = await userDao.insert(req.body.ins);
      msg.message += r.affectedRows + " 건 등록되었습니다.";
    }
    res.json(msg);
  } catch (e) {
    next(new Error(e.message));
  }


});

router.delete('/', function (req, res, next) {
  userDao.delete(req.body.pkeys)
    .then(r => res.status(201).send(r))
    .catch(e => next(e));

});

router.post('/logonchk', async function (req, res, next) {
  const parms = {
     reqip : req.ip ,
     pass  : Buffer.from(req.body.pass.substring(2), 'base64').toString('utf8'),
     usrid : Buffer.from(req.body.usrid.substring(1), 'base64').toString('utf8')
  }
  
  res.locals.aqtlog(`${req.ip}: [${parms.usrid}] login.`);

  userDao.passCheck(parms)
    .then(rows => {
      if (rows[0])
        res.json(rows[0])
      else
        return next(new Error({ message: "not found" }))
    })
    .catch((e) => next(e) );
});

router.post('/logonchk/cp', async function (req, res, next) {
  const parms = {
   reqip : req.ip ,
   pass : Buffer.from(req.body.pass.substring(2), 'base64').toString('utf8'),
   npass  : Buffer.from(req.body.npass.substring(2), 'base64').toString('utf8'),
   usrid : Buffer.from(req.body.usrid.substring(1), 'base64').toString('utf8')
  }
  userDao.passUpdate(parms)
    .then(rows => {
      if (rows?.affectedRows)
        res.status(201).send({message:'변경되었습니다.'});
      else
        res.status(201).send(rows) ;
    })
    .catch((e) => next(e) );
  
}) ;

module.exports = router;
