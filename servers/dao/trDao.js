const aqtdb = require('../db/dbconn');
const mapper = require('mybatis-mapper');
mapper.createMapper(['servers/mappers/aqtdb.xml']);
const NSPACE = 'aqtdb';

module.exports = {
  tasksum: async () => {
    const sql = mapper.getStatement(NSPACE, 'tasksum_sel');
    return await aqtdb.query({dateStrings: true,sql:sql});
  },
  sumByService: async (parms) => {
    const sql = mapper.getStatement(NSPACE, 'vtr_SumByService', parms);
    return await aqtdb.query({dateStrings: true,sql:sql});
  },

  listVtrx: async (parms) => {
    const sql = mapper.getStatement(NSPACE, 'vtrxlist_sel',parms);
    return await aqtdb.query(sql);
  },
  summary: async () => {
    const result = {
        svccnt: 0, // 서비스 수
        rows: []
      } ;

    try {
      const sql = mapper.getStatement(NSPACE, 'tlevel_sel');
      result.rows = await aqtdb.query(sql) ;
      let row = await aqtdb.query('select count(1) as scnt from tservice') ;
      result.svccnt =  row[0].scnt || 0 ;
      return result ;
    } catch (e){
      throw e ;
    } ;
  },
  insertMaster: async (parms) => {
    const row = await aqtdb.query("	SELECT count(1) cnt from tmaster where code = ?", [parms.code]);
    if (row[0].cnt > 0) {
      throw Error(`이미 존재하는 코드입니다(${parms.code})`);
    }
    const qstr = mapper.getStatement(NSPACE, 'tmaster_Ins', parms);
    return await aqtdb.query(qstr);
  },
  updateMaster: async (parms) => {
    const qstr = mapper.getStatement(NSPACE, 'tmaster_Upd', parms);

    return await aqtdb.query(qstr);
  },
  deleteMaster: async (parms) => {
    const qstr = mapper.getStatement(NSPACE, 'tmaster_Del', parms);
    console.log("deleteMaster:" ,qstr);
    return await aqtdb.query(qstr);
  },
  eraseTr: async (parms) => {
    const qstr = mapper.getStatement(NSPACE, 'ttcppacket_Erase', parms);
    console.log("eraseTr:" ,qstr);
    return await aqtdb.query(qstr);
  },
  async findToFile(parms) {
    let senc = '' ;
    let db_tmpdir = '/tmp'
  await aqtdb.query(`select tenv, variable_value from tmaster, information_schema.global_variables 
                     where variable_name = 'tmpdir' AND code = ? limit 1`,[parms.tcode])
  .then(rows => {
    if ( rows[0]?.tenv == 'euc-kr') senc = ' charset euckr' ;
    db_tmpdir = rows[0].variable_value ;
  }) ;

  const tfile = 't' + Date.now().toString().slice(-6) + '.csv' ;
  const tfilenm =   path.join(db_tmpdir  , tfile) ; 
  let etcond = '';
  if (parms.uri) etcond = `and (t.uri = '${parms.uri}' ) ` ;
  if (parms.rcode) etcond = `and (t.rcode = '${parms.rcode}') ` ;
  if (parms.cond) etcond += ` and ('${parms.cond}') ` ;

  const str_qry = ` SELECT t.tcode, t.uri URI, t.stime 송신시간, t.rtime 수신시간, t.svctime 소요시간, t.rcode 응답코드, 
        REGEXP_REPLACE(SUBSTR(t.sdata,1,100),'[\0\r\n]',' ') 송신데이터, 
        REGEXP_REPLACE(CAST( SUBSTR(t.rdata,1,100) AS CHAR ${senc} ),'[\0\r\n]',' ') 수신,   
        REGEXP_REPLACE(CAST( SUBSTR(B.rdata,1,100) AS CHAR ${senc} ),'[\0\r\n]',' ') 원수신  
        FROM ttcppacket t JOIN tloaddata B ON (t.cmpid = B.pkey)  
        LEFT JOIN tservice s ON (t.appid = s.appid AND t.uri = s.svcid ) 
        WHERE t.tcode = ? and t.appid rlike ? ${etcond}
         INTO OUTFILE ? 
          FIELDS TERMINATED BY '\\t' OPTIONALLY ENCLOSED BY '\"' 
          LINES TERMINATED BY '\\n'  ` ;

  const fff =  path.join( __dirname , tfile );

  aqtdb.query({dateStrings:true, 
               sql: str_qry  }, [ parms.tcode,parms.apps,  tfilenm ])
    .then( rows => {   fs.copyFileSync(tfilenm, fff) ;
        fs.unlinkSync(tfilenm);
        // res.setHeader('Content-Disposition', `attachment; filename=${tfile}`) ;
        res.download(fff) ;
         console.log( fff) ;
        setTimeout( () => fs.unlinkSync(fff), 5000) ;
      } )
    .catch( e => { throw e.sqlMessage });
  }
}
