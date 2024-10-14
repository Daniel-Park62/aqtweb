const aqtdb = require('./dbconn') ;

const tconfig = {
 findAll : async () => {
    let rows = await aqtdb.query("	SELECT pjtnm, encval, diffc, col1, col2 from tconfig limit 1" ) ;
    let row1 = await aqtdb.query("SELECT column_type col1type ,generation_expression expr1 FROM information_schema.`COLUMNS` \
                WHERE table_schema  = database() and TABLE_NAME = 'ttcppacket' AND COLUMN_NAME = 'col1' ") ;
    let row2 = await aqtdb.query("SELECT column_type col2type ,generation_expression expr2  FROM information_schema.`COLUMNS` \
                WHERE table_schema  = database() and TABLE_NAME = 'ttcppacket' AND COLUMN_NAME = 'col2' ") ;
    
    let rdata = {...rows[0],...row1[0],...row2[0]} ;
    return(rdata) ;
  },
  saveConfig : async (args) => {
    try {
      let results = await aqtdb.query('update tconfig set pjtnm = ? ,\
        encval = ?, diffc = ?, col1 = ?, col2 = ? where id = 1 ',
        [args.pjtnm, args.encval, args.diffc, args.col1, args.col2] ) ;
      console.log("results:", results) ;
      return 1;
    } catch (e) {
      console.error(e) ;
      return 0;
    }
  },
  alterCol1: async(args) => {
    try {
      let sqlstr = "update tconfig set col1=" +  (args.col1 == null ? "NULL" : "'" + args.col1 + "'") +
                   "; alter table ttcppacket CHANGE COLUMN col1 col1 " + args.col1type + " AS (" + args.expr1 + ")" ;
      let [results] = await aqtdb.query(sqlstr ) ;
      console.log("results:", results) ;
    } catch (e) {
      console.error(e) ;
      throw e.sqlMessage ;
    }
  },
  alterCol2: async(args) => {
    try {
      let sqlstr = "update tconfig set col2=" +  (args.col2 == null ? "NULL" : "'" + args.col2 + "'") +
                   "; alter table ttcppacket CHANGE COLUMN col2 col2 " + args.col2type + " AS (" + args.expr2 + ")" ;
      let [results] = await aqtdb.query(sqlstr ) ;
//      console.log("results:", results) ;
    } catch (e) {
      console.error(e.sqlMessage) ;
      throw new Error(e.sqlMessage) ;
    }
  },
}
 
module.exports = tconfig ;




