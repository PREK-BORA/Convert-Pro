import path from 'node:path';
import { createRequire } from 'node:module';
import zlib from 'node:zlib';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  PageBreak,
  HeadingLevel,
  AlignmentType,
  HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom
} from 'docx';
import mammoth from 'mammoth';
import ExcelJS from 'exceljs';
import pptxgen from 'pptxgenjs';
import { PDFDocument, PDFName, PDFRawStream, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

/**
 * Check if a string contains Khmer Unicode characters.
 */
function isKhmerText(str) {
  return /[\u1780-\u17FF\u19E0-\u19FF]/.test(str || '');
}

/**
 * Clean up, repair ligatures, and normalize Khmer text extracted from PDF streams.
 */
function normalizeKhmerText(str) {
  if (!str) return '';

  let text = str;

  // 1. Remove PDF pagination artifacts like "-- 2 of 51 --"
  text = text.replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '');
  text = text.replace(/--\s*Page\s+\d+.*--/gi, '');

  if (!isKhmerText(text)) {
    return text.trim();
  }

  // 2. Remove space between Khmer digits: e.g. "២ ០ ២ ២" -> "២០២២", "១ ៤" -> "១៤"
  text = text.replace(/([\u17E0-\u17E9])\s+([\u17E0-\u17E9])/g, '$1$2');
  text = text.replace(/([\u17E0-\u17E9])\s+([\u17E0-\u17E9])/g, '$1$2');

  // 3. Remove space around Coeng (្ \u17D2) - crucial for subscript consonants (ជើងអក្សរ)
  text = text.replace(/\s*\u17D2\s*/g, '\u17D2');

  // 4. Remove space between consonant/subscript and dependent vowels (ស្រៈ \u17B6-\u17C5) or diacritics (\u17C6-\u17D3)
  text = text.replace(/([\u1780-\u17B3\u17D2])\s+([\u17B6-\u17D3])/g, '$1$2');
  text = text.replace(/([\u17B6-\u17D3])\s+([\u17B6-\u17D3])/g, '$1$2');
  text = text.replace(/\s+([\u17B6-\u17D3])/g, '$1');

  // 5. Recombine single isolated consonants where PDF advancement inserted a space
  // e.g. "ព ុ ធ" -> "ពុធ", "ទ ី" -> "ទី", "ក ា" -> "កា"
  for (let k = 0; k < 3; k++) {
    text = text.replace(/([\u1780-\u17B3])\s+([\u1780-\u17B3])(?=[\u17D2\u17B6-\u17D3]|\s|$)/g, '$1$2');
  }

  // 6. Normalize excessive spaces while keeping phrase boundaries
  text = text.replace(/[ \t]{3,}/g, '  ');

  return text.trim();
}

/**
 * Robust PDF text and page extractor without default footer/space insertions.
 */
async function extractTextFromPdf(buffer) {
  try {
    const parser = new PDFParse(new Uint8Array(buffer));
    await parser.load();
    const res = await parser.getText({ pageJoiner: '', cellSeparator: '' });
    return {
      text: res?.text || '',
      pages: res?.pages || []
    };
  } catch (err) {
    console.warn('PDF text extraction warning:', err.message);
    return { text: '', pages: [] };
  }
}

/**
 * Extract all raster images organized page-by-page from a PDF buffer.
 */
