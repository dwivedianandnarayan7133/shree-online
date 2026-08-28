import React, { useState } from 'react';
import { 
  LayoutDashboard, Inbox, Camera, FileText, Sparkles, 
  Archive, QrCode, Globe, Printer, Scan, Receipt, Settings, 
  UserCheck, ShieldCheck, HeartHandshake, Award, Menu, X,
  ChevronDown, Sun, Moon, Bell, LogOut, Phone, MessageCircle, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';

export const NavigationBar = ({ activePage, setActivePage }) => {
  const { user, logout, loginWithDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, clearNotifications } = useSocket();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isOperator = user?.role === 'admin' || user?.role === 'operator';

  // Navigation Items
  const navCategories = [
    {
      category: 'Workspace',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, role: 'operator' },
        { id: 'requests', label: 'Request Pipeline', icon: Inbox, role: 'operator' },
        { id: 'customer-portal', label: 'Customer Portal', icon: UserCheck, role: 'all' },
        { id: 'about-us', label: 'About Us (Est. 2013)', icon: Award, role: 'all' },
      ]
    },
    {
      category: 'Digital Studios',
      items: [
        { id: 'passport-photo', label: 'Passport Photo Studio', icon: Camera, role: 'all' },
        { id: 'conversion-studio', label: 'Doc Restore & OCR', icon: Sparkles, role: 'all' },
        { id: 'document-tools', label: 'Document & PDF', icon: FileText, role: 'all' },
        { id: 'file-tools', label: 'ZIP & Files', icon: Archive, role: 'all' },
        { id: 'utility-hub', label: 'QR Utilities', icon: QrCode, role: 'all' },
      ]
    },
    {
      category: 'Operations & POS',
      items: [
        { id: 'website-launcher', label: 'Custom Browser', icon: Globe, role: 'all' },
        { id: 'print-manager', label: 'Print Manager', icon: Printer, role: 'operator' },
        { id: 'scanner-studio', label: 'Scanner Studio', icon: Scan, role: 'operator' },
        { id: 'billing-manager', label: 'Billing & POS', icon: Receipt, role: 'operator' },
      ]
    }
  ];

  if (isAdmin) {
    navCategories.push({
      category: 'MD Controller',
      items: [
        { id: 'admin-panel', label: 'Admin Controller', icon: Settings, role: 'admin' }
      ]
    });
  }

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setMobileDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="universal-nav-header">
      {/* Upper Brand & Controls Bar */}
      <div className="universal-nav-top">
        <div className="brand-logo" onClick={() => handleNavClick('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-wrapper">
            ⚡
          </div>
          <div>
            <div className="brand-text-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Shree Online</span>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                Mahuli, S.K.N
              </span>
            </div>
            <div className="brand-tagline">Sewa Kendra • Est. 2013 • One Window. Every Digital Service.</div>
          </div>
        </div>

        {/* Center Notice & Helplines (Desktop & Tablet) */}
        <div className="nav-center-desk-info">
          <button 
            onClick={() => handleNavClick('about-us')}
            className="btn btn-sm btn-outline"
            style={{ fontSize: '0.75rem', padding: '4px 10px', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b' }}
          >
            <Award size={13} />
            <span>Est. 2013 (13+ Yrs)</span>
          </button>

          <a 
            href="https://wa.me/919161400719" 
            target="_blank" 
            rel="noreferrer" 
            className="desk-pill"
            style={{ color: '#25d366', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <MessageCircle size={14} />
            <span>Owner: 9161400719</span>
          </a>

          <a 
            href="https://wa.me/918090794210" 
            target="_blank" 
            rel="noreferrer" 
            className="desk-pill"
            style={{ color: '#25d366', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <MessageCircle size={14} />
            <span>Admin MD: 8090794210</span>
          </a>
        </div>

        {/* Right Controls */}
        <div className="nav-actions">
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
                {user?.name ? user.name[0].toUpperCase() : 'U'}
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

      {/* Horizontal Navigation Ribbon (Desktop, Laptops & Wide Tablets) */}
      <nav className="universal-nav-ribbon">
        <div className="ribbon-inner">
          {navCategories.map((cat, cIdx) => {
            const visibleItems = cat.items.filter(item => {
              if (item.role === 'all') return true;
              if (item.role === 'operator' && isOperator) return true;
              if (item.role === 'admin' && isAdmin) return true;
              return false;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={cIdx} className="ribbon-group">
                <div className="ribbon-group-label">{cat.category}</div>
                <div className="ribbon-group-items">
                  {visibleItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`ribbon-item ${isActive ? 'active' : ''}`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </nav>

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
              {navCategories.map((cat, cIdx) => {
                const visibleItems = cat.items.filter(item => {
                  if (item.role === 'all') return true;
                  if (item.role === 'operator' && isOperator) return true;
                  if (item.role === 'admin' && isAdmin) return true;
                  return false;
                });

                if (visibleItems.length === 0) return null;

                return (
                  <div key={cIdx} className="drawer-section">
                    <div className="drawer-section-title">{cat.category}</div>
                    <div className="drawer-section-items">
                      {visibleItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activePage === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
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
