import express from 'express';
import fs from 'fs' ;
const router = express.Router();
import trDao from '../dao/trDao.js' ;

router.post('/', async function(req, res, next) {

  trDao.findToFile(req.body)
  .then( f => {
        aqtlog('result',f) ;
        res.download(f,(err) => {
          if (err) {
            aqtlog("다운로드 오류:", err);
            next(err) ;
          } else {
            // fs.unlinkSync(f); // 다운로드가 완료된 후 파일 삭제
          }
        }) ;
      })
  .catch(e => next(e)) ;

});

export default router;