import React from 'react';
import {
  FileText,
  FileImage,
  Film,
  AudioLines,
  FileArchive,
  FileSpreadsheet,
  FileCode2,
  Presentation,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { conversionTypes } from '../../../shared/conversionTypes.js';

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

export default function CategoryToolsPage({
  categoryKey,
  categoryKeys,
  title,
  subtitle,
  onSelectTool
}) {
  const allowedKeys = categoryKeys || [categoryKey];
  const tools = conversionTypes.filter(t => allowedKeys.includes(t.category));
  const PrimaryIcon = iconMap[categoryKey] || FileText;

  return (
    <div className="category-page">
      <div className="page-header">
        <div className="container">
          <span className="section-pill">SPECIALIZED CONVERTER</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="section-padding">
        <div className="container">
          <div className="tools-grid">
            {tools.map(tool => {
              const Icon = iconMap[tool.category] || PrimaryIcon;
              return (
                <button
                  key={tool.id}
                  className="tool-card"
                  onClick={() => onSelectTool(tool)}
                >
                  <div className="tool-card-icon">
                    <Icon size={18} />
                  </div>
                  <div className="tool-card-info">
                    <h4 className="tool-card-name">{tool.name}</h4>
                    <span className="tool-card-badge">
                      {tool.input.toUpperCase()} <ArrowRight size={12} /> {tool.output.toUpperCase()}
                      {tool.twoWayId && (
                        <span title="Two-way conversion supported" style={{ marginLeft: 6, color: '#7c3aed' }}>
                          <RefreshCw size={11} />
                        </span>
                      )}
                    </span>
                  </div>
                  <ArrowRight size={16} color="#cbd5e1" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
