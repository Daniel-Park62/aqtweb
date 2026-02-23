import mariadb from 'mariadb';
import config from './dbinfo' ;
const connection = {
  supportBigNumbers: true,
  // host: config.host,
  // port: config.port,
  socketPath: '\\\\.\\pipe.\\MySQL',
  user: config.user,
  dateStrings : true ,
  password: config.password,
  database: config.database
} ;

export default mariadb.createConnection(connection) ;
  

