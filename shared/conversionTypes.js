/**
 * Comprehensive catalog of supported conversions in ConvertPro.
 * Supports two-way conversions wherever technically possible.
 */
export const categories = [
  { id: 'pdf', name: 'PDF Tools', desc: 'Convert, merge, split, compress, and secure PDF documents', icon: 'FileText', color: 'rose' },
  { id: 'image', name: 'Image Converter', desc: 'JPG, PNG, WebP, SVG, BMP, GIF, resize & compress', icon: 'FileImage', color: 'violet' },
  { id: 'document', name: 'Word & Docs', desc: 'DOCX, PDF, TXT, HTML two-way document conversions', icon: 'FileCode2', color: 'blue' },
  { id: 'spreadsheet', name: 'Excel & Sheets', desc: 'XLSX, CSV, PDF, and HTML spreadsheet conversions', icon: 'FileSpreadsheet', color: 'emerald' },
  { id: 'presentation', name: 'PowerPoint', desc: 'PPTX to PDF, PDF to PPTX presentation converters', icon: 'Presentation', color: 'amber' },
  { id: 'video', name: 'Video Converter', desc: 'MP4, AVI, MOV, WebM, audio extraction & compression', icon: 'Film', color: 'indigo' },
  { id: 'audio', name: 'Audio Converter', desc: 'MP3, WAV, AAC, OGG conversion and audio compression', icon: 'AudioLines', color: 'pink' },
  { id: 'archive', name: 'Archive Tools', desc: 'ZIP create, extract, TAR to ZIP & ZIP to TAR', icon: 'FileArchive', color: 'cyan' },
];

