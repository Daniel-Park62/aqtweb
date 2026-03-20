// error: 0 , warn: 1 , info: 2 , http: 3 , verbose: 4 , debug: 5 , silly: 6 

import {createLogger,format,transports } from 'winston';
import winstonDaily from 'winston-daily-rotate-file';

const logDir =  process.env.AQTLOG || './logs' ;  // logs 디렉토리 하위에 로그 파일 저장
const { combine, timestamp, label, printf } = format;
// console.log(logDir);
// Define log format
const logFormat = printf( ({timestamp,level, label,message} ) => {
  let msg = `${timestamp} [${label}] ${level}: ${message}`;
//  if (Object.keys(meta).length>0) msg += ` ${JSON.stringify(meta)}` ;
  return msg;
});
 
/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = createLogger({
//  label:'AQT',
  format: combine( timestamp({format: 'YYYY-MM-DD HH:mm:ss'}), logFormat  ),
  transports: [
    // info 레벨 로그를 저장할 파일 설정
    new winstonDaily({
      level: 'info',
      datePattern: 'YYYYMMDD',
      dirname: logDir,
      filename: "aqtW%DATE%.log",
      maxFiles: 30,  // 30일치 로그 파일 저장
      maxSize:"10m",
//      zippedArchive: true, 
    }),
    // error 레벨 로그를 저장할 파일 설정
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYYMMDD',
      dirname: logDir ,  // error.log 파일은 /logs/error 하위에 저장 
      filename: "aqtW%DATE%.error.log",
      maxSize:"10m",
      maxFiles: 30,
//      zippedArchive: true,
    }),
  ],
  exceptionHandlers: [
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYYMMDD',
      dirname: logDir ,  // error.log 파일은 /logs/error 하위에 저장 
      filename: "aqtW%DATE%.exception.log",
      maxSize:"10m",
      maxFiles: 30,
//      zippedArchive: true,
    })
  ]
});
 
// Production 환경이 아닌 경우(dev 등) 
if (process.env.NODE_ENV !== 'prod' ) {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),  // 색깔 넣어서 출력
      logFormat
    )
  }));
}
 
export default logger;