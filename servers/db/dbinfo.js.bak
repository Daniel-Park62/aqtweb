const configs = {
    local: { // localhost
      host: process.env.AQTDBIP  ?? 'localhost',
      port: process.env.AQTDBPORT  ||'3306',
      user: process.env.AQTDBUSER || 'aqtusr',
      password: process.env.AQTDBPASS || 'Dawinit1!',
      database: process.env.AQTDBNAME || 'aqtdb',
      socketPath: '\\\\.\\pipe.\\MySQL',
    },
    real: { // real server db info
      host: process.env.AQTDBIP  ?? '172.22.160.1',
      port: process.env.AQTDBPORT  ||'3306',
      user: process.env.AQTDBUSER || 'aqtusr',
      password: process.env.AQTDBPASS || 'Dawinit1!',
      database: process.env.AQTDBNAME || 'aqtdb'
    },
    dev: { // dev server db info
      host: process.env.AQTDBIP  ?? 'localhost',
      port: process.env.AQTDBPORT  ||'3306',
      user: process.env.AQTDBUSER || 'aqtusr',
      password: process.env.AQTDBPASS || 'Dawinit1!',
      database: process.env.AQTDBNAME || 'aqtdb'
    }
  };
export default configs.real ;
