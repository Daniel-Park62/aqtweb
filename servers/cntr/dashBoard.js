import {Router} from 'express';
import tperfcode from '../model/tperfcode.js';
import tperftest from '../model/tperftest.js';
import tdatatr from '../model/tdatatr.js';

const router = Router() ;

router.get('/', async function (req, res, next) {
    const rdata = await tperfcode.find() ;
    res.json(rdata) ;
});

router.get('/perftest_list', async function (req, res, next) {
    const rdata = await tperftest.tperftest_find() ;
    res.json(rdata) ;
});

router.get('/perftest_checkres', async function (req, res, next) {
    const rdata = await tperftest.tperftest_result() ;
    res.json(rdata) ;
});

router.get('/datatr_list', async function (req, res, next) {
    const rdata = await tdatatr.tdatatr_find() ;
    res.json(rdata) ;
});

router.get('/datatr_checkres', async function (req, res, next) {
    const rdata = await tdatatr.tdatatr_verify() ;
    res.json(rdata) ;
});
  
export default router;
