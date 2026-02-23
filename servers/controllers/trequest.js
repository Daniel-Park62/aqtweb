import express from 'express';
const router = express.Router();
import trequestDao from '../dao/trequestDao.js' ;

router.post('/', async function (req, res, next) {

    trequestDao.insert(req.body.insdata)
      .then(r => {
        const tot = Array.isArray(r) ? r.reduce((t,i) => { return t + i.affectedRows} ) : r.affectedRows ;
        res.json({message : `${tot} 건 등록되었습니다.`}) 
      })
      .catch(e => { next(new Error(e.message)) });

});


export default router;
