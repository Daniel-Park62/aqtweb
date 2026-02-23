import {createPool} from 'mariadb';
import config from './dbinfo.js';

const pool = createPool({
//      host: config.host,
//      port: config.port,
      socketPath: '\\\\.\\pipe.\\MySQL',
      user: config.user,
      password: config.password,
      database: config.database,
      connectionLimit: 3,
      dateStrings : true ,
      bigIntAsNumber: true,
      insertIdAsNumber : true,
      decimalAsNumber : true,
      multipleStatements:true,
      validationQuery : 'select 1',
      testWhileIdle : true,
      timeBetweenEvictionRunsMillis: 1800000
    
}) ;

export default pool ;
