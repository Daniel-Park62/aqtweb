const express = require('express');
const router = express.Router();
const trequestDao = require('../dao/trequestDao') ;

router.post('/', async function (req, res, next) {

    trequestDao.insert(req.body.insdata)
      .then(r => res.json({message : `${r.affectedRows} 건 등록되었습니다.`}) )
      .catch(e => { next(new Error(e.message)) });

});


module.exports = router;
