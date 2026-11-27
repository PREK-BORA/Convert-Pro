import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import ffmpegPath from 'ffmpeg-static';

/**
 * Execute FFmpeg process with input and output files, returning the output buffer.
 */
async function runFfmpeg(inputBuffer, inputExt, outputExt, ffmpegArgs) {
  const runId = crypto.randomUUID();
  const tmpDir = os.tmpdir();
  const inPath = path.join(tmpDir, `conv_in_${runId}.${inputExt}`);
  const outPath = path.join(tmpDir, `conv_out_${runId}.${outputExt}`);

  await fs.writeFile(inPath, inputBuffer);

  try {
    const args = ['-y', '-i', inPath, ...ffmpegArgs, outPath];

    await new Promise((resolve, reject) => {
      const proc = spawn(ffmpegPath, args);
      let stderr = '';

      proc.stderr.on('data', d => {
        stderr += d.toString();
      });

      proc.on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg failed (code ${code}): ${stderr.slice(-300)}`));
        }
      });

      proc.on('error', err => reject(err));
    });

    const outBuffer = await fs.readFile(outPath);
    return outBuffer;
  } finally {
    // Guaranteed automatic cleanup of temporary files
    await fs.unlink(inPath).catch(() => {});
    await fs.unlink(outPath).catch(() => {});
  }
}

export async function handleMediaConversion(tool, files, options = {}) {
  const f = files[0];
  const originalBase = path.parse(f.originalname).name;
  const inExt = path.extname(f.originalname).toLowerCase().replace('.', '') || 'bin';

  let outExt = 'mp4';
  let mimeType = 'video/mp4';
  let ffmpegArgs = [];

  switch (tool) {
    // ----------------- VIDEO CONVERSIONS -----------------
    case 'MP4 to AVI':
      outExt = 'avi';
      mimeType = 'video/x-msvideo';
      ffmpegArgs = ['-c:v', 'mpeg4', '-vtag', 'xvid', '-qscale:v', '3', '-c:a', 'mp3'];
      break;

    case 'AVI to MP4':
    case 'MOV to MP4':
      outExt = 'mp4';
      mimeType = 'video/mp4';
      ffmpegArgs = ['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-movflags', '+faststart'];
      break;

    case 'MP4 to MOV':
      outExt = 'mov';
      mimeType = 'video/quicktime';
      ffmpegArgs = ['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac'];
      break;

    case 'MP4 to WebM':
      outExt = 'webm';
      mimeType = 'video/webm';
      ffmpegArgs = ['-c:v', 'libvpx', '-crf', '10', '-b:v', '1M', '-c:a', 'libvorbis'];
      break;

    case 'Video to MP3':
      outExt = 'mp3';
      mimeType = 'audio/mpeg';
      ffmpegArgs = ['-vn', '-acodec', 'libmp3lame', '-b:a', '192k'];
      break;

    case 'Compress video':
      outExt = 'mp4';
      mimeType = 'video/mp4';
      ffmpegArgs = [
        '-c:v', 'libx264',
        '-preset', 'faster',
        '-crf', '28',
        '-vf', 'scale=-2:min(ih\\,720)',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart'
      ];
      break;

    // ----------------- AUDIO CONVERSIONS -----------------
    case 'MP3 to WAV':
      outExt = 'wav';
      mimeType = 'audio/wav';
      ffmpegArgs = ['-vn', '-acodec', 'pcm_s16le', '-ar', '44100'];
      break;

    case 'WAV to MP3':
    case 'AAC to MP3':
    case 'OGG to MP3':
      outExt = 'mp3';
      mimeType = 'audio/mpeg';
      ffmpegArgs = ['-vn', '-acodec', 'libmp3lame', '-b:a', '256k'];
      break;

    case 'MP3 to AAC':
      outExt = 'aac';
      mimeType = 'audio/aac';
      ffmpegArgs = ['-vn', '-c:a', 'aac', '-b:a', '192k'];
      break;

    case 'MP3 to OGG':
      outExt = 'ogg';
      mimeType = 'audio/ogg';
      ffmpegArgs = ['-vn', '-c:a', 'libvorbis', '-q:a', '4'];
      break;

    case 'Audio compression':
      outExt = 'mp3';
      mimeType = 'audio/mpeg';
      ffmpegArgs = ['-vn', '-c:a', 'libmp3lame', '-b:a', '96k'];
      break;

    default:
      throw new Error(`Unsupported media tool: ${tool}`);
  }

  const buffer = await runFfmpeg(f.buffer, inExt, outExt, ffmpegArgs);

  return {
    buffer,
    mimeType,
    filename: `${originalBase}.${outExt}`
  };
}
