#!/usr/bin/env node
// tcp 기본서버 
import Net from 'net';
import mLog from '../lib/aqtLogger.js';
const logger = mLog.child({ label: "tcpsvr" });
import {getCon} from '../db/db_con1.js';
const port = process.argv[2] ?? 10002;
const svrno = process.argv[3] ?? 0;

const server = new Net.Server();
let con, svrnm ;

server.listen(port, function() {
    if (svrno > 0 ) update_status(svrno) ;
    else logger.info(`Server listening on Port:${port}`);
});

server.on('connection', function(socket) {
    logger.info('A new connection has been established.');

    // The server can also receive data from the client by reading from its socket.
    socket.on('data', function(chunk) {
        logger.info(`Data received from client: ${chunk.toString()}`);
		socket.write('ok');
		socket.write(chunk);
    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    socket.on('end', function() {
        logger.info('Closing connection with the client');
    });

    // Don't forget to catch error, for your own sake.
    socket.on('error', function(err) {
        logger.error(err.message);
    });
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