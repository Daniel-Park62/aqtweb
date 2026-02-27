import { WebSocketServer } from 'ws';
import trDao from './dao/trDao.js';
import texecjobDao from './dao/texecjobDao.js';
import { exec } from 'child_process';
import { stderr } from 'process';
/**
 * type 1: 대쉬보드의 테스트현황건수 
 * type 2: 실행중인 작업의 진행건수 { kind : [8 or 9]}
 * type 8: 모의서버 시작 exec 수행 { pkey, port }
 * type 9: 모의서버 종료 { procid }
 */

async function dashboard() {
 const rows = await trDao.summary() ;
 return JSON.stringify(rows) ;
}
async function jobing(kind) {
 const rows = await texecjobDao.ing(kind);
 return JSON.stringify(rows) ;
}

function mocksvr(body) {
  exec('npm ls',{cwd : 'F:/AQTAPP/aqtsvr/jsbin'}, (error, stdout, stderr) => {
    if (error) {
      console.error(error) ;
      return;
    }
    console.log('stdout:',stdout) ;
  }) ;

}

function reqProcess(ws, msg) {
  switch ( msg.type ) {
    case 1:
      ws.intl = setInterval( async () => { 
        const rdata = await dashboard() ;
        ws.send(rdata);
      } , 3000);
      break;
    case 2:
      ws.intl = setInterval( async () => { 
        const rdata = await jobing(msg.payload?.kind) ;
        console.log("send data");
        ws.send(rdata);
      } , 3000);
      break;
    case 9:
      mocksvr(msg.payload);
      break;
    default:
      console.log(msg) ;
  }
}
export default (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('클라이언트 연결 ');
    ws.isAlive = true;
    ws.on('error', console.error);
    ws.on('pong', () => ws.isAlive = true );

    ws.on('message', (message) => {
      const msg = JSON.parse(message);
      console.log(`받은 메시지: ${message} -> ${msg}`);
      reqProcess(ws, msg) ;
      // ws.send(`서버 응답: ${message}`); // 에코
    });
    ws.on('close',() => {
      if (ws?.intl) clearInterval(ws.intl);
      console.log('byebye~~');
    })
  });

  const intl = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(intl);
    wss.clients.forEach( ws => ws.terminate() ) ;
  });
} ;