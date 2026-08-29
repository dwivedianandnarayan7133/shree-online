import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Search, Calendar, Award, ExternalLink, Send, 
  Plus, Edit, Trash2, CheckCircle2, AlertCircle, Clock, ShieldCheck, Tag
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEFAULT_FALLBACK_JOBS = [
  {
    _id: 'sample-job-1',
    title: 'UPSSSC Junior Assistant & Clerk 2026 Recruitment',
    organization: 'Uttar Pradesh Subordinate Services Selection Commission (UPSSSC)',
    category: 'upsssc',
    totalVacancies: '3,831 Posts',
    qualification: '12th Intermediate + CCC / Hindi Typing 25 WPM',
    ageLimit: '18 - 40 Years (Age Relaxation applicable)',
    applicationFee: 'Gen/OBC/EWS: ₹25 | SC/ST/PH: ₹25',
    lastDate: '30-Sep-2026',
    status: 'active',
    officialUrl: 'https://upsssc.gov.in',
    description: 'Direct recruitment for Junior Assistant, Junior Clerk, and Assistant Grade III across UP Government Departments.',
    featured: true
  },
  {
    _id: 'sample-job-2',
    title: 'UP Police Constable & SI 2026 Direct Recruitment',
    organization: 'Uttar Pradesh Police Recruitment and Promotion Board (UPPRPB)',
    category: 'police',
    totalVacancies: '60,244 Posts',
    qualification: '10+2 Intermediate from any recognized board in India',
    ageLimit: '18 - 25 Years (Male) / 18 - 28 Years (Female)',
    applicationFee: 'All Candidates: ₹400',
    lastDate: '15-Oct-2026',
    status: 'active',
    officialUrl: 'https://uppbpb.gov.in',
    description: 'Massive recruitment for UP Police Civil Constables and PAC Battalions across Uttar Pradesh.',
    featured: true
  },
  {
    _id: 'sample-job-3',
    title: 'SSC GD Constable (CAPFs, SSF, Rifleman) 2026',
    organization: 'Staff Selection Commission (SSC)',
    category: 'ssc',
    totalVacancies: '39,481 Posts',
    qualification: 'Class 10th High School Pass in India',
    ageLimit: '18 - 23 Years',
    applicationFee: 'Gen/OBC: ₹100 | SC/ST/Female: Exempted',
    lastDate: '14-Oct-2026',
    status: 'active',
    officialUrl: 'https://ssc.gov.in',
    description: 'Recruitment of Constables (GD) in BSF, CISF, CRPF, SSB, ITBP, AR and SSF.',
    featured: true
  },
  {
    _id: 'sample-job-4',
    title: 'Railway RRB Non-Technical Popular Categories (NTPC) 2026',
    organization: 'Railway Recruitment Boards (RRB)',
    category: 'railway',
    totalVacancies: '11,558 Posts',
    qualification: '12th Pass or Any Bachelor Degree from Recognized University',
    ageLimit: '18 - 33 Years (12th) / 18 - 36 Years (Graduate)',
    applicationFee: 'Gen/OBC: ₹500 (Refundable ₹400) | SC/ST/PH/Female: ₹250',
    lastDate: '20-Oct-2026',
    status: 'active',
    officialUrl: 'https://indianrailways.gov.in',
    description: 'Station Master, Goods Train Manager, Senior Clerk, Junior Accounts Assistant and Commercial Apprentice.',
    featured: true
  },
  {
    _id: 'sample-job-5',
    title: 'UP Scholarship & Fee Reimbursement 2026-27 Online Form',
    organization: 'Social Welfare Department, Uttar Pradesh',
    category: 'state_gov',
    totalVacancies: 'All Eligible Students (Pre & Post Matric)',
    qualification: 'Enrolled in 9th, 10th, 11th, 12th, ITI, Diploma, UG, PG, B.Ed',
    ageLimit: 'No Age Limit',
    applicationFee: 'Free (Online Application)',
    lastDate: '31-Dec-2026',
    status: 'active',
    officialUrl: 'https://scholarship.up.gov.in',
    description: 'Post-Matric and Pre-Matric Scholarship for General, OBC, SC, ST, and Minority candidates of Uttar Pradesh.',
    featured: true
  },
  {
    _id: 'sample-job-6',
    title: 'Indian Army Agniveer Rally Bharti (UP & All Zones) 2026',
    organization: 'Join Indian Army',
    category: 'defence',
    totalVacancies: '25,000+ Posts',
    qualification: '10th / 12th Pass (Min 45% aggregate)',
    ageLimit: '17.5 - 21 Years',
    applicationFee: 'Exam Fee: ₹250',
    lastDate: '05-Nov-2026',
    status: 'active',
    officialUrl: 'https://joinindianarmy.nic.in',
    description: 'Agniveer General Duty (GD), Technical, Clerk/Store Keeper, and Tradesman entry across India.',
    featured: true
  }
];

