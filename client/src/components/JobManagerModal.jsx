import React, { useState, useEffect } from 'react';
import { X, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const JobManagerModal = ({ isOpen, onClose, job, onSaved }) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [category, setCategory] = useState('upsssc');
  const [totalVacancies, setTotalVacancies] = useState('');
  const [qualification, setQualification] = useState('');
  const [ageLimit, setAgeLimit] = useState('18 - 40 Years');
  const [applicationFee, setApplicationFee] = useState('');
  const [lastDate, setLastDate] = useState('');
  const [status, setStatus] = useState('active');
  const [officialUrl, setOfficialUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (job) {
      setTitle(job.title || '');
      setOrganization(job.organization || '');
      setCategory(job.category || 'upsssc');
      setTotalVacancies(job.totalVacancies || '');
      setQualification(job.qualification || '');
      setAgeLimit(job.ageLimit || '18 - 40 Years');
      setApplicationFee(job.applicationFee || '');
      setLastDate(job.lastDate || '');
      setStatus(job.status || 'active');
      setOfficialUrl(job.officialUrl || '');
      setDescription(job.description || '');
    } else {
      setTitle('');
      setOrganization('');
      setCategory('upsssc');
      setTotalVacancies('');
      setQualification('');
      setAgeLimit('18 - 40 Years');
      setApplicationFee('');
      setLastDate('');
      setStatus('active');
      setOfficialUrl('https://upsssc.gov.in');
      setDescription('');
    }
  }, [job]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !organization) {
      setError('Job title and Organization name are required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        organization,
        category,
        totalVacancies,
        qualification,
        ageLimit,
        applicationFee,
        lastDate,
        status,
        officialUrl,
        description,
        featured: true,
        applyViaShreeOnline: true
      };

      if (job && job._id) {
        await api.updateJob(job._id, payload);
      } else {
        await api.createJob(payload);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save job alert.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal-container" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={20} color="#2563eb" />
            <h3 style={{ fontWeight: '800', fontSize: '1.1rem' }}>
              {job ? 'Edit Job Posting Alert' : 'Publish New Government Job Alert'}
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {error && (
              <div className="alert alert-danger" style={{ marginBottom: '14px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. UPSSSC Junior Assistant & Clerk 2026 Recruitment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department / Organization *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Uttar Pradesh Subordinate Services Selection Commission (UPSSSC)"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="upsssc">UPSSSC</option>
                  <option value="police">UP Police</option>
                  <option value="ssc">SSC</option>
                  <option value="railway">Railway (RRB)</option>
                  <option value="defence">Army / Defence</option>
                  <option value="teaching">Teaching / TET</option>
                  <option value="banking">Banking (IBPS/SBI)</option>
                  <option value="state_gov">State Gov / Scholarship</option>
                  <option value="other">Other Vacancy</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Total Vacancies</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 3,831 Posts"
                  value={totalVacancies}
                  onChange={(e) => setTotalVacancies(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Eligibility / Qualification</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 12th Intermediate + CCC / Hindi Typing 25 WPM"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Application Fee</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Gen/OBC: ₹25 | SC/ST: ₹25"
                  value={applicationFee}
                  onChange={(e) => setApplicationFee(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Date</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 30-Sep-2026"
                  value={lastDate}
                  onChange={(e) => setLastDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="active">Active Form (Open)</option>
                  <option value="closing_soon">Closing Soon</option>
                  <option value="expired">Expired / Closed</option>
                  <option value="admit_card_out">Admit Card Released</option>
                  <option value="result_declared">Result Declared</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Official Portal URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://upsssc.gov.in"
                  value={officialUrl}
                  onChange={(e) => setOfficialUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Important Instructions</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Important document requirements, selection process, syllabus details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Publishing...' : job ? 'Save Changes' : 'Publish Job Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