export const conversionTypes = [
  // ----------------- PDF CONVERTER -----------------
  {
    id: 'pdf-to-docx',
    name: 'PDF to Word',
    input: 'pdf',
    output: 'docx',
    category: 'pdf',
    desc: 'Convert PDF document to an editable Microsoft Word DOCX file',
    twoWayId: 'docx-to-pdf',
    popular: true
  },
  {
    id: 'docx-to-pdf',
    name: 'Word to PDF',
    input: 'docx',
    output: 'pdf',
    category: 'pdf',
    desc: 'Convert Microsoft Word DOCX documents into clean PDF files',
    twoWayId: 'pdf-to-docx',
    popular: true
  },
  {
    id: 'pdf-to-xlsx',
    name: 'PDF to Excel',
    input: 'pdf',
    output: 'xlsx',
    category: 'pdf',
    desc: 'Extract tables and data from PDF into an Excel XLSX spreadsheet',
    twoWayId: 'xlsx-to-pdf',
    popular: true
  },
  {
    id: 'xlsx-to-pdf',
    name: 'Excel to PDF',
    input: 'xlsx',
    output: 'pdf',
    category: 'pdf',
    desc: 'Convert Excel spreadsheets into a printable, formatted PDF',
    twoWayId: 'pdf-to-xlsx',
    popular: true
  },
  {
    id: 'pdf-to-pptx',
    name: 'PDF to PowerPoint',
    input: 'pdf',
    output: 'pptx',
    category: 'pdf',
    desc: 'Convert PDF pages into PowerPoint PPTX presentation slides',
    twoWayId: 'pptx-to-pdf',
    popular: true
  },
  {
    id: 'pptx-to-pdf',
    name: 'PowerPoint to PDF',
    input: 'pptx',
    output: 'pdf',
    category: 'pdf',
    desc: 'Convert PowerPoint presentations into shareable PDF documents',
    twoWayId: 'pdf-to-pptx',
    popular: true
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    input: 'pdf',
    output: 'pdf',
    category: 'pdf',
    multi: true,
    desc: 'Combine multiple PDF documents into a single unified file',
    popular: true
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    input: 'pdf',
    output: 'zip',
    category: 'pdf',
    desc: 'Split each page of a PDF into individual files packed in a ZIP',
    popular: true
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    input: 'pdf',
    output: 'pdf',
    category: 'pdf',
    desc: 'Optimize and reduce PDF file size while retaining document quality',
    popular: true
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    input: 'pdf',
    output: 'pdf',
    category: 'pdf',
    desc: 'Rotate PDF pages by 90, 180, or 270 degrees',
    options: [{ name: 'angle', label: 'Rotation', type: 'select', choices: ['90', '180', '270'], default: '90' }]
  },
  {
    id: 'extract-first-page',
    name: 'Extract PDF pages',
    input: 'pdf',
    output: 'pdf',
    category: 'pdf',
    desc: 'Extract individual pages from your PDF document'
  },
  {
    id: 'remove-pdf-pages',
    name: 'Remove PDF pages',
    input: 'pdf',
    output: 'pdf',
    category: 'pdf',
    desc: 'Remove unnecessary pages from your PDF file'
  },
  {
    id: 'protect-pdf',
    name: 'Protect PDF',
    input: 'pdf',
    output: 'pdf',
    category: 'pdf',
    desc: 'Secure your PDF file with custom security and encryption',
    options: [{ name: 'password', label: 'Password', type: 'text', default: '' }]
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    input: 'jpg',
    output: 'pdf',
    category: 'pdf',
    multi: true,
    desc: 'Turn JPG photos and images into a single PDF document',
    popular: true
  },
  {
    id: 'png-to-pdf',
    name: 'PNG to PDF',
    input: 'png',
    output: 'pdf',
    category: 'pdf',
    multi: true,
    desc: 'Convert transparent or crisp PNG graphics into a PDF document'
  },

  // ----------------- IMAGE CONVERTER -----------------
  {
    id: 'jpg-to-png',
    name: 'JPG to PNG',
    input: 'jpg',
    output: 'png',
    category: 'image',
    desc: 'Convert JPG images to lossless PNG format with transparent support',
    twoWayId: 'png-to-jpg',
    popular: true
  },
  {
    id: 'png-to-jpg',
    name: 'PNG to JPG',
    input: 'png',
    output: 'jpg',
    category: 'image',
    desc: 'Convert PNG graphics to standard lightweight JPG images',
    twoWayId: 'jpg-to-png',
    popular: true
  },
  {
    id: 'jpg-to-webp',
    name: 'JPG to WebP',
    input: 'jpg',
    output: 'webp',
    category: 'image',
    desc: 'Convert JPG into modern next-gen WebP format for fast web loading',
    twoWayId: 'webp-to-jpg',
    popular: true
  },
  {
    id: 'webp-to-jpg',
    name: 'WebP to JPG',
    input: 'webp',
    output: 'jpg',
    category: 'image',
    desc: 'Convert modern WebP images into universally compatible JPG files',
    twoWayId: 'jpg-to-webp'
  },
  {
    id: 'png-to-webp',
    name: 'PNG to WebP',
    input: 'png',
    output: 'webp',
    category: 'image',
    desc: 'Convert PNG to high-efficiency WebP preserving alpha transparency',
    twoWayId: 'webp-to-png',
    popular: true
  },
  {
    id: 'webp-to-png',
    name: 'WebP to PNG',
    input: 'webp',
    output: 'png',
    category: 'image',
    desc: 'Convert WebP images back into full-resolution PNG format',
    twoWayId: 'png-to-webp'
  },
  {
    id: 'svg-to-png',
    name: 'SVG to PNG',
    input: 'svg',
    output: 'png',
    category: 'image',
    desc: 'Rasterize vector SVG files into crisp, high-resolution PNG images'
  },
  {
    id: 'bmp-to-jpg',
    name: 'BMP to JPG',
    input: 'bmp',
    output: 'jpg',
    category: 'image',
    desc: 'Convert uncompressed BMP bitmaps into compressed JPG files'
  },
  {
    id: 'gif-to-png',
    name: 'GIF to PNG',
    input: 'gif',
    output: 'png',
    category: 'image',
    desc: 'Extract clean high-quality static frames from GIF files into PNG'
  },
  {
    id: 'compress-image',
    name: 'Compress images',
    input: 'image',
    output: 'jpg',
    category: 'image',
    desc: 'Significantly reduce image size without perceptible loss in visual quality',
    popular: true
  },
  {
    id: 'resize-image',
    name: 'Resize images',
    input: 'image',
    output: 'image',
    category: 'image',
    desc: 'Resize image dimensions cleanly to fit web and display requirements'
  },

  // ----------------- WORD CONVERTER -----------------
  {
    id: 'docx-to-txt',
    name: 'DOCX to TXT',
    input: 'docx',
    output: 'txt',
    category: 'document',
    desc: 'Extract clean plain text from Microsoft Word DOCX files',
    twoWayId: 'txt-to-docx'
  },
  {
    id: 'txt-to-docx',
    name: 'TXT to DOCX',
    input: 'txt',
    output: 'docx',
    category: 'document',
    desc: 'Transform plain text files into formatted Microsoft Word documents',
    twoWayId: 'docx-to-txt'
  },
  {
    id: 'docx-to-html',
    name: 'DOCX to HTML',
    input: 'docx',
    output: 'html',
    category: 'document',
    desc: 'Convert Word documents into clean, semantic HTML web pages',
    twoWayId: 'html-to-docx'
  },
  {
    id: 'html-to-docx',
    name: 'HTML to DOCX',
    input: 'html',
    output: 'docx',
    category: 'document',
    desc: 'Convert HTML code and web pages into Microsoft Word DOCX files',
    twoWayId: 'docx-to-html'
  },

  // ----------------- EXCEL CONVERTER -----------------
  {
    id: 'csv-to-xlsx',
    name: 'CSV to XLSX',
    input: 'csv',
    output: 'xlsx',
    category: 'spreadsheet',
    desc: 'Convert CSV data tables into full Microsoft Excel XLSX workbooks',
    twoWayId: 'xlsx-to-csv',
    popular: true
  },
  {
    id: 'xlsx-to-csv',
    name: 'XLSX to CSV',
    input: 'xlsx',
    output: 'csv',
    category: 'spreadsheet',
    desc: 'Export Excel worksheets into universal lightweight CSV text format',
    twoWayId: 'csv-to-xlsx',
    popular: true
  },
  {
    id: 'xlsx-to-html',
    name: 'XLSX to HTML',
    input: 'xlsx',
    output: 'html',
    category: 'spreadsheet',
    desc: 'Convert Excel spreadsheets into styled HTML data tables'
  },

  // ----------------- VIDEO CONVERTER -----------------
  {
    id: 'mp4-to-avi',
    name: 'MP4 to AVI',
    input: 'mp4',
    output: 'avi',
    category: 'video',
    desc: 'Convert MP4 video clips into standard AVI media container format',
    twoWayId: 'avi-to-mp4'
  },
  {
    id: 'avi-to-mp4',
    name: 'AVI to MP4',
    input: 'avi',
    output: 'mp4',
    category: 'video',
    desc: 'Convert AVI videos into modern, universally playable MP4 format',
    twoWayId: 'mp4-to-avi',
    popular: true
  },
  {
    id: 'mp4-to-mov',
    name: 'MP4 to MOV',
    input: 'mp4',
    output: 'mov',
    category: 'video',
    desc: 'Convert MP4 video files into Apple QuickTime MOV format',
    twoWayId: 'mov-to-mp4'
  },
  {
    id: 'mov-to-mp4',
    name: 'MOV to MP4',
    input: 'mov',
    output: 'mp4',
    category: 'video',
    desc: 'Convert Apple MOV videos into web-standard MP4 format',
    twoWayId: 'mp4-to-mov',
    popular: true
  },
  {
    id: 'mp4-to-webm',
    name: 'MP4 to WebM',
    input: 'mp4',
    output: 'webm',
    category: 'video',
    desc: 'Convert MP4 videos into open-source HTML5 WebM format for websites'
  },
  {
    id: 'video-to-mp3',
    name: 'Video to MP3',
    input: 'video',
    output: 'mp3',
    category: 'video',
    desc: 'Extract high-fidelity audio tracks from MP4, AVI, MOV, or MKV videos',
    popular: true
  },
  {
    id: 'compress-video',
    name: 'Compress video',
    input: 'video',
    output: 'mp4',
    category: 'video',
    desc: 'Reduce video file size substantially while preserving visual clarity',
    popular: true
  },

  // ----------------- AUDIO CONVERTER -----------------
  {
    id: 'mp3-to-wav',
    name: 'MP3 to WAV',
    input: 'mp3',
    output: 'wav',
    category: 'audio',
    desc: 'Convert compressed MP3 audio into uncompressed PCM WAV audio',
    twoWayId: 'wav-to-mp3',
    popular: true
  },
  {
    id: 'wav-to-mp3',
    name: 'WAV to MP3',
    input: 'wav',
    output: 'mp3',
    category: 'audio',
    desc: 'Convert uncompressed WAV recordings into lightweight MP3 audio',
    twoWayId: 'mp3-to-wav',
    popular: true
  },
  {
    id: 'mp3-to-aac',
    name: 'MP3 to AAC',
    input: 'mp3',
    output: 'aac',
    category: 'audio',
    desc: 'Convert MP3 songs and recordings into advanced AAC audio format',
    twoWayId: 'aac-to-mp3'
  },
  {
    id: 'aac-to-mp3',
    name: 'AAC to MP3',
    input: 'aac',
    output: 'mp3',
    category: 'audio',
    desc: 'Convert AAC audio into universal MP3 format for any media player',
    twoWayId: 'mp3-to-aac'
  },
  {
    id: 'mp3-to-ogg',
    name: 'MP3 to OGG',
    input: 'mp3',
    output: 'ogg',
    category: 'audio',
    desc: 'Convert MP3 audio into patent-free OGG Vorbis audio streams',
    twoWayId: 'ogg-to-mp3'
  },
  {
    id: 'ogg-to-mp3',
    name: 'OGG to MP3',
    input: 'ogg',
    output: 'mp3',
    category: 'audio',
    desc: 'Convert OGG Vorbis files back into standard MP3 format',
    twoWayId: 'mp3-to-ogg'
  },
  {
    id: 'compress-audio',
    name: 'Audio compression',
    input: 'audio',
    output: 'mp3',
    category: 'audio',
    desc: 'Optimize audio bitrates to reduce MP3 or WAV file sizes',
    popular: true
  },

  // ----------------- ARCHIVE CONVERTER -----------------
  {
    id: 'create-zip',
    name: 'Create ZIP',
    input: 'files',
    output: 'zip',
    category: 'archive',
    multi: true,
    desc: 'Pack and compress multiple files into a single ZIP archive',
    popular: true
  },
  {
    id: 'extract-zip',
    name: 'ZIP extract',
    input: 'zip',
    output: 'zip',
    category: 'archive',
    desc: 'Inspect and extract clean uncompressed files from ZIP archives',
    popular: true
  },
  {
    id: 'tar-to-zip',
    name: 'TAR to ZIP',
    input: 'tar',
    output: 'zip',
    category: 'archive',
    desc: 'Convert Unix TAR archives into standard Windows/Mac ZIP files',
    twoWayId: 'zip-to-tar'
  },
  {
    id: 'zip-to-tar',
    name: 'ZIP to TAR',
    input: 'zip',
    output: 'tar',
    category: 'archive',
    desc: 'Convert standard ZIP archives into Unix/Linux TAR archives',
    twoWayId: 'tar-to-zip'
  }
];

/**
 * Returns available conversion tools for a given input file extension.
 */
export function getToolsForExtension(ext) {
  if (!ext) return [];
  const clean = ext.toLowerCase().replace(/^\./, '');
  
  const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'];
  const videoExts = ['mp4', 'avi', 'mov', 'webm', 'mkv', 'flv'];
  const audioExts = ['mp3', 'wav', 'aac', 'ogg', 'm4a', 'flac'];

  return conversionTypes.filter(tool => {
    if (tool.input === clean) return true;
    if (tool.input === 'jpg' && (clean === 'jpg' || clean === 'jpeg')) return true;
    if (tool.input === 'image' && imageExts.includes(clean)) return true;
    if (tool.input === 'video' && videoExts.includes(clean)) return true;
    if (tool.input === 'audio' && audioExts.includes(clean)) return true;
    if (tool.input === 'files') return true;
    return false;
  });
}
