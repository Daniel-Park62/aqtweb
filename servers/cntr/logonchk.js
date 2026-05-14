import { Router } from 'express';
const router = Router();
import tlogon from '../model/tlogon.js';


// router.get('/', async function (req, res, next) {
//     const rdata = await tlogon.find() ;
//     res.json(rdata) ;
// });
router.post('/', async function (req, res, next) {
    const rdata = await tlogon.getUser(req);
    if (rdata.length !== 0) {
        res.status(200).json(rdata[0]);
    } else {
        res.status(404).json({ message: '사용자를 찾을수 없습니다.\n아이디, 비밀번호를 확인하세요.' });
    }
});

router.post('/cp', async function (req, res, next) {

    // const opass = Buffer.from(req.body.opass.substring(2), 'base64').toString('utf8');
    // const pass = Buffer.from(req.body.pass.substring(2), 'base64').toString('utf8');
    const usrid = Buffer.from(req.body.usrid.substring(1), 'base64').toString('utf8');
    // const r = await tlogon.getUserPass(req);
    // // console.log("aa:", r);
    // if (r !== 1) return res.status(200).send({ message: "권한이 없습니다.", err: 1 });

    let changeCnt = await tlogon.setPass(req);
    if (changeCnt === 1) {
        res.status(200).json({ message: `${usrid}` + " 변경 되었습니다." });
    } else {
        res.status(200).send({ message: "권한이 없습니다.", err: 1 });
    }

});

export default router;