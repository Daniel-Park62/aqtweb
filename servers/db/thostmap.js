const aqtdb = require('./dbconn');

const thostmap = {
  find: async (tcode) => {

      return await aqtdb.query({
        rowsAsArray: true,
        sql: "	SELECT pkey,  thost, tport, thost2, tport2 \
                 FROM thostmap t  where tcode  = ?  "
      } , [tcode]);
  },
  delete: async (id) => {
    return aqtdb.query('delete from thostmap where pkey in (?)', [id]) ;
  },
  update: async (values) => {
  const qstr = 'REPLACE INTO thostmap ' +
	             ' (pkey,  tcode, thost, tport, thost2, tport2 ) ' +
               'VALUES (?, ?, ?, ?, ?) ' ;
  return await aqtdb.batch(qstr, values ) ;
 },
}
module.exports = thostmap;




