import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, ChevronDown, Bell, Search, 
  MapPin, Phone, Mail, FileText, Share2, Facebook, Twitter, Instagram, Linkedin, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NavigationBar = ({ activePage, setActivePage }) => {
  const { user, logout } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  
  const isOperator = user?.role === 'admin' || user?.role === 'operator';
  const isAdmin = user?.role === 'admin';

  const handleItemClick = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    {
      id: 'services',
      label: 'SERVICES',
      items: [
        { id: 'dashboard', label: 'Main Dashboard' },
        { id: 'customer-portal', label: 'Citizen Service Desk' },
        { id: 'passport-photo', label: 'Passport Photo Studio' },
        { id: 'conversion-studio', label: 'Old Doc Restore & OCR' },
        { id: 'document-tools', label: 'Document & PDF Studio' },
      ]
    },
    {
      id: 'resources',
      label: 'RESOURCES',
      items: [
        { id: 'file-tools', label: 'Compressor & ZIP Studio' },
        { id: 'utility-hub', label: 'QR & Barcode Utilities' },
        { id: 'website-launcher', label: 'Custom AdShield Browser' },
      ]
    }
  ];

  if (isOperator) {
    navLinks.push({
      id: 'operations',
      label: 'OPERATIONS',
      items: [
        { id: 'requests', label: 'Request Pipeline Manager' },
        { id: 'print-manager', label: 'Print Job Manager' },
        { id: 'scanner-studio', label: 'Scanner Studio' },
        { id: 'billing-manager', label: 'Billing & POS Invoices' },
      ]
    });
  }

  if (isAdmin) {
    navLinks.push({
      id: 'admin',
      label: 'ADMIN',
      items: [
        { id: 'admin-panel', label: 'MD Control Center' },
      ]
    });
  }

  navLinks.push({
    id: 'contact',
    label: 'ABOUT US',
    items: [
      { id: 'about-us', label: 'Leadership & History' }
    ]
  });

  return (
    <>
      <style>{`
        /* Official Agency Navbar Styles */
        .agency-top-bar {
          background: #0f172a;
          color: #f1f5f9;
          font-size: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 32px;
          font-weight: 500;
        }
        .agency-top-left, .agency-top-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .agency-top-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #cbd5e1;
          text-decoration: none;
          transition: color 0.15s;
        }
        .agency-top-link:hover { color: #ffffff; }
        .social-icons-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          border-left: 1px solid #334155;
          padding-left: 20px;
        }

        .agency-main-nav {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .agency-brand-area {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .agency-logo-img {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }
        .agency-brand-text {
          display: flex;
          flex-direction: column;
        }
        .agency-title {
          font-size: 1.4rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .agency-subtitle {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .agency-center-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        
        @media (max-width: 1024px) {
          .agency-center-links { display: none; }
          .agency-top-bar { display: none; }
        }

        .nav-link-group {
          position: relative;
        }
        .nav-link-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          padding: 8px 0;
          transition: color 0.2s;
        }
        .nav-link-title:hover {
          color: var(--primary-600);
        }

        .nav-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-top: 3px solid var(--primary-600);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          min-width: 220px;
          display: flex;
          flex-direction: column;
          padding: 8px 0;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.2s;
        }
        .nav-link-group:hover .nav-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-item {
          padding: 10px 18px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s;
          border-left: 2px solid transparent;
        }
        .dropdown-item:hover {
          background: #f8fafc;
          color: var(--primary-600);
          border-left-color: var(--primary-600);
        }

        .agency-right-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .help-btn {
          background: var(--primary-600);
          color: #fff;
          font-weight: 800;
          padding: 10px 24px;
          border-radius: 4px;
          text-transform: uppercase;
          font-size: 0.82rem;
          letter-spacing: 0.05em;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(234, 88, 12, 0.25);
          transition: background 0.2s;
        }
        .help-btn:hover { background: var(--primary-700); }

        .search-icon-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          border: 1px solid #e2e8f0;
          border-radius: 50%;
          cursor: pointer;
          background: #f8fafc;
        }
        .search-icon-btn:hover { background: #e2e8f0; color: #0f172a; }

        .mobile-menu-btn {
          display: none;
          background: transparent;
          border: none;
          color: #0f172a;
          cursor: pointer;
        }
        @media (max-width: 1024px) {
          .mobile-menu-btn { display: block; }
          .agency-right-actions .help-btn { display: none; }
          .agency-right-actions .search-icon-btn { display: none; }
          .agency-main-nav { padding: 12px 20px; }
        }

        /* Mobile Drawer */
        .mobile-drawer {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          transition: opacity 0.3s;
        }
        .mobile-drawer-content {
          width: 80vw;
          max-width: 320px;
          background: #ffffff;
          height: 100vh;
          box-shadow: -5px 0 25px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
      `}</style>

      {/* 1. Dark Top Bar */}
      <div className="agency-top-bar">
        <div className="agency-top-left">
          <span style={{ color: '#94a3b8' }}>Any Enquiry:</span>
          <a href="tel:+918090794210" className="agency-top-link">
            <Phone size={13} />  +91 80907 94210 (Operator)
          </a>
          <a href="tel:+919161400719" className="agency-top-link">
            <Phone size={13} />  +91 91614 00719 (Owner)
          </a>
          <a href="mailto:kdshree778@gmail.com" className="agency-top-link" style={{ marginLeft: '10px' }}>
            <Mail size={13} /> kdshree778@gmail.com
          </a>
        </div>
        <div className="agency-top-right">
          <a href="#" className="agency-top-link" onClick={(e) => { e.preventDefault(); handleItemClick('login'); }}>
            Login / Portal Access
          </a>
          {user && (
            <a href="#" className="agency-top-link" onClick={() => logout()} style={{ color: '#f87171' }}>
              Sign Out
            </a>
          )}
          <div className="social-icons-wrapper">
            <Facebook size={14} className="agency-top-link" style={{ cursor: 'pointer' }} />
            <Twitter size={14} className="agency-top-link" style={{ cursor: 'pointer' }} />
            <Instagram size={14} className="agency-top-link" style={{ cursor: 'pointer' }} />
            <Linkedin size={14} className="agency-top-link" style={{ cursor: 'pointer' }} />
          </div>
        </div>
      </div>

      {/* 2. Main Sticky Navbar */}
      <nav className="agency-main-nav">
        <div className="agency-brand-area" onClick={() => handleItemClick('dashboard')}>
          <div style={{ background: '#f8fafc', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <img src="/logo.png" alt="Logo" className="agency-logo-img" />
          </div>
          <div className="agency-brand-text">
            <span className="agency-title">Shree<span style={{ color: 'var(--primary-600)' }}>Online</span></span>
            <span className="agency-subtitle">A Govt. Authorized Center</span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="agency-center-links">
          {navLinks.map(cat => (
            <div className="nav-link-group" key={cat.id}>
              <div className="nav-link-title">
                {cat.label} <ChevronDown size={14} />
              </div>
              <div className="nav-dropdown">
                {cat.items.map(item => (
                  <div 
                    key={item.id} 
                    className="dropdown-item"
                    onClick={() => handleItemClick(item.id)}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="agency-right-actions">
          {user ? (
            <button className="help-btn" onClick={() => logout()} style={{ background: '#fef2f2', color: '#ef4444', borderColor: '#f87171' }}>
              Sign Out Securely
            </button>
          ) : (
            <button className="help-btn" onClick={() => handleItemClick('login')}>
              Sign Up & Request Service
            </button>
          )}
          <button className="search-icon-btn">
            <Search size={18} />
          </button>
          
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div className="mobile-drawer-content">
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
              <span className="agency-title" style={{ fontSize: '1.2rem' }}>Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: '10px 0' }}>
              {navLinks.map(cat => (
                <div key={cat.id}>
                  <div style={{ padding: '12px 20px', fontWeight: '800', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', background: '#f8fafc' }}>
                    {cat.label}
                  </div>
                  {cat.items.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => handleItemClick(item.id)}
                      style={{ padding: '12px 20px', fontSize: '0.95rem', fontWeight: '600', color: '#334155', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ padding: '20px' }}>
                  {user ? (
                    <>
                      <button className="help-btn" style={{ width: '100%', marginBottom: '10px' }} onClick={() => handleItemClick('dashboard')}>
                        Access Dashboard
                      </button>
                      <button 
                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                        style={{ width: '100%', padding: '12px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', fontWeight: '800', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="help-btn" style={{ width: '100%' }} onClick={() => handleItemClick('customer-portal')}>
                        Appoint Expert
                      </button>
                      <button 
                        onClick={() => { handleItemClick('login'); }}
                        style={{ width: '100%', padding: '10px', marginTop: '10px', background: '#e2e8f0', color: '#334155', border: 'none', fontWeight: '700', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Operator Login
                      </button>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
