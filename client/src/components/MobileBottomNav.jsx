import React from 'react';
import { 
  LayoutDashboard, Globe, Camera, UserCheck, KeyRound, 
  Inbox, Sparkles, FileText, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav = ({ activePage, setActivePage }) => {
  const { user } = useAuth();
  const isOperator = user?.role === 'admin' || user?.role === 'operator';

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'website-launcher', label: 'Browser', icon: Globe },
    { id: 'passport-photo', label: 'Passport', icon: Camera },
    { id: 'customer-portal', label: 'Apply', icon: UserCheck },
    { 
      id: isOperator ? 'requests' : 'login', 
      label: isOperator ? 'Orders' : 'Staff', 
      icon: isOperator ? Inbox : KeyRound 
    }
  ];

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => {
              setActivePage(item.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="bottom-nav-icon-box">
              <Icon size={20} />
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
