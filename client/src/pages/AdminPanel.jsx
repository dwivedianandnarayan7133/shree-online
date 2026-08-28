import React, { useState, useEffect } from 'react';
import { 
  Settings, Users, Clock, ShieldCheck, 
  Trash2, HardDrive, Edit3, CheckCircle2, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('pricing'); // 'pricing', 'retention', 'logs', 'users'

  // Pricing Catalog State
  const [services, setServices] = useState([]);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [newPrice, setNewPrice] = useState(0);

  // Retention Config State
  const [config, setConfig] = useState(null);
  const [retentionHours, setRetentionHours] = useState(24);
  const [adShieldEnabled, setAdShieldEnabled] = useState(true);

  // Audit Logs State
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [cleanupResult, setCleanupResult] = useState(null);

  const fetchAdminData = async () => {
    try {
      const [servRes, confRes, logRes, userRes] = await Promise.all([
        api.getPricing(),
        api.getSystemConfig(),
        api.getAuditLogs('limit=25'),
        api.getUsers()
      ]);

      if (servRes.success) setServices(servRes.services);
      if (confRes.success) {
        setConfig(confRes.config);
        setRetentionHours(confRes.config.retentionHours || 24);
        setAdShieldEnabled(confRes.config.adShieldEnabled ?? true);
      }
      if (logRes.success) setLogs(logRes.logs);
      if (userRes.success) setUsers(userRes.users);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdatePrice = async (serviceId) => {
    try {
      const res = await api.updatePrice(serviceId, { basePrice: Number(newPrice) });
      if (res.success) {
        setEditingPriceId(null);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update price');
    }
  };

  const handleSaveConfig = async () => {
    try {
      const res = await api.updateSystemConfig({
        retentionHours: Number(retentionHours),
        adShieldEnabled
      });
      if (res.success) {
        alert('System retention policy and security settings updated.');
      }
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    }
  };

  const handleTriggerManualCleanup = async () => {
    if (!window.confirm('Trigger manual deletion of expired temporary processing files now?')) return;
    try {
      const res = await api.triggerCleanup({ retentionHours: Number(retentionHours) });
      if (res.success) {
        setCleanupResult(res.result);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Cleanup error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Settings size={24} color="var(--primary-500)" />
            <span>Shree Online Master Admin & Settings (Mahuli, S.K.N)</span>
          </h1>
          <p className="page-subtitle">
            Configure digital service pricing, automated file retention cleaner schedules, security shield, and audit logs.
          </p>
        </div>
      </div>

      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'pricing' ? 'active' : ''}`} onClick={() => setActiveTab('pricing')}>
          <Edit3 size={16} /> Service Pricing Catalog
        </button>
        <button className={`tab-btn ${activeTab === 'retention' ? 'active' : ''}`} onClick={() => setActiveTab('retention')}>
          <Clock size={16} /> File Retention & Auto-Cleaner
        </button>
        <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          <ShieldCheck size={16} /> Security Audit Logs
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <Users size={16} /> Operators & Staff
        </button>
      </div>

      {/* 1. PRICING CATALOG */}
      {activeTab === 'pricing' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span>Configurable Service Rates</span></div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Category</th>
                    <th>Rate / Unit</th>
                    <th>Est. Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(s => (
                    <tr key={s._id}>
                      <td style={{ fontWeight: '700' }}>{s.name}</td>
                      <td>
                        <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{s.category}</span>
                      </td>
                      <td>
                        {editingPriceId === s._id ? (
                          <input 
                            type="number"
                            className="form-input"
                            style={{ width: '90px', padding: '4px 8px' }}
                            value={newPrice}
                            onChange={e => setNewPrice(e.target.value)}
                          />
                        ) : (
                          <span style={{ fontWeight: '800', color: 'var(--accent-emerald)' }}>
                            ₹{s.basePrice} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({s.unit})</span>
                          </span>
                        )}
                      </td>
                      <td>{s.estimatedMinutes} mins</td>
                      <td>
                        {editingPriceId === s._id ? (
                          <div className="flex gap-1">
                            <button className="btn btn-success btn-sm" onClick={() => handleUpdatePrice(s._id)}>Save</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditingPriceId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setEditingPriceId(s._id);
                              setNewPrice(s.basePrice);
                            }}
                          >
                            Edit Price
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. FILE RETENTION SCHEDULER */}
      {activeTab === 'retention' && (
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Clock size={18} color="var(--primary-500)" />
                <span>Automatic File Retention & Privacy Cleanup</span>
              </div>
            </div>
            <div className="card-body">
              <div className="notice-banner notice-warning" style={{ marginBottom: '20px' }}>
                <div>
                  <b>Privacy & Confidentiality Standard:</b> Cyber cafes handle sensitive government IDs, marksheets, and financial documents. Setting a short retention schedule ensures temporary conversion files are permanently cleaned up while permanent customer request records remain intact.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Auto-Delete Temporary Processing Files After:</label>
                <select 
                  className="form-select"
                  value={retentionHours}
                  onChange={e => setRetentionHours(Number(e.target.value))}
                >
                  <option value={1}>1 Hour (Strict Privacy Mode)</option>
                  <option value={6}>6 Hours (Daily Desk Mode)</option>
                  <option value={24}>24 Hours (Standard 1 Day Retention - Recommended)</option>
                  <option value={168}>7 Days (Weekly Extended Retention)</option>
                </select>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
                <input 
                  type="checkbox"
                  id="adShieldToggle"
                  checked={adShieldEnabled}
                  onChange={e => setAdShieldEnabled(e.target.checked)}
                />
                <label htmlFor="adShieldToggle" style={{ fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>
                  Enable AdShield workspace distraction and malicious popup protection
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-primary" onClick={handleSaveConfig}>
                  Save Retention & Security Settings
                </button>
                <button className="btn btn-danger" onClick={handleTriggerManualCleanup}>
                  <Trash2 size={16} /> Run Manual Cleanup Now
                </button>
              </div>

              {cleanupResult && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'var(--status-comp-bg)', color: 'var(--status-comp-text)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  ✅ Cleaned {cleanupResult.cleanedFilesCount} temporary files ({cleanupResult.freedKb} KB freed).
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShieldCheck size={18} color="var(--accent-emerald)" />
              <span>System & Document Access Audit Trail</span>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(l.timestamp).toLocaleString()}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{l.action}</td>
                      <td>{l.user}</td>
                      <td><span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{l.role}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{l.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. USERS & OPERATORS */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span>Operators & Staff Accounts</span></div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: '700' }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={`role-tag ${u.role}`}>{u.role}</span></td>
                      <td>{u.phone || '—'}</td>
                      <td><span className="badge badge-completed">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
