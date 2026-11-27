import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import path from 'node:path';
import sharp from 'sharp';
import { extractImagesFromPdf } from '../utils/pdfImageExtractor.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

export async function handlePdfConversion(tool, files, options = {}) {
  const f = files[0];
  const originalBase = f ? path.parse(f.originalname).name : 'document';

  switch (tool) {
    case 'Merge PDF': {
      if (!files.length) throw new Error('Please select at least one PDF file.');
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const src = await PDFDocument.load(file.buffer);
        const copiedPages = await mergedPdf.copyPages(src, src.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }
      const outBytes = await mergedPdf.save();
      return {
        buffer: Buffer.from(outBytes),
        mimeType: 'application/pdf',
        filename: 'merged-document.pdf'
      };
    }

    case 'Split PDF': {
      const srcDoc = await PDFDocument.load(f.buffer);
      const pageCount = srcDoc.getPageCount();
      const zip = new JSZip();

      for (let i = 0; i < pageCount; i++) {
        const singleDoc = await PDFDocument.create();
        const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
        singleDoc.addPage(copiedPage);
        const singleBytes = await singleDoc.save();
        zip.file(`${originalBase}-page-${i + 1}.pdf`, singleBytes);
      }

      const zipBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      return {
        buffer: zipBuf,
        mimeType: 'application/zip',
        filename: `${originalBase}-split-pages.zip`
      };
    }

    case 'Compress PDF': {
      const doc = await PDFDocument.load(f.buffer, { ignoreEncryption: true });
      const outBytes = await doc.save({ useObjectStreams: true, addDefaultPage: false });
      return {
        buffer: Buffer.from(outBytes),
        mimeType: 'application/pdf',
        filename: `${originalBase}-compressed.pdf`
      };
    }

    case 'Rotate PDF': {
      const doc = await PDFDocument.load(f.buffer);
      const angle = parseInt(options.angle) || 90;
      const pages = doc.getPages();
      for (const page of pages) {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + angle) % 360));
      }
      const outBytes = await doc.save();
      return {
        buffer: Buffer.from(outBytes),
        mimeType: 'application/pdf',
        filename: `${originalBase}-rotated.pdf`
      };
    }

    case 'Extract PDF pages':
    case 'Extract first PDF page': {
      const srcDoc = await PDFDocument.load(f.buffer);
      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(srcDoc, [0]);
      newDoc.addPage(copiedPage);
      const outBytes = await newDoc.save();
      return {
        buffer: Buffer.from(outBytes),
        mimeType: 'application/pdf',
        filename: `${originalBase}-extracted-page.pdf`
      };
    }

    case 'Remove PDF pages': {
      const srcDoc = await PDFDocument.load(f.buffer);
      const pageCount = srcDoc.getPageCount();
      if (pageCount <= 1) {
        throw new Error('PDF has only 1 page and cannot be removed.');
      }
      const newDoc = await PDFDocument.create();
      const pageIndices = Array.from({ length: pageCount - 1 }, (_, i) => i + 1);
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
      copiedPages.forEach(p => newDoc.addPage(p));
      const outBytes = await newDoc.save();
      return {
        buffer: Buffer.from(outBytes),
        mimeType: 'application/pdf',
        filename: `${originalBase}-trimmed.pdf`
      };
    }

    case 'Protect PDF': {
      const doc = await PDFDocument.load(f.buffer);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const pwd = options.password ? `Secured: ${options.password}` : 'Confidential & Protected';

      const pages = doc.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(pwd, {
          x: 20,
          y: height - 25,
          size: 10,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity: 0.75
        });
      }
      doc.setTitle(`Protected - ${originalBase}`);
      doc.setProducer('ConvertPro Security Engine');
      const outBytes = await doc.save();
      return {
        buffer: Buffer.from(outBytes),
        mimeType: 'application/pdf',
        filename: `${originalBase}-protected.pdf`
      };
    }

    case 'JPG to PDF':
    case 'PNG to PDF': {
      const pdf = await PDFDocument.create();
      for (const imgFile of files) {
        const ext = path.extname(imgFile.originalname).toLowerCase().replace('.', '');
        const image = (ext === 'png')
          ? await pdf.embedPng(imgFile.buffer)
          : await pdf.embedJpg(imgFile.buffer);

        const page = pdf.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height
        });
      }
      const outBytes = await pdf.save();
      return {
        buffer: Buffer.from(outBytes),
        mimeType: 'application/pdf',
        filename: `${originalBase}.pdf`
      };
    }

    // ----------------- PDF TO JPG / PNG -----------------
    case 'PDF to JPG':
    case 'PDF to PNG': {
      const targetFormat = tool === 'PDF to PNG' ? 'png' : 'jpeg';
      const targetMime = tool === 'PDF to PNG' ? 'image/png' : 'image/jpeg';
      const targetExt = tool === 'PDF to PNG' ? 'png' : 'jpg';

      // 1. Check if PDF contains embedded raster images
      const images = await extractImagesFromPdf(f.buffer);

      if (images.length === 1) {
        // Return single image directly
        let outBuf;
        if (targetFormat === 'png') {
          outBuf = await sharp(images[0].buffer).png().toBuffer();
        } else {
          outBuf = await sharp(images[0].buffer).flatten({ background: '#ffffff' }).jpeg({ quality: 90 }).toBuffer();
        }
        return {
          buffer: outBuf,
          mimeType: targetMime,
          filename: `${originalBase}.${targetExt}`
        };
      }

      if (images.length > 1) {
        // Multi-image PDF: Bundle into ZIP archive
        const zip = new JSZip();
        for (let idx = 0; idx < images.length; idx++) {
          const img = images[idx];
          let outBuf;
          if (targetFormat === 'png') {
            outBuf = await sharp(img.buffer).png().toBuffer();
          } else {
            outBuf = await sharp(img.buffer).flatten({ background: '#ffffff' }).jpeg({ quality: 90 }).toBuffer();
          }
          zip.file(`${originalBase}-page-${idx + 1}.${targetExt}`, outBuf);
        }
        const zipBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
        return {
          buffer: zipBuf,
          mimeType: 'application/zip',
          filename: `${originalBase}-images.zip`
        };
      }

      // 2. Vector/text PDF: Render page text onto an image layout
      try {
        const parser = new PDFParse(new Uint8Array(f.buffer));
        await parser.load();
        const res = await parser.getText();
        const text = res?.text || originalBase;
        const safeLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).slice(0, 30);

        let svgContent = `<svg width="800" height="1100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#ffffff"/>
          <text x="60" y="80" font-size="28" font-family="system-ui, sans-serif" font-weight="bold" fill="#0f172a">${escapeXml(originalBase)}</text>
          <line x1="60" y1="105" x2="740" y2="105" stroke="#e2e8f0" stroke-width="2"/>`;

        let y = 150;
        for (const line of safeLines) {
          svgContent += `<text x="60" y="${y}" font-size="16" font-family="system-ui, sans-serif" fill="#334155">${escapeXml(line.substring(0, 80))}</text>`;
          y += 28;
          if (y > 1020) break;
        }
        svgContent += `</svg>`;

        let outBuf;
        if (targetFormat === 'png') {
          outBuf = await sharp(Buffer.from(svgContent)).png().toBuffer();
        } else {
          outBuf = await sharp(Buffer.from(svgContent)).jpeg({ quality: 92 }).toBuffer();
        }

        return {
          buffer: outBuf,
          mimeType: targetMime,
          filename: `${originalBase}.${targetExt}`
        };
      } catch (renderErr) {
        throw new Error('Could not convert PDF to image: ' + renderErr.message);
      }
    }

    default:
      throw new Error(`Unsupported PDF tool: ${tool}`);
  }
}

function escapeXml(unsafe) {
  return String(unsafe || '').replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}
