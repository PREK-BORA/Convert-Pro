import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Feedback / General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="contact-page">
      <div className="page-header">
        <div className="container">
          <span className="section-pill">GET IN TOUCH</span>
          <h1>Contact Us</h1>
          <p>
            Have a question, feature request, or need assistance with a conversion?
            We are always here to help.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="prose-page">
          <h2>We would love to hear from you</h2>
          <p>
            Feel free to send us a message or reach us directly at{' '}
            <strong>hello@convertpro.app</strong>.
          </p>

          {submitted ? (
            <div className="result-card" style={{ marginTop: 20 }}>
              <div className="result-meta">
                <div className="result-badge">
                  <CheckCircle2 size={24} />
                </div>
                <div className="result-info">
                  <h4>Thank you, {formData.name}!</h4>
                  <p>Your message has been sent. Our team will review and reply to {formData.email} shortly.</p>
                </div>
              </div>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option>Feedback / General Inquiry</option>
                  <option>Bug Report / Conversion Issue</option>
                  <option>Feature Request / New Format</option>
                  <option>API & Partnership</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Your Message</label>
                <textarea
                  rows={5}
                  required
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <div className="full-width">
                <button type="submit" className="btn-convert-action">
                  <Send size={16} /> Send Message
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
