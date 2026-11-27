export function validateFile(req,res,next){if(!req.files?.length)return res.status(400).json({error:'Choose a file to convert.'});next();}
