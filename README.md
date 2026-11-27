# ConvertPro – All-in-One File Converter

ConvertPro is a modern, responsive, high-performance web application designed to convert between almost all common file formats with full two-way conversion support.

## Key Features

- **True Two-Way Conversions**: Convert back and forth between PDF, Word, Excel, PowerPoint, Images, Video, Audio, and Archives.
- **Real Conversion Engines**: Powered by native libraries (`Sharp`, `pdf-lib`, `docx`, `mammoth`, `ExcelJS`, `pptxgenjs`, `FFmpeg`, `JSZip`, and `archiver`). No fake buttons or mocked transformations.
- **In-Memory & Private**: Files are processed in memory and streamed directly back to the user. No permanent storage or tracking.
- **Universal Drag-and-Drop Hub**: Drop any file onto the home page; ConvertPro automatically detects format and lists valid conversions with custom options.
- **Multi-File Batch Support**: Merge multiple PDFs or pack multiple files into compressed ZIP archives.
- **Responsive UI/UX**: Clean modern interface with blue and purple gradients, animated progress tracking, and full mobile/tablet compatibility.

---

## Supported Conversions

### 1. PDF Tools
- **PDF to Word (DOCX)** & **Word to PDF** (Two-Way)
- **PDF to Excel (XLSX)** & **Excel to PDF** (Two-Way)
- **PDF to PowerPoint (PPTX)** & **PowerPoint to PDF** (Two-Way)
- **Merge PDF** (combine multiple PDF documents)
- **Split PDF** (split pages into individual PDFs packed in a ZIP)
- **Compress PDF** (optimize and reduce file size)
- **Rotate PDF** (90°, 180°, or 270° rotation)
- **Extract & Remove PDF pages**
- **Protect PDF** (custom security permissions & protection watermark)
- **JPG to PDF** & **PNG to PDF** (multi-image document generation)

### 2. Image Converter
- **JPG to PNG** & **PNG to JPG** (Two-Way)
- **JPG to WebP** & **WebP to JPG** (Two-Way)
- **PNG to WebP** & **WebP to PNG** (Two-Way)
- **SVG to PNG** (high-resolution rasterization)
- **BMP to JPG** & **GIF to PNG**
- **Compress images** (mozjpeg & webp quality optimization)
- **Resize images** (custom dimensions with aspect ratio preservation)

### 3. Word & Document Converter
- **DOCX to PDF** & **PDF to DOCX** (Two-Way)
- **DOCX to TXT** & **TXT to DOCX** (Two-Way)
- **DOCX to HTML** & **HTML to DOCX** (Two-Way)

### 4. Excel & Spreadsheet Converter
- **CSV to XLSX** & **XLSX to CSV** (Two-Way)
- **XLSX to PDF** & **PDF to XLSX** (Two-Way)
- **XLSX to HTML** (styled web data tables)

### 5. PowerPoint Converter
- **PDF to PPTX** & **PPTX to PDF** (Two-Way)

### 6. Video Converter (FFmpeg)
- **MP4 to AVI** & **AVI to MP4** (Two-Way)
- **MP4 to MOV** & **MOV to MP4** (Two-Way)
- **MP4 to WebM** (HTML5 web video)
- **Video to MP3** (high-fidelity audio track extraction)
- **Compress video** (smart 720p scaling & CRF 28 optimization)

### 7. Audio Converter (FFmpeg)
- **MP3 to WAV** & **WAV to MP3** (Two-Way)
- **MP3 to AAC** & **AAC to MP3** (Two-Way)
- **MP3 to OGG** & **OGG to MP3** (Two-Way)
- **Audio compression** (bitrate optimization)

### 8. Archive Tools
- **Create ZIP** (pack multiple uploaded files)
- **ZIP extract** (safe in-memory entry extraction)
- **TAR to ZIP** & **ZIP to TAR** (Two-Way)

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/              # Server configuration and environment
│   │   ├── controllers/         # API request controllers
│   │   ├── converters/          # Modular conversion handlers
│   │   │   ├── archiveConverter.js
│   │   │   ├── documentConverter.js
│   │   │   ├── imageConverter.js
│   │   │   ├── mediaConverter.js
│   │   │   └── pdfConverter.js
│   │   ├── middleware/          # Multer file upload & error handlers
│   │   ├── routes/              # Express API route endpoints
│   │   ├── services/            # Main conversion dispatcher
│   │   └── server.js            # Express application entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── converter/       # Universal interactive converter
│   │   ├── pages/               # Home, AllTools, CategoryPages, About, Contact, Privacy, Terms
│   │   ├── App.jsx              # Main router and layout
│   │   ├── index.css            # Modern styling & design system
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── shared/
│   ├── conversionTypes.js       # Complete conversion definitions & reverse mappings
│   └── supportedFormats.js      # Format definitions & upload limits
├── package.json
└── README.md
```

---

## How to Run Locally

### Requirements
- Node.js 18+ (tested on Node v24)
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
Runs both the Vite React frontend (port `5173`) and Express backend (port `4000`) concurrently with hot reloading:
```bash
npm run dev
```
Open your browser at:
- Frontend: **http://localhost:5173**
- Backend API: **http://localhost:4000**

### 3. Production Mode
Builds the static assets and runs the Express server serving both the web application and API on a single port:
```bash
npm run build
npm start
```
Open your browser at:
- **http://localhost:4000**

---

## Security & Privacy

- **In-Memory Streaming**: Conversion inputs and outputs are processed from memory buffers; temporary files are automatically cleaned up immediately.
- **File Validation**: Strict file type validation and a 100 MB per file limit.
- **Archive Path Sanitization**: Prevents directory traversal attacks (`../`) when reading or extracting archives.
