import {Router} from 'express';
import tperfcode from '../model/tperfcode.js';
import tperftest from '../model/tperftest.js';
 
const router = Router() ;

router.get('/', async function (req, res, next) {
    const rdata = await tperfcode.tperflist() ;
    res.json(rdata) ;
});

router.get('/perfcomp_title', async function (req, res, next) {
    // console.log("req.query.tid : " + req.query.tid);

    const rdata = await tperfcode.tperftitle(req) ;
    res.json(rdata) ;
});

router.get('/perfcomp_list', async function (req, res, next) {
    // console.log("req.query.tid : " + req.query.tid);

    const rdata = await tperftest.tperfchklist(req) ;
    res.json(rdata) ;
});

router.get('/perfcomp_checkres', async function (req, res, next) {
    // console.log("req.query.asisdt : " + req.query.asisdt);
    // console.log("req.query.tobedt : " + req.query.tobedt);

    const rdata = await tperftest.tperfchkresult(req) ;
    res.json(rdata) ;
});

export default router;
