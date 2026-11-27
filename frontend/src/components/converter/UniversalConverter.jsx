import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  UploadCloud,
  FileText,
  FileImage,
  Film,
  AudioLines,
  FileArchive,
  FileSpreadsheet,
  FileCode2,
  Presentation,
  CheckCircle2,
  AlertCircle,
  Download,
  RotateCcw,
  X,
  ArrowRight,
  RefreshCw,
  Sliders,
  Lock
} from 'lucide-react';
import { conversionTypes, getToolsForExtension } from '../../../../shared/conversionTypes.js';

const iconMap = {
  pdf: FileText,
  image: FileImage,
  document: FileCode2,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  video: Film,
  audio: AudioLines,
  archive: FileArchive
};

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function UniversalConverter({ initialTool, onResetTool }) {
  const [files, setFiles] = useState([]);
  const [selectedTool, setSelectedTool] = useState(initialTool || null);
  const [availableTools, setAvailableTools] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  // Custom tool options
  const [options, setOptions] = useState({
    angle: '90',
    password: '',
    width: '1200',
    height: '1200'
  });

  const fileInputRef = useRef(null);

  // Sync initialTool prop if changed from parent
  useEffect(() => {
    if (initialTool) {
      setSelectedTool(initialTool);
      setResult(null);
      setError('');
    }
  }, [initialTool]);

  // When files change, detect available conversion tools
  useEffect(() => {
    if (files.length > 0) {
      const firstExt = files[0].name.split('.').pop().toLowerCase();
      const matched = getToolsForExtension(firstExt);
      setAvailableTools(matched);

      // If user had not chosen a tool or current tool doesn't match new file, pick first valid
      if (!selectedTool || !matched.some(t => t.id === selectedTool.id)) {
        if (matched.length > 0) {
          setSelectedTool(matched[0]);
        }
      }
    } else {
      if (!initialTool) {
        setAvailableTools([]);
      }
    }
  }, [files]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles) => {
    setError('');
    setResult(null);
    if (selectedTool?.multi) {
      setFiles(prev => [...prev, ...newFiles].slice(0, 20));
    } else {
      // Single file converter
      setFiles([newFiles[0]]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResult(null);
    setError('');
  };

  const handleConvert = async () => {
    if (!files.length) {
      setError('Please add a file to convert.');
      return;
    }
    if (!selectedTool) {
      setError('Please select an output format.');
      return;
    }

    setConverting(true);
    setProgress(5);
    setProgressStatus('Uploading file...');
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('tool', selectedTool.id);
    files.forEach(f => formData.append('files', f));

    // Append options
    Object.entries(options).forEach(([k, v]) => formData.append(k, v));

    try {
      const response = await axios.post('/api/convert', formData, {
        responseType: 'blob',
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 45) / progressEvent.total);
            setProgress(Math.max(10, percent));
            if (percent >= 45) {
              setProgressStatus('Processing & converting format...');
            }
          }
        }
      });

      // Smooth completion
      setProgress(85);
      setProgressStatus('Finalizing download...');

      setTimeout(() => {
        setProgress(100);
        const disposition = response.headers['content-disposition'] || '';
        let filename = 'converted-file.' + selectedTool.output;
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }

        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const downloadUrl = URL.createObjectURL(blob);

        setResult({
          url: downloadUrl,
          filename,
          size: blob.size,
          originalName: files[0].name,
          originalSize: files.reduce((total, file) => total + file.size, 0),
          outputFormat: filename.split('.').pop()?.toUpperCase() || selectedTool.output.toUpperCase()
        });
        setConverting(false);
      }, 500);

    } catch (err) {
      setConverting(false);
      setProgress(0);
      if (err.response && err.response.data instanceof Blob) {
        // Read error json from blob
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(reader.result);
            setError(parsed.error || 'Conversion failed. Please try again.');
          } catch {
            setError('Conversion failed. Please verify file integrity.');
          }
        };
        reader.readAsText(err.response.data);
      } else {
        setError(err.message || 'Server error during conversion.');
      }
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setError('');
    setProgress(0);
    if (onResetTool) onResetTool();
  };

  const ActiveIcon = (selectedTool && iconMap[selectedTool.category]) || FileText;

  return (
    <div className="converter-container" id="converter-section">
      <div className="converter-card">
        {/* Converter Header */}
        <div className="converter-header">
          <div className="converter-badge-info">
            <div className="tool-icon-large">
              <ActiveIcon size={26} />
            </div>
            <div className="converter-title-group">
              <h3>{selectedTool ? selectedTool.name : 'Universal File Converter'}</h3>
              <p>
                {selectedTool
                  ? selectedTool.desc
                  : 'Drop any file below to automatically detect and convert formats.'}
              </p>
            </div>
          </div>
          {selectedTool?.twoWayId && (
            <span className="two-way-badge">
              <RefreshCw size={12} /> Two-Way Supported
            </span>
          )}
        </div>

        {/* Drag & Drop Zone */}
        <div
          className={`dropzone ${isDragOver ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            hidden
            multiple={Boolean(selectedTool?.multi)}
            onChange={handleFileInput}
          />
          <div className="drop-icon-wrapper">
            <UploadCloud size={30} />
          </div>
          <div className="drop-prompt">
            <h4>Drag & drop your files here</h4>
            <p>or <strong>Browse Files</strong> from your device</p>
          </div>
          <span className="drop-limits">
            Supported up to 100 MB per file · In-memory private processing
          </span>
        </div>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="file-list">
            {files.map((file, idx) => (
              <div className="file-item" key={idx}>
                <div className="file-info">
                  <FileText size={20} />
                  <div className="file-text">
                    <p className="file-name">{file.name}</p>
                    <span className="file-meta">
                      {formatBytes(file.size)} · {file.name.split('.').pop()?.toUpperCase()}
                    </span>
                  </div>
                </div>
                {!converting && (
                  <button
                    className="btn-remove"
                    onClick={() => removeFile(idx)}
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Controls & Output Format Selector */}
        {files.length > 0 && (
          <div className="convert-controls">
            <div className="selector-group">
              <span className="selector-label">Convert to:</span>
              <select
                className="format-dropdown"
                value={selectedTool?.id || ''}
                onChange={(e) => {
                  const found = conversionTypes.find(t => t.id === e.target.value);
                  if (found) setSelectedTool(found);
                }}
                disabled={converting}
              >
                {availableTools.length > 0 ? (
                  availableTools.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.output.toUpperCase()} ({t.name})
                    </option>
                  ))
                ) : (
                  <option value={selectedTool?.id || ''}>
                    {selectedTool?.name || 'Select Format'}
                  </option>
                )}
              </select>
            </div>

            <button
              className="btn-convert-action"
              disabled={converting || files.length === 0}
              onClick={handleConvert}
            >
              {converting ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  Converting...
                </>
              ) : (
                <>
                  Convert Now
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        )}

        {/* Tool Specific Options (e.g., Rotate angle, Protect password, Resize) */}
        {selectedTool?.id === 'rotate-pdf' && files.length > 0 && !converting && (
          <div className="options-bar">
            <Sliders size={16} />
            <label>Rotation Angle:</label>
            <select
              value={options.angle}
              onChange={(e) => setOptions({ ...options, angle: e.target.value })}
            >
              <option value="90">90° Clockwise</option>
              <option value="180">180° Half Turn</option>
              <option value="270">270° Counter-Clockwise</option>
            </select>
          </div>
        )}

        {selectedTool?.id === 'protect-pdf' && files.length > 0 && !converting && (
          <div className="options-bar">
            <Lock size={16} />
            <label>Security Watermark / Password:</label>
            <input
              type="text"
              placeholder="Enter password or protection notice"
              value={options.password}
              onChange={(e) => setOptions({ ...options, password: e.target.value })}
            />
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Progress Panel */}
        {converting && (
          <div className="progress-panel">
            <div className="progress-header">
              <span>{progressStatus || 'Converting file...'}</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="result-card">
            <div className="result-meta">
              <div className="result-badge">
                <CheckCircle2 size={24} />
              </div>
              <div className="result-info">
                <h4>Conversion Completed Successfully!</h4>
                <p><strong>Original:</strong> {result.originalName} ({formatBytes(result.originalSize)})</p>
                <p><strong>Converted:</strong> {result.filename} ({formatBytes(result.size)}) · {result.outputFormat}</p>
              </div>
            </div>
            <div className="result-actions">
              <a
                href={result.url}
                download={result.filename}
                className="btn-download"
              >
                <Download size={16} />
                Download File
              </a>
              <button
                className="btn-reset"
                onClick={handleReset}
              >
                <RotateCcw size={14} />
                Convert Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
