import express from 'express';
const router = express.Router();
import tconfigDao from '../dao/tconfigDao.js' ;
import tcppacketDao from '../dao/tcppacketDao.js' ;
import tloaddataDao from '../dao/tloaddataDao.js' ;

let senc = '';
let col1 = false ;
let col2 = false ;
const configCol = {} ;
tconfigDao.findAll()
.then( r => {
    if (r[0][0].encval == 'MS949' || r[0][0].encval.encval == 'EUCKR') senc = ' character set euckr';
    if (r[0][0].col1) { col1 = true; configCol.col1 = r[0][0].col1 }
    if (r[0][0].col2) { col2 = true; configCol.col2 = r[0][0].col2 }
})
.catch(e => console.log );

router.get('/config', async function (req, res, next) {
    res.json(configCol) ;
});

router.put('/change', async function (req, res, next) {
  tcppacketDao.changeSdata([req.body.sdata , req.body.pkey])
    .then( res.json({ message: `${req.body.pkey} 수정되었습니다.` }))
    .catch(e => next(e) );
});

router.put('/redo', async function (req, res, next) {
  tcppacketDao.redoSdata([req.body.pkey])
    .then(r => {
      res.json({ message: r[0].affectedRows > 0 ? "원복 되었습니다.": "변경되지 않았습니다." });
    })
    .catch(e => next(e) );
});
router.post('/tcnt', async function (req, res, next) {
  tcppacketDao.tcount(req.body)
  .then(rcnt => res.json(rcnt)  )
  .catch (e => next(e)) ;
});

router.post('/', async function (req, res, next) {
  if (!req.body.psize) {
    return res.send([]);
  };
  tcppacketDao.find(req.body)
  .then(rows =>  res.json(rows) )
  .catch((e) => next(e) );

});

router.get('/:id', async function (req, res, next) {

  tcppacketDao.findById(req.params.id)
    .then(rows => { return res.json(rows) })
    .catch((e) => { console.error(e); return next(e) });

});

router.post('/orig', async function (req, res, next) {
  if (!req.body.id) throw new Error('조회할 origin id값이 없습니다.') ;
  tloaddataDao.findById(req.body.id)
    .then(rows => { return res.json(rows) })
    .catch((e) => { console.error(e); return next(e) });

});

export default router;
