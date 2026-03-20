#!/usr/bin/env node

import express from 'express';
const app = express();
import cors from 'cors';
import mLog from '../lib/aqtLogger.js';
const logger = mLog.child({ label: "httpsvr" });

import {getCon} from '../db/db_con1.js';
const port = process.argv[2] ?? 10003;
const svrno = process.argv[3] ?? 0;

app.use(cors());
app.set('trust proxy', true);
app.use(express.json()); 
app.use(express.urlencoded( {extended : false } ));

app.get('/', (req, res) => {
    res.format({
        'application/json': () => {
            res.json({ message: 'Hello, JSON!' });
        },
        'text/html': () => {
            res.send('<h1>Hello, HTML!</h1>');
        },
        'text/plain': () => {
            res.send('Hello, Plain Text!');
        },
        'default': () => {
            res.status(406).send('Not Acceptable');
        }
    });
});

app.post('/data', (req, res) => {
  if (req.is('json')) {
    // JSON 데이터 처리
    res.send('JSON received');
  } else if (req.is('multipart/form-data')) {
    // 폼 데이터 처리
    res.send('Form data received');
  } else {
    res.send(req.get('Content-type'));
  }
});

app.listen(port, () => {
    if (svrno > 0 ) update_status(svrno) ;
    else logger.info(`Server listening on Port:${port}`);
});

async function update_status(svrno) {
    try {
            const con = await getCon();
            const rows = await con.query(`select svrnm from tmocksvr where pkey=?; update tmocksvr set status=2,procid=? where pkey=?`,[svrno,process.pid, svrno]) ;
            if (rows[0][0]?.svrnm) {
                svrnm = rows[0][0].svrnm 
                logger.info(`${svrnm} 서버 port:${port} start`) ;
            }
            con.end();
        
    } catch (error) {
        logger.error(error.message);
    }
}
async function endfunc() {
    if (svrno > 0) {
        try {
            const con = await getCon() ;
            await con.query(`update tmocksvr set status=0 where pkey=?`,[svrno]) ;
            logger.info(`${svrnm} 서버종료`);
    
        } catch (error) {
            logger.error(error.message);
        }
    } else {
        logger.info(`Port:${port} 서버종료`);
    }
    process.exit(0);
}

process.on('SIGINT', endfunc);
process.on('SIGTERM', endfunc);
process.on('uncaughtException', (err) => { endfunc(); logger.error(err.message) });