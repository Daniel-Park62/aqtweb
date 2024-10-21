const express    = require('express');
const app        = express();
const port = process.argv[2] ?? process.env.AQTWPORT ?? 5972;
const cors = require('cors');
app.set('trust proxy', true);
app.use(express.json()); 
app.use(express.urlencoded( {extended : false } ));

const path = require('path');
const { notFound, errorHandler } = require('./middle/errors');
// const aqtdb = require('./db/dbconn') ;
const dashboard = require('./controllers/dashBoard') ;
const bytcode = require('./controllers/bytcode') ;
const bytask = require('./controllers/bytask') ;
const regapp = require('./controllers/regapp') ;
const trlist = require('./controllers/trlist') ;
const tmaster = require('./controllers/tmaster') ;
const tservice = require('./controllers/tservice') ;
const texecjob = require('./controllers/texecjob') ;
const logonchk = require('./controllers/logonchk') ;
const tuser = require('./controllers/tuser') ;
const trequest = require('./controllers/trequest') ;
const tresult = require('./controllers/tresult') ;
const basicSetup = require('./controllers/basicSetup') ;
const tloadDate = require('./controllers/tloadData') ;

app.use(cors());

console.log(__dirname);
app.use(express.static(path.join(__dirname, "../public")));
//app.use(express.static('public'));
app.get('/', (req, res) => {
   res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
});

app.use('/logonchk', logonchk) ;
app.use('/dashboard', dashboard) ;
app.use('/bytcode', bytcode) ;
app.use('/bytask', bytask) ;
app.use('/regapp', regapp) ;
app.use('/trlist', trlist) ;
app.use('/tmaster', tmaster) ;
app.use('/tservice', tservice) ;
app.use('/texecjob', texecjob) ;
app.use('/tuser', tuser) ;
app.use('/trequest', trequest) ;
app.use('/tresult', tresult) ;
app.use('/aqtSetup', basicSetup) ;
app.use('/tloaddata', tloadDate) ;

app.listen(port,'0.0.0.0', () => {
   console.log(`Server is up at port ${port}`);
});

app.use(notFound);
app.use(errorHandler);

// (async () => {
//   const conn = await aqtdb.getConn() ;
//   conn.query("select * from tconfig").then( row => console.log(row[0]) )
//   .catch(console.log) 
//   .finally(conn.release);
// })() ;