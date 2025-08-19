const router = require('express').Router();
const tconfig = require('../dao/tconfigDao');

router.get('/', async function (req, res, next) {
  try {
    const rdata = await tconfig.findAll();
    let rows = { ...rdata[0][0], ...rdata[1][0], ...rdata[2][0] } ;
    // console.log(rows);
    res.json(rows);

  } catch (error) {
    next(error);
  }
});

router.put('/',function(req, res, next) {
  tconfig.saveConfig(req.body)
  .then( res.json({message: " 수정되었습니다."}) )
  .catch(e => next(e) ) ;           

});

router.put('/altercol1',function(req, res, next) {
  tconfig.alterCol1(req.body)
  .then( res.json({message: "칼럼1 수정되었습니다."}) )
  .catch(e => next(e) ) ;           

});
router.put('/altercol2',function(req, res, next) {
  tconfig.alterCol2(req.body)
  .then( res.json({message: "칼럼2 수정되었습니다."}) )
  .catch(e => next(e) ) ;           

});

module.exports = router;
