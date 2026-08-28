import React, { useState, useEffect } from 'react';
import { 
  Users, Inbox, Printer, Sparkles, IndianRupee, HardDrive, 
  Clock, CheckCircle, PlusCircle, ArrowRight, Eye, RefreshCw 
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
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
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
          <div className="stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)' }}>
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
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        No service requests recorded today.
                      </td>
                    </tr>
                  ) : (
                    recentRequests.map((req) => (
                      <tr key={req._id}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--primary-600)' }}>
                            {req.requestId}
                          </span>
                        </td>
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
                            Open
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
              <Printer size={18} color="var(--accent-amber)" />
              <span>Active Print Queue</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActivePage('print-manager')}>
              Manage Queue
            </button>
          </div>
          <div className="card-body" style={{ padding: '16px' }}>
            {printJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                <Printer size={36} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
                <p style={{ fontSize: '0.88rem' }}>No pending print jobs in queue.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {printJobs.map(job => (
                  <div 
                    key={job._id}
                    style={{
                      padding: '12px', background: 'var(--bg-surface-alt)',
                      borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{job.title}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {job.copies} Copies • {job.paperSize} • {job.colorMode === 'bw' ? 'B&W' : 'Color'} • ₹{job.cost}
                      </div>
                    </div>
                    <span className="badge badge-processing" style={{ fontSize: '0.7rem' }}>
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DocPreviewModal 
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        fileUrl={previewDoc?.url}
        fileName={previewDoc?.name}
      />
    </div>
  );
};
