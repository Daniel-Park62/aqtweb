#!/usr/bin/env node

import express from 'express';
import wsocket  from './wsocket.js';
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
import taqtprog from './controllers/taqtprog.js' ;
import tuser from './controllers/tuser.js' ;
import trequest from './controllers/trequest.js' ;
import tresult from './controllers/tresult.js' ;
import basicSetup from './controllers/basicSetup.js' ;
import tloadData from './controllers/tloadData.js' ;

// bang
import logonchk from './cntr/logonchk.js';
import project from './cntr/project.js'
import jobService from './cntr/jobService.js'
import commonController from './cntr/commonController.js'
import commHeader from './cntr/commHeader.js'
import jobController from './cntr/jobController.js'
import testCase from './cntr/testCase.js'
import testSinalio from './cntr/testSinalio.js'
import unitTest from './cntr/unitTest.js'
import integrationTest from './cntr/integrationTest.js'
import useruploadmanagement from './cntr/userUploadManagement.js';

global.aqtlog = (...a) => { process.env.AQTDEBUG && console.log((new Date()).toLocaleString('lt'),...a )} ;
aqtlog( "Starting AQT-WEB Server...",import.meta.dirname) ;
app.use(express.static(path.join(import.meta.dirname, "../public")));

app.use((req,res,next) => {
   aqtlog(`${req.ip}:${req.originalUrl}:`, req.body ? JSON.stringify(req.body) : "") ;
   next();
});

app.get('/', (req, res) => {
   res.sendFile(path.resolve(import.meta.dirname, '../public', 'index.html'));
});

app.use('/dashboard', dashboard) ;
app.use('/byservice', byservice) ;
app.use('/regapp', regapp) ;
app.use('/trlist', trlist) ;
app.use('/tmaster', tmaster) ;
app.use('/tservice', tservice) ;
app.use('/tmocksvr', tmocksvr) ;
app.use('/taqtprog', taqtprog) ;
app.use('/texecjob', texecjob) ;
app.use('/tuser', tuser) ;
app.use('/trequest', trequest) ;
app.use('/tresult', tresult) ;
app.use('/aqtSetup', basicSetup) ;
app.use('/tloaddata', tloadData) ;
// bang
app.use('/logonchk', logonchk);
app.use('/project', project);
app.use('/jobService', jobService);
app.use('/useruploadmanagement', useruploadmanagement);
app.use('/common', commonController);
app.use('/commHeader', commHeader);
app.use('/jobs', jobController);
app.use('/testCase', testCase);
app.use('/testSinalio', testSinalio);
app.use('/unitTest', unitTest);
app.use('/integrationTest', integrationTest);
// end bang

const server = app.listen(port,'0.0.0.0', () => {
   console.log((new Date()).toLocaleString('lt'), `Server is up at port ${port}`);
});

app.use(notFound);
app.use(errorHandler);

wsocket( server );
