import multer from 'multer';
import path from 'node:path';
import { config } from '../config/config.js';

// Keep uploads aligned with the formats advertised in shared/supportedFormats.js
// and conversionTypes.js. MIME headers supplied by browsers are not trusted.
const allowed = /\.(png|jpe?g|webp|bmp|gif|svg|pdf|docx|txt|html|csv|xlsx|pptx|mp4|avi|mov|webm|mkv|flv|mp3|wav|aac|ogg|m4a|flac|zip|tar)$/i;
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: config.uploadLimit, files: config.maxFiles, fields: 20 },
  fileFilter(req, file, done) {
    const valid = allowed.test(path.basename(file.originalname));
    done(valid ? null : new Error('This file type is not accepted.'), valid);
  }
});
