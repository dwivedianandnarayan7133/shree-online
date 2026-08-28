import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Inbox, Camera, FileText, Sparkles, 
  Archive, QrCode, Globe, Printer, Scan, Receipt, Settings, 
  UserCheck, ShieldCheck, HeartHandshake, Award, Menu, X,
  ChevronDown, Sun, Moon, Bell, LogOut, Phone, MessageCircle, MapPin,
  ExternalLink, Layers, CheckCircle2, UserPlus, IndianRupee, HardDrive, LogIn, User
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
  const isCustomer = user?.role === 'customer';
  const isGuest = !user;

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

  // Define Navigation Categories dynamically based on user role
  const navCategories = [];

  // Workspace Category
  const workspaceItems = [];
  if (isOperator) {
    workspaceItems.push({ id: 'dashboard', label: 'Command Center Dashboard', desc: 'Real-time KPIs, live queue & quick tools', icon: LayoutDashboard });
    workspaceItems.push({ id: 'requests', label: 'Request Pipeline Manager', desc: 'Manage customer submissions & orders', icon: Inbox });
  }
  workspaceItems.push({ id: 'customer-portal', label: 'Citizen Service Desk', desc: 'Submit application & track token status', icon: UserCheck });
  workspaceItems.push({ id: 'about-us', label: 'About Us & Leadership', desc: 'Est. 2013 history & owner/admin messages', icon: Award });

  navCategories.push({
    id: 'workspace',
    label: isOperator ? 'Staff Workspace' : 'Home & Services',
    icon: isOperator ? LayoutDashboard : UserCheck,
    items: workspaceItems
  });

  // Digital Studios (Available for ALL visitors and staff)
  navCategories.push({
    id: 'studios',
    label: 'Digital Studios',
    icon: Sparkles,
    items: [
      { id: 'passport-photo', label: 'Passport Photo Studio', desc: '6/line A4 sheet & exam sky-blue BG', icon: Camera },
      { id: 'conversion-studio', label: 'Old Doc Restore & OCR', desc: 'Extract scans to Word (.docx) & Excel', icon: Sparkles },
      { id: 'document-tools', label: 'Document & PDF Studio', desc: 'Images to PDF, Merge, Split & Compress', icon: FileText },
      { id: 'file-tools', label: 'Compressor & ZIP Studio', desc: 'Batch compression & extraction', icon: Archive },
      { id: 'utility-hub', label: 'Utilities (QR & Barcode)', desc: 'Instant QR code & barcode generator', icon: QrCode },
    ]
  });

  // Operations Category
  const operationItems = [
    { id: 'website-launcher', label: 'Custom Browser & Gateway', desc: 'In-portal ad-blocked govt browser', icon: Globe }
  ];
  if (isOperator) {
    operationItems.push({ id: 'print-manager', label: 'Print Job Manager', desc: 'A4/Color queue & printer telemetry', icon: Printer });
    operationItems.push({ id: 'scanner-studio', label: 'Scanner Studio', desc: 'Device presets, de-skew & scan to PDF', icon: Scan });
    operationItems.push({ id: 'billing-manager', label: 'Billing & POS Invoices', desc: 'Thermal receipts & GST calculations', icon: Receipt });
  }

  navCategories.push({
    id: 'operations',
    label: isOperator ? 'Operations & POS' : 'Online Gateway',
    icon: Globe,
    items: operationItems
  });

  // MD Controller (Only for Admin)
  if (isAdmin) {
    navCategories.push({
      id: 'admin',
      label: 'MD Controller',
      icon: Settings,
      items: [
        { id: 'admin-panel', label: 'Admin Control Center', desc: 'Static pages, operators, catalog & retention', icon: Settings }
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
    return null;
  };

  const activeCategoryId = getActiveCategory();

  return (
    <header className="compact-navbar-wrapper" ref={navRef}>
      <div className="compact-navbar-inner">
        
        {/* 1. Left Brand Identity */}
        <div 
          className="navbar-brand" 
          onClick={() => handleItemClick(isOperator ? 'dashboard' : 'customer-portal')}
          title="Shree Online Sewa Kendra (Mahuli, S.K.N)"
        >
          <div className="brand-icon-wrapper">
            ⚡
          </div>
          <div>
            <div className="brand-name">
              <span>Shree Online</span>
              <span className="brand-est-badge">Est. 2013</span>
            </div>
            <div className="brand-location">
              Main Market, Mahuli, S.K.N (U.P.)
            </div>
          </div>
        </div>

        {/* 2. Desktop Dropdown Navigation Categories */}
        <nav className="navbar-dropdown-nav">
          {navCategories.map(cat => {
            const Icon = cat.icon;
            const isOpen = openDropdown === cat.id;
            const isCategoryActive = activeCategoryId === cat.id;

            return (
              <div key={cat.id} className="dropdown-category-wrapper">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(isOpen ? null : cat.id)}
                  className={`dropdown-trigger-btn ${isOpen ? 'active-dropdown' : ''} ${isCategoryActive ? 'active-category' : ''}`}
                >
                  <Icon size={15} />
                  <span>{cat.label}</span>
                  <ChevronDown size={13} className={`chevron-icon ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Floating Menu */}
                {isOpen && (
                  <div className="dropdown-menu-card">
                    <div className="dropdown-items-grid">
                      {cat.items.map(item => {
                        const ItemIcon = item.icon;
                        const isCurrent = activePage === item.id;

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleItemClick(item.id)}
                            className={`dropdown-menu-item ${isCurrent ? 'selected-item' : ''}`}
                          >
                            <div className="item-icon-box">
                              <ItemIcon size={18} />
                            </div>
                            <div className="item-text-box">
                              <div className="item-title">
                                <span>{item.label}</span>
                                {isCurrent && <span className="active-dot">•</span>}
                              </div>
                              <div className="item-desc">{item.desc}</div>
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

        {/* 3. Right Action Tools (Theme, Quick Help, Auth Controls) */}
        <div className="navbar-right-tools">
          
          {/* Direct WhatsApp Call & Helpline */}
          <a
            href="https://wa.me/918090794210"
            target="_blank"
            rel="noreferrer"
            className="navbar-tool-btn wa-badge-btn"
            title="Helpline: Kamal Narayan (+91 8090794210)"
          >
            <MessageCircle size={15} color="#25d366" />
            <span className="hide-mobile">Helpline</span>
          </a>

          {/* Dark / Light Mode Toggle */}
          <button 
            onClick={toggleTheme} 
            className="navbar-tool-btn icon-only" 
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* User Account / Staff Login Button */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="user-profile-pill"
              >
                <div className={`user-avatar-dot ${user.role || 'customer'}`}>
                  {user.role === 'admin' ? '🛡️' : user.role === 'operator' ? '🖥️' : '👤'}
                </div>
                <div className="user-info-text hide-mobile">
                  <span className="user-name">{user.name?.split(' ')[0] || 'Account'}</span>
                  <span className="user-role-badge">{(user.role || 'customer').toUpperCase()}</span>
                </div>
                <ChevronDown size={12} />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="user-dropdown-popover">
                  <div className="user-dropdown-header">
                    <div style={{ fontWeight: '800', fontSize: '0.88rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    <span className={`role-tag ${user.role}`} style={{ marginTop: '6px', display: 'inline-block' }}>
                      {user.role?.toUpperCase()}
                    </span>
                  </div>

                  {isAdmin && (
                    <button 
                      onClick={() => handleItemClick('admin-panel')}
                      className="user-menu-action"
                    >
                      <Settings size={14} /> MD Admin Panel
                    </button>
                  )}

                  <button 
                    onClick={() => { logout(); setShowUserMenu(false); setActivePage('customer-portal'); }}
                    className="user-menu-action text-danger"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setActivePage('login')}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}
            >
              <LogIn size={14} />
              <span>Sign In / Staff</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button 
            className="navbar-tool-btn mobile-menu-toggle"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          >
            {mobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* 4. Mobile Sliding Drawer */}
      {mobileDrawerOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-drawer-content">
            {navCategories.map(cat => (
              <div key={cat.id} className="mobile-nav-section">
                <div className="mobile-section-title">
                  <span>{cat.label}</span>
                </div>
                <div className="mobile-section-items">
                  {cat.items.map(item => {
                    const ItemIcon = item.icon;
                    const isCurrent = activePage === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={`mobile-nav-item ${isCurrent ? 'active' : ''}`}
                      >
                        <ItemIcon size={16} />
                        <span>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {!user && (
              <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  className="btn btn-primary w-full"
                  onClick={() => handleItemClick('login')}
                >
                  <LogIn size={15} /> Sign In / Staff Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
