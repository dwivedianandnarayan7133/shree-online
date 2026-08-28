import React from 'react';
import { 
  LayoutDashboard, Inbox, Camera, FileText, Sparkles, 
  Archive, QrCode, Globe, Printer, Scan, Receipt, Settings, 
  UserCheck, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activePage, setActivePage }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isOperator = user?.role === 'admin' || user?.role === 'operator';

  const menuItems = [
    {
      category: 'Main Workspace',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, role: 'operator' },
        { id: 'requests', label: 'Request Pipeline', icon: Inbox, role: 'operator' },
        { id: 'customer-portal', label: 'Customer Portal', icon: UserCheck, role: 'all' },
      ]
    },
    {
      category: 'Digital Service Studio',
      items: [
        { id: 'passport-photo', label: 'Passport Photo Studio', icon: Camera, role: 'all' },
        { id: 'conversion-studio', label: 'Old Doc Restore & OCR', icon: Sparkles, role: 'all' },
        { id: 'document-tools', label: 'Document & PDF Tools', icon: FileText, role: 'all' },
        { id: 'file-tools', label: 'Compressor & ZIP', icon: Archive, role: 'all' },
        { id: 'utility-hub', label: 'Utilities (QR/Barcode)', icon: QrCode, role: 'all' },
      ]
    },
    {
      category: 'Operations & POS',
      items: [
        { id: 'website-launcher', label: 'Website Launcher', icon: Globe, role: 'all' },
        { id: 'print-manager', label: 'Print Manager', icon: Printer, role: 'operator' },
        { id: 'scanner-studio', label: 'Scanner Studio', icon: Scan, role: 'operator' },
        { id: 'billing-manager', label: 'Billing & POS', icon: Receipt, role: 'operator' },
      ]
    }
  ];

  if (isAdmin) {
    menuItems.push({
      category: 'System Admin',
      items: [
        { id: 'admin-panel', label: 'Admin Settings', icon: Settings, role: 'admin' }
      ]
    });
  }

  return (
    <aside className="sidebar">
      {menuItems.map((sec, idx) => {
        const visibleItems = sec.items.filter(item => {
          if (item.role === 'all') return true;
          if (item.role === 'operator' && isOperator) return true;
          if (item.role === 'admin' && isAdmin) return true;
          return false;
        });

        if (visibleItems.length === 0) return null;

        return (
          <div key={idx} style={{ marginBottom: '12px' }}>
            <div className="sidebar-category-label">{sec.category}</div>
            {visibleItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  style={{ width: '100%', textAlign: 'left' }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </aside>
  );
};
