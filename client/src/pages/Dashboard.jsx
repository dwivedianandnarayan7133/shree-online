import React, { useState, useEffect } from 'react';
import { 
  Users, Inbox, Printer, Sparkles, IndianRupee, HardDrive, 
  Clock, CheckCircle, PlusCircle, ArrowRight, Eye, RefreshCw,
  Award, HeartHandshake, ShieldCheck, MessageCircle, Phone,
  Search, FileText, Camera, Archive, QrCode, Globe, CheckCircle2,
  AlertCircle, Briefcase, ChevronRight
} from 'lucide-react';
import { api, getFullUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_CONFIG, DEFAULT_STATS } from '../services/defaultConfig';
import { StatusBadge } from '../components/StatusBadge';
import { QuickActionCards } from '../components/QuickActionCards';
import { AdShieldBanner } from '../components/AdShieldBanner';
import { DocPreviewModal } from '../components/DocPreviewModal';
import { JobAlertsBoard } from '../components/JobAlertsBoard';
import { JobManagerModal } from '../components/JobManagerModal';

export const Dashboard = ({ setActivePage }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isOperator = user?.role === 'admin' || user?.role === 'operator';

  const [stats, setStats] = useState(DEFAULT_STATS);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Job Modal for Admin
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Citizen Token Quick Tracker
  const [searchToken, setSearchToken] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [statsRes, configRes, reqsRes] = await Promise.all([
        isOperator ? api.getDashboardStats().catch(() => ({ success: false })) : Promise.resolve(null),
        api.getSystemConfig().catch(() => ({ success: false })),
        isOperator ? api.getRequests('limit=6').catch(() => ({ success: false })) : Promise.resolve(null)
      ]);

      if (statsRes && statsRes.success && statsRes.stats) setStats(statsRes.stats);
      if (configRes && configRes.success && configRes.config) setConfig(configRes.config);
      if (reqsRes && reqsRes.success && reqsRes.requests && reqsRes.requests.length > 0) {
        setRecentRequests(reqsRes.requests);
      }
    } catch (err) {
      console.warn('Dashboard background sync notice:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleTrackToken = async (e) => {
    e.preventDefault();
    if (!searchToken.trim()) return;

    setTrackLoading(true);
    setTrackError('');
    setTrackResult(null);

    try {
      const res = await api.trackRequest(searchToken.trim());
      if (res.success && res.request) {
        setTrackResult(res.request);
      } else {
        setTrackError('No application found with this Token ID or Phone Number.');
      }
    } catch (err) {
      setTrackError(err.message || 'Unable to find application. Please verify your token.');
    } finally {
      setTrackLoading(false);
    }
  };

  const adminPhotoUrl = config?.adminPhoto ? getFullUrl(config.adminPhoto) : '/admin-photo.jpg';
  const ownerPhotoUrl = config?.ownerPhoto ? getFullUrl(config.ownerPhoto) : null;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>{isOperator ? 'Staff Command Center (Mahuli, S.K.N)' : 'Shree Online Sewa Kendra'}</span>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
              {isOperator ? 'Live Staff Desk' : 'Citizen Public Portal'}
            </span>
          </h1>
          <p className="page-subtitle">
            {isOperator 
              ? 'Mahuli, S.K.N Digital Workspace • Real-time processing for documents, forms, printing, and customer orders.' 
              : 'Main Market, Mahuli, Sant Kabir Nagar (S.K.N), U.P. • One Window. Every Government & Digital Service.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setActivePage('customer-portal')}>
            <PlusCircle size={14} /> New Application Request
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
        <div className="card-body" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #10b981, #f59e0b)', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Award size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>
                    {config?.portalName || 'Shree Online Sewa Kendra'}
                  </h2>
                  <span className="badge badge-completed" style={{ fontSize: '0.72rem', padding: '2px 10px' }}>
                    Est. {config?.establishedYear || '2013'} • 13+ Years Trust
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Main Market, Mahuli, Sant Kabir Nagar (S.K.N), U.P. • Pioneer in Online Operations & Digital Seva
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href="https://wa.me/918090794210"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm"
                style={{ background: '#25d366', color: '#ffffff', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
              >
                <MessageCircle size={15} /> WhatsApp Desk
              </a>
              <a
                href="tel:8090794210"
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Phone size={14} /> Call Kendra
              </a>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            
            {/* 1. MANAGING DIRECTOR (MD & CONTROLLER) */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '2px solid rgba(37, 99, 235, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {config?.adminPhoto ? (
                  <img 
                    src={adminPhotoUrl} 
                    alt="Kamal Narayan Dwivedi" 
                    style={{
                      width: '64px', height: '64px', borderRadius: '50%',
                      objectFit: 'cover', border: '3px solid #2563eb',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                      aspectRatio: '1/1'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #38bdf8)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '900', fontSize: '1.3rem', border: '3px solid #2563eb',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    aspectRatio: '1/1'
                  }}>
                    KD
                  </div>
                )}
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: '#2563eb', color: '#fff', borderRadius: '50%',
                  width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: '900', border: '2px solid #fff'
                }}>
                  🛡️
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                  <div style={{ fontWeight: '900', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                    {config?.adminName || 'Kamal Narayan Dwivedi'}
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                    Managing Director
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px', lineHeight: '1.3' }}>
                  "Ensuring instant, error-free online submissions for every student and citizen in Mahuli."
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '0.74rem' }}>
                  <a href={`https://wa.me/91${config?.adminPhone || '8090794210'}`} target="_blank" rel="noreferrer" style={{ color: '#25d366', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MessageCircle size={12} /> {config?.adminPhone || '8090794210'}
                  </a>
                </div>
              </div>
            </div>

            {/* 2. FOUNDER & MANAGING OWNER */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '2px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {ownerPhotoUrl ? (
                  <img 
                    src={ownerPhotoUrl} 
                    alt="Krishan Narayan Dwivedi" 
                    style={{
                      width: '64px', height: '64px', borderRadius: '50%',
                      objectFit: 'cover', border: '3px solid #f59e0b',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                      aspectRatio: '1/1'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '900', fontSize: '1.3rem', border: '3px solid #f59e0b',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    aspectRatio: '1/1'
                  }}>
                    KD
                  </div>
                )}
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: '#f59e0b', color: '#000', borderRadius: '50%',
                  width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: '900', border: '2px solid #fff'
                }}>
                  👑
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                  <div style={{ fontWeight: '900', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                    {config?.ownerName || 'Krishan Narayan Dwivedi'}
                  </div>
                  <span className="badge badge-warning" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                    Founder & Owner
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px', lineHeight: '1.3' }}>
                  "Serving Mahuli, S.K.N since 2013 with 100% reliable government applications."
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '0.74rem' }}>
                  <a href={`https://wa.me/91${config?.ownerPhone || '9161400719'}`} target="_blank" rel="noreferrer" style={{ color: '#25d366', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MessageCircle size={12} /> {config?.ownerPhone || '9161400719'}
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* CITIZEN TOKEN QUICK STATUS TRACKER (FOR PUBLIC DESK) */}
      <div className="card" style={{
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(56, 189, 248, 0.05))',
        border: '1px solid rgba(37, 99, 235, 0.3)'
      }}>
        <div className="card-body" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Search size={18} color="#2563eb" />
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>
              Check Your Application Token Status
            </h3>
          </div>
          <form onSubmit={handleTrackToken} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter 6-character Token ID (e.g. SO-8921) or Mobile Number..."
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              style={{ flex: 1, minWidth: '220px' }}
            />
            <button type="submit" className="btn btn-primary" disabled={trackLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size={14} /> {trackLoading ? 'Searching...' : 'Track Status'}
            </button>
          </form>

          {trackError && (
            <div className="alert alert-danger" style={{ marginTop: '12px', fontSize: '0.84rem' }}>
              <AlertCircle size={15} /> {trackError}
            </div>
          )}

          {trackResult && (
            <div style={{ marginTop: '14px', padding: '14px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontWeight: '800', color: 'var(--primary-400)', fontSize: '0.9rem', marginRight: '8px' }}>
                    {trackResult.trackingId}
                  </span>
                  <strong style={{ fontSize: '0.9rem' }}>{trackResult.customerName}</strong>
                </div>
                <StatusBadge status={trackResult.status} />
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Service: <strong>{(trackResult.serviceType || 'form').replace('_', ' ').toUpperCase()}</strong> • 
                Submitted: {new Date(trackResult.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REVENUE & INTERNAL OPERATOR ANALYTICS — ONLY SHOWN TO LOGGED-IN STAFF / ADMINS */}
      {isOperator && (
        <div className="stat-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <div>
              <div className="stat-val">{stats?.todayRequests ?? 14}</div>
              <div className="stat-label">Today's Requests</div>
            </div>
            <div className="stat-icon-wrapper blue"><Inbox size={22} /></div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-val">{stats?.pendingRequests ?? 3}</div>
              <div className="stat-label">In Pipeline</div>
            </div>
            <div className="stat-icon-wrapper amber"><Clock size={22} /></div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-val">{stats?.completedRequests ?? 1237}</div>
              <div className="stat-label">Completed Orders</div>
            </div>
            <div className="stat-icon-wrapper emerald"><CheckCircle size={22} /></div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-val">₹{stats?.todayRevenue ?? 2850}</div>
              <div className="stat-label">Today's Revenue</div>
            </div>
            <div className="stat-icon-wrapper purple"><IndianRupee size={22} /></div>
          </div>
        </div>
      )}

      {/* LIVE GOVERNMENT JOB ALERTS & RECRUITMENT HUB */}
      <JobAlertsBoard 
        setActivePage={setActivePage} 
        onOpenJobModal={(jobToEdit) => {
          setSelectedJob(jobToEdit);
          setJobModalOpen(true);
        }} 
      />

      {/* AdShield Security Banner */}
      <div style={{ marginTop: '24px' }}>
        <AdShieldBanner />
      </div>

      {/* Quick Launch Digital Studios */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--primary-500)" />
          <span>Digital Studio Tools</span>
        </div>
        <QuickActionCards setActivePage={setActivePage} />
      </div>

      {/* RECENT PIPELINE ORDERS TABLE — ONLY FOR LOGGED-IN STAFF / ADMINS */}
      {isOperator && (
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-header">
            <div className="card-title">
              <Inbox size={18} color="var(--primary-500)" />
              <span>Recent Citizen Service Requests (Internal Queue)</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActivePage('requests')}>
              View All Pipeline ({stats?.totalRequests ?? 1240})
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
                  {recentRequests.map(req => (
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
                          {(req.serviceType || 'form').replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td><StatusBadge status={req.status} /></td>
                      <td style={{ fontSize: '0.82rem' }}>{req.assignedTo?.name || 'Mahuli Desk'}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Admin Job Manager Modal */}
      <JobManagerModal
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        job={selectedJob}
        onSaved={fetchDashboardData}
      />

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
