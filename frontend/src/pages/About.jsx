import React from 'react';
import { Shield, Zap, Layers, Lock, Cpu, Globe } from 'lucide-react';

export default function About() {
  return (
    <div className="about-page">
      <div className="page-header">
        <div className="container">
          <span className="section-pill">OUR MISSION</span>
          <h1>About ConvertPro</h1>
          <p>
            ConvertPro is an enterprise-grade, high-performance file conversion platform
            built to make everyday transformations seamless, secure, and private.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="prose-page">
          <h2>Transforming Digital Files Without Friction</h2>
          <p>
            Modern workflows require moving effortlessly between document formats, image standards,
            audio tracks, and media containers. ConvertPro was engineered to eliminate conversion
            barriers through native, high-performance conversion engines without paywalls or invasive tracking.
          </p>

          <h2>Core Principles</h2>
          <div className="features-grid" style={{ margin: '24px 0' }}>
            <div className="feature-box">
              <div className="feature-icon"><Zap size={20} /></div>
              <h4>Blazing Fast</h4>
              <p>In-memory processing engines convert documents, images, and media in seconds.</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon"><Lock size={20} /></div>
              <h4>Privacy First</h4>
              <p>Zero permanent storage. Files are transformed in memory and immediately discarded.</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon"><Layers size={20} /></div>
              <h4>True Two-Way</h4>
              <p>Full round-trip conversion support across PDF, Word, Excel, PowerPoint, and media.</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon"><Cpu size={20} /></div>
              <h4>High Fidelity</h4>
              <p>Powered by Sharp, pdf-lib, ExcelJS, docx, and FFmpeg for maximum formatting preservation.</p>
            </div>
          </div>

          <h2>Enterprise-Grade Technology Stack</h2>
          <p>
            Behind ConvertPro is a modern asynchronous microservices architecture designed to scale.
            From vector rasterization and typography preservation to video stream transcoding and
            encrypted ZIP packaging, every conversion engine is battle-tested.
          </p>
        </div>
      </div>
    </div>
  );
}
