import { SERVER_BASE, getFullUrl } from '../services/config';
﻿import React, { useState, useEffect } from 'react';
import { 
  Send, Search, Clock, CheckCircle2, Download, FileText, 
  Sparkles, AlertCircle, Phone, Mail, User, Check, MessageCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FileUploadZone } from '../components/FileUploadZone';
import { StatusBadge } from '../components/StatusBadge';
import { DocPreviewModal } from '../components/DocPreviewModal';

export const CustomerPortal = () => {
  const { user } = useAuth();
  const { latestRequestUpdate } = useSocket();

  const [activeTab, setActiveTab] = useState('submit'); // 'submit', 'track', 'my-requests'
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    customerEmail: user?.email || '',
    serviceCategory: 'Government Application',
    serviceName: 'PAN Card New / Correction Assistance',
    instructions: '',
    priority: 'normal'
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Tracking tab state
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedRequest, setTrackedRequest] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  // My requests list
  const [myRequests, setMyRequests] = useState([]);
  const [loadingMyReqs, setLoadingMyReqs] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Sync if customer user details change
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerPhone: user.phone || prev.customerPhone,
        customerEmail: user.email || prev.customerEmail
      }));
    }
  }, [user]);

  // Real-time socket update for tracked request
  useEffect(() => {
    if (latestRequestUpdate && trackedRequest && latestRequestUpdate.requestId === trackedRequest.requestId) {
      setTrackedRequest(latestRequestUpdate);
    }
  }, [latestRequestUpdate, trackedRequest]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.serviceName) {
      alert('Please fill customer name, phone number, and service requested.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('customerName', formData.customerName);
      data.append('customerPhone', formData.customerPhone);
      data.append('customerEmail', formData.customerEmail);
      data.append('serviceCategory', formData.serviceCategory);
      data.append('serviceName', formData.serviceName);
      data.append('instructions', formData.instructions);
      data.append('priority', formData.priority);

      if (Array.isArray(selectedFiles)) {
        selectedFiles.forEach(file => {
          data.append('files', file);
        });
      }

      const res = await api.createRequest(data);
      if (res.success) {
        setSubmissionResult(res.request);
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (err) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackRequest = async (e) => {
    if (e) e.preventDefault();
    if (!trackQuery.trim()) return;

    setTrackLoading(true);
    setTrackError('');
    try {
      const res = await api.getRequestById(trackQuery.trim());
      if (res.success && res.request) {
        setTrackedRequest(res.request);
      } else {
        setTrackError('Request ID not found. Please check and try again.');
        setTrackedRequest(null);
      }
    } catch (err) {
      setTrackError('No matching request found with that ID or phone number.');
      setTrackedRequest(null);
    } finally {
      setTrackLoading(false);
    }
  };

  const loadMyRequests = async () => {
    setLoadingMyReqs(true);
    try {
      const res = await api.getRequests('myRequestsOnly=true');
      if (res.success) {
        setMyRequests(res.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMyReqs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my-requests') {
      loadMyRequests();
    }
  }, [activeTab]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Shree Online — Customer Digital Service Portal (Mahuli, S.K.N)</span>
          </h1>
          <p className="page-subtitle">
            Submit document processing requests, upload files, and track real-time status.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          <Send size={16} /> Submit New Request
        </button>
        <button 
          className={`tab-btn ${activeTab === 'track' ? 'active' : ''}`}
          onClick={() => setActiveTab('track')}
        >
          <Search size={16} /> Track Request ID
        </button>
        <button 
          className={`tab-btn ${activeTab === 'my-requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-requests')}
        >
          <FileText size={16} /> My Requests & Downloads
        </button>
      </div>

      {/* 1. SUBMIT NEW REQUEST TAB */}
      {activeTab === 'submit' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {submissionResult ? (
            <div className="card" style={{ textAlign: 'center', padding: '36px 24px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'var(--status-comp-bg)', color: 'var(--status-comp-text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>
                Request Submitted Successfully!
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Your service request has been registered at Shree Online (Mahuli, S.K.N) queue. Keep this Request ID safe:
              </p>

              <div style={{
                background: 'var(--bg-surface-alt)', border: '2px dashed var(--primary-500)',
                padding: '16px 24px', borderRadius: 'var(--radius-lg)', display: 'inline-block',
                fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: '800',
                color: 'var(--primary-600)', marginBottom: '24px'
              }}>
                {submissionResult.requestId}
              </div>

              <div style={{ marginBottom: "16px", padding: "12px", background: "rgba(37, 211, 102, 0.08)", border: "1px solid rgba(37, 211, 102, 0.3)", borderRadius: "var(--radius-md)" }}><div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#25d366", marginBottom: "8px" }}>💬 Need fast updates on WhatsApp?</div><div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}><a href={`https://wa.me/919161400719?text=${encodeURIComponent("Hello Shree Online, I submitted request " + submissionResult.requestId + " for " + submissionResult.serviceName)}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-success"><MessageCircle size={14} /> WhatsApp Desk 1 (9161400719)</a><a href={`https://wa.me/918090794210?text=${encodeURIComponent("Hello Shree Online, I submitted request " + submissionResult.requestId + " for " + submissionResult.serviceName)}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary"><MessageCircle size={14} /> Helpline (8090794210)</a></div></div><div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setTrackQuery(submissionResult.requestId);
                    setActiveTab('track');
                    setTrackedRequest(submissionResult);
                  }}
                >
                  <Search size={16} /> Track This Request Live
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setSubmissionResult(null);
                    setSelectedFiles([]);
                  }}
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="card">
              <div className="card-header">
                <div className="card-title">
                  <Send size={18} color="var(--primary-500)" />
                  <span>Digital Service Request Form</span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Secure 256-bit Encrypted</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Customer Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.customerName}
                      onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="e.g. +91 98765 43210"
                      value={formData.customerPhone}
                      onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Optional for delivery)</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="e.g. ramesh@gmail.com"
                    value={formData.customerEmail}
                    onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Service Category</label>
                    <select 
                      className="form-select"
                      value={formData.serviceCategory}
                      onChange={e => setFormData({ ...formData, serviceCategory: e.target.value })}
                    >
                      <option>Government Application</option>
                      <option>Photo & ID</option>
                      <option>Document & Printing</option>
                      <option>Conversion & OCR</option>
                      <option>Form Filling & Exam</option>
                      <option>General Digital Service</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Service Required *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Passport Photo Print / Pan Card Form / Doc Compression"
                      value={formData.serviceName}
                      onChange={e => setFormData({ ...formData, serviceName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Special Instructions / Requirements</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="Specify number of copies, target file size (e.g. < 100KB), background color for photos, or specific details..."
                    value={formData.instructions}
                    onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                  />
                </div>

                {/* Drag-and-Drop File Upload */}
                <div className="form-group">
                  <label className="form-label">Upload Documents / Photos</label>
                  <FileUploadZone 
                    multiple={true}
                    onFilesSelected={(files) => setSelectedFiles(files || [])}
                    title="Upload required files & ID proofs"
                    subtitle="PDF, Scans, JPG photos, signature images up to 50MB"
                  />
                </div>

                <div className="notice-banner notice-info" style={{ marginTop: '16px' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <b>Privacy Guarantee:</b> All customer documents are stored securely with strict role-based access. Temporary processing files are automatically cleared per retention policy.
                  </div>
                </div>
              </div>

              <div className="card-header" style={{ justifyContent: 'flex-end', background: 'var(--bg-surface-alt)' }}>
                <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request & Get Request ID'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 2. TRACK REQUEST ID TAB */}
      {activeTab === 'track' && (
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-body">
              <form onSubmit={handleTrackRequest} style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter Request ID (e.g. CA-2026-104821)"
                  value={trackQuery}
                  onChange={e => setTrackQuery(e.target.value)}
                  style={{ fontSize: '1rem', padding: '12px 16px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }} disabled={trackLoading}>
                  <Search size={16} /> {trackLoading ? 'Searching...' : 'Track'}
                </button>
              </form>
              {trackError && (
                <div style={{ color: 'var(--accent-rose)', fontSize: '0.85rem', marginTop: '10px' }}>
                  {trackError}
                </div>
              )}
            </div>
          </div>

          {trackedRequest && (
            <div className="card">
              <div className="card-header">
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>REQUEST STATUS</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--primary-600)' }}>
                    {trackedRequest.requestId}
                  </div>
                </div>
                <StatusBadge status={trackedRequest.status} />
              </div>

              <div className="card-body">
                {/* Visual Step Timeline */}
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0 32px 0', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: '3px', background: 'var(--border-color)', zIndex: 1 }}></div>
                  
                  {[
                    { key: 'new', label: 'Received' },
                    { key: 'processing', label: 'In Progress' },
                    { key: 'waiting_customer', label: 'Action Needed' },
                    { key: 'completed', label: 'Ready for Download' }
                  ].map((step, idx) => {
                    const isPassed = ['completed', 'waiting_customer', 'processing'].includes(trackedRequest.status) && (
                      step.key === 'new' || 
                      (trackedRequest.status === 'processing' && step.key === 'processing') ||
                      (trackedRequest.status === 'completed')
                    );
                    const isCurrent = trackedRequest.status === step.key;

                    return (
                      <div key={step.key} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: isCurrent ? 'var(--primary-600)' : isPassed ? 'var(--accent-emerald)' : 'var(--bg-surface-alt)',
                          color: isCurrent || isPassed ? '#fff' : 'var(--text-muted)',
                          border: '2px solid var(--border-color)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem'
                        }}>
                          {isPassed ? <Check size={16} /> : idx + 1}
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: isCurrent ? '700' : '500', color: isCurrent ? 'var(--primary-600)' : 'var(--text-secondary)' }}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Details Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg-surface-alt)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer</div>
                    <div style={{ fontWeight: '700' }}>{trackedRequest.customerName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Service Requested</div>
                    <div style={{ fontWeight: '700' }}>{trackedRequest.serviceName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Operator</div>
                    <div>{trackedRequest.assignedOperatorName || 'Desk Operator'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Submitted Date</div>
                    <div>{new Date(trackedRequest.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                {/* Operator Notes if any */}
                {trackedRequest.operatorNotes && (
                  <div className="notice-banner notice-warning" style={{ marginTop: '16px' }}>
                    <div>
                      <b>Operator Note:</b> {trackedRequest.operatorNotes}
                    </div>
                  </div>
                )}

                {/* Deliverables / Processed Files Section */}
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>
                    📁 Deliverables & Processed Files
                  </h3>
                  {(!trackedRequest.processedFiles || trackedRequest.processedFiles.length === 0) ? (
                    <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Files are currently being processed. Once completed, your download buttons will appear here.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {trackedRequest.processedFiles.map(file => (
                        <div key={file.fileId} className="file-preview-item">
                          <div className="flex items-center gap-2">
                            <FileText size={18} color="var(--primary-500)" />
                            <div>
                              <div style={{ fontWeight: '700' }}>{file.originalName || file.fileName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(file.size / 1024)} KB</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => setPreviewDoc({ url: `/uploads/processed/${file.fileName}`, name: file.fileName })}
                            >
                              Preview
                            </button>
                            <a 
                              href={`${SERVER_BASE}/uploads/processed/${file.fileName}`}
                              download
                              className="btn btn-primary btn-sm"
                            >
                              <Download size={14} /> Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. MY REQUESTS TAB */}
      {activeTab === 'my-requests' && (
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <FileText size={18} color="var(--primary-500)" />
                <span>My Submitted Requests & Deliverables</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={loadMyRequests}>
                Refresh
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Service</th>
                      <th>Submitted Date</th>
                      <th>Status</th>
                      <th>Downloads</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                          No requests found. Click "Submit New Request" to create one.
                        </td>
                      </tr>
                    ) : (
                      myRequests.map(req => (
                        <tr key={req._id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{req.requestId}</td>
                          <td>{req.serviceName}</td>
                          <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                          <td><StatusBadge status={req.status} /></td>
                          <td>
                            {req.processedFiles?.length > 0 ? (
                              <span className="badge badge-completed">{req.processedFiles.length} Ready</span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In progress</span>
                            )}
                          </td>
                          <td>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setTrackQuery(req.requestId);
                                setTrackedRequest(req);
                                setActiveTab('track');
                              }}
                            >
                              View Details
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
        </div>
      )}

      <DocPreviewModal 
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        fileUrl={previewDoc?.url}
        fileName={previewDoc?.name}
      />
    </div>
  );
};
