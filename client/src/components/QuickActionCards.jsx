import React from 'react';
import { 
  Camera, Sparkles, FileText, Minimize2, 
  Printer, UserPlus, Globe, Receipt, Scan, QrCode
} from 'lucide-react';

export const QuickActionCards = ({ onSelectTool }) => {
  const actions = [
    { id: 'passport-photo', title: 'Passport Photo', desc: '4/6/8 Sheet generator', icon: Camera, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
    { id: 'conversion-studio', title: 'Old Doc & OCR', desc: 'Restore & Word/Excel export', icon: Sparkles, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)' },
    { id: 'document-tools', title: 'PDF & Doc Tools', desc: 'Merge, split, images to PDF', icon: FileText, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' },
    { id: 'file-tools', title: 'Compress & ZIP', desc: 'Reduce MBs for portals', icon: Minimize2, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
    { id: 'print-manager', title: 'Print Queue', desc: 'A4 / Color / B&W prints', icon: Printer, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
    { id: 'scanner-studio', title: 'Scanner Studio', desc: 'Hardware & Webcam scan', icon: Scan, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)' },
    { id: 'billing-manager', title: 'Billing & POS', desc: 'Receipts & daily sales', icon: Receipt, color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.12)' },
    { id: 'website-launcher', title: 'Gov Portals', desc: 'Aadhaar, PAN, CSC shortcuts', icon: Globe, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)' }
  ];

  return (
    <div className="quick-action-grid">
      {actions.map(act => {
        const Icon = act.icon;
        return (
          <div 
            key={act.id} 
            className="quick-action-card"
            onClick={() => onSelectTool(act.id)}
          >
            <div className="quick-action-icon" style={{ background: act.bg, color: act.color }}>
              <Icon size={22} />
            </div>
            <div>
              <div className="quick-action-title">{act.title}</div>
              <div className="quick-action-desc">{act.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
