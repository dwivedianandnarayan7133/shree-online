import React, { useState, useEffect } from 'react';
import { 
  Inbox, Search, Filter, CheckCircle2, Clock, 
  Paperclip, ArrowRight, User, Phone, Upload, Eye, Plus, Receipt
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { DocPreviewModal } from '../components/DocPreviewModal';
import { FileUploadZone } from '../components/FileUploadZone';
import { BillModal } from '../components/BillModal';

export const RequestManager = ({ setActivePage }) => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected request details modal
  const [selectedReq, setSelectedReq] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Billing modal
  const [billInvoice, setBillInvoice] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let query = `status=${statusFilter}`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      const res = await api.getRequests(query);
      if (res.success) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedReq) return;
    setActionLoading(true);
    try {
      const res = await api.updateRequestStatus(selectedReq._id, {
        status: newStatus,
        note: statusNote || `Status changed to ${newStatus}`
      });
      if (res.success) {
        setSelectedReq(res.request);
        setStatusNote('');
        fetchRequests();
      }
    } catch (err) {
      alert(err.message || 'Status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAttachDeliverable = async () => {
    if (!selectedReq || !uploadFile) {
      alert('Please select a processed deliverable file to attach.');
      return;
    }
    setActionLoading(true);
    try {
      const data = new FormData();
      data.append('file', uploadFile);
      data.append('actionType', 'processed_delivery');
      data.append('notes', 'Delivered to customer');

      const res = await api.addProcessedFile(selectedReq._id, data);
      if (res.success) {
        setSelectedReq(res.request);
        setUploadFile(null);
        fetchRequests();
      }
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateBillForRequest = async () => {
    if (!selectedReq) return;
    try {
      const res = await api.createInvoice({
        requestId: selectedReq.requestId,
        customerName: selectedReq.customerName,
        customerPhone: selectedReq.customerPhone,
        items: [
          { description: selectedReq.serviceName, quantity: 1, unitPrice: selectedReq.totalCost || 50, total: selectedReq.totalCost || 50 }
        ],
        discount: 0,
        taxPercent: 0,
        paymentMethod: 'cash',
        paymentStatus: 'paid'
      });
      if (res.success) {
        setBillInvoice(res.invoice);
      }
    } catch (err) {
      alert(err.message || 'Invoice creation failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Inbox size={24} color="var(--primary-500)" />
            <span>Customer Requests Pipeline</span>
          </h1>
          <p className="page-subtitle">
            Manage incoming customer requests, process documents, attach deliverables, and generate bills.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setActivePage('customer-portal')}>
          <Plus size={14} /> New Customer Request
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Status Filter Buttons */}
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Requests' },
              { id: 'new', label: 'New' },
              { id: 'processing', label: 'Processing' },
              { id: 'waiting_customer', label: 'Waiting' },
              { id: 'completed', label: 'Completed' }
            ].map(f => (
              <button 
                key={f.id}
                className={`btn btn-sm ${statusFilter === f.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2" style={{ minWidth: '300px' }}>
            <input 
              type="text"
              className="form-input"
              placeholder="Search by ID, Name, Phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              <Search size={14} /> Search
            </button>
          </form>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Customer</th>
                  <th>Service Category</th>
                  <th>Service Name</th>
                  <th>Files</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No service requests match the current filter.
                    </td>
                  </tr>
                ) : (
                  requests.map(req => (
                    <tr key={req._id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--primary-600)' }}>
                        {req.requestId}
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{req.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.customerPhone}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                          {req.serviceCategory}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>{req.serviceName}</td>
                      <td>
                        <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                          {req.submittedFiles?.length || 0} In / {req.processedFiles?.length || 0} Out
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase',
                          color: req.priority === 'urgent' ? 'var(--accent-rose)' : 'var(--text-secondary)'
                        }}>
                          {req.priority}
                        </span>
                      </td>
                      <td><StatusBadge status={req.status} /></td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedReq(req)}
                        >
                          Manage
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

      {/* Detail & Action Modal */}
      {selectedReq && (
        <div className="modal-overlay" onClick={() => setSelectedReq(null)}>
          <div className="modal-container modal-lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '88vh' }}>
            <div className="modal-header">
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Request {selectedReq.requestId}</span>
                  <StatusBadge status={selectedReq.status} />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Customer: <b>{selectedReq.customerName}</b> ({selectedReq.customerPhone})
                </div>
              </div>
              <button className="icon-btn" onClick={() => setSelectedReq(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Instructions */}
              <div style={{ background: 'var(--bg-surface-alt)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Customer Instructions & Requirements
                </div>
                <div style={{ marginTop: '4px', fontSize: '0.9rem' }}>
                  {selectedReq.instructions || 'No specific instructions provided.'}
                </div>
              </div>

              {/* Submitted Files */}
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '10px' }}>
                  📥 Customer Uploaded Documents ({selectedReq.submittedFiles?.length || 0})
                </h3>
                {(!selectedReq.submittedFiles || selectedReq.submittedFiles.length === 0) ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No documents attached.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedReq.submittedFiles.map(file => (
                      <div key={file.fileId} className="file-preview-item">
                        <div className="flex items-center gap-2">
                          <Paperclip size={16} color="var(--primary-500)" />
                          <span style={{ fontWeight: '600' }}>{file.originalName}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({Math.round(file.size / 1024)} KB)</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setPreviewDoc({ url: `/uploads/customer_records/${file.fileName}`, name: file.originalName })}
                          >
                            <Eye size={12} /> Preview
                          </button>
                          <a 
                            href={`http://localhost:5000/uploads/customer_records/${file.fileName}`}
                            download
                            className="btn btn-primary btn-sm"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Update Pipeline Controls */}
              <div style={{ background: 'var(--bg-surface-alt)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '10px' }}>
                  Update Workflow Status
                </div>
                <div className="flex gap-2" style={{ flexWrap: 'wrap', marginBottom: '12px' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus('new')}
                  >
                    Set as New
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus('processing')}
                  >
                    Mark Processing
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus('waiting_customer')}
                  >
                    Waiting for Customer
                  </button>
                  <button 
                    className="btn btn-success btn-sm"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus('completed')}
                  >
                    Mark Completed
                  </button>
                </div>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Optional status note / comment for customer..."
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              {/* Deliverable Upload */}
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '10px' }}>
                  📤 Attach Completed Deliverable & Send to Customer
                </h3>
                <div className="flex gap-2 items-center">
                  <input 
                    type="file" 
                    className="form-input"
                    onChange={e => setUploadFile(e.target.files[0])}
                    style={{ fontSize: '0.85rem', padding: '6px' }}
                  />
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={handleAttachDeliverable}
                    disabled={!uploadFile || actionLoading}
                  >
                    <Upload size={14} /> Deliver File
                  </button>
                </div>

                {selectedReq.processedFiles?.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)' }}>Delivered Deliverables:</div>
                    {selectedReq.processedFiles.map(pf => (
                      <div key={pf.fileId} className="file-preview-item" style={{ background: 'var(--status-comp-bg)', borderColor: 'var(--status-comp-border)' }}>
                        <span style={{ fontWeight: '600', color: 'var(--status-comp-text)' }}>✅ {pf.originalName || pf.fileName}</span>
                        <a 
                          href={`http://localhost:5000/uploads/processed/${pf.fileName}`}
                          download
                          className="btn btn-success btn-sm"
                        >
                          Download Deliverable
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={handleCreateBillForRequest}>
                <Receipt size={14} /> Generate POS Bill (₹{selectedReq.totalCost || 50})
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedReq(null)}>
                Close
              </button>
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

      <BillModal 
        isOpen={Boolean(billInvoice)}
        onClose={() => setBillInvoice(null)}
        invoice={billInvoice}
      />
    </div>
  );
};
