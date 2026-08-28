import React, { useState, useEffect } from 'react';
import { 
  Users, Inbox, Printer, Sparkles, IndianRupee, HardDrive, 
  Clock, CheckCircle, PlusCircle, ArrowRight, Eye, RefreshCw,
  Award, HeartHandshake, ShieldCheck, MessageCircle, Phone
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { QuickActionCards } from '../components/QuickActionCards';
import { AdShieldBanner } from '../components/AdShieldBanner';
import { DocPreviewModal } from '../components/DocPreviewModal';

export const Dashboard = ({ setActivePage }) => {
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [printJobs, setPrintJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, reqsRes, printRes] = await Promise.all([
        api.getDashboardStats(),
        api.getRequests('limit=6'),
        api.getPrintJobs('status=pending')
      ]);

      if (statsRes.success) setStats(statsRes.stats);
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

      {/* FEATURED: ABOUT SHREE ONLINE SEWA KENDRA (EST. 2013) & LEADERSHIP SHOWCASE */}
      <div className="card" style={{
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(16, 185, 129, 0.06) 50%, rgba(99, 102, 241, 0.1) 100%)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        overflow: 'hidden'
      }}>
        <div className="card-body" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #f59e0b, #3b82f6)', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Award size={26} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>
                    Shree Online Sewa Kendra
                  </h2>
                  <span className="badge badge-completed" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                    Est. 2013 • 13+ Years Trust
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Main Market, Mahuli, Sant Kabir Nagar (S.K.N), U.P. • Pioneer in Online Operations & Digital Seva
                </div>
              </div>
            </div>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setActivePage('about-us')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>View Full History & Leadership Messages</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Mini Leadership Avatars & Quote Previews */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Owner Quote Snapshot */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', gap: '14px', alignItems: 'center'
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)', padding: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%', background: '#1e293b',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '900', fontSize: '1rem', border: '1.5px solid #fff'
                }}>
                  AD
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: '800', fontSize: '0.86rem', color: 'var(--text-main)' }}>Krishan Narayan Dwivedi</div>
                  <span style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: '800' }}>Founder & Owner</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px', lineHeight: '1.4' }}>
                  "Serving Mahuli, S.K.N since 2013 with 100% reliable government applications and customer trust."
                </div>
              </div>
            </div>

            {/* Admin Quote Snapshot */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', gap: '14px', alignItems: 'center'
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #10b981, #06b6d4)', padding: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%', background: '#0f172a',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '900', fontSize: '1rem', border: '1.5px solid #fff'
                }}>
                  KV
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: '800', fontSize: '0.86rem', color: 'var(--text-main)' }}>Kamal Narayan Dwivedi</div>
                  <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: '800' }}>Technical Admin</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px', lineHeight: '1.4' }}>
                  "Engineered with AdShield protection, WhatsApp OTP & AI document studios for zero-error speed."
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
            <div className="stat-val">{stats?.todayRequests ?? 3}</div>
            <div className="stat-label">Today's Requests</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary-600)' }}>
            <Inbox size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-val" style={{ color: 'var(--accent-amber)' }}>{stats?.pendingRequests ?? 2}</div>
            <div className="stat-label">Pending Processing</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-val" style={{ color: 'var(--accent-emerald)' }}>{stats?.completedRequests ?? 1}</div>
            <div className="stat-label">Completed Deliveries</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)' }}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-val">₹{stats?.todayRevenue ?? 70}</div>
            <div className="stat-label">Today's Revenue</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-val">{stats?.activePrintJobs ?? 1}</div>
            <div className="stat-label">Print Jobs in Queue</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)' }}>
            <Printer size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-val" style={{ fontSize: '1.4rem' }}>{stats?.storageMb ?? '0.00'} MB</div>
            <div className="stat-label">Temp Storage (Auto-Clean)</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <HardDrive size={24} />
          </div>
        </div>
      </div>

      {/* Quick Action Tools Hub */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>⚡ Single-Window Service Tools</h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Launch any tool in 1-click</span>
      </div>
      <QuickActionCards onSelectTool={(toolId) => setActivePage(toolId)} />

      {/* 2-Column Split: Active Requests & Print Queue */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginTop: '28px' }}>
        {/* Recent Service Requests */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Inbox size={18} color="var(--primary-500)" />
              <span>Recent Service Requests</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActivePage('requests')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        No active service requests today.
                      </td>
                    </tr>
                  ) : (
                    recentRequests.map(req => (
                      <tr key={req._id}>
                        <td><span className="font-mono font-bold text-primary">{req.requestId}</span></td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{req.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.customerPhone}</div>
                        </td>
                        <td>{req.serviceName}</td>
                        <td><StatusBadge status={req.status} /></td>
                        <td>
                          <button 
                            className="btn btn-secondary btn-sm"
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

        {/* Live Print Queue */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Printer size={18} color="var(--accent-cyan)" />
              <span>Active Print Queue</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActivePage('print-manager')}>
              Queue <ArrowRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {printJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                No print jobs pending.
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Copies</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printJobs.map(job => (
                      <tr key={job._id}>
                        <td>
                          <div style={{ fontWeight: '600' }}>{job.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.paperSize} • {job.colorMode}</div>
                        </td>
                        <td>{job.copies}</td>
                        <td><StatusBadge status={job.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {previewDoc && (
        <DocPreviewModal 
          isOpen={Boolean(previewDoc)} 
          onClose={() => setPreviewDoc(null)} 
          fileUrl={previewDoc.url}
          fileName={previewDoc.name}
        />
      )}
    </div>
  );
};
