const router = require('express').Router();
const tloaddata = require('../dao/tloaddata');

router.get('/summary', async function (req, res, next) {
  try {
    const rdata = await tloaddata.summary();
    
    res.json(rdata);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/getcodes', async function (req, res, next) {
  try {
    const rdata = await tloaddata.getTcodes();
    res.send(rdata);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/', async function (req, res, next) {
  try {
    const rdata = await tloaddata.find(req.body);
    res.send(rdata);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/compareTcnt', async function (req, res, next) {
  try {
    const rdata = await tloaddata.compareTcnt(req.body);
    res.send(rdata[0]);
  } catch (err) {
    console.error(err);
    next(err);
  }
});
router.post('/compareData', async function (req, res, next) {
  try {
    const rdata = await tloaddata.compareData(req.body);
    res.send(rdata);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/:id', async function (req, res, next) {
  
  try {
    const rdata = await tloaddata.findById(req.params.id);
    res.send(rdata);
  } catch (err) {
    console.error(err);
    next(err);
  }
});


module.exports = router;
