import React from 'react';
import { X, Download, Printer, ExternalLink } from 'lucide-react';

export const DocPreviewModal = ({ isOpen, onClose, fileUrl, fileName, title = 'Document Preview' }) => {
  if (!isOpen || !fileUrl) return null;

  const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(fileUrl);
  const fullUrl = fileUrl.startsWith('http') ? fileUrl : `http://localhost:5000${fileUrl}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={e => e.stopPropagation()} style={{ height: '85vh' }}>
        <div className="modal-header">
          <div style={{ fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{title}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({fileName})</span>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body flex-1" style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b' }}>
          {isPdf ? (
            <iframe 
              src={fullUrl} 
              style={{ width: '100%', height: '100%', border: 'none' }} 
              title="PDF Preview"
            />
          ) : isImage ? (
            <img 
              src={fullUrl} 
              alt={fileName} 
              style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain', borderRadius: 'var(--radius-md)' }} 
            />
          ) : (
            <div style={{ color: '#fff', textAlign: 'center', padding: '40px' }}>
              <p style={{ marginBottom: '16px' }}>Direct browser preview not supported for this format.</p>
              <a href={fullUrl} download className="btn btn-primary">
                <Download size={16} /> Download File
              </a>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <a href={fullUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
            <ExternalLink size={14} /> Open in Tab
          </a>
          <a href={fullUrl} download={fileName} className="btn btn-primary btn-sm">
            <Download size={14} /> Download File
          </a>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
