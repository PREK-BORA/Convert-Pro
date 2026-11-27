import React, { useState } from 'react';
import {
  RefreshCw,
  ArrowRight,
  Menu,
  X,
  FileText,
  FileImage,
  Film,
  AudioLines,
  FileArchive,
  FileCode2,
  Shield,
  Heart
} from 'lucide-react';
import Home from './pages/Home.jsx';
import AllTools from './pages/AllTools.jsx';
import CategoryToolsPage from './pages/CategoryToolsPage.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeTool, setActiveTool] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTool = (tool) => {
    setActiveTool(tool);
    setCurrentPage('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      document.getElementById('converter-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSelectCategory = (catId) => {
    setCurrentPage(catId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetTool = () => {
    setActiveTool(null);
  };

  return (
    <div className="app-root">
      {/* Navigation Header */}
      <header className="site-header">
        <div className="container header-inner">
          <button className="brand-logo" onClick={() => navigateTo('home')}>
            <div className="logo-badge">
              <RefreshCw size={20} />
            </div>
            Convert<span>Pro</span>
          </button>

          {/* Nav links */}
          <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <button
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => navigateTo('home')}
            >
              Home
            </button>
            <button
              className={`nav-link ${currentPage === 'all-tools' ? 'active' : ''}`}
              onClick={() => navigateTo('all-tools')}
            >
              All Tools
            </button>
            <button
              className={`nav-link ${currentPage === 'pdf' ? 'active' : ''}`}
              onClick={() => navigateTo('pdf')}
            >
              PDF Tools
            </button>
            <button
              className={`nav-link ${currentPage === 'image' ? 'active' : ''}`}
              onClick={() => navigateTo('image')}
            >
              Image Tools
            </button>
            <button
              className={`nav-link ${['document', 'spreadsheet', 'presentation'].includes(currentPage) ? 'active' : ''}`}
              onClick={() => navigateTo('document')}
            >
              Document Tools
            </button>
            <button
              className={`nav-link ${currentPage === 'video' ? 'active' : ''}`}
              onClick={() => navigateTo('video')}
            >
              Video Tools
            </button>
            <button
              className={`nav-link ${currentPage === 'audio' ? 'active' : ''}`}
              onClick={() => navigateTo('audio')}
            >
              Audio Tools
            </button>
            <button
              className={`nav-link ${currentPage === 'archive' ? 'active' : ''}`}
              onClick={() => navigateTo('archive')}
            >
              Archive Tools
            </button>
          </nav>

          {/* Header Action & Mobile Hamburger */}
          <div className="header-actions">
            <button
              className="btn-primary-sm"
              onClick={() => navigateTo('all-tools')}
            >
              Explore Tools <ArrowRight size={14} />
            </button>

            <button
              className="menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="site-main">
        {currentPage === 'home' && (
          <Home
            onSelectCategory={handleSelectCategory}
            onSelectTool={handleSelectTool}
            activeTool={activeTool}
            onResetTool={handleResetTool}
          />
        )}

        {currentPage === 'all-tools' && (
          <AllTools onSelectTool={handleSelectTool} />
        )}

        {currentPage === 'pdf' && (
          <CategoryToolsPage
            categoryKey="pdf"
            title="PDF Conversion & Editing Tools"
            subtitle="Convert PDF to Word, Excel, PowerPoint, images, or merge, split, compress, and protect your PDF documents."
            onSelectTool={handleSelectTool}
          />
        )}

        {currentPage === 'image' && (
          <CategoryToolsPage
            categoryKey="image"
            title="Image Converters & Optimizers"
            subtitle="Two-way conversion for JPG, PNG, WebP, SVG, BMP, and GIF with lossless compression and smart resizing."
            onSelectTool={handleSelectTool}
          />
        )}

        {currentPage === 'document' && (
          <CategoryToolsPage
            categoryKey="document"
            categoryKeys={['document', 'spreadsheet', 'presentation']}
            title="Office & Document Converters"
            subtitle="Two-way conversions across Microsoft Word (DOCX), Excel (XLSX), PowerPoint (PPTX), CSV, and HTML."
            onSelectTool={handleSelectTool}
          />
        )}

        {currentPage === 'video' && (
          <CategoryToolsPage
            categoryKey="video"
            title="Video Converters & Audio Extraction"
            subtitle="Transcode video files between MP4, AVI, MOV, and WebM, or extract MP3 audio and compress clips."
            onSelectTool={handleSelectTool}
          />
        )}

        {currentPage === 'audio' && (
          <CategoryToolsPage
            categoryKey="audio"
            title="Audio Converters & Compression"
            subtitle="Convert music and audio files between MP3, WAV, AAC, and OGG formats with custom bitrates."
            onSelectTool={handleSelectTool}
          />
        )}

        {currentPage === 'archive' && (
          <CategoryToolsPage
            categoryKey="archive"
            title="Archive & Compression Tools"
            subtitle="Create and extract ZIP archives, and convert effortlessly between TAR and ZIP formats."
            onSelectTool={handleSelectTool}
          />
        )}

        {currentPage === 'about' && <About />}
        {currentPage === 'contact' && <Contact />}
        {currentPage === 'privacy' && <Privacy />}
        {currentPage === 'terms' && <Terms />}
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <h3>
                <div className="logo-badge" style={{ width: 28, height: 28 }}>
                  <RefreshCw size={15} />
                </div>
                Convert<span>Pro</span>
              </h3>
              <p>
                Professional, secure, and private all-in-one file conversion web platform.
                Transform documents, images, and media without limits.
              </p>
            </div>

            <div className="footer-col">
              <h4>Tools</h4>
              <ul>
                <li><button onClick={() => navigateTo('all-tools')}>All Tools</button></li>
                <li><button onClick={() => navigateTo('pdf')}>PDF Tools</button></li>
                <li><button onClick={() => navigateTo('image')}>Image Tools</button></li>
                <li><button onClick={() => navigateTo('document')}>Document Tools</button></li>
                <li><button onClick={() => navigateTo('video')}>Video Tools</button></li>
                <li><button onClick={() => navigateTo('audio')}>Audio Tools</button></li>
                <li><button onClick={() => navigateTo('archive')}>Archive Tools</button></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Popular</h4>
              <ul>
                <li><button onClick={() => handleSelectTool({ id: 'pdf-to-docx', name: 'PDF to Word', input: 'pdf', output: 'docx', category: 'pdf', desc: 'Convert PDF to DOCX' })}>PDF to Word</button></li>
                <li><button onClick={() => handleSelectTool({ id: 'docx-to-pdf', name: 'Word to PDF', input: 'docx', output: 'pdf', category: 'pdf', desc: 'Convert Word to PDF' })}>Word to PDF</button></li>
                <li><button onClick={() => handleSelectTool({ id: 'pdf-to-xlsx', name: 'PDF to Excel', input: 'pdf', output: 'xlsx', category: 'pdf', desc: 'Convert PDF to Excel' })}>PDF to Excel</button></li>
                <li><button onClick={() => handleSelectTool({ id: 'jpg-to-png', name: 'JPG to PNG', input: 'jpg', output: 'png', category: 'image', desc: 'Convert JPG to PNG' })}>JPG to PNG</button></li>
                <li><button onClick={() => handleSelectTool({ id: 'mp4-to-avi', name: 'MP4 to AVI', input: 'mp4', output: 'avi', category: 'video', desc: 'Convert MP4 to AVI' })}>MP4 to AVI</button></li>
                <li><button onClick={() => handleSelectTool({ id: 'video-to-mp3', name: 'Video to MP3', input: 'video', output: 'mp3', category: 'video', desc: 'Extract audio to MP3' })}>Video to MP3</button></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Company & Legal</h4>
              <ul>
                <li><button onClick={() => navigateTo('about')}>About Us</button></li>
                <li><button onClick={() => navigateTo('contact')}>Contact Us</button></li>
                <li><button onClick={() => navigateTo('privacy')}>Privacy Policy</button></li>
                <li><button onClick={() => navigateTo('terms')}>Terms and Conditions</button></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 ConvertPro. All rights reserved. In-memory private processing.</span>
            <span>Crafted with care for seamless daily workflows.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
