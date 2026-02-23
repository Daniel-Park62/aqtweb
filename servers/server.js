import { fileURLToPath } from 'url'; 
import { dirname } from 'path'; 

const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename); 

import express from 'express';
const app        = express();
const port = process.argv[2] ?? process.env.AQTWPORT ?? 5972;
import cors from 'cors';
app.set('trust proxy', true);
app.use(express.json()); 
app.use(express.urlencoded( {extended : false } ));
app.use(cors());

import path from 'path';
import { notFound, errorHandler  }  from './middle/errors.js';
// import aqtdb from './db/dbconn' ;
import dashboard from './controllers/dashBoard.js' ;

import byservice from './controllers/byservice.js' ;
import regapp from './controllers/regapp.js' ;
import trlist from './controllers/trlist.js' ;
import tmaster from './controllers/tmaster.js' ;
import tservice from './controllers/tservice.js' ;
import texecjob from './controllers/texecjob.js' ;
import tmocksvr from './controllers/tmocksvr.js' ;

import tuser from './controllers/tuser.js' ;
import trequest from './controllers/trequest.js' ;
import tresult from './controllers/tresult.js' ;
import basicSetup from './controllers/basicSetup.js' ;
import tloadData from './controllers/tloadData.js' ;

app.use(express.static(path.join(__dirname, "../public")));

app.use((req,res,next) => {
   res.locals.aqtlog = (...a) => { console.log((new Date()).toLocaleString('lt'),...a )} ;
   if (process.env.AQTDEBUG) res.locals.aqtlog(`${req.ip}:${req.originalUrl}:`, req.body ? JSON.stringify(req.body) : "") ;
   next();
});

app.get('/', (req, res) => {
   res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
});

app.use('/dashboard', dashboard) ;

app.use('/byservice', byservice) ;
app.use('/regapp', regapp) ;
app.use('/trlist', trlist) ;
app.use('/tmaster', tmaster) ;
app.use('/tservice', tservice) ;
app.use('/tmocksvr', tmocksvr) ;
app.use('/texecjob', texecjob) ;
app.use('/tuser', tuser) ;
app.use('/trequest', trequest) ;
app.use('/tresult', tresult) ;
app.use('/aqtSetup', basicSetup) ;
app.use('/tloaddata', tloadData) ;

app.listen(port,'0.0.0.0', () => {
   console.log((new Date()).toLocaleString('lt'), `Server is up at port ${port}`);
});

app.use(notFound);
app.use(errorHandler);

// (async () => {
//   const conn = await aqtdb.getConn() ;
//   conn.query("select * from tconfig").then( row => console.log(row[0]) )
//   .catch(console.log) 
//   .finally(conn.release);
// })() ;