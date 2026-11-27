export function errorMiddleware(error,req,res,next){console.error(error);if(res.headersSent)return next(error);res.status(500).json({error:'The server could not process this request.'});}
