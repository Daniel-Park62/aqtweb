#!/usr/bin/env node
import express from 'express';
const app = express();
import cors from 'cors';
import mLog from '../lib/aqtLogger.js';
const logger = mLog.child({ label: "kftcsvr" });
import mdb from '../db/db_con1.js';
const port = process.argv[2] ?? 10004;
const svrno = process.argv[3] ?? 0;
import account from './kftc/kftcAccount.js' ;
import inquiry from './kftc/kftcInquiry.js' ;
import transfer from './kftc/kftcTransfer.js';

import { fileURLToPath } from 'url'; 
import { dirname } from 'path'; 

const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename); 

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
app.use('/v2.0/account', account) ;
app.use('/v2.0/inquiry', inquiry) ;
app.use('/v2.0/transfer', transfer) ;
app.use((req,res,next) => {
    res.status(404).send(`🔍 - Not Found -> ${req.originalUrl}` );
}) ;
app.listen(port, () => {
    if (svrno > 0 ) update_status(svrno) ;
    else logger.info(`금결원 모의서버 listening on Port:${port}`);
});

async function update_status(svrno) {
    con = await mdb;
    const rows = await con.query(`select svrnm from tmocksvr where pkey=?; update tmocksvr set status=2,procid=? where pkey=?`,[svrno,process.pid, svrno]) ;
    if (rows[0][0]?.svrnm) {
        svrnm = rows[0][0].svrnm 
        logger.info(`${svrnm} 서버 port:${port} start`) ;
    }
    // con.end();
}
async function endfunc() {
    if (svrno > 0) {
        await con.ping() ;
        await con.query(`update tmocksvr set status=0 where pkey=?`,[svrno]) ;
        logger.info(`${svrnm} 서버종료`);
    } else {
        logger.info(`Port:${port} 서버종료`);
    }
    process.exit(0);
}

process.on('SIGINT', endfunc);
process.on('SIGTERM', endfunc);
process.on('uncaughtException', (err) => { endfunc(); logger.error(err.message) });