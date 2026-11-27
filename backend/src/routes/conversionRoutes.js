import { Router } from 'express';
import { convert } from '../controllers/conversionController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { conversionTypes, categories } from '../../../shared/conversionTypes.js';

const router = Router();

router.get('/tools', (req, res) => {
  res.json({ tools: conversionTypes, categories });
});

router.post('/', (req, res, next) => {
  upload.array('files', 20)(req, res, error => {
    if (!error) return next();
    return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
      error: error.code === 'LIMIT_FILE_SIZE' ? 'Files must be 100 MB or smaller.' : error.message
    });
  });
}, convert);

export default router;
