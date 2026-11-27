export function uploadInfo(req,res){res.json({files:(req.files||[]).map(f=>({name:f.originalname,size:f.size,mimeType:f.mimetype}))});}
