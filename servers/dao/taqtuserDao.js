const aqtdb = require('../db/dbconn');
const mapper = require('mybatis-mapper');
mapper.createMapper(['servers/mappers/aqtdb.xml']);
const NSPACE = 'aqtdb';

async function getUser(parms) {
  // console.log(uid, pass, ip);
  const rows = await aqtdb.query({ sql: "select if( PASSWORD(?) = pass1, 1,0) c1, if(? like host,1,0) c2 FROM taqtuser where usrid = ? " }
    , [pass, ip, uid]);
  // .then(rows => {
  // console.log(rows[0]);
  if (rows[0]) {
    if (rows[0].c1 && rows[0].c2) return 1;
    if (rows[0].c1) return 2;
    if (rows[0].c2) return 3; else return 4;
  } else
    return 0;
  // })
  // .catch((e) => { return -1 });
}

const taqtuserDao = {

  listAll: async () => {
    const sql = mapper.getStatement(NSPACE, 'taqtuser_All');
    return await aqtdb.query({ rowsAsArray: false,sql:sql});
  },
  passCheck: async (parms) => {
    console.log('passCheck',parms);
    const qstr = mapper.getStatement(NSPACE, "taqtuser_PassCheck", parms);
    return await aqtdb.query(qstr);
  },
  passUpdate: async (parms) => {
    try {
      const rows = await taqtuserDao.passCheck(parms) ;
      // console.log(rows) ;
      if (rows[0].chk && rows[0].hg) {
        const qstr =  mapper.getStatement(NSPACE, "taqtuser_PassUpd", parms);
        return await aqtdb.query(qstr);
      }
      if (rows[0].chk != 1) return({message:'현재 비밀번호가 맞지않습니다.'}) ;
      if (rows[0].hg != 1) return({message:'해당 PC에서 접근할 수 없습니다.'}) ;
      return({message:'변경 권한이 없습니다.'}) ;
    } catch(e)  {return(e)}  ;

  },
  update: async (parms) => {
    const qstr = mapper.getStatement(NSPACE, "taqtuser_Upd", {list:parms});
    return await aqtdb.query(qstr);
  },
  insert: async (parms) => {
    const qstr = mapper.getStatement(NSPACE, "taqtuser_Ins", {list:parms});
    return await aqtdb.query(qstr);
  },
  delete: async (parms) => {
    const qstr = mapper.getStatement(NSPACE, 'taqtuser_Del', {list:parms});
    return await aqtdb.query(qstr);
  }

}

module.exports = taqtuserDao;




