import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, EyeOff, Zap } from 'lucide-react';

export const AdShieldBanner = () => {
  return (
    <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(37, 99, 235, 0.08))', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
      <div className="card-body" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>AdShield & Cyber Protection Active</span>
              <span className="badge badge-completed" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>Protected</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Blocking intrusive advertisements, malicious popups, tracker scripts & suspicious redirects inside workspace.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-1">
            <Lock size={14} color="var(--accent-emerald)" />
            <span>Zero Data Leak</span>
          </div>
          <div className="flex items-center gap-1">
            <EyeOff size={14} color="var(--accent-cyan)" />
            <span>Privacy Guard</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={14} color="var(--accent-amber)" />
            <span>High Speed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
