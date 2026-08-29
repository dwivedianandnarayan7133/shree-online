import React, { useState, useEffect } from 'react';
import { 
  Layers, MapPin, Phone, MessageCircle, Clock, ShieldCheck, 
  Award, ArrowUp, Sparkles, FileText, Camera, HeartHandshake,
  CheckCircle2, ExternalLink, Mail, Lock
} from 'lucide-react';
import { api } from '../services/api';
import { DEFAULT_CONFIG } from '../services/defaultConfig';
import { LeadershipModal } from './LeadershipModal';

export const Footer = ({ setActivePage }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [showStaffModal, setShowStaffModal] = useState(false);

  useEffect(() => {
    api.getSystemConfig().then(res => {
      if (res && res.success && res.config) {
        setConfig(res.config);
      }
    }).catch(err => console.warn('Footer background sync:', err));
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="light-grey-footer">
      {/* Upper Footer: 4 Grid Columns */}
      <div className="footer-container">
        {/* Column 1: Brand & Legacy (Est. 2013) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div className="brand-icon-wrapper" style={{ width: '42px', height: '42px', overflow: 'hidden', padding: '2px', background: '#000000', borderRadius: '10px' }}>
              <img src="/logo.png" alt="Shree Online" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                {config?.portalName || 'Shree Online'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--primary-500)', fontWeight: '800', textTransform: 'uppercase' }}>
                Sewa Kendra • Est. {config?.establishedYear || '2013'}
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '14px' }}>
            Established in <b>{config?.establishedYear || '2013'}</b>, Shree Online Sewa Kendra is Mahuli's premier digital services, CSC Seva, government recruitment forms, and universal document processing center.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(16, 185, 129, 0.15)', color: '#059669', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '800' }}>
            <Award size={13} />
            <span>13+ Years of Continuous Service Excellence</span>
          </div>
        </div>

        {/* Column 2: Digital Studios & Services */}
        <div>
          <div style={{ fontWeight: '800', fontSize: '0.84rem', color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Digital Studios
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
            <button 
              onClick={() => { setActivePage('passport-photo'); scrollToTop(); }}
              className="footer-link-btn"
            >
              <Camera size={13} /> 6/Line A4 Passport Photo Studio
            </button>
            <button 
              onClick={() => { setActivePage('conversion-studio'); scrollToTop(); }}
              className="footer-link-btn"
            >
              <Sparkles size={13} /> Old Doc Restore & OCR (Word/Excel)
            </button>
            <button 
              onClick={() => { setActivePage('document-tools'); scrollToTop(); }}
              className="footer-link-btn"
            >
              <FileText size={13} /> Images to PDF, Merge & Split
            </button>
            <button 
              onClick={() => { setActivePage('file-tools'); scrollToTop(); }}
              className="footer-link-btn"
            >
              <Layers size={13} /> Batch Compressor & ZIP Studio
            </button>
            <button 
              onClick={() => { setActivePage('website-launcher'); scrollToTop(); }}
              className="footer-link-btn"
            >
              <ExternalLink size={13} /> Custom Browser & Govt Links
            </button>
          </div>
        </div>

        {/* Column 3: Leadership Desks & Direct Helplines — MANAGING DIRECTOR FIRST */}
        <div>
          <div style={{ fontWeight: '800', fontSize: '0.84rem', color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Leadership Desks & Helplines
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
            {/* Admin MD Helpline (FIRST) */}
            <div style={{ background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '800' }}>🛡️ Managing Director & Controller</div>
              <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{config?.adminName || 'Kamal Narayan Dwivedi'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <a 
                  href={`https://wa.me/91${config?.adminPhone || '8090794210'}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ color: '#25d366', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  <MessageCircle size={12} /> {config?.adminPhone || '8090794210'}
                </a>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <a 
                  href={`mailto:${config?.adminEmail || 'kdshree778@gmail.com'}`}
                  style={{ color: 'var(--primary-400)', textDecoration: 'none' }}
                >
                  {config?.adminEmail || 'kdshree778@gmail.com'}
                </a>
              </div>
            </div>

            {/* Owner Helpline (SECOND) */}
            <div style={{ background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: '800' }}>👑 Founder & Owner</div>
              <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{config?.ownerName || 'Krishan Narayan Dwivedi'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <a 
                  href={`https://wa.me/91${config?.ownerPhone || '9161400719'}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ color: '#25d366', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  <MessageCircle size={12} /> {config?.ownerPhone || '9161400719'}
                </a>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <a 
                  href={`mailto:${config?.ownerEmail || 'onlinebaba111111@gmail.com'}`}
                  style={{ color: 'var(--primary-400)', textDecoration: 'none' }}
                >
                  {config?.ownerEmail || 'onlinebaba111111@gmail.com'}
                </a>
              </div>
            </div>

            {/* Dedicated Leadership / Admin Password Login Button */}
            <button
              type="button"
              onClick={() => setShowStaffModal(true)}
              className="btn btn-outline btn-sm"
              style={{
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontWeight: '800',
                fontSize: '0.76rem',
                borderColor: 'var(--primary-500)',
                color: 'var(--primary-400)'
              }}
            >
              <Lock size={12} color="#10b981" />
              <span>🔐 Admin MD & Owner Desk (Password Verified)</span>
            </button>
          </div>
        </div>

        {/* Column 4: Location & Security Certifications */}
        <div>
          <div style={{ fontWeight: '800', fontSize: '0.84rem', color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Location & Timings
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <MapPin size={15} color="var(--primary-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{config?.cyberCafeAddress || 'Main Market, Mahuli, Sant Kabir Nagar (S.K.N), Uttar Pradesh - 272172'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={15} color="#f59e0b" style={{ flexShrink: 0 }} />
              <span>{config?.footerTimings || 'Monday – Sunday (08:00 AM – 09:00 PM)'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={15} color="#10b981" style={{ flexShrink: 0 }} />
              <span>AdShield™ & Google OTP Certified</span>
            </div>

            <button 
              onClick={() => { setActivePage('about-us'); scrollToTop(); }}
              className="btn btn-outline btn-sm"
              style={{ marginTop: '6px', fontSize: '0.76rem', justifyContent: 'flex-start' }}
            >
              📖 View Leadership Narrative & History
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="footer-bottom-bar">
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {config?.footerCopyright || `© 2013 – ${currentYear} Shree Online Sewa Kendra • Mahuli, Sant Kabir Nagar (S.K.N), U.P. All rights reserved.`}
        </div>

        <button 
          onClick={scrollToTop}
          className="btn btn-secondary btn-sm"
          style={{ padding: '4px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <ArrowUp size={12} /> Top
        </button>
      </div>

      <LeadershipModal 
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        setActivePage={setActivePage}
      />
    </footer>
  );
};
