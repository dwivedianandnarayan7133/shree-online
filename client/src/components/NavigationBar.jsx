import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Inbox, Camera, FileText, Sparkles, 
  Archive, QrCode, Globe, Printer, Scan, Receipt, Settings, 
  UserCheck, ShieldCheck, HeartHandshake, Award, Menu, X,
  ChevronDown, Sun, Moon, Bell, LogOut, Phone, MessageCircle, MapPin,
  ExternalLink, Layers, CheckCircle2, UserPlus, IndianRupee, HardDrive
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const NavigationBar = ({ activePage, setActivePage }) => {
  const { user, logout, loginWithDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [openDropdown, setOpenDropdown] = useState(null); // 'workspace', 'studios', 'operations', 'admin' or null
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const isOperator = user?.role === 'admin' || user?.role === 'operator';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Main Categories with Dropdown Menus
  const navCategories = [
    {
      id: 'workspace',
      label: 'Workspace',
      icon: LayoutDashboard,
      role: 'all',
      items: [
        { id: 'dashboard', label: 'Command Center Dashboard', desc: 'Real-time KPIs, live queue & quick tools', icon: LayoutDashboard, role: 'operator' },
        { id: 'requests', label: 'Request Pipeline', desc: 'Manage customer submissions & orders', icon: Inbox, role: 'operator' },
        { id: 'customer-portal', label: 'Customer Portal', desc: 'Submit form & live tracking status', icon: UserCheck, role: 'all' },
        { id: 'about-us', label: 'About Us & Leadership', desc: 'Est. 2013 history & owner/admin messages', icon: Award, role: 'all' },
      ]
    },
    {
      id: 'studios',
      label: 'Digital Studios',
      icon: Sparkles,
      role: 'all',
      items: [
        { id: 'passport-photo', label: 'Passport Photo Studio', desc: '6/line A4 sheet & exam sky-blue BG', icon: Camera, role: 'all' },
        { id: 'conversion-studio', label: 'Old Doc Restore & OCR', desc: 'Extract scans to Word (.docx) & Excel', icon: Sparkles, role: 'all' },
        { id: 'document-tools', label: 'Document & PDF Studio', desc: 'Images to PDF, Merge, Split & Compress', icon: FileText, role: 'all' },
        { id: 'file-tools', label: 'Compressor & ZIP Studio', desc: 'Batch compression & extraction', icon: Archive, role: 'all' },
        { id: 'utility-hub', label: 'Utilities (QR & Barcode)', desc: 'Instant QR code & barcode generator', icon: QrCode, role: 'all' },
      ]
    },
    {
      id: 'operations',
      label: 'Operations & POS',
      icon: Printer,
      role: 'all',
      items: [
        { id: 'website-launcher', label: 'Custom Browser & Gateway', desc: 'In-portal ad-blocked govt browser', icon: Globe, role: 'all' },
        { id: 'print-manager', label: 'Print Job Manager', desc: 'A4/Color queue & printer telemetry', icon: Printer, role: 'operator' },
        { id: 'scanner-studio', label: 'Scanner Studio', desc: 'Device presets, de-skew & scan to PDF', icon: Scan, role: 'operator' },
        { id: 'billing-manager', label: 'Billing & POS Invoices', desc: 'Thermal receipts & GST calculations', icon: Receipt, role: 'operator' },
      ]
    }
  ];

  if (isAdmin) {
    navCategories.push({
      id: 'admin',
      label: 'MD Controller',
      icon: Settings,
      role: 'admin',
      items: [
        { id: 'admin-panel', label: 'Admin Control Center', desc: 'Static pages, operators, catalog & retention', icon: Settings, role: 'admin' }
      ]
    });
  }

  const handleItemClick = (pageId) => {
    setActivePage(pageId);
    setOpenDropdown(null);
    setMobileDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getActiveCategory = () => {
    for (const cat of navCategories) {
      if (cat.items.some(it => it.id === activePage)) {
        return cat.id;
      }
    }
    return 'workspace';
  };

  const activeCatId = getActiveCategory();

  return (
    <header className="universal-nav-header" ref={navRef}>
      <div className="universal-nav-top">
        {/* Brand */}
        <div className="brand-logo" onClick={() => handleItemClick('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-wrapper">
            ⚡
          </div>
          <div>
            <div className="brand-text-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Shree Online</span>
              <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                Mahuli, S.K.N
              </span>
            </div>
            <div className="brand-tagline">Sewa Kendra • Est. 2013 • One Window. Every Digital Service.</div>
          </div>
        </div>

        {/* Compact Dropdown Menus (Desktop / Laptop / Tablet) */}
        <nav className="desktop-dropdown-nav">
          {navCategories.map(cat => {
            const isCatActive = activeCatId === cat.id;
            const isOpen = openDropdown === cat.id;
            const CatIcon = cat.icon;

            const visibleItems = cat.items.filter(item => {
              if (item.role === 'all') return true;
              if (item.role === 'operator' && isOperator) return true;
              if (item.role === 'admin' && isAdmin) return true;
              return false;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={cat.id} className="nav-dropdown-wrapper">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(isOpen ? null : cat.id)}
                  className={`nav-dropdown-btn ${isCatActive ? 'active' : ''} ${isOpen ? 'open' : ''}`}
                >
                  <CatIcon size={16} />
                  <span>{cat.label}</span>
                  <ChevronDown size={14} className={`caret ${isOpen ? 'rotate' : ''}`} />
                </button>

                {isOpen && (
                  <div className="nav-dropdown-menu">
                    <div className="dropdown-menu-header">
                      <span>{cat.label} Services</span>
                    </div>
                    <div className="dropdown-menu-items">
                      {visibleItems.map(item => {
                        const ItemIcon = item.icon;
                        const isCurrent = activePage === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleItemClick(item.id)}
                            className={`dropdown-menu-item ${isCurrent ? 'active' : ''}`}
                          >
                            <div className="dropdown-item-icon">
                              <ItemIcon size={18} />
                            </div>
                            <div className="dropdown-item-info">
                              <div className="dropdown-item-title">{item.label}</div>
                              <div className="dropdown-item-desc">{item.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="nav-actions">
          {/* Direct WhatsApp Quick Helplines */}
          <div className="nav-quick-helplines">
            <a 
              href="https://wa.me/919161400719" 
              target="_blank" 
              rel="noreferrer" 
              className="desk-pill"
              style={{ color: '#25d366', textDecoration: 'none', fontSize: '0.74rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}
              title="Chat with Owner Krishan Narayan Dwivedi"
            >
              <MessageCircle size={13} />
              <span>Owner: 9161400719</span>
            </a>
          </div>

          {/* Theme Toggle */}
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Profile */}
          <div style={{ position: 'relative' }}>
            <div 
              className="user-role-pill" 
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: 'var(--primary-600)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700'
              }}>
                {user?.name ? user.name[0].toUpperCase() : 'K'}
              </div>
              <span style={{ fontWeight: '700', fontSize: '0.82rem' }}>
                {user?.name?.split(' ')[0] || 'Kamal'}
              </span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </div>

            {showUserMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '48px',
                width: '250px', background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
                zIndex: 100, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
                <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{user?.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>{user?.email}</div>
                  <div style={{ color: 'var(--primary-400)', fontSize: '0.74rem', marginTop: '2px' }}>📍 Mahuli, S.K.N Central Branch</div>
                </div>

                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Quick Role Switch
                </div>

                <button 
                  onClick={() => { loginWithDemo('admin'); setShowUserMenu(false); }}
                  className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}
                >
                  🛡️ Admin MD (Kamal Narayan)
                </button>
                <button 
                  onClick={() => { loginWithDemo('operator'); setShowUserMenu(false); }}
                  className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}
                >
                  🖥️ Desk Operator
                </button>
                <button 
                  onClick={() => { loginWithDemo('customer'); setShowUserMenu(false); }}
                  className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}
                >
                  👤 Customer / Student
                </button>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                  <button 
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="btn btn-danger btn-sm w-full"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Drawer Hamburger Button */}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            title="Toggle Navigation Menu"
          >
            {mobileDrawerOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Touch Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="mobile-nav-drawer-overlay" onClick={() => setMobileDrawerOpen(false)}>
          <div className="mobile-nav-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div style={{ fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Shree Online Menu</span>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Est. 2013</span>
              </div>
              <button className="icon-btn" onClick={() => setMobileDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-content">
              {navCategories.map(cat => {
                const visibleItems = cat.items.filter(item => {
                  if (item.role === 'all') return true;
                  if (item.role === 'operator' && isOperator) return true;
                  if (item.role === 'admin' && isAdmin) return true;
                  return false;
                });

                if (visibleItems.length === 0) return null;

                return (
                  <div key={cat.id} className="drawer-section">
                    <div className="drawer-section-title">{cat.label}</div>
                    <div className="drawer-section-items">
                      {visibleItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activePage === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleItemClick(item.id)}
                            className={`drawer-item ${isActive ? 'active' : ''}`}
                          >
                            <Icon size={18} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