async function extractImagesByPage(pdfBuffer) {
  const pagesImages = [];
  try {
    const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const pageCount = doc.getPageCount();

    for (let i = 0; i < pageCount; i++) {
      const pageImgs = [];
      const page = doc.getPage(i);
      const res = page.node.Resources();
      const xobj = res?.get(PDFName.of('XObject'));

      if (xobj && xobj.dict) {
        for (const [key, ref] of xobj.dict) {
          const obj = doc.context.lookup(ref);
          if (obj instanceof PDFRawStream) {
            const dict = obj.dict;
            const subtype = dict.get(PDFName.of('Subtype'))?.toString();

            if (subtype === '/Image') {
              const filter = dict.get(PDFName.of('Filter'))?.toString();
              const width = dict.get(PDFName.of('Width'))?.numberValue;
              const height = dict.get(PDFName.of('Height'))?.numberValue;
              const colorSpace = dict.get(PDFName.of('ColorSpace'))?.toString();

              if (!width || !height || width < 16 || height < 16) continue;

              try {
                if (filter === '/DCTDecode') {
                  const rawJpg = Buffer.from(obj.contents);
                  const meta = await sharp(rawJpg).metadata();
                  if (meta && meta.width) {
                    pageImgs.push({
                      buffer: rawJpg,
                      width: meta.width,
                      height: meta.height,
                      isBorder: (meta.height / meta.width > 1.15 && meta.width > 200 && meta.height > 250)
                    });
                  }
                } else if (filter === '/FlateDecode') {
                  const uncompressed = zlib.inflateSync(obj.contents);
                  const channels = (colorSpace === '/DeviceRGB') ? 3 : (colorSpace === '/DeviceGray') ? 1 : 4;
                  if (uncompressed.length >= width * height * channels) {
                    const rawBuffer = uncompressed.subarray(0, width * height * channels);
                    const pngBuf = await sharp(rawBuffer, {
                      raw: {
                        width,
                        height,
                        channels: channels === 1 ? 1 : (channels === 4 ? 4 : 3)
                      }
                    }).png().toBuffer();

                    pageImgs.push({
                      buffer: pngBuf,
                      width,
                      height,
                      isBorder: (height / width > 1.15 && width > 200 && height > 250)
                    });
                  }
                }
              } catch (e) {
                console.warn('Could not extract image stream:', e.message);
              }
            }
          }
        }
      }
      pagesImages.push(pageImgs);
    }
  } catch (err) {
    console.warn('PDF image extraction error:', err.message);
  }
  return pagesImages;
}

/**
 * Text word wrapping helper for PDF document rendering.
 */
function wrapText(text, maxChars = 80) {
  const lines = [];
  const rawLines = text.split(/\r?\n/);
  for (const raw of rawLines) {
    if (raw.length <= maxChars) {
      lines.push(raw);
    } else {
      const words = raw.split(' ');
      let current = '';
      for (const w of words) {
        if ((current + ' ' + w).trim().length <= maxChars) {
          current = (current + ' ' + w).trim();
        } else {
          if (current) lines.push(current);
          current = w;
        }
      }
      if (current) lines.push(current);
    }
  }
  return lines;
}

/**
 * Render plain or structured lines into a multi-page PDF document.
 */
