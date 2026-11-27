import React from 'react';

export default function Terms() {
  return (
    <div className="terms-page">
      <div className="page-header">
        <div className="container">
          <span className="section-pill">TERMS OF SERVICE</span>
          <h1>Terms and Conditions</h1>
          <p>
            Please read these terms carefully before using ConvertPro.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="prose-page">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the ConvertPro web application and its conversion services, you agree
            to be bound by these Terms and Conditions. If you do not agree with any part of these terms,
            you must not use our services.
          </p>

          <h2>2. Permitted Use & Content Ownership</h2>
          <p>
            You retain 100% full ownership, rights, and title to all files, media, and documents you upload
            to ConvertPro. You represent and warrant that you hold the necessary rights, licenses, or permissions
            for any content processed through the service.
          </p>

          <h2>3. Prohibited Activities</h2>
          <p>
            You agree not to use ConvertPro to upload, process, or transmit:
          </p>
          <ul>
            <li>Malicious code, viruses, trojans, or corrupted archives.</li>
            <li>Content that infringes third-party intellectual property or copyright.</li>
            <li>Unlawful, abusive, harassing, or defamatory materials.</li>
            <li>Automated scraping or denial-of-service traffic that burdens our infrastructure.</li>
          </ul>

          <h2>4. Service Availability & Disclaimer</h2>
          <p>
            ConvertPro is provided on an "as-is" and "as-available" basis. While we strive for maximum
            uptime, accuracy, and formatting fidelity, we make no warranties that conversions will always
            be error-free or uninterrupted.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            In no event shall ConvertPro, its developers, or affiliates be liable for any indirect,
            incidental, consequential, or punitive damages resulting from your use of or inability to use
            the conversion services.
          </p>

          <h2>6. Modifications to Terms</h2>
          <p>
            We reserve the right to revise or update these terms at any time. Continued use of the platform
            after modifications constitutes your acceptance of the revised terms.
          </p>
        </div>
      </div>
    </div>
  );
}
