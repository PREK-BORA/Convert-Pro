import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config/config.js';
import conversionRoutes from './routes/conversionRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import downloadRoutes from './routes/downloadRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

const app = express();

// Security and parsing middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'ConvertPro', version: '2.0.0' });
});

// API conversion routes
app.use('/api/convert', conversionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/download', downloadRoutes);

// Static frontend serving
const dist = fileURLToPath(config.frontendDist);
app.use(express.static(dist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(dist, 'index.html'), error => {
    if (error) next();
  });
});

// Global error handling middleware
app.use(errorMiddleware);

app.listen(config.port, () => {
  console.log(`ConvertPro API & Web Application listening on http://localhost:${config.port}`);
});
