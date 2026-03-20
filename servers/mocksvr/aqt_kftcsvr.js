#!/usr/bin/env node
import express from 'express';
const app = express();
import cors from 'cors';
import mLog from '../lib/aqtLogger.js';
const logger = mLog.child({ label: "kftcsvr" });
//import { getCon } from '../db/db_con1.js';
import tmocksvrDao from '../dao/tmocksvrDao.js';
const port = process.argv[2] ?? 10004;
const svrno = process.argv[3] ?? 0;

let svrnm ;

import account from './kftc/kftcAccount.js' ;
import inquiry from './kftc/kftcInquiry.js' ;
import transfer from './kftc/kftcTransfer.js';
import cards from './kftc/kftcCards.js' ;
import pays from './kftc/kftcPays.js';
import insurances from './kftc/kftcInsurances.js';
import loans from './kftc/kftcLoans.js';

const originalWrite = process.stdout.write;

// stdout.write 가로채기
process.stdout.write = function (chunk, encoding, callback) {
  if (svrno > 0)  tmocksvrDao.saveLogs(svrno, chunk.toString());
  // 원래의 write 함수를 호출하여 화면에도 출력되게 함
  return originalWrite.apply(process.stdout, arguments);
};

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
app.use('/v2.0/cards', cards) ;
app.use('/v2.0/pays', pays) ;
app.use('/v2.0/insurances', insurances) ;
app.use('/v2.0/loans', loans) ;
app.use((req,res,next) => {
    res.status(404).send(`🔍 - Not Found -> ${req.originalUrl}` );
}) ;
app.listen(port, () => {
    if (svrno > 0 ) update_status(svrno) ;
    else logger.info(`금결원 모의서버 listening on Port:${port}`);
});

async function update_status(svrno) {
    try {
            // const con = await getCon();
            // const rows = await con.query(`select svrnm from tmocksvr where pkey=?; update tmocksvr set status=2,procid=? where pkey=?`,[svrno,process.pid, svrno]) ;
            // if (rows[0][0]?.svrnm) {
            const row = await tmocksvrDao.statusUpd(svrno,2,process.pid) ;
            if (row[0].svrnm) {
                svrnm = row[0].svrnm 
                logger.info(`${svrnm} 서버 port:${port} start`) ;
            }
            // con.end();
        
    } catch (error) {
        logger.error(error.message);
    }
}
async function endfunc() {
    if (svrno > 0) {
        try {
            logger.info(`${svrnm} 서버종료`);
            await tmocksvrDao.statusUpd(svrno,0) ;
    
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