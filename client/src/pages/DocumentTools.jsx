import { SERVER_BASE, getFullUrl } from '../services/config';
﻿import React, { useState } from 'react';
import { 
  FileText, Layers, Scissors, RotateCw, Minimize2, 
  Download, Plus, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { api } from '../services/api';
import { FileUploadZone } from '../components/FileUploadZone';

export const DocumentTools = () => {
  const [activeTab, setActiveTab] = useState('img2pdf'); // 'img2pdf', 'merge', 'split', 'rotate', 'compress'

  // Image to PDF state
  const [imgFiles, setImgFiles] = useState([]);
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [img2PdfResult, setImg2PdfResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Merge state
  const [mergeFiles, setMergeFiles] = useState([]);
  const [mergeResult, setMergeResult] = useState(null);

  // Split state
  const [splitFile, setSplitFile] = useState(null);
  const [pageRange, setPageRange] = useState('1-3');
  const [splitResult, setSplitResult] = useState(null);

  // Rotate state
  const [rotateFile, setRotateFile] = useState(null);
  const [rotateAngle, setRotateAngle] = useState(90);
  const [rotateResult, setRotateResult] = useState(null);

  // Compress state
  const [compFile, setCompFile] = useState(null);
  const [compResult, setCompResult] = useState(null);

  const handleImgToPdf = async () => {
    if (!imgFiles || imgFiles.length === 0) {
      alert('Please upload one or more images.');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      imgFiles.forEach(f => data.append('images', f));
      data.append('pageSize', pageSize);
      data.append('orientation', orientation);

      const res = await api.imagesToPdf(data);
      if (res.success) setImg2PdfResult(res);
    } catch (err) {
      alert(err.message || 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMergePdf = async () => {
    if (!mergeFiles || mergeFiles.length < 2) {
      alert('Please upload at least 2 PDF files to merge.');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      mergeFiles.forEach(f => data.append('pdfs', f));

      const res = await api.mergePdfs(data);
      if (res.success) setMergeResult(res);
    } catch (err) {
      alert(err.message || 'Merge failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSplitPdf = async () => {
    if (!splitFile) {
      alert('Please upload a PDF file.');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('pdf', splitFile);
      data.append('pageRange', pageRange);

      const res = await api.splitPdf(data);
      if (res.success) setSplitResult(res);
    } catch (err) {
      alert(err.message || 'Split failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRotatePdf = async () => {
    if (!rotateFile) {
      alert('Please upload a PDF file.');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('pdf', rotateFile);
      data.append('angle', rotateAngle);

      const res = await api.rotatePdf(data);
      if (res.success) setRotateResult(res);
    } catch (err) {
      alert(err.message || 'Rotate failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCompressPdf = async () => {
    if (!compFile) {
      alert('Please upload a PDF file.');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('pdf', compFile);

      const res = await api.compressPdf(data);
      if (res.success) setCompResult(res);
    } catch (err) {
      alert(err.message || 'Compression failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileText size={24} color="var(--primary-500)" />
            <span>Document & PDF Tools Workspace</span>
          </h1>
          <p className="page-subtitle">
            Single-window PDF management: convert photos to PDF, merge, split, rotate, and optimize file sizes.
          </p>
        </div>
      </div>

      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'img2pdf' ? 'active' : ''}`} onClick={() => setActiveTab('img2pdf')}>
          <Plus size={16} /> Images → PDF
        </button>
        <button className={`tab-btn ${activeTab === 'merge' ? 'active' : ''}`} onClick={() => setActiveTab('merge')}>
          <Layers size={16} /> Merge Multiple PDFs
        </button>
        <button className={`tab-btn ${activeTab === 'split' ? 'active' : ''}`} onClick={() => setActiveTab('split')}>
          <Scissors size={16} /> Split & Extract Pages
        </button>
        <button className={`tab-btn ${activeTab === 'rotate' ? 'active' : ''}`} onClick={() => setActiveTab('rotate')}>
          <RotateCw size={16} /> Rotate PDF
        </button>
        <button className={`tab-btn ${activeTab === 'compress' ? 'active' : ''}`} onClick={() => setActiveTab('compress')}>
          <Minimize2 size={16} /> Compress PDF
        </button>
      </div>

      {/* 1. IMAGES TO PDF */}
      {activeTab === 'img2pdf' && (
        <div className="tool-workspace">
          <div className="tool-panel">
            <div className="card">
              <div className="card-header">
                <div className="card-title"><span>Images to Single PDF</span></div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Upload Images (In desired page order)</label>
                  <FileUploadZone 
                    multiple={true}
                    accept="image/*"
                    onFilesSelected={(f) => { setImgFiles(f || []); setImg2PdfResult(null); }}
                    title="Select multiple JPG/PNG images"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Page Size</label>
                    <select className="form-select" value={pageSize} onChange={e => setPageSize(e.target.value)}>
                      <option value="A4">Standard A4</option>
                      <option value="fit">Fit to Image Size</option>
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

                <button className="btn btn-primary btn-lg w-full" disabled={imgFiles.length === 0 || loading} onClick={handleImgToPdf}>
                  {loading ? 'Converting...' : `Convert ${imgFiles.length} Images to PDF`}
                </button>
              </div>
            </div>
          </div>

          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Generated PDF</span></div></div>
              <div className="card-body">
                {!img2PdfResult ? (
                  <div className="preview-box"><p style={{ color: 'var(--text-muted)' }}>Generated PDF will be ready here.</p></div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <CheckCircle2 size={48} color="var(--accent-emerald)" style={{ margin: '0 auto 12px auto' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>PDF Generated Successfully!</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                      {img2PdfResult.result.pageCount} Pages • {Math.round(img2PdfResult.result.size / 1024)} KB
                    </p>
                    <a href={`${SERVER_BASE}${img2PdfResult.downloadUrl}`} download={img2PdfResult.result.fileName} className="btn btn-primary btn-lg">
                      <Download size={16} /> Download Converted PDF
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MERGE PDF */}
      {activeTab === 'merge' && (
        <div className="tool-workspace">
          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Merge PDFs</span></div></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Upload PDFs to Combine</label>
                  <FileUploadZone 
                    multiple={true}
                    accept="application/pdf"
                    onFilesSelected={(f) => { setMergeFiles(f || []); setMergeResult(null); }}
                    title="Select 2 or more PDF documents"
                  />
                </div>
                <button className="btn btn-primary btn-lg w-full" disabled={mergeFiles.length < 2 || loading} onClick={handleMergePdf}>
                  {loading ? 'Merging...' : `Merge ${mergeFiles.length} PDF Documents`}
                </button>
              </div>
            </div>
          </div>

          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Merged Output</span></div></div>
              <div className="card-body">
                {!mergeResult ? (
                  <div className="preview-box"><p style={{ color: 'var(--text-muted)' }}>Combined PDF download link will appear here.</p></div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <CheckCircle2 size={48} color="var(--accent-emerald)" style={{ margin: '0 auto 12px auto' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>PDFs Combined Successfully!</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                      Total Pages: {mergeResult.result.pageCount} • {Math.round(mergeResult.result.size / 1024)} KB
                    </p>
                    <a href={`${SERVER_BASE}${mergeResult.downloadUrl}`} download={mergeResult.result.fileName} className="btn btn-primary btn-lg">
                      <Download size={16} /> Download Merged PDF
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SPLIT & EXTRACT */}
      {activeTab === 'split' && (
        <div className="tool-workspace">
          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Split & Extract Pages</span></div></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Upload Multi-Page PDF</label>
                  <FileUploadZone 
                    multiple={false}
                    accept="application/pdf"
                    onFilesSelected={(f) => { setSplitFile(f); setSplitResult(null); }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Page Range to Extract</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 1, 3-5, 8"
                    value={pageRange}
                    onChange={e => setPageRange(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Use commas for separate pages and hyphens for ranges (e.g. 1-3, 5).
                  </span>
                </div>
                <button className="btn btn-primary btn-lg w-full" disabled={!splitFile || loading} onClick={handleSplitPdf}>
                  {loading ? 'Extracting...' : 'Extract Selected Pages'}
                </button>
              </div>
            </div>
          </div>

          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Extracted PDF</span></div></div>
              <div className="card-body">
                {!splitResult ? (
                  <div className="preview-box"><p style={{ color: 'var(--text-muted)' }}>Extracted pages PDF ready for download.</p></div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <CheckCircle2 size={48} color="var(--accent-emerald)" style={{ margin: '0 auto 12px auto' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Pages Extracted!</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                      Extracted {splitResult.result.extractedCount} Pages
                    </p>
                    <a href={`${SERVER_BASE}${splitResult.downloadUrl}`} download={splitResult.result.fileName} className="btn btn-primary btn-lg">
                      <Download size={16} /> Download Extracted PDF
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ROTATE PDF */}
      {activeTab === 'rotate' && (
        <div className="tool-workspace">
          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Rotate PDF</span></div></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Upload PDF</label>
                  <FileUploadZone multiple={false} accept="application/pdf" onFilesSelected={(f) => { setRotateFile(f); setRotateResult(null); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Rotation</label>
                  <select className="form-select" value={rotateAngle} onChange={e => setRotateAngle(Number(e.target.value))}>
                    <option value={90}>90° Clockwise</option>
                    <option value={180}>180° Upside Down</option>
                    <option value={270}>270° Counter-Clockwise</option>
                  </select>
                </div>
                <button className="btn btn-primary btn-lg w-full" disabled={!rotateFile || loading} onClick={handleRotatePdf}>
                  Rotate All Pages
                </button>
              </div>
            </div>
          </div>
          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Rotated PDF</span></div></div>
              <div className="card-body">
                {!rotateResult ? (
                  <div className="preview-box"><p style={{ color: 'var(--text-muted)' }}>Preview will appear here.</p></div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <CheckCircle2 size={48} color="var(--accent-emerald)" style={{ margin: '0 auto 12px auto' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Rotated Successfully!</h3>
                    <a href={`${SERVER_BASE}${rotateResult.downloadUrl}`} download={rotateResult.result.fileName} className="btn btn-primary btn-lg" style={{ marginTop: '16px' }}>
                      <Download size={16} /> Download Rotated PDF
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. COMPRESS PDF */}
      {activeTab === 'compress' && (
        <div className="tool-workspace">
          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Optimize & Compress PDF</span></div></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Upload Large PDF</label>
                  <FileUploadZone multiple={false} accept="application/pdf" onFilesSelected={(f) => { setCompFile(f); setCompResult(null); }} />
                </div>
                <button className="btn btn-primary btn-lg w-full" disabled={!compFile || loading} onClick={handleCompressPdf}>
                  {loading ? 'Compressing...' : 'Compress PDF'}
                </button>
              </div>
            </div>
          </div>
          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Compressed Output</span></div></div>
              <div className="card-body">
                {!compResult ? (
                  <div className="preview-box"><p style={{ color: 'var(--text-muted)' }}>Compression reduction delta will be shown here.</p></div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div className="delta-badge" style={{ marginBottom: '14px' }}>
                      -{compResult.result.reductionPercent}% Size Reduction
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                      {Math.round(compResult.result.originalSize / 1024)} KB ➔ <b>{Math.round(compResult.result.compressedSize / 1024)} KB</b>
                    </div>
                    <a href={`${SERVER_BASE}${compResult.downloadUrl}`} download={compResult.result.fileName} className="btn btn-primary btn-lg">
                      <Download size={16} /> Download Compressed PDF
                    </a>
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
