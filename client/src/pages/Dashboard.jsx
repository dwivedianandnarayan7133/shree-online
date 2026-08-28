import React, { useState, useEffect } from 'react';
import { 
  Users, Inbox, Printer, Sparkles, IndianRupee, HardDrive, 
  Clock, CheckCircle, PlusCircle, ArrowRight, Eye, RefreshCw,
  Award, HeartHandshake, ShieldCheck, MessageCircle, Phone
} from 'lucide-react';
import { api, getFullUrl } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { QuickActionCards } from '../components/QuickActionCards';
import { AdShieldBanner } from '../components/AdShieldBanner';
import { DocPreviewModal } from '../components/DocPreviewModal';

export const Dashboard = ({ setActivePage }) => {
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [printJobs, setPrintJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, configRes, reqsRes, printRes] = await Promise.all([
        api.getDashboardStats(),
        api.getSystemConfig(),
        api.getRequests('limit=6'),
        api.getPrintJobs('status=pending')
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (configRes.success && configRes.config) setConfig(configRes.config);
      if (reqsRes.success) setRecentRequests(reqsRes.requests);
      if (printRes.success) setPrintJobs(printRes.printJobs);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const adminPhotoUrl = config?.adminPhoto ? getFullUrl(config.adminPhoto) : '/admin-photo.jpg';
  const ownerPhotoUrl = config?.ownerPhoto ? getFullUrl(config.ownerPhoto) : null;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Shree Online Command Center (Mahuli, S.K.N)</span>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>Live System</span>
          </h1>
          <p className="page-subtitle">
            Mahuli, S.K.N Digital Workspace • Real-time processing for documents, forms, printing, and customer requests.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setActivePage('customer-portal')}>
            <PlusCircle size={14} /> New Customer Request
          </button>
        </div>
      </div>

      {/* FEATURED: LEADERSHIP SHOWCASE — ADMIN MD FIRST, THEN OWNER */}
      <div className="card" style={{
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(37, 99, 235, 0.06) 50%, rgba(245, 158, 11, 0.08) 100%)',
        borderColor: 'rgba(16, 185, 129, 0.35)',
        overflow: 'hidden'
      }}>
        <div className="card-body" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #10b981, #f59e0b)', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Award size={26} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>
                    {config?.portalName || 'Shree Online Sewa Kendra'}
                  </h2>
                  <span className="badge badge-completed" style={{ fontSize: '0.74rem', padding: '2px 10px' }}>
                    Est. {config?.establishedYear || '2013'} • 13+ Years Trust
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Main Market, Mahuli, Sant Kabir Nagar (S.K.N), U.P. • Pioneer in Online Operations & Digital Seva
                </div>
              </div>
            </div>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setActivePage('about-us')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>View Full Leadership Messages & History</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Leadership Avatars & Quote Snapshots — MANAGING DIRECTOR FIRST, OWNER SECOND */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
            
            {/* 1. MANAGING DIRECTOR & ADMIN (FIRST) */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-lg)', padding: '16px 18px', display: 'flex', gap: '16px', alignItems: 'center',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)'
            }}>
              {/* Circular Photo */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img 
                  src={adminPhotoUrl} 
                  alt="Kamal Narayan Dwivedi" 
                  style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    objectFit: 'cover', border: '3px solid #10b981',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    aspectRatio: '1/1'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/admin-photo.jpg';
                  }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: '#10b981', color: '#fff', borderRadius: '50%',
                  width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: '900', border: '2px solid #fff'
                }}>
                  🛡️
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                  <div style={{ fontWeight: '900', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {config?.adminName || 'Kamal Narayan Dwivedi'}
                  </div>
                  <span className="badge badge-completed" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                    Managing Director & Controller
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px', lineHeight: '1.4' }}>
                  "Engineered with AdShield protection, Google OTP & AI document studios for 100% operational excellence."
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.75rem' }}>
                  <a href={`https://wa.me/91${config?.adminPhone || '8090794210'}`} target="_blank" rel="noreferrer" style={{ color: '#25d366', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MessageCircle size={12} /> {config?.adminPhone || '8090794210'}
                  </a>
                  <a href={`mailto:${config?.adminEmail || 'kdshree778@gmail.com'}`} style={{ color: 'var(--primary-400)', textDecoration: 'none' }}>
                    {config?.adminEmail || 'kdshree778@gmail.com'}
                  </a>
                </div>
              </div>
            </div>

            {/* 2. FOUNDER & MANAGING OWNER (SECOND) */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-lg)', padding: '16px 18px', display: 'flex', gap: '16px', alignItems: 'center',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)'
            }}>
              {/* Circular Photo */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {ownerPhotoUrl ? (
                  <img 
                    src={ownerPhotoUrl} 
                    alt="Krishan Narayan Dwivedi" 
                    style={{
                      width: '72px', height: '72px', borderRadius: '50%',
                      objectFit: 'cover', border: '3px solid #f59e0b',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                      aspectRatio: '1/1'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '900', fontSize: '1.4rem', border: '3px solid #f59e0b',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    aspectRatio: '1/1'
                  }}>
                    KD
                  </div>
                )}
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: '#f59e0b', color: '#000', borderRadius: '50%',
                  width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: '900', border: '2px solid #fff'
                }}>
                  👑
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                  <div style={{ fontWeight: '900', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {config?.ownerName || 'Krishan Narayan Dwivedi'}
                  </div>
                  <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                    Founder & Managing Owner
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px', lineHeight: '1.4' }}>
                  "Serving Mahuli, S.K.N since 2013 with 100% reliable government applications and customer trust."
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.75rem' }}>
                  <a href={`https://wa.me/91${config?.ownerPhone || '9161400719'}`} target="_blank" rel="noreferrer" style={{ color: '#25d366', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MessageCircle size={12} /> {config?.ownerPhone || '9161400719'}
                  </a>
                  <a href={`mailto:${config?.ownerEmail || 'onlinebaba111111@gmail.com'}`} style={{ color: 'var(--primary-400)', textDecoration: 'none' }}>
                    {config?.ownerEmail || 'onlinebaba111111@gmail.com'}
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* AdShield Security Banner */}
      <AdShieldBanner />

      {/* KPI Stats Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div>
            <div className="stat-val">{stats?.todayRequests ?? 0}</div>
            <div className="stat-label">Today's Requests</div>
          </div>
          <div className="stat-icon-wrapper blue"><Inbox size={22} /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-val">{stats?.pendingRequests ?? 0}</div>
            <div className="stat-label">In Pipeline</div>
          </div>
          <div className="stat-icon-wrapper amber"><Clock size={22} /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-val">{stats?.completedRequests ?? 0}</div>
            <div className="stat-label">Completed Orders</div>
          </div>
          <div className="stat-icon-wrapper emerald"><CheckCircle size={22} /></div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-val">₹{stats?.todayRevenue ?? 0}</div>
            <div className="stat-label">Today's Revenue</div>
          </div>
          <div className="stat-icon-wrapper purple"><IndianRupee size={22} /></div>
        </div>
      </div>

      {/* Quick Launch Studios */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--primary-500)" />
          <span>Quick Launch Studios</span>
        </div>
        <QuickActionCards setActivePage={setActivePage} />
      </div>

      {/* Recent Pipeline Requests */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div className="card-title">
            <Inbox size={18} color="var(--primary-500)" />
            <span>Recent Citizen Service Requests</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setActivePage('requests')}>
            View All Pipeline ({stats?.totalRequests ?? 0})
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Token ID</th>
                  <th>Customer Name</th>
                  <th>Service Type</th>
                  <th>Status</th>
                  <th>Assigned Desk</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No active requests right now. Click "New Customer Request" to initiate.
                    </td>
                  </tr>
                ) : (
                  recentRequests.map(req => (
                    <tr key={req._id}>
                      <td style={{ fontWeight: '800', color: 'var(--primary-400)', fontFamily: 'monospace' }}>
                        {req.trackingId || req._id.substring(req._id.length - 6).toUpperCase()}
                      </td>
                      <td>
                        <div style={{ fontWeight: '700' }}>{req.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.customerPhone || '—'}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary" style={{ fontSize: '0.74rem' }}>
                          {req.serviceType.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td><StatusBadge status={req.status} /></td>
                      <td style={{ fontSize: '0.82rem' }}>{req.assignedTo?.name || 'Unassigned'}</td>
                      <td style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                          onClick={() => setActivePage('requests')}
                        >
                          <Eye size={12} /> Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {previewDoc && (
        <DocPreviewModal 
          isOpen={true} 
          onClose={() => setPreviewDoc(null)} 
          fileUrl={previewDoc.url} 
          fileName={previewDoc.name} 
        />
      )}
    </div>
  );
};
