import { SERVER_BASE, getFullUrl } from '../services/config';
﻿import React, { useState } from 'react';
import { 
  Archive, Minimize2, FolderArchive, Download, 
  FileText, CheckCircle2, ArrowDown 
} from 'lucide-react';
import { api } from '../services/api';
import { FileUploadZone } from '../components/FileUploadZone';

export const FileTools = () => {
  const [activeTab, setActiveTab] = useState('compress'); // 'compress', 'zip-create', 'zip-extract'

  // Compressor state
  const [compFiles, setCompFiles] = useState([]);
  const [compQuality, setCompQuality] = useState('medium'); // 'low', 'medium', 'high'
  const [compResults, setCompResults] = useState([]);
  const [compLoading, setCompLoading] = useState(false);

  // ZIP Creator state
  const [zipFiles, setZipFiles] = useState([]);
  const [zipName, setZipName] = useState('CyberCafe_Documents.zip');
  const [zipResult, setZipResult] = useState(null);
  const [zipLoading, setZipLoading] = useState(false);

  // ZIP Extractor state
  const [unzipFile, setUnzipFile] = useState(null);
  const [unzipResult, setUnzipResult] = useState(null);
  const [unzipLoading, setUnzipLoading] = useState(false);

  // Handle Multi-file Compression
  const handleCompress = async () => {
    if (!compFiles || compFiles.length === 0) {
      alert('Please upload files to compress.');
      return;
    }

    setCompLoading(true);
    try {
      const data = new FormData();
      compFiles.forEach(f => data.append('files', f));
      data.append('quality', compQuality);

      const res = await api.compressFiles(data);
      if (res.success) {
        setCompResults(res.results);
      }
    } catch (err) {
      alert(err.message || 'Compression failed');
    } finally {
      setCompLoading(false);
    }
  };

  // Handle ZIP Creation
  const handleCreateZip = async () => {
    if (!zipFiles || zipFiles.length === 0) {
      alert('Please upload files to archive into ZIP.');
      return;
    }

    setZipLoading(true);
    try {
      const data = new FormData();
      zipFiles.forEach(f => data.append('files', f));
      data.append('zipName', zipName);

      const res = await api.createZip(data);
      if (res.success) {
        setZipResult(res);
      }
    } catch (err) {
      alert(err.message || 'ZIP creation failed');
    } finally {
      setZipLoading(false);
    }
  };

  // Handle ZIP Extraction
  const handleExtractZip = async () => {
    if (!unzipFile) {
      alert('Please select a ZIP file to extract.');
      return;
    }

    setUnzipLoading(true);
    try {
      const data = new FormData();
      data.append('file', unzipFile);

      const res = await api.extractZip(data);
      if (res.success) {
        setUnzipResult(res.result);
      }
    } catch (err) {
      alert(err.message || 'Extraction failed');
    } finally {
      setUnzipLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Archive size={24} color="var(--accent-emerald)" />
            <span>File Compressor & Archive Hub</span>
          </h1>
          <p className="page-subtitle">
            Reduce file sizes for online admission & exam portals, create password-safe ZIP packages, and extract archives.
          </p>
        </div>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'compress' ? 'active' : ''}`}
          onClick={() => setActiveTab('compress')}
        >
          <Minimize2 size={16} /> Batch File Compressor (PDF / JPG / PNG)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'zip-create' ? 'active' : ''}`}
          onClick={() => setActiveTab('zip-create')}
        >
          <FolderArchive size={16} /> Create ZIP Archive
        </button>
        <button 
          className={`tab-btn ${activeTab === 'zip-extract' ? 'active' : ''}`}
          onClick={() => setActiveTab('zip-extract')}
        >
          <Archive size={16} /> Inspect & Extract ZIP
        </button>
      </div>

      {/* 1. FILE COMPRESSOR */}
      {activeTab === 'compress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Minimize2 size={18} color="var(--accent-emerald)" />
                <span>Upload Documents / Photos for Compression</span>
              </div>
              <div className="flex gap-2 items-center">
                <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>Compression Level:</span>
                <select 
                  className="form-select"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
                  value={compQuality}
                  onChange={e => setCompQuality(e.target.value)}
                >
                  <option value="high">High Quality (Light Compression)</option>
                  <option value="medium">Medium (Standard Web & Exam Uploads)</option>
                  <option value="low">Maximum Compression (Smallest Size &lt; 100KB)</option>
                </select>
              </div>
            </div>
            <div className="card-body">
              <FileUploadZone 
                multiple={true}
                accept="application/pdf,image/*"
                onFilesSelected={(f) => { setCompFiles(f || []); setCompResults([]); }}
                title="Select multiple PDFs and Photos"
              />
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-primary btn-lg"
                  disabled={compFiles.length === 0 || compLoading}
                  onClick={handleCompress}
                >
                  {compLoading ? 'Compressing Files...' : `Compress ${compFiles.length} Selected Files`}
                </button>
              </div>
            </div>
          </div>

          {/* Delta Results Table */}
          {compResults.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <CheckCircle2 size={18} color="var(--accent-emerald)" />
                  <span>Compression Results & Delta Summary</span>
                </div>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Original Size</th>
                        <th>Compressed Size</th>
                        <th>Size Reduction</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compResults.map((r, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>{r.originalName}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{Math.round(r.originalSize / 1024)} KB</td>
                          <td style={{ fontWeight: '700', color: 'var(--primary-600)' }}>{Math.round(r.compressedSize / 1024)} KB</td>
                          <td>
                            <span className="delta-badge">
                              <ArrowDown size={12} /> {r.reductionPercent}%
                            </span>
                          </td>
                          <td>
                            <a 
                              href={getFullUrl(r.downloadUrl)} 
                              download={r.fileName}
                              className="btn btn-primary btn-sm"
                            >
                              <Download size={14} /> Download
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. CREATE ZIP */}
      {activeTab === 'zip-create' && (
        <div className="tool-workspace">
          <div className="tool-panel">
            <div className="card">
              <div className="card-header">
                <div className="card-title"><span>ZIP Archive Creator</span></div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Upload Files to Bundle</label>
                  <FileUploadZone 
                    multiple={true}
                    onFilesSelected={(f) => { setZipFiles(f || []); setZipResult(null); }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Archive File Name</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={zipName}
                    onChange={e => setZipName(e.target.value)}
                  />
                </div>
                <button 
                  className="btn btn-primary btn-lg w-full"
                  disabled={zipFiles.length === 0 || zipLoading}
                  onClick={handleCreateZip}
                >
                  {zipLoading ? 'Creating ZIP...' : `Bundle ${zipFiles.length} Files into ZIP`}
                </button>
              </div>
            </div>
          </div>

          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Created Archive</span></div></div>
              <div className="card-body">
                {!zipResult ? (
                  <div className="preview-box"><p style={{ color: 'var(--text-muted)' }}>Created ZIP download button will appear here.</p></div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <CheckCircle2 size={48} color="var(--accent-emerald)" style={{ margin: '0 auto 12px auto' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>ZIP Archive Created!</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                      {zipResult.result.fileCount} Files • {Math.round(zipResult.result.size / 1024)} KB
                    </p>
                    <a href={getFullUrl(zipResult.downloadUrl)} download={zipResult.result.fileName} className="btn btn-primary btn-lg">
                      <Download size={16} /> Download ZIP Archive
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. EXTRACT ZIP */}
      {activeTab === 'zip-extract' && (
        <div className="tool-workspace">
          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Inspect & Extract ZIP</span></div></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Upload ZIP Archive</label>
                  <FileUploadZone 
                    multiple={false}
                    accept=".zip"
                    onFilesSelected={(f) => { setUnzipFile(f); setUnzipResult(null); }}
                  />
                </div>
                <button 
                  className="btn btn-primary btn-lg w-full"
                  disabled={!unzipFile || unzipLoading}
                  onClick={handleExtractZip}
                >
                  {unzipLoading ? 'Extracting Archive...' : 'Inspect ZIP Contents'}
                </button>
              </div>
            </div>
          </div>

          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Archive Entries</span></div></div>
              <div className="card-body">
                {!unzipResult ? (
                  <div className="preview-box"><p style={{ color: 'var(--text-muted)' }}>Extracted files will be listed here.</p></div>
                ) : (
                  <div>
                    <div style={{ fontWeight: '700', marginBottom: '10px' }}>
                      Contents ({unzipResult.totalFiles} Files):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                      {unzipResult.files?.map((f, i) => (
                        <div key={i} className="file-preview-item">
                          <div className="flex items-center gap-2">
                            <FileText size={16} color="var(--primary-500)" />
                            <span>{f.name}</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {Math.round(f.size / 1024)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
