const router = require('express').Router();
const tconfig = require('../dao/tconfigDao');

router.get('/', async function (req, res, next) {
  try {
    const rdata = await tconfig.findAll();
    // console.log('basic', rdata);
    res.json(rdata);

  } catch (error) {
    next(error);
  }
});

router.put('/',function(req, res, next) {
  tconfig.saveConfig(req.body)
  .then(r => res.status(201).send({message: " 수정되었습니다."}) )
  .catch(e => { next( new Error(e.message) ) } ) ;           

});

router.put('/altercol1',function(req, res, next) {
  tconfig.alterCol1(req.body)
  .then(r => res.status(201).send({message: " 수정되었습니다."}) )
  .catch( e => next(e.message) ) ;           

});
router.put('/altercol2',function(req, res, next) {
  tconfig.alterCol2(req.body)
  .then(r => res.status(201).send({message: " 수정되었습니다."}) )
  .catch(e => { next( new Error(e.message) ) } ) ;           

});

module.exports = router;
