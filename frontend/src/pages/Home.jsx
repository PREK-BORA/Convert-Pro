import React from 'react';
import {
  Sparkles,
  Check,
  Shield,
  Zap,
  LockKeyhole,
  ArrowRight,
  RefreshCw,
  FileText,
  FileImage,
  Film,
  AudioLines,
  FileArchive,
  FileSpreadsheet,
  FileCode2,
  Presentation,
  MousePointer2,
  UploadCloud,
  ArrowDown
} from 'lucide-react';
import UniversalConverter from '../components/converter/UniversalConverter.jsx';
import { categories, conversionTypes } from '../../../shared/conversionTypes.js';

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

export default function Home({ onSelectCategory, onSelectTool, activeTool, onResetTool }) {
  const popularTools = conversionTypes.filter(t => t.popular).slice(0, 12);

  const faqs = [
    {
      q: 'Are my uploaded files safe and private?',
      a: 'Yes, absolutely. ConvertPro processes files in secure in-memory buffers. We never retain, inspect, or store your documents permanently. Once your download completes, temporary files are immediately and automatically deleted.'
    },
    {
      q: 'What is two-way conversion?',
      a: 'Two-way conversion means you can convert in both directions between formats. For example, you can convert PDF to Word, and also Word to PDF; JPG to PNG, and PNG to JPG; MP4 to MOV, and MOV to MP4.'
    },
    {
      q: 'Is there a file size limit?',
      a: 'ConvertPro supports files up to 100 MB each, allowing you to convert large presentations, video clips, and high-resolution documents without throttling.'
    },
    {
      q: 'Do I need an account or subscription?',
      a: 'No account, sign-up, or payment is required. ConvertPro is completely free to use without hidden limits.'
    },
    {
      q: 'Does ConvertPro work on mobile phones and tablets?',
      a: 'Yes! ConvertPro is fully responsive and designed to work seamlessly across desktops, laptops, tablets, iOS, and Android mobile devices.'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-pill">
            <Sparkles size={14} />
            ALL-IN-ONE TWO-WAY FILE CONVERTER
          </div>

          <h1 className="hero-title">
            Convert Any File,<br />
            <em>Anytime, Anywhere.</em>
          </h1>

          <p className="hero-subtitle">
            Instantly transform documents, images, audio, video, spreadsheets, and archives.
            Secure, lightning-fast, and powered by real conversion engines.
          </p>

          <div className="hero-tags">
            <span className="hero-tag">
              <Check size={16} /> No account needed
            </span>
            <span className="hero-tag">
              <Check size={16} /> 100% In-memory privacy
            </span>
            <span className="hero-tag">
              <Check size={16} /> True two-way conversions
            </span>
            <span className="hero-tag">
              <Check size={16} /> Free & unlimited
            </span>
          </div>

          {/* Universal Interactive Converter Card */}
          <UniversalConverter
            initialTool={activeTool}
            onResetTool={onResetTool}
          />
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="section-padding" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="section-title-group">
            <span className="section-pill">MOST POPULAR</span>
            <h2 className="section-title">Popular Conversion Tools</h2>
            <p className="section-desc">
              Get started quickly with the most frequently used file transformation tools.
            </p>
          </div>

          <div className="tools-grid">
            {popularTools.map(tool => {
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
        </div>
      </section>

      {/* Conversion Categories Section */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title-group">
            <span className="section-pill">FORMAT CATEGORIES</span>
            <h2 className="section-title">Explore by File Category</h2>
            <p className="section-desc">
              Find dedicated tools for every document, graphic, presentation, and media format.
            </p>
          </div>

          <div className="categories-grid">
            {categories.map(cat => {
              const Icon = iconMap[cat.id] || FileText;
              return (
                <button
                  key={cat.id}
                  className="category-card"
                  onClick={() => onSelectCategory(cat.id)}
                >
                  <div className={`cat-icon-box ${cat.color}`}>
                    <Icon size={22} />
                  </div>
                  <div className="cat-details">
                    <h4>{cat.name}</h4>
                    <p>{cat.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="section-title-group">
            <span className="section-pill">EFFORTLESS WORKFLOW</span>
            <h2 className="section-title">How It Works in 3 Steps</h2>
            <p className="section-desc">
              Zero clutter, zero guesswork. Convert any file in three simple steps.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">STEP 01</span>
              <div className="step-icon-wrap">
                <UploadCloud size={26} />
              </div>
              <h3>Choose or Drop File</h3>
              <p>
                Drag and drop your file into the converter or click browse.
                ConvertPro automatically detects your format.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">STEP 02</span>
              <div className="step-icon-wrap">
                <MousePointer2 size={26} />
              </div>
              <h3>Select Target Format</h3>
              <p>
                Choose from available output formats or customize options like
                image resizing, rotation angle, or compression.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">STEP 03</span>
              <div className="step-icon-wrap">
                <ArrowDown size={26} />
              </div>
              <h3>Download Converted File</h3>
              <p>
                Hit Convert and watch real-time progress. Download your
                high-fidelity converted file instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose ConvertPro Section */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title-group">
            <span className="section-pill">BUILT FOR EVERYONE</span>
            <h2 className="section-title">Why Choose ConvertPro?</h2>
            <p className="section-desc">
              Everything you need in a modern converter tool, backed by robust security.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon"><RefreshCw size={20} /></div>
              <h4>Two-Way Conversion</h4>
              <p>Convert forward and backwards between PDF, Word, Excel, PowerPoint, images, and audio.</p>
            </div>

            <div className="feature-box">
              <div className="feature-icon"><Shield size={20} /></div>
              <h4>Private & Secure</h4>
              <p>No storage. Your files are processed securely in volatile memory and deleted immediately.</p>
            </div>

            <div className="feature-box">
              <div className="feature-icon"><Zap size={20} /></div>
              <h4>Lightning Fast</h4>
              <p>Real native libraries (Sharp, pdf-lib, FFmpeg) process your conversions in milliseconds.</p>
            </div>

            <div className="feature-box">
              <div className="feature-icon"><LockKeyhole size={20} /></div>
              <h4>No Sign-Up Needed</h4>
              <p>No accounts, no credit cards, no subscriptions. Use any tool instantly from any browser.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="faq-grid">
            <div>
              <span className="section-pill">FAQ</span>
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-desc">
                Have questions about ConvertPro? Here are the answers to the most common inquiries.
              </p>
            </div>

            <div className="faq-list">
              {faqs.map((item, i) => (
                <details className="faq-item" key={i} open={i === 0}>
                  <summary className="faq-question">
                    {item.q}
                    <span>+</span>
                  </summary>
                  <p className="faq-answer">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
