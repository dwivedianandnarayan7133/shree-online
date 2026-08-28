import React, { useState } from 'react';
import { 
  ShieldCheck, Moon, Sun, Bell, User as UserIcon, 
  Layers, LogOut, CheckCircle, Sparkles, ChevronDown, Laptop, MapPin, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';

export const Navbar = ({ onOpenCustomerSubmit, onOpenAboutUs }) => {
  const { user, logout, loginWithDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, clearNotifications } = useSocket();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="navbar">
      {/* Brand & Tagline */}
      <div className="brand-logo" onClick={onOpenAboutUs} style={{ cursor: 'pointer' }} title="View Shree Online Sewa Kendra (Est. 2013)">
        <div className="brand-icon-wrapper">
          <Layers size={22} />
        </div>
        <div>
          <div className="brand-text-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Shree Online</span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary-400)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: '700' }}>
              Mahuli, S.K.N
            </span>
          </div>
          <div className="brand-tagline">Sewa Kendra (Est. 2013) • One Window. Every Digital Service.</div>
        </div>
      </div>

      {/* Center Actions / AdShield & Est 2013 Status */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenAboutUs}
          style={{
            background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#f59e0b', padding: '5px 12px', borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px',
            cursor: 'pointer'
          }}
          title="Learn about Shree Online Sewa Kendra history & leadership"
        >
          <Award size={14} />
          <span>Est. 2013 (13+ Yrs)</span>
        </button>

        <div className="notice-shield" style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: '700' }}>
          <ShieldCheck size={16} />
          <span>AdShield Active • Mahuli, S.K.N</span>
        </div>
      </div>

      {/* Right Navigation Controls */}
      <div className="nav-actions">
        {/* Theme Toggle */}
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Real-time Notifications */}
        <div style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            onClick={() => setShowNotifs(!showNotifs)}
            title="Notifications"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: 'var(--accent-rose)', color: '#fff',
                fontSize: '0.65rem', fontWeight: '800',
                padding: '2px 6px', borderRadius: 'var(--radius-full)'
              }}>
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', right: 0, top: '48px',
              width: '320px', background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
              zIndex: 100, overflow: 'hidden'
            }}>
              <div style={{ padding: '12px 16px', background: 'var(--card-header-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Live Activity Feed</span>
                {notifications.length > 0 && (
                  <button onClick={clearNotifications} style={{ fontSize: '0.75rem', color: 'var(--primary-500)', cursor: 'pointer' }}>
                    Clear
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '8px' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    No recent notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} style={{
                      padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.82rem'
                    }}>
                      <Sparkles size={16} color="var(--primary-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{n.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem' }}>{n.message}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Switcher */}
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
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '700', fontSize: '0.82rem', lineHeight: '1.1' }}>
                {user?.name?.split(' ')[0] || 'Operator'}
              </span>
              <span className={`role-tag ${user?.role || 'operator'}`}>
                {user?.role || 'Operator'}
              </span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>

          {showUserMenu && (
            <div style={{
              position: 'absolute', right: 0, top: '48px',
              width: '240px', background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
              zIndex: 100, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px'
            }}>
              <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{user?.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>{user?.email}</div>
                <div style={{ color: 'var(--primary-400)', fontSize: '0.74rem', marginTop: '2px' }}>📍 Mahuli, S.K.N Branch</div>
              </div>

              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Quick Role Switcher (Demo)
              </div>

              <button 
                onClick={() => { loginWithDemo('admin'); setShowUserMenu(false); }}
                className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}
              >
                👔 Admin (Full Access)
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
      </div>
    </header>
  );
};
