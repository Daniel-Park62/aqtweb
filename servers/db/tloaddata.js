const aqtdb = require('./dbconn');

const tloaddata = {
  find: async (args) => {
    // console.log(args);
    if (!args.enc) args.enc = '';
    if (!args.psize) {
      return [];
    }

    await aqtdb.query("select tenv from tmaster where code = ? limit 1", [args.tcode])
      .then(rows => {
        if (rows[0]?.tenv == 'euc-kr') args.enc = ' charset euckr'
        else args.enc = '';
      });
    let etcond = '';
    if (args.cond) etcond += ' and (' + args.cond + ') ';

    try {
      const rows = await aqtdb.query({
        dateStrings: true,
        sql: "	SELECT pkey,  tcode, o_stime, stime, rtime, svctime, elapsed, srcip, srcport, dstip, dstport, ifnull(method,'') method,  \
                 '' appid, uri, seqno, ackno, rcode, errinfo, sflag, rhead, slen, rlen, \
                 cast(sdata AS CHAR(250) " + args.enc + ") sdata , cast(rdata AS CHAR(250) " + args.enc + ") rdata,\
                 date_format(cdate,'%Y-%m-%d %T') cdate \
                 FROM tloaddata t  where tcode  = ? and t.uri rlike ? " + etcond + " order by o_stime limit ?, ?  "
      }
        , [args.tcode, args.uri, args.page * args.psize, +(args.psize)]);
      return (rows);
    } catch (e) {
      throw e.sqlMessage
    };
  },
  findById : async (id) => {
    
    try {
    const rows = await aqtdb.query({
      dateStrings: true,
      sql: "	SELECT pkey, pkey cmpid, tcode, o_stime, stime, rtime, svctime, elapsed, srcip, srcport, dstip, dstport, ifnull(method,'') method,  \
      '' appid, uri, seqno, ackno, rcode, errinfo, sflag, rhead, slen, rlen, \
          case tenv when 'euc-kr' then CAST( sdata AS CHAR CHARSET euckr) else cast(sdata as char) end sdata ,\
          case tenv when 'euc-kr' then CAST( rdata AS CHAR CHARSET euckr) else cast(rdata as char) end rdata ,\
      date_format(cdate,'%Y-%m-%d %T') cdate \
      FROM tloaddata t left join tmaster m on (t.tcode = m.code) where pkey  = ? limit 1"  }
      , [id]) ;
      return (rows);
    } catch (e) {
      throw e.sqlMessage
    };
  },
  summary: async () => {
    try {
      const rows = await aqtdb.query("	SELECT tcode, date_format(min(o_stime),'%Y/%m/%d') stimef,date_format(max(o_stime),'%Y/%m/%d') stimet "
        + " ,format(count(1),0) cnt, format(count(distinct(uri)),0) scnt, date_format(max(cdate),'%Y/%m/%d %T') cdate FROM tloaddata GROUP BY tcode ");
      return (rows);
    } catch (e) {
      throw e;
    }
  },
  getTcodes: async () => {
    try {
      const rows = await aqtdb.query("	SELECT tcode, date_format(min(o_stime),'%Y/%m/%d') stime FROM tloaddata GROUP BY tcode ");
      return (rows);
    } catch (e) {
      throw e;
    }
  }
}
module.exports = tloaddata;




