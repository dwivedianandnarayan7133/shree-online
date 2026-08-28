import React, { useState, useRef } from 'react';
import { 
  Scan, Camera, Download, Printer, RefreshCw, 
  Sparkles, CheckCircle2, RotateCw 
} from 'lucide-react';
import { api } from '../services/api';
import { FileUploadZone } from '../components/FileUploadZone';

export const ScannerStudio = () => {
  const [scanFile, setScanFile] = useState(null);
  const [scanMode, setScanMode] = useState('bw_scan');
  const [contrast, setContrast] = useState(1.4);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  // Webcam live scanner simulation
  const [webcamActive, setWebcamActive] = useState(false);
  const videoRef = useRef();

  const handleStartWebcam = async () => {
    setWebcamActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn('Webcam permission not granted or device unavailable');
    }
  };

  const handleCaptureWebcam = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], `webcam-scan-${Date.now()}.png`, { type: 'image/png' });
      setScanFile(file);
      setWebcamActive(false);
    });
  };

  const handleProcessScan = async () => {
    if (!scanFile) {
      alert('Please upload or capture a document to scan.');
      return;
    }

    setScanning(true);
    try {
      const data = new FormData();
      data.append('image', scanFile);
      data.append('mode', scanMode);
      data.append('contrast', contrast);

      const res = await api.restoreDocument(data);
      if (res.success) {
        setScanResult(res);
      }
    } catch (err) {
      alert(err.message || 'Scan enhancement failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Scan size={24} color="var(--primary-500)" />
            <span>Digital Scanner Studio & Document Capture</span>
          </h1>
          <p className="page-subtitle">
            Capture documents via webcam or scanner feed, apply high-contrast B&W scan mode, and produce clean 300 DPI copies.
          </p>
        </div>
      </div>

      <div className="tool-workspace">
        <div className="tool-panel">
          <div className="card">
            <div className="card-header">
              <div className="card-title"><span>Document Capture Source</span></div>
              <button className="btn btn-secondary btn-sm" onClick={handleStartWebcam}>
                <Camera size={14} /> Use Webcam Scanner
              </button>
            </div>
            <div className="card-body">
              {webcamActive ? (
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    style={{ width: '100%', borderRadius: 'var(--radius-md)', background: '#000' }} 
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleCaptureWebcam} style={{ marginTop: '10px' }}>
                    Capture Scanned Frame
                  </button>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Upload Document Photo or Flatbed Scan</label>
                  <FileUploadZone 
                    multiple={false}
                    accept="image/*"
                    onFilesSelected={(f) => { setScanFile(f); setScanResult(null); }}
                    title="Upload raw scanned document"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Scan Output Enhancement</label>
                <select className="form-select" value={scanMode} onChange={e => setScanMode(e.target.value)}>
                  <option value="bw_scan">Monochrome Black & White Scan Mode (CSC Style)</option>
                  <option value="grayscale">Clean Grayscale (300 DPI)</option>
                  <option value="auto_enhance">Auto Color Balance</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Threshold Contrast Boost ({contrast}x)</label>
                <input 
                  type="range" 
                  min="1.0" 
                  max="2.5" 
                  step="0.1" 
                  value={contrast}
                  onChange={e => setContrast(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <button 
                className="btn btn-primary btn-lg w-full"
                disabled={!scanFile || scanning}
                onClick={handleProcessScan}
              >
                {scanning ? 'Processing Scan...' : 'Process Clean Document Scan'}
              </button>
            </div>
          </div>
        </div>

        <div className="tool-panel">
          <div className="card">
            <div className="card-header"><div className="card-title"><span>Processed Document Scan</span></div></div>
            <div className="card-body">
              {!scanResult ? (
                <div className="preview-box"><p style={{ color: 'var(--text-muted)' }}>Scan preview will appear here.</p></div>
              ) : (
                <div>
                  <div className="preview-box" style={{ background: '#fff' }}>
                    <img 
                      src={`http://localhost:5000${scanResult.downloadUrl}`} 
                      alt="Scanned Doc" 
                      className="preview-img"
                    />
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                    <a 
                      href={`http://localhost:5000${scanResult.downloadUrl}`} 
                      download={scanResult.result.fileName}
                      className="btn btn-primary flex-1"
                    >
                      <Download size={14} /> Download Scanned PNG
                    </a>
                    <button 
                      className="btn btn-success flex-1"
                      onClick={() => {
                        api.createPrintJob({
                          title: 'Scanned Document Print',
                          copies: 1,
                          colorMode: 'bw',
                          cost: 10
                        });
                        alert('Sent to Print Queue!');
                      }}
                    >
                      <Printer size={14} /> Print Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
