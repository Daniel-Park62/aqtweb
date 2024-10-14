const aqtdb = require('./dbconn') ;
 
function erase(tcode, cond) {
  return new Promise ( (resolve,reject) => {
    let qstr = "delete from ttcppacket where tcode = ? " + ( cond ? "and "+cond: "") ;
    aqtdb.query(qstr, [tcode])
    .then( r => resolve(r) ) 
    .catch( e => reject(e));
  })
}

module.exports = {
  erase: erase 
}