export const JobAlertsBoard = ({ setActivePage, onOpenJobModal }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isOperator = user?.role === 'admin' || user?.role === 'operator';

  const [jobs, setJobs] = useState(DEFAULT_FALLBACK_JOBS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'all', label: 'All Jobs' },
    { id: 'upsssc', label: 'UPSSSC' },
    { id: 'police', label: 'UP Police' },
    { id: 'ssc', label: 'SSC' },
    { id: 'railway', label: 'Railway' },
    { id: 'defence', label: 'Army / Defence' },
    { id: 'state_gov', label: 'Scholarship & UP Gov' }
  ];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let query = '';
      if (selectedCategory !== 'all') query += `category=${selectedCategory}&`;
      if (searchTerm) query += `search=${encodeURIComponent(searchTerm)}&`;

      const res = await api.getJobs(query);
      if (res && res.success && res.jobs && res.jobs.length > 0) {
        setJobs(res.jobs);
      } else if (!searchTerm && selectedCategory === 'all') {
        setJobs(DEFAULT_FALLBACK_JOBS);
      }
    } catch (err) {
      console.warn('Jobs sync notice:', err.message);
      setJobs(DEFAULT_FALLBACK_JOBS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory]);

  const handleDeleteJob = async (jobId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this job alert?')) return;

    try {
      await api.deleteJob(jobId);
      setJobs(prev => prev.filter(j => j._id !== jobId));
    } catch (err) {
      alert(err.message || 'Failed to delete job alert');
    }
  };

  const handleApplyThroughShree = (job) => {
    sessionStorage.setItem('shree_prefill_job', JSON.stringify({
      title: job.title,
      organization: job.organization,
      category: job.category,
      fee: job.applicationFee,
      lastDate: job.lastDate
    }));
    setActivePage('customer-portal');
  };

  const filteredJobs = jobs.filter(job => {
    if (selectedCategory !== 'all' && job.category !== selectedCategory) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        job.title?.toLowerCase().includes(term) ||
        job.organization?.toLowerCase().includes(term) ||
        job.qualification?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="card" style={{ marginTop: '24px', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #2563eb, #38bdf8)', color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Briefcase size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-main)' }}>
                Live Government Job Alerts & Recruitment Hub
              </h2>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Sarkari Seva</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Verified vacancies, eligibility, exam fee & 1-click online application through Shree Online Sewa Kendra.
            </p>
          </div>
        </div>

        {isOperator && onOpenJobModal && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onOpenJobModal(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}
          >
            <Plus size={15} /> Publish New Job Alert
          </button>
        )}
      </div>

      <div className="card-body">
        {/* Search & Category Filter Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
          
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by job title, department, UPSSSC, Police, SSC, or qualification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
              style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedCategory(cat.id)}
                style={{ whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: '700' }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Job Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredJobs.map(job => (
            <div
              key={job._id || job.title}
              className="card"
              style={{
                background: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-color)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div>
                {/* Header with Organization and Status Badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: '800', color: 'var(--primary-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {job.organization}
                  </div>
                  <span className={`badge ${job.status === 'closing_soon' ? 'badge-warning' : 'badge-completed'}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                    {job.status === 'closing_soon' ? '⏳ Closing Soon' : '🟢 Active Form'}
                  </span>
                </div>

                {/* Job Title */}
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.35', marginBottom: '10px' }}>
                  {job.title}
                </h3>

                {/* Job Details Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', fontSize: '0.76rem' }}>
                  <div style={{ background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Total Vacancies:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{job.totalVacancies || 'Multiple'}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Last Date:</span>
                    <strong style={{ color: '#ef4444' }}>{job.lastDate || 'Check Notice'}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Eligibility / Qualification:</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{job.qualification}</span>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Exam Fee:</span>
                    <span style={{ color: 'var(--text-main)' }}>{job.applicationFee || 'As per Notification'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleApplyThroughShree(job)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '800', fontSize: '0.84rem', padding: '8px 12px' }}
                  >
                    <Send size={14} /> Apply via Shree Online
                  </button>

                  <a
                    href={job.officialUrl || 'https://upsssc.gov.in'}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.8rem', padding: '8px 10px' }}
                    title="Open Official Department Notification"
                  >
                    <ExternalLink size={14} /> Official
                  </a>
                </div>

                {isOperator && onOpenJobModal && (
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', paddingTop: '6px', borderTop: '1px solid var(--border-color)' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onOpenJobModal(job)}
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                    >
                      <Edit size={12} /> Edit
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={(e) => handleDeleteJob(job._id, e)}
                        style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
