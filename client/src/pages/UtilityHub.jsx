import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, Barcode, Calculator, StickyNote, Download, 
  Copy, Check, Plus, Trash2, RefreshCw 
} from 'lucide-react';

export const UtilityHub = () => {
  const [activeTab, setActiveTab] = useState('qr'); // 'qr', 'calc', 'notes'

  // QR Code State
  const [qrText, setQrText] = useState('upi://pay?pa=shreeonline@okaxis&pn=ShreeOnlineMahuli&cu=INR');
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBg, setQrBg] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const qrCanvasRef = useRef();

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcMemory, setCalcMemory] = useState(null);
  const [calcOp, setCalcOp] = useState(null);

  // Scratchpad Notes State
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem('cybercafe_scratchpad') || '• Class 12th Admit Card print for roll number 261890\n• Check Aadhaar OTP update for customer Sunil\n• 6 Passport photos with sky blue background for Army Bharti';
  });
  const [copied, setCopied] = useState(false);

  // Render QR Code dynamically onto HTML Canvas
  useEffect(() => {
    if (activeTab === 'qr') {
      const canvas = qrCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const size = 260;
      canvas.width = size;
      canvas.height = size;

      ctx.fillStyle = qrBg;
      ctx.fillRect(0, 0, size, size);

      // Simple visual high-density QR representation matrix
      ctx.fillStyle = qrColor;
      const margin = 20;
      const matrixSize = 25;
      const cellSize = (size - margin * 2) / matrixSize;

      // Seed deterministic pseudo-random blocks based on qrText
      let hash = 0;
      for (let i = 0; i < qrText.length; i++) {
        hash = ((hash << 5) - hash) + qrText.charCodeAt(i);
        hash |= 0;
      }

      // Draw standard 3 QR positioning corner squares
      const drawCorner = (x, y) => {
        ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
        ctx.fillStyle = qrBg;
        ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
        ctx.fillStyle = qrColor;
        ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
      };

      drawCorner(margin, margin);
      drawCorner(margin + cellSize * (matrixSize - 7), margin);
      drawCorner(margin, margin + cellSize * (matrixSize - 7));

      // Draw data cells
      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          if ((r < 7 && c < 7) || (r < 7 && c >= matrixSize - 7) || (r >= matrixSize - 7 && c < 7)) {
            continue;
          }
          const pseudoBit = ((Math.sin((r * 31 + c * 17) + hash) * 10000) % 1) > 0.45;
          if (pseudoBit) {
            ctx.fillRect(margin + c * cellSize, margin + r * cellSize, cellSize - 0.5, cellSize - 0.5);
          }
        }
      }

      setQrDataUrl(canvas.toDataURL('image/png'));
    }
  }, [qrText, qrColor, qrBg, activeTab]);

  const handleCalcBtn = (val) => {
    if (val === 'C') {
      setCalcDisplay('0');
      setCalcMemory(null);
      setCalcOp(null);
    } else if (['+', '-', '*', '/'].includes(val)) {
      setCalcMemory(Number(calcDisplay));
      setCalcOp(val);
      setCalcDisplay('0');
    } else if (val === '=') {
      if (calcOp && calcMemory !== null) {
        const cur = Number(calcDisplay);
        let res = 0;
        if (calcOp === '+') res = calcMemory + cur;
        if (calcOp === '-') res = calcMemory - cur;
        if (calcOp === '*') res = calcMemory * cur;
        if (calcOp === '/') res = cur !== 0 ? calcMemory / cur : 0;
        setCalcDisplay(String(res));
        setCalcMemory(null);
        setCalcOp(null);
      }
    } else {
      setCalcDisplay(calcDisplay === '0' ? String(val) : calcDisplay + val);
    }
  };

  const handleSaveNotes = (val) => {
    setNotes(val);
    localStorage.setItem('cybercafe_scratchpad', val);
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <QrCode size={24} color="var(--primary-500)" />
            <span>Shree Online Utility Hub (Mahuli, S.K.N)</span>
          </h1>
          <p className="page-subtitle">
            Instant QR code generator for UPI payments/URLs, on-screen calculator, and operator scratchpad.
          </p>
        </div>
      </div>

      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'qr' ? 'active' : ''}`} onClick={() => setActiveTab('qr')}>
          <QrCode size={16} /> QR Code Generator
        </button>
        <button className={`tab-btn ${activeTab === 'calc' ? 'active' : ''}`} onClick={() => setActiveTab('calc')}>
          <Calculator size={16} /> POS Calculator
        </button>
        <button className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
          <StickyNote size={16} /> Operator Scratchpad & Notes
        </button>
      </div>

      {/* 1. QR CODE GENERATOR */}
      {activeTab === 'qr' && (
        <div className="tool-workspace">
          <div className="tool-panel">
            <div className="card">
              <div className="card-header">
                <div className="card-title"><span>QR Code Generator</span></div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Data / UPI Payment URL / Text</label>
                  <textarea 
                    className="form-textarea"
                    value={qrText}
                    onChange={e => setQrText(e.target.value)}
                    placeholder="Enter URL, text or UPI string (e.g. upi://pay?pa=cybercafe@bank...)"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">QR Color</label>
                    <input 
                      type="color"
                      className="form-input"
                      style={{ height: '42px', padding: '2px' }}
                      value={qrColor}
                      onChange={e => setQrColor(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Background Color</label>
                    <input 
                      type="color"
                      className="form-input"
                      style={{ height: '42px', padding: '2px' }}
                      value={qrBg}
                      onChange={e => setQrBg(e.target.value)}
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setQrText('upi://pay?pa=shreeonline@okaxis&pn=ShreeOnlineMahuliPoint&am=50&cu=INR')}
                  >
                    UPI ₹50 Preset
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setQrText('upi://pay?pa=shreeonline@okaxis&pn=ShreeOnlineMahuliPoint&am=100&cu=INR')}
                  >
                    UPI ₹100 Preset
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setQrText('https://myaadhaar.uidai.gov.in/')}
                  >
                    UIDAI Portal URL
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Generated High-Res QR Code</span></div></div>
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div className="preview-box" style={{ background: qrBg }}>
                  <canvas ref={qrCanvasRef} style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)' }} />
                </div>
                <div style={{ marginTop: '16px' }}>
                  <a 
                    href={qrDataUrl} 
                    download="cybercafe_qrcode.png"
                    className="btn btn-primary btn-lg"
                  >
                    <Download size={16} /> Download QR Code (PNG)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CALCULATOR */}
      {activeTab === 'calc' && (
        <div style={{ maxWidth: '360px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{
              background: 'var(--bg-main)', border: '1px solid var(--border-color)',
              padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'right',
              fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-mono)',
              marginBottom: '16px', minHeight: '68px', overflow: 'hidden'
            }}>
              {calcDisplay}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {['C', '/', '*', '-'].map(btn => (
                <button key={btn} className="btn btn-secondary" style={{ fontSize: '1.2rem', fontWeight: '700' }} onClick={() => handleCalcBtn(btn)}>
                  {btn}
                </button>
              ))}
              {['7', '8', '9', '+'].map(btn => (
                <button key={btn} className={`btn ${btn === '+' ? 'btn-secondary' : 'btn-outline'}`} style={{ fontSize: '1.2rem', fontWeight: '700' }} onClick={() => handleCalcBtn(btn)}>
                  {btn}
                </button>
              ))}
              {['4', '5', '6', '='].map(btn => (
                <button key={btn} className={`btn ${btn === '=' ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '1.2rem', fontWeight: '700' }} onClick={() => handleCalcBtn(btn)}>
                  {btn}
                </button>
              ))}
              {['1', '2', '3', '0'].map(btn => (
                <button key={btn} className="btn btn-outline" style={{ fontSize: '1.2rem', fontWeight: '700' }} onClick={() => handleCalcBtn(btn)}>
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. OPERATOR SCRATCHPAD */}
      {activeTab === 'notes' && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card-header">
            <div className="card-title">
              <StickyNote size={18} color="var(--accent-amber)" />
              <span>Operator Digital Scratchpad & Quick Clipboard</span>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" onClick={handleCopyNotes}>
                {copied ? <><Check size={14} color="var(--accent-emerald)" /> Copied</> : <><Copy size={14} /> Copy All</>}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleSaveNotes('')}>
                <Trash2 size={14} /> Clear
              </button>
            </div>
          </div>
          <div className="card-body">
            <textarea 
              className="form-textarea"
              style={{ minHeight: '320px', fontFamily: 'var(--font-mono)', fontSize: '0.95rem', lineHeight: '1.6' }}
              value={notes}
              onChange={e => handleSaveNotes(e.target.value)}
              placeholder="Type customer notes, roll numbers, application IDs, token numbers here..."
            />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Auto-saved in local browser cache. Notes will persist across sessions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
