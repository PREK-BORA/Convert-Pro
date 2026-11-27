import { handleImageConversion } from '../converters/imageConverter.js';
import { handlePdfConversion } from '../converters/pdfConverter.js';
import { handleDocumentConversion } from '../converters/documentConverter.js';
import { handleMediaConversion } from '../converters/mediaConverter.js';
import { handleArchiveConversion } from '../converters/archiveConverter.js';
import { conversionTypes } from '../../../shared/conversionTypes.js';
import path from 'node:path';

const imageTools = [
  'JPG to PNG', 'PNG to JPG', 'JPG to WebP', 'WebP to JPG',
  'PNG to WebP', 'WebP to PNG', 'SVG to PNG', 'BMP to JPG',
  'GIF to PNG', 'Compress images', 'Compress image', 'Resize images', 'Resize image'
];

const pdfTools = [
  'Merge PDF', 'Split PDF', 'Compress PDF', 'Rotate PDF',
  'Extract PDF pages', 'Extract first PDF page', 'Remove PDF pages',
  'Protect PDF', 'JPG to PDF', 'PNG to PDF'
];

const documentTools = [
  'PDF to Word', 'PDF to DOCX', 'Word to PDF', 'DOCX to PDF',
  'PDF to Excel', 'PDF to XLSX', 'Excel to PDF', 'XLSX to PDF',
  'PDF to PowerPoint', 'PDF to PPTX', 'PowerPoint to PDF', 'PPTX to PDF',
  'DOCX to TXT', 'TXT to DOCX', 'DOCX to HTML', 'HTML to DOCX',
  'CSV to XLSX', 'XLSX to CSV', 'XLSX to HTML'
];

const mediaTools = [
  'MP4 to AVI', 'AVI to MP4', 'MP4 to MOV', 'MOV to MP4',
  'MP4 to WebM', 'Video to MP3', 'Compress video',
  'MP3 to WAV', 'WAV to MP3', 'MP3 to AAC', 'AAC to MP3',
  'MP3 to OGG', 'OGG to MP3', 'Audio compression'
];

const archiveTools = [
  'Create ZIP', 'ZIP extract', 'Extract ZIP', 'TAR to ZIP', 'ZIP to TAR'
];

function safeDownloadName(value) {
  return path.basename(value || 'converted-file').replace(/[\r\n"\\]/g, '_');
}

export async function convert(req, res) {
  let tool = req.body.tool;
  const files = req.files || [];

  if (!tool) {
    return res.status(400).json({ error: 'Please choose a conversion tool.' });
  }

  // Allow lookup by ID as well as Name
  const matchedType = conversionTypes.find(t => t.id === tool || t.name.toLowerCase() === tool.toLowerCase());
  if (matchedType) {
    tool = matchedType.name;
  }

  if (!files.length) {
    return res.status(400).json({ error: 'Please select a file to convert.' });
  }

  try {
    let result;

    if (imageTools.includes(tool)) {
      result = await handleImageConversion(tool, files, req.body);
    } else if (pdfTools.includes(tool)) {
      result = await handlePdfConversion(tool, files, req.body);
    } else if (documentTools.includes(tool)) {
      result = await handleDocumentConversion(tool, files, req.body);
    } else if (mediaTools.includes(tool)) {
      result = await handleMediaConversion(tool, files, req.body);
    } else if (archiveTools.includes(tool)) {
      result = await handleArchiveConversion(tool, files, req.body);
    } else {
      return res.status(400).json({
        error: `Tool '${tool}' is not currently enabled on this server.`
      });
    }

    if (!result || !result.buffer) {
      throw new Error('Conversion produced an empty file.');
    }

    const filename = safeDownloadName(result.filename);
    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Content-Length': String(result.buffer.length),
      'Cache-Control': 'no-store',
      'Access-Control-Expose-Headers': 'Content-Disposition'
    });

    return res.send(result.buffer);
  } catch (err) {
    console.error(`Conversion error for [${tool}]:`, err);
    return res.status(422).json({
      error: 'Conversion failed. Check that the file is valid and supported, then try again.'
    });
  }
}
