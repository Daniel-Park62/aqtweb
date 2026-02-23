import express from 'express';
const router = express.Router();
import trDao from '../dao/trDao.js' ;

router.post('/', async function(req, res, next) {

  await trDao.findToFile(req.body)
  .then( f => {
        console.log('result',f) ;
        res.download(f) ;
      })
  .catch(e => next(e)) ;

});

export default router;