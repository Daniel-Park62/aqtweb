import aqtdb from '../db/dbconn.js' ;

export default {
 findAll : async () => {
    return await aqtdb.query(`	SELECT pjtnm, encval, diffc, col1, col2 from tconfig limit 1;
                  SELECT generation_expression sflagc FROM information_schema.COLUMNS
                WHERE table_schema  = database() and TABLE_NAME = 'ttcppacket' AND COLUMN_NAME = 'sflag' ;
                  SELECT column_type col1type ,generation_expression expr1 FROM information_schema.COLUMNS
                WHERE table_schema  = database() and TABLE_NAME = 'ttcppacket' AND COLUMN_NAME = 'col1' ;
                  SELECT column_type col2type ,generation_expression expr2  FROM information_schema.COLUMNS 
                WHERE table_schema  = database() and TABLE_NAME = 'ttcppacket' AND COLUMN_NAME = 'col2' `) ;

  },
/*  findAllbk : async () => {
    let rows = await aqtdb.query("	SELECT pjtnm, encval, diffc, col1, col2 from tconfig limit 1" ) ;
    let row1 = await aqtdb.query("SELECT column_type col1type ,generation_expression expr1 FROM information_schema.`COLUMNS` \
                WHERE table_schema  = database() and TABLE_NAME = 'ttcppacket' AND COLUMN_NAME = 'col1' ") ;
    let row2 = await aqtdb.query("SELECT column_type col2type ,generation_expression expr2  FROM information_schema.`COLUMNS` \
                WHERE table_schema  = database() and TABLE_NAME = 'ttcppacket' AND COLUMN_NAME = 'col2' ") ;
    
    let rdata = {...rows[0],...row1[0],...row2[0]} ;
    return(rdata) ;
  },
 */  
  saveConfig : async (args) => {
    return await aqtdb.query(`alter table ttcppacket CHANGE COLUMN sflag sflag char(1) as ( ${args.sflagc}) ;
        update tconfig set pjtnm = ? , encval = ?, diffc = ?, col1 = ?, col2 = ? where id = 1 `,
        [args.pjtnm, args.encval, args.diffc, args.col1, args.col2] ) ;
  },
  alterCol1: async(args) => {
      let sqlstr = "update tconfig set col1=" +  (args.col1 == null ? "NULL" : "'" + args.col1 + "'") +
                   "; alter table ttcppacket CHANGE COLUMN col1 col1 " + args.col1type + " AS (" + args.expr1 + ")" ;
      return await aqtdb.query(sqlstr ) ;

  },
  alterCol2: async(args) => {
      let sqlstr = "update tconfig set col2=" +  (args.col2 == null ? "NULL" : "'" + args.col2 + "'") +
                   "; alter table ttcppacket CHANGE COLUMN col2 col2 " + args.col2type + " AS (" + args.expr2 + ")" ;
      return await aqtdb.query(sqlstr ) ;
  },
}





