const express = require('express');
const router = express.Router();
const trDao = require('../dao/trDao') ;

router.post('/', async function(req, res, next) {

  await trDao.findToFile(req.body)
  .then( f => {
        console.log('result',f) ;
        res.download(f) ;
      })
  .catch(e => next(e)) ;

});

module.exports = router;