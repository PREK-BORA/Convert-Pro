import React, { useState } from 'react';
import {
  Search,
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
import { conversionTypes, categories } from '../../../shared/conversionTypes.js';

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

export default function AllTools({ onSelectTool }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filtered = conversionTypes.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.output.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="all-tools-page">
      <div className="page-header">
        <div className="container">
          <span className="section-pill">CONVERTPRO TOOLKIT</span>
          <h1>All Conversion Tools</h1>
          <p>
            Explore our comprehensive suite of two-way file converters. Fast, secure,
            and optimized for every major format.
          </p>

          <div className="search-controls">
            <div className="search-input-wrap">
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by format (e.g. PDF, Word, MP4, WebP)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="category-filter-chips">
              <button
                className={`filter-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Tools ({conversionTypes.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`filter-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="section-padding">
        <div className="container">
          <div className="tools-grid">
            {filtered.map(tool => {
              const Icon = iconMap[tool.category] || FileText;
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

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <p>No tools found matching "{searchTerm}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
