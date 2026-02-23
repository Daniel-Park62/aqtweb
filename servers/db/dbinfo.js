export default {
      host: process.env.AQTDBIP  ?? 'localhost',
      port: process.env.AQTDBPORT  ||'3306',
      user: process.env.AQTDBUSER || 'aqtusr',
      password: process.env.AQTDBPASS || 'Dawinit1!',
      database: process.env.AQTDBNAME || 'aqtdb'
  };
