const express = require('express');
const router = express.Router();
const tloaddata = require('../db/tloaddata') ;

router.post('/', async function(req, res, next) {
  if (!req.body.psize ) {
    res.send([]);
    return ;
  }
  try {
    const rdata = await tloaddata.find(req.body) ;
    return res.json(rdata) ;
  } catch (e) {
    console.error(e) ;
    next(e) ;
  }
});

router.get('/:id', async function(req, res, next) {
  try {
    const rdata = await tloaddata.findById(req.body.id) ;
    return res.json(rdata) ;
  } catch (e) {
    console.error(e) ;
    next(e) ;
  }
});

router.get('/next/:id', async function(req, res, next) {


});

router.get('/prev/:id', async function(req, res, next) {

  
});

module.exports = router;