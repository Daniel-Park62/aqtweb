import express from 'express';
import tloaddataDao from '../dao/tloaddataDao.js';
const router = express.Router();
router.get('/summary', async function (req, res, next) {
  try {
    const rdata = await tloaddataDao.summary();
    res.json(rdata);
  } catch (err) {
    next(err);
  }
});

router.get('/getcodes', async function (req, res, next) {
  try {
    const rdata = await tloaddataDao.getTcodes();
    res.send(rdata);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/', async function (req, res, next) {
  try {
    const rdata = await tloaddataDao.find(req.body);
    res.send(rdata);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/compareTcnt', async function (req, res, next) {
  try {
    const rdata = await tloaddataDao.compareTcnt(req.body);
    res.send(rdata[0]);
  } catch (err) {
    console.error(err);
    next(err);
  }
});
router.post('/compareData', async function (req, res, next) {
  try {
    const rdata = await tloaddataDao.compareData(req.body);
    res.send(rdata);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/:id', async function (req, res, next) {
  
  try {
    const rdata = await tloaddataDao.findById(req.params.id);
    res.send(rdata);
  } catch (err) {
    console.error(err);
    next(err);
  }
});


export default router;
