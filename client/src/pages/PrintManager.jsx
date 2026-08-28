import React, { useState, useEffect } from 'react';
import { 
  Printer, Plus, CheckCircle2, Clock, 
  FileText, RefreshCw, Eye, Settings, Play 
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { FileUploadZone } from '../components/FileUploadZone';

export const PrintManager = () => {
  const [printJobs, setPrintJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [jobTitle, setJobTitle] = useState('');
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState('bw');
  const [paperSize, setPaperSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [doubleSided, setDoubleSided] = useState(false);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [cost, setCost] = useState(5);
  const [printFile, setPrintFile] = useState(null);

  const fetchPrintJobs = async () => {
    setLoading(true);
    try {
      const res = await api.getPrintJobs();
      if (res.success) {
        setPrintJobs(res.printJobs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrintJobs();
  }, []);

  const handleCreatePrintJob = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', jobTitle || 'Document Print');
      data.append('copies', copies);
      data.append('colorMode', colorMode);
      data.append('paperSize', paperSize);
      data.append('orientation', orientation);
      data.append('doubleSided', doubleSided);
      data.append('customerName', customerName);
      data.append('cost', cost);
      if (printFile) data.append('file', printFile);

      const res = await api.createPrintJob(data);
      if (res.success) {
        setShowAddModal(false);
        fetchPrintJobs();
      }
    } catch (err) {
      alert(err.message || 'Failed to queue print job');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.updatePrintStatus(id, { status });
      if (res.success) {
        fetchPrintJobs();
      }
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleTriggerBrowserPrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Printer size={24} color="var(--accent-amber)" />
            <span>Shree Online Print Station & Queue (Mahuli, S.K.N)</span>
          </h1>
          <p className="page-subtitle">
            Prepare print layouts, manage print queues (Pending ➔ Printing ➔ Completed), and track copy counts.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={fetchPrintJobs}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Print Job
          </button>
        </div>
      </div>

      {/* Print Queue Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Printer size={18} color="var(--accent-amber)" />
            <span>Print Queue ({printJobs.length} Jobs)</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleTriggerBrowserPrint}>
            <Printer size={14} /> Open System Print Dialog
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Document Title</th>
                  <th>Customer</th>
                  <th>Copies & Spec</th>
                  <th>Paper Size</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {printJobs.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No print jobs in queue. Click "Add Print Job" to queue a new document.
                    </td>
                  </tr>
                ) : (
                  printJobs.map(job => (
                    <tr key={job._id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{job.jobId}</td>
                      <td style={{ fontWeight: '600' }}>{job.title}</td>
                      <td>{job.customerName}</td>
                      <td>
                        <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                          {job.copies}x • {job.colorMode === 'bw' ? 'Black & White' : 'Color'} {job.doubleSided ? '• 2-Sided' : ''}
                        </span>
                      </td>
                      <td>{job.paperSize} ({job.orientation})</td>
                      <td style={{ fontWeight: '700' }}>₹{job.cost}</td>
                      <td><StatusBadge status={job.status} /></td>
                      <td>
                        <div className="flex gap-1">
                          {job.status === 'pending' && (
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleUpdateStatus(job._id, 'printing')}
                            >
                              <Play size={12} /> Start Print
                            </button>
                          )}
                          {job.status === 'printing' && (
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => handleUpdateStatus(job._id, 'completed')}
                            >
                              <CheckCircle2 size={12} /> Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Print Job Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: '700', fontSize: '1rem' }}>Queue New Print Job</div>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreatePrintJob}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Document Title *</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g. Admit Card / Resume / Marksheet"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Copies</label>
                    <input 
                      type="number" 
                      min="1"
                      className="form-input"
                      value={copies}
                      onChange={e => {
                        setCopies(Number(e.target.value));
                        setCost(Number(e.target.value) * (colorMode === 'bw' ? 5 : 15));
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Color Mode</label>
                    <select 
                      className="form-select"
                      value={colorMode}
                      onChange={e => {
                        setColorMode(e.target.value);
                        setCost(copies * (e.target.value === 'bw' ? 5 : 15));
                      }}
                    >
                      <option value="bw">Black & White Laser (₹5/page)</option>
                      <option value="color">Color Photo Print (₹15/page)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Paper Size</label>
                    <select className="form-select" value={paperSize} onChange={e => setPaperSize(e.target.value)}>
                      <option value="A4">A4 (Standard)</option>
                      <option value="4x6">4 x 6 Glossy Photo</option>
                      <option value="Legal">Legal (Govt Stamp / Deed)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Orientation</label>
                    <select className="form-select" value={orientation} onChange={e => setOrientation(e.target.value)}>
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Attach File (Optional for Queue)</label>
                  <FileUploadZone 
                    multiple={false}
                    onFilesSelected={(f) => setPrintFile(f)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">Add to Print Queue (₹{cost})</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