async function renderLinesToPdf(title, lines, landscape = false) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = landscape ? 842 : 595;
  const pageHeight = landscape ? 595 : 842;
  const margin = 50;
  const lineHeight = 16;
  const maxLinesPerPage = Math.floor((pageHeight - margin * 2 - 40) / lineHeight);

  let pageIndex = 0;
  let lineCursor = 0;

  while (lineCursor < lines.length || pageIndex === 0) {
    pageIndex++;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const safeTitle = (title || 'Document').replace(/[^\x20-\x7E]/g, '');
    page.drawText(safeTitle, {
      x: margin,
      y: pageHeight - margin,
      size: 16,
      font: boldFont,
      color: rgb(0.12, 0.23, 0.54)
    });

    page.drawLine({
      start: { x: margin, y: pageHeight - margin - 8 },
      end: { x: pageWidth - margin, y: pageHeight - margin - 8 },
      thickness: 1,
      color: rgb(0.8, 0.85, 0.95)
    });

    let y = pageHeight - margin - 30;
    const chunk = lines.slice(lineCursor, lineCursor + maxLinesPerPage);
    for (const line of chunk) {
      const safeLine = line.replace(/[^\x20-\x7E]/g, '');
      page.drawText(safeLine.substring(0, 110), {
        x: margin,
        y,
        size: 10,
        font,
        color: rgb(0.15, 0.15, 0.2)
      });
      y -= lineHeight;
    }

    page.drawText(`Page ${pageIndex} · Generated by ConvertPro`, {
      x: margin,
      y: margin - 20,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5)
    });

    lineCursor += maxLinesPerPage;
    if (lines.length === 0) break;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function handleDocumentConversion(tool, files, options = {}) {
  const f = files[0];
  const originalBase = path.parse(f.originalname).name;

  switch (tool) {
    // ----------------- PDF TO WORD (DOCX) -----------------
    case 'PDF to Word':
    case 'PDF to DOCX': {
      // 1. Extract text and pages without injected footer artifacts
      const { text, pages } = await extractTextFromPdf(f.buffer);

      // 2. Extract embedded images organized per page
      const imagesByPage = await extractImagesByPage(f.buffer);

      // 3. Detect Khmer script in content
      const containsKhmer = isKhmerText(text) || isKhmerText(originalBase);

      // Complex Script font configuration with Khmer OS Battambang as primary
      // and Leelawadee UI / Khmer OS as system fallbacks
      const fontConfig = containsKhmer ? {
        name: 'Khmer OS Battambang',
        cs: 'Khmer OS Battambang',
        ascii: 'Khmer OS Battambang',
        hAnsi: 'Khmer OS Battambang',
        eastAsia: 'Khmer OS Battambang'
      } : {
        name: 'Segoe UI',
        cs: 'Segoe UI',
        ascii: 'Segoe UI',
        hAnsi: 'Segoe UI'
      };

      const titleSize = containsKhmer ? 38 : 32;     // 19pt for Khmer, 16pt for Latin
      const bodySize = containsKhmer ? 26 : 24;      // 13pt for Khmer so subscript consonants are crisp
      const lineHeight = containsKhmer ? 360 : 280; // 1.5x line height for Khmer diacritics

      const docChildren = [];
      const totalPages = Math.max(pages.length, imagesByPage.length, 1);

      // Process document page by page to mirror original layout
      for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        const rawPageText = pages[pageIdx]?.text || (pageIdx === 0 ? text : '');
        const pageImgs = imagesByPage[pageIdx] || [];

        // Add page break between pages
        if (pageIdx > 0) {
          docChildren.push(
            new Paragraph({
              children: [new PageBreak()]
            })
          );
        }

        // Clean and normalize Khmer text for this page
        const cleanedLines = rawPageText
          .split(/\r?\n/)
          .map(l => normalizeKhmerText(l))
          .filter(Boolean);

        // Check if page has a decorative background border image
        const borderImg = pageImgs.find(img => img.isBorder);
        const contentImgs = pageImgs.filter(img => !img.isBorder);

        // If page has a decorative background border frame, place it behind text
        if (borderImg) {
          docChildren.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: borderImg.buffer,
                  transformation: { width: 520, height: 720 },
                  floating: {
                    horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 40 },
                    verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 40 },
                    behindDocument: true
                  }
                })
              ]
            })
          );
        }

        // Title on first page
        if (pageIdx === 0) {
          let detectedTitle = originalBase;
          if (cleanedLines.length > 0 && cleanedLines[0].length < 120) {
            detectedTitle = cleanedLines[0];
          }

          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: detectedTitle,
                  font: fontConfig,
                  size: titleSize,
                  bold: true,
                  noProof: true, // Disables red spellcheck squiggly lines in Word
                  color: '0F172A'
                })
              ],
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { before: 120, after: 200, line: lineHeight }
            })
          );
        }

        // Render content images for this page (logos, photos, diagrams, signatures)
        if (contentImgs.length > 0) {
          for (const img of contentImgs) {
            const maxWidth = 480;
            const maxHeight = 320;
            let w = img.width;
            let h = img.height;

            if (w > maxWidth) {
              h = Math.round((h * maxWidth) / w);
              w = maxWidth;
            }
            if (h > maxHeight) {
              w = Math.round((w * maxHeight) / h);
              h = maxHeight;
            }

            docChildren.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: img.buffer,
                    transformation: { width: Math.max(w, 40), height: Math.max(h, 30) }
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 150, after: 200 }
              })
            );
          }
        }

        // Group lines into readable paragraphs
        const pageBodyLines = (pageIdx === 0 && cleanedLines.length > 0 && cleanedLines[0].length < 120)
          ? cleanedLines.slice(1)
          : cleanedLines;

        let currentParagraphLines = [];
        const flushParagraph = () => {
          if (currentParagraphLines.length === 0) return;
          const paraText = currentParagraphLines.join(' ');
          const paraIsKhmer = isKhmerText(paraText);

          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: paraText,
                  font: paraIsKhmer ? fontConfig : {
                    name: 'Segoe UI',
                    cs: 'Khmer OS Battambang',
                    ascii: 'Segoe UI',
                    hAnsi: 'Segoe UI'
                  },
                  size: paraIsKhmer ? bodySize : 24,
                  noProof: true, // Disables red wavy lines under Khmer words
                  color: '1E293B'
                })
              ],
              spacing: {
                before: paraIsKhmer ? 60 : 40,
                after: paraIsKhmer ? 160 : 120,
                line: paraIsKhmer ? lineHeight : 280
              }
            })
          );
          currentParagraphLines = [];
        };

        for (let i = 0; i < pageBodyLines.length; i++) {
          const line = pageBodyLines[i];
          if (!line) {
            flushParagraph();
          } else {
            currentParagraphLines.push(line);
            // End of clause or punctuation
            if (line.endsWith('.') || line.endsWith('។') || line.endsWith('៖') || currentParagraphLines.length >= 3) {
              flushParagraph();
            }
          }
        }
        flushParagraph();
      }

      const doc = new Document({
        styles: {
          default: {
            document: {
              run: {
                font: fontConfig,
                size: bodySize,
                noProof: true
              },
              paragraph: {
                spacing: { line: lineHeight }
              }
            }
          }
        },
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          children: docChildren
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      return {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        filename: `${originalBase}.docx`
      };
    }

    // ----------------- WORD TO PDF -----------------
    case 'Word to PDF':
    case 'DOCX to PDF': {
      const result = await mammoth.extractRawText({ buffer: f.buffer });
      const text = result.value || '';
      const lines = wrapText(text, 80);
      const buffer = await renderLinesToPdf(originalBase, lines);
      return {
        buffer,
        mimeType: 'application/pdf',
        filename: `${originalBase}.pdf`
      };
    }

    // ----------------- PDF TO EXCEL -----------------
    case 'PDF to Excel':
    case 'PDF to XLSX': {
      const { text } = await extractTextFromPdf(f.buffer);
      const lines = text.split(/\r?\n/).map(l => normalizeKhmerText(l)).filter(Boolean);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Extracted Data');

      for (const line of lines) {
        const cells = line.split(/\t|\||\s{2,}/).map(c => c.trim()).filter(Boolean);
        if (cells.length > 0) {
          ws.addRow(cells);
        } else {
          ws.addRow([line]);
        }
      }

      if (ws.rowCount > 0) {
        ws.getRow(1).font = { bold: true };
      }

      const buffer = Buffer.from(await wb.xlsx.writeBuffer());
      return {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `${originalBase}.xlsx`
      };
    }

    // ----------------- EXCEL TO PDF -----------------
    case 'Excel to PDF':
    case 'XLSX to PDF': {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(f.buffer);
      const ws = wb.worksheets[0];
      if (!ws) throw new Error('Excel workbook has no readable sheets.');

      const tableLines = [];
      ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        const values = row.values.slice(1).map(v => (v == null ? '' : String(v)));
        tableLines.push(values.join('  |  '));
      });

      const buffer = await renderLinesToPdf(`${originalBase} - Sheet 1`, tableLines, true);
      return {
        buffer,
        mimeType: 'application/pdf',
        filename: `${originalBase}.pdf`
      };
    }

    // ----------------- PDF TO POWERPOINT (PPTX) -----------------
    case 'PDF to PowerPoint':
    case 'PDF to PPTX': {
      const { text, pages } = await extractTextFromPdf(f.buffer);
      const ppt = new pptxgen();
      ppt.layout = 'LAYOUT_16x9';

      const titleSlide = ppt.addSlide();
      titleSlide.background = { color: 'F8FAFC' };
      titleSlide.addText(originalBase, {
        x: 1,
        y: 2,
        w: '80%',
        h: 1.5,
        fontSize: 32,
        bold: true,
        color: '1E293B',
        align: 'center'
      });
      titleSlide.addText('Converted with ConvertPro Presentation Engine', {
        x: 1,
        y: 3.5,
        w: '80%',
        h: 0.8,
        fontSize: 16,
        color: '64748B',
        align: 'center'
      });

      const slideChunks = (pages && pages.length > 0)
        ? pages.map(p => normalizeKhmerText(p.text))
        : text.split(/\f|\n(?=Page \d+)/).map(p => normalizeKhmerText(p)).filter(Boolean);

      const validChunks = slideChunks.length > 0 ? slideChunks : [text || 'Slide Content'];
      validChunks.slice(0, 30).forEach((chunk, idx) => {
        const slide = ppt.addSlide();
        slide.background = { color: 'FFFFFF' };
        slide.addText(`Slide ${idx + 1}`, {
          x: 0.8,
          y: 0.5,
          w: '90%',
          h: 0.6,
          fontSize: 22,
          bold: true,
          color: '2563EB'
        });

        const snippet = chunk.substring(0, 1000);
        slide.addText(snippet, {
          x: 0.8,
          y: 1.4,
          w: '85%',
          h: 4.8,
          fontSize: 14,
          color: '334155',
          lineSpacing: 22
        });
      });

      const buffer = await ppt.write({ outputType: 'nodebuffer' });
      return {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        filename: `${originalBase}.pptx`
      };
    }

    // ----------------- POWERPOINT TO PDF -----------------
    case 'PowerPoint to PDF':
    case 'PPTX to PDF': {
      const zip = await JSZip.loadAsync(f.buffer);
      const slideFiles = Object.keys(zip.files).filter(k => k.startsWith('ppt/slides/slide') && k.endsWith('.xml'));

      const slideContents = [];
      for (const slideKey of slideFiles) {
        const xml = await zip.files[slideKey].async('string');
        const matches = [...xml.matchAll(/<a:t>([^<]+)<\/a:t>/g)].map(m => m[1]);
        slideContents.push(matches.join(' '));
      }

      const lines = [];
      slideContents.forEach((content, i) => {
        lines.push(`=== Slide ${i + 1} ===`);
        wrapText(content, 70).forEach(l => lines.push(l));
        lines.push('');
      });

      const buffer = await renderLinesToPdf(originalBase, lines, true);
      return {
        buffer,
        mimeType: 'application/pdf',
        filename: `${originalBase}.pdf`
      };
    }

    // ----------------- DOCX TO TXT -----------------
    case 'DOCX to TXT': {
      const result = await mammoth.extractRawText({ buffer: f.buffer });
      return {
        buffer: Buffer.from(result.value || '', 'utf8'),
        mimeType: 'text/plain',
        filename: `${originalBase}.txt`
      };
    }

    // ----------------- TXT TO DOCX -----------------
    case 'TXT to DOCX': {
      const raw = f.buffer.toString('utf8');
      const containsKhmer = isKhmerText(raw);
      const fontConfig = containsKhmer ? {
        name: 'Khmer OS Battambang',
        cs: 'Khmer OS Battambang',
        ascii: 'Khmer OS Battambang',
        hAnsi: 'Khmer OS Battambang'
      } : {
        name: 'Segoe UI',
        cs: 'Segoe UI',
        ascii: 'Segoe UI',
        hAnsi: 'Segoe UI'
      };

      const paragraphs = raw.split(/\r?\n/).map(line =>
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: fontConfig,
              size: containsKhmer ? 26 : 24,
              noProof: true
            })
          ],
          spacing: {
            line: containsKhmer ? 360 : 280,
            after: containsKhmer ? 140 : 100
          }
        })
      );

      const doc = new Document({
        sections: [{ properties: {}, children: paragraphs }]
      });

      const buffer = await Packer.toBuffer(doc);
      return {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        filename: `${originalBase}.docx`
      };
    }

    // ----------------- DOCX TO HTML -----------------
    case 'DOCX to HTML': {
      const result = await mammoth.convertToHtml({ buffer: f.buffer });
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${originalBase}</title>
  <style>
    body { font-family: 'Khmer OS Battambang', 'Segoe UI', system-ui, sans-serif; line-height: 1.8; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; }
    th { background: #f1f5f9; }
  </style>
</head>
<body>
  ${result.value}
</body>
</html>`;

      return {
        buffer: Buffer.from(html, 'utf8'),
        mimeType: 'text/html',
        filename: `${originalBase}.html`
      };
    }

    // ----------------- HTML TO DOCX -----------------
    case 'HTML to DOCX': {
      const html = f.buffer.toString('utf8');
      const containsKhmer = isKhmerText(html);
      const fontConfig = containsKhmer ? {
        name: 'Khmer OS Battambang',
        cs: 'Khmer OS Battambang',
        ascii: 'Khmer OS Battambang',
        hAnsi: 'Khmer OS Battambang'
      } : {
        name: 'Segoe UI',
        cs: 'Segoe UI',
        ascii: 'Segoe UI',
        hAnsi: 'Segoe UI'
      };

      const cleanBlocks = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .split(/<\/(?:p|div|h1|h2|h3|h4|li|tr)>/i)
        .map(b => b.replace(/<[^>]+>/g, '').trim())
        .filter(Boolean);

      const paragraphs = cleanBlocks.map(b =>
        new Paragraph({
          children: [
            new TextRun({
              text: b,
              font: fontConfig,
              size: containsKhmer ? 26 : 24,
              noProof: true
            })
          ],
          spacing: {
            line: containsKhmer ? 360 : 280,
            after: containsKhmer ? 140 : 120
          }
        })
      );

      const doc = new Document({
        sections: [{ properties: {}, children: paragraphs }]
      });

      const buffer = await Packer.toBuffer(doc);
      return {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        filename: `${originalBase}.docx`
      };
    }

    // ----------------- CSV TO XLSX -----------------
    case 'CSV to XLSX': {
      const text = f.buffer.toString('utf8');
      const rows = parseCsv(text);
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Sheet1');
      rows.forEach(r => ws.addRow(r));
      const buffer = Buffer.from(await wb.xlsx.writeBuffer());
      return {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `${originalBase}.xlsx`
      };
    }

    // ----------------- XLSX TO CSV -----------------
    case 'XLSX to CSV': {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(f.buffer);
      const ws = wb.worksheets[0];
      if (!ws) throw new Error('Excel workbook contains no sheets.');

      const rows = [];
      ws.eachRow({ includeEmpty: true }, row => {
        const vals = row.values.slice(1).map(v => {
          let s = (v == null) ? '' : String(v);
          return /[",\r\n]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s;
        });
        rows.push(vals.join(','));
      });

      return {
        buffer: Buffer.from(rows.join('\r\n'), 'utf8'),
        mimeType: 'text/csv',
        filename: `${originalBase}.csv`
      };
    }

    // ----------------- XLSX TO HTML -----------------
    case 'XLSX to HTML': {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(f.buffer);
      const ws = wb.worksheets[0];
      if (!ws) throw new Error('Excel workbook contains no sheets.');

      let tableHtml = '<table border="1" style="border-collapse:collapse; width:100%; font-family:sans-serif;">';
      ws.eachRow((row, rowIdx) => {
        tableHtml += '<tr>';
        const vals = row.values.slice(1);
        const tag = (rowIdx === 1) ? 'th' : 'td';
        const style = (rowIdx === 1) ? 'background:#e2e8f0; font-weight:bold; padding:8px;' : 'padding:6px;';
        vals.forEach(v => {
          tableHtml += `<${tag} style="${style}">${v == null ? '' : escapeHtml(String(v))}</${tag}>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</table>';

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${originalBase}</title>
</head>
<body style="padding:20px;">
  <h2>${originalBase}</h2>
  ${tableHtml}
</body>
</html>`;

      return {
        buffer: Buffer.from(fullHtml, 'utf8'),
        mimeType: 'text/html',
        filename: `${originalBase}.html`
      };
    }

    default:
      throw new Error(`Unsupported document tool: ${tool}`);
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [], s = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' && inQuotes && text[i + 1] === '"') {
      s += '"';
      i++;
    } else if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      row.push(s);
      s = '';
    } else if ((c === '\n' || c === '\r') && !inQuotes) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(s);
      rows.push(row);
      row = [];
      s = '';
    } else {
      s += c;
    }
  }
  if (s || row.length) {
    row.push(s);
    rows.push(row);
  }
  return rows;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[m]);
}
