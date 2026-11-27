import React from 'react';
import { ShieldCheck, Lock, Trash2, CheckCircle2 } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="privacy-page">
      <div className="page-header">
        <div className="container">
          <span className="section-pill">DATA PROTECTION</span>
          <h1>Privacy Policy</h1>
          <p>
            Your privacy and file security are the foundation of ConvertPro.
            Learn how we handle and protect your data.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="prose-page">
          <h2>1. Zero Permanent Storage</h2>
          <p>
            ConvertPro does not permanently store your uploaded files. All conversions are performed
            in volatile memory buffers or securely isolated temporary processes. Once your conversion
            is completed and streamed to your browser, temporary assets are automatically purged.
          </p>

          <h2>2. No File Inspection or AI Training</h2>
          <p>
            We do not read, inspect, monetize, share, or use your uploaded content or converted files
            for training artificial intelligence models. Your documents remain strictly yours.
          </p>

          <h2>3. End-to-End Transport Security</h2>
          <p>
            All file transfers between your browser and the ConvertPro conversion engines occur over
            secure TLS/HTTPS connections with 256-bit encryption. Unauthenticated access to conversion
            streams is blocked.
          </p>

          <h2>4. Cookies & Analytics</h2>
          <p>
            ConvertPro uses minimal, non-invasive session cookies only to provide core website functionality.
            We do not use tracking pixels, cross-site trackers, or sell analytics data to third parties.
          </p>

          <h2>5. Contact Us Regarding Privacy</h2>
          <p>
            If you have any questions or inquiries regarding our security architecture or privacy
            commitments, please contact our Data Protection team at{' '}
            <strong>privacy@convertpro.app</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
