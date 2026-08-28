import { SERVER_BASE, getFullUrl } from '../services/config';
﻿import React, { useState } from 'react';
import { 
  Sparkles, FileText, Table, Download, Printer, RefreshCw, 
  RotateCw, AlertTriangle, CheckCircle, Edit3, Plus, Trash2 
} from 'lucide-react';
import { api } from '../services/api';
import { FileUploadZone } from '../components/FileUploadZone';

export const ConversionStudio = () => {
  const [activeTab, setActiveTab] = useState('restore'); // 'restore', 'ocr-studio'

  // Restoration state
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoreMode, setRestoreMode] = useState('bw_scan'); // 'auto_enhance', 'bw_scan', 'grayscale', 'high_contrast'
  const [contrast, setContrast] = useState(1.4);
  const [brightness, setBrightness] = useState(1.05);
  const [rotation, setRotation] = useState(0);
  const [restoring, setRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState(null);

  // OCR & Export state
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrLang, setOcrLang] = useState('eng');
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [ocrStats, setOcrStats] = useState(null);

  // Editable Table Data
  const [tableData, setTableData] = useState([
    ['S.No', 'Document / Item Description', 'Quantity', 'Remarks'],
    ['1', 'Class 10th Marksheet (CBSE)', '1 Copy', 'Verified Original'],
    ['2', 'Aadhaar Card Proof', '1 Copy', 'Verified Active'],
    ['3', 'Income Certificate Slip', '1 Copy', 'Issued 2026']
  ]);
  const [exportLoading, setExportLoading] = useState(false);

  // Run Document Restoration
  const handleRestoreDoc = async () => {
    if (!restoreFile) {
      alert('Please upload a document to restore.');
      return;
    }

    setRestoring(true);
    try {
      const data = new FormData();
      data.append('image', restoreFile);
      data.append('mode', restoreMode);
      data.append('contrast', contrast);
      data.append('brightness', brightness);
      data.append('rotation', rotation);

      const res = await api.restoreDocument(data);
      if (res.success) {
        setRestoreResult(res);
      }
    } catch (err) {
      alert(err.message || 'Restoration failed');
    } finally {
      setRestoring(false);
    }
  };

  // Run OCR on document
  const handleRunOcr = async () => {
    if (!ocrFile) {
      alert('Please upload a scanned document or image for OCR.');
      return;
    }

    setOcrRunning(true);
    try {
      const data = new FormData();
      data.append('file', ocrFile);
      data.append('lang', ocrLang);

      const res = await api.extractOcr(data);
      if (res.success) {
        setOcrText(res.result.text);
        setOcrStats({
          confidence: res.result.confidence,
          lineCount: res.result.lineCount,
          words: res.result.words
        });
        if (res.result.detectedTable && res.result.detectedTable.length > 0) {
          setTableData(res.result.detectedTable);
        }
      }
    } catch (err) {
      alert(err.message || 'OCR extraction failed');
    } finally {
      setOcrRunning(false);
    }
  };

  // Export to Word (.docx)
  const handleExportWord = async () => {
    if (!ocrText) {
      alert('No text extracted to export.');
      return;
    }
    setExportLoading(true);
    try {
      const res = await api.exportToWord({
        text: ocrText,
        title: 'Cyber Cafe Converted Document',
        tableData: tableData.length > 0 ? tableData : null
      });
      if (res.success) {
        window.open(`${SERVER_BASE}${res.downloadUrl}`, '_blank');
      }
    } catch (err) {
      alert(err.message || 'Word export failed');
    } finally {
      setExportLoading(false);
    }
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = async () => {
    if (!tableData || tableData.length === 0) {
      alert('No tabular data to export.');
      return;
    }
    setExportLoading(true);
    try {
      const res = await api.exportToExcel({
        tableRows: tableData,
        sheetName: 'Extracted Document Data'
      });
      if (res.success) {
        window.open(`${SERVER_BASE}${res.downloadUrl}`, '_blank');
      }
    } catch (err) {
      alert(err.message || 'Excel export failed');
    } finally {
      setExportLoading(false);
    }
  };

  // Table Editing Helpers
  const updateCell = (rowIndex, colIndex, value) => {
    const updated = tableData.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        const newRow = [...row];
        newRow[colIndex] = value;
        return newRow;
      }
      return row;
    });
    setTableData(updated);
  };

  const addTableRow = () => {
    const numCols = tableData[0]?.length || 3;
    const newRow = Array(numCols).fill('');
    setTableData([...tableData, newRow]);
  };

  const removeTableRow = (index) => {
    if (tableData.length <= 1) return;
    setTableData(tableData.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Sparkles size={24} color="var(--accent-purple)" />
            <span>Old Document Restoration & Conversion Studio</span>
          </h1>
          <p className="page-subtitle">
            Enhance blurry scans, extract OCR text, edit structured tables, and export to Word (.docx) & Excel (.xlsx).
          </p>
        </div>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'restore' ? 'active' : ''}`}
          onClick={() => setActiveTab('restore')}
        >
          <Sparkles size={16} /> Old Document Restoration & B&W Scan Mode
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ocr-studio' ? 'active' : ''}`}
          onClick={() => setActiveTab('ocr-studio')}
        >
          <FileText size={16} /> Scanned Doc → Word (.docx) & Excel (.xlsx) OCR Studio
        </button>
      </div>

      {/* 1. RESTORATION STUDIO */}
      {activeTab === 'restore' && (
        <div className="tool-workspace">
          <div className="tool-panel">
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Sparkles size={18} color="var(--accent-purple)" />
                  <span>Document Enhancement Controls</span>
                </div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Upload Old / Blurry Scanned Document</label>
                  <FileUploadZone 
                    multiple={false}
                    accept="*/*"
                    onFilesSelected={(f) => { setRestoreFile(f); setRestoreResult(null); }}
                    title="Upload certificate, marksheet, or paper photo"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Restoration Preset Mode</label>
                  <select 
                    className="form-select"
                    value={restoreMode}
                    onChange={e => setRestoreMode(e.target.value)}
                  >
                    <option value="bw_scan">Pure Black & White Scan Mode (CSC / Official Scan)</option>
                    <option value="auto_enhance">Auto-Enhance Color & Contrast</option>
                    <option value="grayscale">Clean Document Grayscale</option>
                    <option value="high_contrast">Deep Text High Contrast</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Contrast Boost ({contrast}x)</label>
                    <input 
                      type="range" 
                      min="1.0" 
                      max="2.2" 
                      step="0.05"
                      value={contrast}
                      onChange={e => setContrast(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Rotation Angle</label>
                    <select 
                      className="form-select"
                      value={rotation}
                      onChange={e => setRotation(Number(e.target.value))}
                    >
                      <option value={0}>0° (Normal)</option>
                      <option value={90}>90° Clockwise</option>
                      <option value={180}>180° Flip</option>
                      <option value={270}>270° Counter-Clockwise</option>
                    </select>
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-lg w-full"
                  disabled={!restoreFile || restoring}
                  onClick={handleRestoreDoc}
                  style={{ marginTop: '8px' }}
                >
                  {restoring ? 'Cleaning Document...' : 'Restore & Enhance Document'}
                </button>
              </div>
            </div>
          </div>

          <div className="tool-panel">
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <CheckCircle size={18} color="var(--accent-emerald)" />
                  <span>Restored Clean Document Output</span>
                </div>
              </div>
              <div className="card-body">
                {!restoreResult ? (
                  <div className="preview-box">
                    <p style={{ color: 'var(--text-muted)' }}>Restored document preview will appear here.</p>
                  </div>
                ) : (
                  <div>
                    <div className="preview-box" style={{ background: '#fff' }}>
                      <img 
                        src={getFullUrl(restoreResult.downloadUrl)} 
                        alt="Restored Document"
                        className="preview-img"
                      />
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <a 
                        href={getFullUrl(restoreResult.downloadUrl)}
                        download={restoreResult.result.fileName}
                        className="btn btn-primary flex-1"
                      >
                        <Download size={14} /> Download Clean PNG
                      </a>

                      <button 
                        className="btn btn-secondary flex-1"
                        onClick={() => {
                          setOcrFile(restoreFile);
                          setActiveTab('ocr-studio');
                        }}
                      >
                        Send to OCR Studio <Edit3 size={14} />
                      </button>

                      <button 
                        className="btn btn-success"
                        onClick={() => {
                          api.createPrintJob({
                            title: 'Restored Document Print',
                            copies: 1,
                            colorMode: restoreMode === 'bw_scan' || restoreMode === 'grayscale' ? 'bw' : 'color',
                            paperSize: 'A4',
                            cost: 10
                          });
                          alert('Sent to Print Queue!');
                        }}
                      >
                        <Printer size={14} /> Print
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. OCR & WORD/EXCEL CONVERSION STUDIO */}
      {activeTab === 'ocr-studio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Mandatory OCR Review Warning Banner */}
          <div className="notice-banner notice-warning">
            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            <div>
              <b>Important Verification Notice:</b> Extracted text and tables are generated automatically using Optical Character Recognition (OCR). OCR may occasionally misread degraded letters or symbols. Please review and edit the extracted content below before official application submission.
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <FileText size={18} color="var(--primary-500)" />
                <span>Upload Scanned Paper / Form / Table</span>
              </div>
              <div className="flex gap-2 items-center">
                <select 
                  className="form-select" 
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
                  value={ocrLang}
                  onChange={e => setOcrLang(e.target.value)}
                >
                  <option value="eng">English (eng)</option>
                  <option value="hin">Hindi (hin)</option>
                </select>
                <button 
                  className="btn btn-primary btn-sm"
                  disabled={!ocrFile || ocrRunning}
                  onClick={handleRunOcr}
                >
                  {ocrRunning ? <><RefreshCw size={14} className="animate-spin" /> Running OCR...</> : 'Extract Text & Tables'}
                </button>
              </div>
            </div>
            <div className="card-body">
              <FileUploadZone 
                multiple={false}
                accept="*/*"
                onFilesSelected={(f) => { setOcrFile(f); setOcrText(''); }}
                title="Select document scan for text & table extraction"
              />
            </div>
          </div>

          {/* OCR Results & Side-by-Side Editors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
            {/* Extracted Text Area */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Edit3 size={18} color="var(--primary-500)" />
                  <span>Extracted Text Editor (Word .docx Output)</span>
                </div>
                {ocrStats && (
                  <span className="badge badge-completed" style={{ fontSize: '0.72rem' }}>
                    {ocrStats.format ? ocrStats.format + " • " : ""}{ocrStats.confidence}% Confidence • {ocrStats.words} Words
                  </span>
                )}
              </div>
              <div className="card-body">
                <textarea 
                  className="form-textarea"
                  style={{ minHeight: '260px', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}
                  placeholder="Extracted text will appear here. You can edit directly before exporting..."
                  value={ocrText}
                  onChange={e => setOcrText(e.target.value)}
                />
                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-primary"
                    disabled={!ocrText || exportLoading}
                    onClick={handleExportWord}
                  >
                    <Download size={16} /> Export to Word (.docx)
                  </button>
                </div>
              </div>
            </div>

            {/* Extracted & Editable Table Grid */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Table size={18} color="var(--accent-emerald)" />
                  <span>Detected Table Editor (Excel .xlsx Output)</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={addTableRow}>
                  <Plus size={12} /> Add Row
                </button>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-wrapper" style={{ maxHeight: '280px', overflowY: 'auto', border: 'none', borderRadius: 0 }}>
                  <table className="editable-grid-table">
                    <thead>
                      <tr>
                        {tableData[0]?.map((headerCell, cIdx) => (
                          <th key={cIdx}>
                            <input 
                              type="text" 
                              value={headerCell} 
                              onChange={e => updateCell(0, cIdx, e.target.value)}
                              style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: '700', width: '100%', outline: 'none' }}
                            />
                          </th>
                        ))}
                        <th style={{ width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.slice(1).map((row, rIdx) => (
                        <tr key={rIdx + 1}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx}>
                              <input 
                                type="text"
                                className="editable-cell-input"
                                value={cell}
                                onChange={e => updateCell(rIdx + 1, cIdx, e.target.value)}
                              />
                            </td>
                          ))}
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              onClick={() => removeTableRow(rIdx + 1)}
                              style={{ color: 'var(--accent-rose)', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'flex-end', background: 'var(--card-header-bg)', borderTop: '1px solid var(--border-color)' }}>
                  <button 
                    className="btn btn-success"
                    disabled={exportLoading}
                    onClick={handleExportExcel}
                  >
                    <Download size={16} /> Export to Excel (.xlsx)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
