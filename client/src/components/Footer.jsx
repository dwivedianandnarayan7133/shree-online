import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, ChevronRight, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
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
    }).catch(err => console.warn('Footer config error:', err));
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <>
      <style>{`
        .agency-footer {
          background: #0f172a;
          color: #cbd5e1;
          padding: 60px 0 20px 0;
          font-family: inherit;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 40px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
          margin-bottom: 40px;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .footer-brand-img {
          width: 50px;
          height: 50px;
          background: #ffffff;
          padding: 4px;
          border-radius: 8px;
        }
        .footer-brand-title {
          font-size: 1.4rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.1;
        }
        .footer-desc {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #94a3b8;
          margin-bottom: 20px;
        }
        .footer-heading {
          font-size: 1.1rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 24px;
          position: relative;
          padding-bottom: 12px;
        }
        .footer-heading::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 40px;
          height: 3px;
          background: var(--primary-600);
        }
        .footer-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #cbd5e1;
          background: transparent;
          border: none;
          padding: 0;
          font-size: 0.9rem;
          margin-bottom: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .footer-link:hover {
          color: var(--primary-400);
          transform: translateX(4px);
        }
        .footer-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
          font-size: 0.9rem;
          color: #cbd5e1;
        }
        .footer-contact-item svg {
          color: var(--primary-500);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .footer-bottom {
          border-top: 1px solid #1e293b;
          padding: 24px 32px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
          font-size: 0.85rem;
          color: #64748b;
        }
        @media (max-width: 768px) {
          .footer-bottom { flex-direction: column; gap: 16px; text-align: center; }
        }
      `}</style>

      <footer className="agency-footer">
        <div className="footer-grid">
          
          {/* Brand Info */}
          <div>
            <div className="footer-brand">
              <img src="/logo.png" alt="Logo" className="footer-brand-img" />
              <div className="footer-brand-title">Shree<br/><span style={{ color: 'var(--primary-600)' }}>Online</span></div>
            </div>
            <p className="footer-desc">
              Established in {config?.establishedYear || '2013'}, Shree Online is providing top-class digital marketing and citizen services with an official and reliable infrastructure.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ padding: '8px', background: '#1e293b', borderRadius: '4px', cursor: 'pointer' }}><Facebook size={16} color="#cbd5e1" /></div>
              <div style={{ padding: '8px', background: '#1e293b', borderRadius: '4px', cursor: 'pointer' }}><Twitter size={16} color="#cbd5e1" /></div>
              <div style={{ padding: '8px', background: '#1e293b', borderRadius: '4px', cursor: 'pointer' }}><Linkedin size={16} color="#cbd5e1" /></div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="footer-heading">Services</div>
            <button className="footer-link" onClick={() => setActivePage('customer-portal')}>
              <ChevronRight size={14} /> Citizen Service Desk
            </button>
            <button className="footer-link" onClick={() => setActivePage('passport-photo')}>
              <ChevronRight size={14} /> Passport Photo Studio
            </button>
            <button className="footer-link" onClick={() => setActivePage('document-tools')}>
              <ChevronRight size={14} /> Documentation Tools
            </button>
            <button className="footer-link" onClick={() => setActivePage('utility-hub')}>
              <ChevronRight size={14} /> Payment & Utility Services
            </button>
            <button className="footer-link" onClick={() => setActivePage('website-launcher')}>
              <ChevronRight size={14} /> Custom AdShield Browser
            </button>
          </div>

          {/* Leadership & Admin */}
          <div>
            <div className="footer-heading">Leadership</div>
            <button className="footer-link" onClick={() => setShowStaffModal(true)}>
              <ChevronRight size={14} /> Board of Directors
            </button>
            <button className="footer-link" onClick={() => setActivePage('about-us')}>
              <ChevronRight size={14} /> Organization Mission
            </button>
            <button className="footer-link" onClick={() => setActivePage('login')}>
              <ChevronRight size={14} /> Operator Extranet
            </button>
          </div>

          {/* Contact Info */}
          <div>
            <div className="footer-heading">Contact Us</div>
            <div className="footer-contact-item">
              <MapPin size={18} />
              <div>{config?.cyberCafeAddress || 'Main Market, Mahuli, Sant Kabir Nagar (U.P.) - 272172'}</div>
            </div>
            <div className="footer-contact-item">
              <Phone size={18} />
              <div>
                <div>+91 {config?.adminPhone || '8090794210'} (Admin)</div>
                <div>+91 {config?.ownerPhone || '9161400719'} (Owner)</div>
              </div>
            </div>
            <div className="footer-contact-item">
              <Mail size={18} />
              <div>kdshree778@gmail.com</div>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <div>
            {config?.footerCopyright || `© ${currentYear} Shree Online Org. All rights reserved.`}
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          </div>
        </div>

      </footer>

      {showStaffModal && (
        <LeadershipModal 
          isOpen={showStaffModal}
          onClose={() => setShowStaffModal(false)}
          setActivePage={setActivePage}
        />
      )}
    </>
  );
};
