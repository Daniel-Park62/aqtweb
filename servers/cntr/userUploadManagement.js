import {Router} from 'express';
import tuser from '../model/tuser.js';

const router = Router() ;

router.get('/', async function (req, res, next) {
    const rdata = await tuser.ttuserlist() ;
    res.json(rdata) ;
});

router.get('/user_list', async function (req, res, next) {
     console.log("req.query.gubun : " + req.query.gubun);
     console.log("req.query.searchtxt : " + req.query.searchtxt);

    const rdata = await tuser.ttusersearch(req.query) ;
    res.json(rdata) ;
});

router.delete('/user_del', async function (req, res, next) {
    const rdata = await tuser.ttuserdel(JSON.stringify(req.body)) ;

    if(rdata === 1){
        // res.status(200).json({ message: '삭제 완료하였습니다.'}) ;
        res.status(200).json({ "rdata": 1}) ;
    }else{
        // res.status(200).json({ message: '삭제 완료하지 못하였습니다.'}) ;
        res.status(200).json({ "rdata": 0}) ;
    }
  });

router.post('/user_save', async function (req, res, next) {
    const rdata = await tuser.ttusersave(JSON.stringify(req.body)) ;

    if(rdata === 1){
        // res.status(200).json({ message: '수정을 완료하였습니다.'}) ;
        res.status(200).json({ "rdata": 1}) ;
    }else{
        // res.status(200).json({ message: '수정을 완료하지 못하였습니다.'}) ;
        res.status(200).json({ "rdata": 0}) ;
    }
  });

export default router;
