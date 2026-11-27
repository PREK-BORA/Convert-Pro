import sharp from 'sharp';
import path from 'node:path';
import JSZip from 'jszip';

async function convertSingleImage(tool, file, options = {}) {
  const originalBase = path.parse(path.basename(file.originalname)).name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').slice(0, 150) || 'converted-image';
  const inExt = path.extname(file.originalname).toLowerCase().replace('.', '');

  let pipeline = sharp(file.buffer, { limitInputPixels: 50000000 }).rotate();
  let outBuffer;
  let mimeType = 'image/jpeg';
  let outExt = 'jpg';

  switch (tool) {
    case 'JPG to PNG':
    case 'WebP to PNG':
    case 'SVG to PNG':
    case 'GIF to PNG':
      outBuffer = await pipeline.png({ compressionLevel: 8 }).toBuffer();
      mimeType = 'image/png';
      outExt = 'png';
      break;

    case 'PNG to JPG':
    case 'WebP to JPG':
    case 'BMP to JPG':
      outBuffer = await pipeline.flatten({ background: '#ffffff' }).jpeg({ quality: Math.min(100, Math.max(1, Number(options.quality) || 95)), mozjpeg: true }).toBuffer();
      mimeType = 'image/jpeg';
      outExt = 'jpg';
      break;

    case 'JPG to WebP':
    case 'PNG to WebP':
      outBuffer = await pipeline.webp({ quality: Math.min(100, Math.max(1, Number(options.quality) || 95)) }).toBuffer();
      mimeType = 'image/webp';
      outExt = 'webp';
      break;

    case 'Compress images':
    case 'Compress image': {
      if (inExt === 'png') {
        outBuffer = await pipeline.png({ compressionLevel: 9, quality: 75 }).toBuffer();
        mimeType = 'image/png';
        outExt = 'png';
      } else if (inExt === 'webp') {
        outBuffer = await pipeline.webp({ quality: Math.min(100, Math.max(1, Number(options.quality) || 85)) }).toBuffer();
        mimeType = 'image/webp';
        outExt = 'webp';
      } else {
        outBuffer = await pipeline.jpeg({ quality: Math.min(100, Math.max(1, Number(options.quality) || 85)), mozjpeg: true }).toBuffer();
        mimeType = 'image/jpeg';
        outExt = 'jpg';
      }
      break;
    }

    case 'Resize images':
    case 'Resize image': {
      const width = Math.min(12000, Math.max(1, parseInt(options.width, 10) || 1200));
      const height = Math.min(12000, Math.max(1, parseInt(options.height, 10) || 1200));
      pipeline = pipeline.resize({ width, height, fit: 'inside', withoutEnlargement: true });
      if (inExt === 'png') {
        outBuffer = await pipeline.png().toBuffer();
        mimeType = 'image/png';
        outExt = 'png';
      } else if (inExt === 'webp') {
        outBuffer = await pipeline.webp().toBuffer();
        mimeType = 'image/webp';
        outExt = 'webp';
      } else {
        outBuffer = await pipeline.jpeg().toBuffer();
        mimeType = 'image/jpeg';
        outExt = 'jpg';
      }
      break;
    }

    default:
      throw new Error(`Unsupported image tool: ${tool}`);
  }

  return {
    buffer: outBuffer,
    mimeType,
    filename: `${originalBase}.${outExt}`
  };
}

export async function handleImageConversion(tool, files, options = {}) {
  if (!files || files.length === 0) {
    throw new Error('Please select at least one image file.');
  }

  // Single file conversion
  if (files.length === 1) {
    return await convertSingleImage(tool, files[0], options);
  }

  // Batch multi-image conversion (e.g. 5 PNG files to WebP) -> pack into ZIP
  const zip = new JSZip();
  for (const file of files) {
    const single = await convertSingleImage(tool, file, options);
    zip.file(single.filename, single.buffer);
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  return {
    buffer: zipBuffer,
    mimeType: 'application/zip',
    filename: `converted-images.zip`
  };
}
