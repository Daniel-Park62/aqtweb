import mondb from '../db/dbconn.js' ;

const tlogon = {
    /**
     * 로그인 process
     */
    getUser : async (args) => {
      const ip = args.ip;
      const usrid = Buffer.from(args.body.usrid.substring(1), 'base64').toString('utf8');
      const pass = Buffer.from(args.body.pass.substring(2), 'base64').toString('utf8');
      let rows = await mondb.query("select if( PASSWORD(?) = pass1, 1,0) chk, admin, if(? like host,1,0) hg, apps FROM tuser where usrid = ? " ,[pass, ip, usrid]);
      return rows;
    },

    setPass : async (args) => {
      const opass = Buffer.from(args.body.opass.substring(2), 'base64').toString('utf8');
      const pass = Buffer.from(args.body.pass.substring(2), 'base64').toString('utf8');
      const usrid = Buffer.from(args.body.usrid.substring(1), 'base64').toString('utf8');
      const rows = await mondb.query( "select if( PASSWORD(?) = pass1, 1,0) c1, if(? like host,1,0) c2 FROM tuser where usrid = ? " , [opass, args.ip, usrid]);
      console.log(args.ip);
      console.log("rows[0].c1 : " + rows[0].c1 + " rows[0].c2 : " + rows[0].c2 );
      if(rows[0].c1 == 1 && rows[0].c2 == 1){
        await mondb.query(" update tuser set pass1 =  PASSWORD(?)  where usrid = ?  " , [pass, usrid]);
        return 1;
      }
      return 0;
    },

}
 
export default tlogon ;
