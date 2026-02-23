function notFound(req, res, next) {
  res.status(404).send(`🔍 - Not Found -> ${req.originalUrl}` );
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  
  res.locals.aqtlog(`:${req.originalUrl}:`, err.message);
  res.status(501) ;
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
}

export  {
  notFound ,
  errorHandler ,
}
