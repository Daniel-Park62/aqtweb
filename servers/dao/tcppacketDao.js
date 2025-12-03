const aqtdb = require('../db/dbconn');

let senc = '';
let vcol = '' ;
async function vcolSet() {
  aqtdb.query("select encval, col1, col2 from tconfig limit 1")
    .then(rows => {
      if (rows[0].encval == 'MS949' || rows[0].encval == 'EUCKR') senc = 'charset euckr';
      if (rows[0].col1) vcol = ', col1';
      if (rows[0].col2) vcol += ',col2' ;
    });
}
// aqtdb.query("SET character_set_connection = 'euckr';");

module.exports = {
  /** @param {*} parms */
  async find(parms) {
    let etcond = '';
    let sortby = '';
    let tcodes = parms.tcode.split(/,\s*/) ;
    if (parms.rcode) etcond = `and (t.rcode = ${parms.rcode}) `;
    if (parms.apps) etcond += ` and (t.appid rlike '${parms.apps}' ) `;
    if (parms.uri) etcond += ` and (t.uri rlike '${parms.uri}' ) `;
    if (parms.cond) etcond += ` and (${parms.cond}) `;
    if (parms.sortby) sortby = ` order by ${parms.sortby}` ;
    await vcolSet() ;
    // console.log(`[${etcond}]`);
    const sqlval = `SELECT '' chk,t.pkey, cmpid id, tcode tid, o_stime, stime 송신시간, rtime, svctime 소요시간, method, uri, sflag, rcode status, 
                    if(tport=0,dstport,tport) dstport, t.appid , if(sflag='2',errinfo,
                    case tenv when 'euc-kr' then CAST( rdata AS CHAR(200) CHARSET euckr) 
                       else cast(rdata as char(200)) end ) 수신데이터, 
                    rlen 수신크기, date_format(cdate,'%Y-%m-%d %T') cdate ${vcol}
                    FROM ttcppacket t ${parms.uri ? "force index (codesvc)":""} 
                        join tmaster m on (m.code = t.tcode)
                         left join tservice s on (t.uri = s.svcid and t.appid = s.appid) 
                    where t.tcode in (${tcodes.map(i => "'"+ i +"'").join()})  ${etcond} ${sortby} limit ?, ? ` ;
                //  console.log(`[${sqlval}]`) ;
    return await aqtdb.query({
      dateStrings: true,
      sql: sqlval
    }, [parms.page * parms.psize, +(parms.psize)]);
  },
  /** @param {number} id */
  async findById(id) {
    return await aqtdb.query({
      dateStrings: true,
      sql: `SELECT pkey, cmpid, tcode, o_stime, stime, rtime, svctime, elapsed, srcip, srcport, thost dstip, if(tport=0,dstport,tport) dstport, method,  \
                  appid, uri, seqno, ackno, rcode, errinfo,sflag, rhead, slen, rlen, tenv,\
                  case tenv when 'euc-kr' then CAST( sdata AS CHAR CHARSET euckr) else cast(sdata as char) end sdata ,\
                  case tenv when 'euc-kr' then CAST( rdata AS CHAR CHARSET euckr) else cast(rdata as char) end rdata ,\
                  date_format(cdate,'%Y-%m-%d %T') cdate ${vcol}  FROM vtcppacket t  where pkey  = ? `  }
      , [id]);
  },

  /** @param {any[String, Int ]} arr */
  async changeSdata(arr) {
    return await aqtdb.query("update ttcppacket set sdata = ? where pkey = ? ; commit ;", arr);
  },
  /** @param {number[]} pkey */
  async redoSdata(pkey) {
    return await aqtdb.query(`update ttcppacket t, tloaddata o  SET t.sdata = o.sdata 
                              WHERE t.pkey in (?) AND t.cmpid = o.pkey ; commit ;`, pkey);
  },
  /** @param {*} parms */
  async tcount(parms) {
    let etcond = '';
    let tcodes = parms.tcode.split(/,\s*/) ;
    if (parms.rcode) etcond = `and (t.rcode = ${parms.rcode}) `;
    if (parms.apps == '.*') parms.apps = '';
    if (parms.apps) etcond += ` and (t.appid rlike '${parms.apps}' ) `;
    if (parms.uri) etcond += ` and (t.uri rlike '${parms.uri}' ) `;
    if (parms.cond) etcond += ` and (${parms.cond}) `;

    // console.log("enc:", senc);
    return await aqtdb.query(`set statement max_statement_time=10 for select count(1) tcnt 
         FROM vtcppacket t left join tservice s on (t.uri = s.svcid and t.appid = s.appid) 
         where tcode in ( ${tcodes.map(i => "'"+ i + "'").join()} )  ${etcond}`) ;

  },

}


