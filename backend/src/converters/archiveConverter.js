import JSZip from 'jszip';
import archiver from 'archiver';
import tar from 'tar-stream';
import path from 'node:path';
import { Readable } from 'node:stream';

export async function handleArchiveConversion(tool, files, options = {}) {
  const f = files[0];
  const originalBase = f ? path.parse(f.originalname).name : 'archive';

  switch (tool) {
    case 'Create ZIP': {
      if (!files.length) throw new Error('Please select at least one file to create an archive.');
      const zip = new JSZip();
      for (const file of files) {
        const safeName = path.basename(file.originalname);
        zip.file(safeName, file.buffer);
      }
      const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      return {
        buffer,
        mimeType: 'application/zip',
        filename: 'convertpro-archive.zip'
      };
    }

    case 'ZIP extract':
    case 'Extract ZIP': {
      const zip = await JSZip.loadAsync(f.buffer, { checkCRC32: true });
      const names = Object.keys(zip.files);
      if (names.length > 500) throw new Error('Archive contains too many entries (max 500).');

      for (const name of names) {
        const safe = path.posix.normalize(name);
        if (safe.startsWith('../') || path.posix.isAbsolute(safe)) {
          throw new Error('Archive contains unsafe paths.');
        }
      }

      const cleanZip = new JSZip();
      for (const name of names) {
        if (!zip.files[name].dir) {
          const entryBuf = await zip.files[name].async('nodebuffer');
          cleanZip.file(name, entryBuf);
        }
      }

      const buffer = await cleanZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      return {
        buffer,
        mimeType: 'application/zip',
        filename: `${originalBase}-extracted.zip`
      };
    }

    case 'TAR to ZIP': {
      const extract = tar.extract();
      const zip = new JSZip();

      await new Promise((resolve, reject) => {
        extract.on('entry', (header, stream, next) => {
          const chunks = [];
          stream.on('data', chunk => chunks.push(chunk));
          stream.on('end', () => {
            if (header.type === 'file') {
              const safeName = path.posix.normalize(header.name).replace(/^(\.\.\/)+/, '');
              zip.file(safeName, Buffer.concat(chunks));
            }
            next();
          });
          stream.resume();
        });

        extract.on('finish', resolve);
        extract.on('error', reject);

        Readable.from(f.buffer).pipe(extract);
      });

      const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      return {
        buffer,
        mimeType: 'application/zip',
        filename: `${originalBase}.zip`
      };
    }

    case 'ZIP to TAR': {
      const zip = await JSZip.loadAsync(f.buffer);
      const names = Object.keys(zip.files);

      const archive = archiver('tar', { gzip: false });
      const chunks = [];

      const tarPromise = new Promise((resolve, reject) => {
        archive.on('data', chunk => chunks.push(chunk));
        archive.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', reject);
      });

      for (const name of names) {
        if (!zip.files[name].dir) {
          const buf = await zip.files[name].async('nodebuffer');
          archive.append(buf, { name });
        }
      }

      await archive.finalize();
      const buffer = await tarPromise;

      return {
        buffer,
        mimeType: 'application/x-tar',
        filename: `${originalBase}.tar`
      };
    }

    default:
      throw new Error(`Unsupported archive tool: ${tool}`);
  }
}
