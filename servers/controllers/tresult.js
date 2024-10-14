const express = require('express');
const router = express.Router();
const path = require('path');
const aqtdb = require('../db/dbconn') ;
const fs = require('fs');

router.post('/', async function(req, res, next) {

  let senc = '' ;
  let db_tmpdir = '/tmp'
  await aqtdb.query("select tenv, variable_value from tmaster, information_schema.global_variables \
                     where variable_name = 'tmpdir' AND code = ? limit 1",[req.body.tcode])
  .then(rows => {
    if ( rows[0]?.tenv == 'euc-kr') senc = ' charset euckr' ;
    db_tmpdir = rows[0].variable_value ;
  }) ;

  const tfile = 't' + Date.now().toString().substr(-6) + '.csv' ;
//  const tfilenm =  (process.env.AQTLOG ?? '.' ) + '/' + tfile ;
// const tfilenm =  path.join(__dirname, "../") + tfile ;
//  const tfilenm =  "/tmp/" + tfile ;
  const tfilenm =   path.join(db_tmpdir  , tfile) ; 
  let etcond = '';
  if (req.body.uri) etcond = 'and (t.uri = \'' + req.body.uri + '\') ' ;
  if (req.body.rcode) etcond = 'and (t.rcode = ' + req.body.rcode + ') ' ;
  if (req.body.cond) etcond += ' and (' + req.body.cond + ') ' ;
    // console.log("enc:", senc);
  const str_qry = " SELECT t.tcode, t.uri `URI`, t.stime `송신시간`, t.rtime `수신시간`, t.svctime `소요시간`, t.rcode `응답코드`, \
        REGEXP_REPLACE(SUBSTR(t.sdata,1,100),'[\0\r\n]',' ') 송신데이터, \
        REGEXP_REPLACE(CAST( SUBSTR(t.rdata,1,100) AS CHAR " + senc + " ),'[\0\r\n]',' ') 수신,   \
        REGEXP_REPLACE(CAST( SUBSTR(B.rdata,1,100) AS CHAR " + senc + " ),'[\0\r\n]',' ') 원수신  \
        FROM ttcppacket t JOIN tloaddata B ON (t.cmpid = B.pkey)  \
        LEFT JOIN tservice s ON (t.appid = s.appid AND t.uri = s.svcid ) \
        WHERE t.tcode = ? and t.appid rlike ? " + etcond +
        " INTO OUTFILE ? \
          FIELDS TERMINATED BY '\\t' OPTIONALLY ENCLOSED BY '\"' \
          LINES TERMINATED BY '\\n'  " ;

//      console.log(str_qry, etcond,  tfilenm ) ;

  const fff =  path.join( __dirname , tfile );

  aqtdb.query({dateStrings:true, 
               sql: str_qry  }, [ req.body.tcode,req.body.apps,  tfilenm ])
    .then( rows => {   fs.copyFileSync(tfilenm, fff) ;
        fs.unlinkSync(tfilenm);

        // res.setHeader('Content-Disposition', `attachment; filename=${tfile}`) ;
        res.download(fff) ;
         console.log( fff) ;
        setTimeout( () => fs.unlinkSync(fff), 5000) ;
      } )

//       res.download(  __dirname + '/abcd.txt',  (err) => console.error('xxx ',err) ) } ) 
    .catch((e) => { console.error(etcond, e) ; return next(e) });

  // const rows = await conn.query({dateStrings:true, sql: 'select * from vtrxlist '})  ;
  // const scnt = await conn.query('select count(1) as scnt from tservice') ;
  // res.send({ scnt: scnt[0].scnt, data: rows} ) ;

});

module.exports = router;