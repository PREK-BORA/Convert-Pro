import { PDFDocument, PDFName, PDFRawStream } from 'pdf-lib';
import sharp from 'sharp';
import zlib from 'node:zlib';

/**
 * Extract all raster images from a PDF buffer.
 */
export async function extractImagesFromPdf(pdfBuffer) {
  const images = [];
  try {
    const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const objects = doc.context.enumerateIndirectObjects();

    for (const [ref, obj] of objects) {
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
                images.push({
                  buffer: rawJpg,
                  width: meta.width,
                  height: meta.height,
                  format: 'jpeg'
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

                images.push({
                  buffer: pngBuf,
                  width,
                  height,
                  format: 'png'
                });
              }
            }
          } catch (imgErr) {
            console.warn('Skipping unreadable PDF image stream:', imgErr.message);
          }
        }
      }
    }
  } catch (err) {
    console.warn('PDF image extraction error:', err.message);
  }
  return images;
}
