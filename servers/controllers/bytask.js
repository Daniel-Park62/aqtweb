const express = require('express');
const router = express.Router();
const aqtdb = require('../db/dbconn') ;

router.get('/', async function (req, res, next) {

  aqtdb.query({ dateStrings: true, sql: 'select *, if(scnt+fcnt=0,0,round(scnt*100/(scnt+fcnt),2)) srate from TTASKSUM order by TASK,LVL' })
    .then(rows => res.json(rows))
    .catch((e) => { return next(e) });

});

router.get('/:task/:lvl', async function(req, res, next) {
  
  aqtdb.query({dateStrings:true, sql: 
            "select t.tcode, t.uri svcid, s.svckor , count(1) tcnt, round(avg(t.svctime),3) avgt, sum(case when t.sflag = '1' then 1 else 0 end) scnt \
        , sum(case when t.sflag = '2' then 1 else 0 end) fcnt , s.cumcnt \
        from   vtcppacket t join tservice s on (t.uri = s.svcid and t.appid = s.appid)  \
        WHERE s.task = ? and lvl = ?  group by t.tcode, t.uri ORDER BY T.URI"
    }, [ req.params.task == 'EMPTY' ? '':req.params.task, req.params.lvl ])
    .then( rows => res.json(rows) ) 
    .catch((e) => {  return next(e) });
  
  // const rows = await conn.query({dateStrings:true, sql: 'select * from vtrxlist '})  ;
  // const scnt = await conn.query('select count(1) as scnt from tservice') ;
  // res.send({ scnt: scnt[0].scnt, data: rows} ) ;

});
 
module.exports = router;
