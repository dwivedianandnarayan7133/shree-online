import { generatePassportSheetClient, processSignatureClient } from '../services/clientImageEngine';
import { SERVER_BASE, getFullUrl } from '../services/config';
﻿import React, { useState } from 'react';
import { 
  Camera, Download, Printer, RefreshCw, Scissors, 
  Sparkles, Image, Check, Layers, Sliders, Maximize2,
  Plus, Minus, AlignJustify, Space
} from 'lucide-react';
import { api } from '../services/api';
import { FileUploadZone } from '../components/FileUploadZone';
import { removeBackground } from '@imgly/background-removal';

export const ImageTools = ({ setActivePage }) => {
  const [activeSubTab, setActiveSubTab] = useState('passport'); // 'passport', 'signature', 'transform', 'bg-remover'

  // Passport photo generator state
  const [passportFile, setPassportFile] = useState(null);
  const [spec, setSpec] = useState('standard_35x45');
  const [quantity, setQuantity] = useState(6);
  const [paperType, setPaperType] = useState('A4');
  const [paddingGutter, setPaddingGutter] = useState('standard');
  const [bgColor, setBgColor] = useState('original');
  const [zoom, setZoom] = useState(1.0);
  const [generating, setGenerating] = useState(false);
  const [passportResult, setPassportResult] = useState(null);

  // Photo Enhancement Controls
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(108);
  const [saturation, setSaturation] = useState(110);
  const [sharpness, setSharpness] = useState(0); // 0=off, 1=light, 2=medium, 3=strong
  const [photoFilter, setPhotoFilter] = useState('none'); // preset filter
  const [enhancedPreview, setEnhancedPreview] = useState(null); // data URI of enhanced photo

  // Signature state
  const [sigFile, setSigFile] = useState(null);
  const [contrastBoost, setContrastBoost] = useState(1.8);
  const [invertSig, setInvertSig] = useState(false);
  const [sigResult, setSigResult] = useState(null);
  const [sigLoading, setSigLoading] = useState(false);

  // General Image Transform state
  const [transFile, setTransFile] = useState(null);
  const [targetWidth, setTargetWidth] = useState('');
  const [targetHeight, setTargetHeight] = useState('');
  const [targetFormat, setTargetFormat] = useState('jpeg');
  const [targetQuality, setTargetQuality] = useState(85);
  const [transResult, setTransResult] = useState(null);
  const [transLoading, setTransLoading] = useState(false);

  // BG Remover state
  const [bgFile, setBgFile] = useState(null);
  const [bgResult, setBgResult] = useState(null);
  const [bgLoading, setBgLoading] = useState(false);

  // Calculate lines info (6 photos per line on A4, 3 on 4x6)
  const photosPerLine = paperType === 'A4' ? 6 : 3;
  const maxPhotos = paperType === 'A4' ? 42 : 6;
  const fullLines = Math.floor(quantity / photosPerLine);
  const remainder = quantity % photosPerLine;

  const handleIncreaseQty = () => {
    setQuantity(prev => Math.min(maxPhotos, prev + 1));
  };

  const handleDecreaseQty = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  // Apply photo enhancements client-side using Canvas + CSS filters
  const applyEnhancements = async (file) => {
    if (!file) return null;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          // Upscale 2x for HD quality
          const scale = 2;
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');

          // Build CSS filter string
          let filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

          // Preset filter overrides
          if (photoFilter === 'vivid')    filterStr = 'brightness(105%) contrast(120%) saturate(140%)';
          if (photoFilter === 'studio')   filterStr = 'brightness(108%) contrast(115%) saturate(105%)';
          if (photoFilter === 'natural')  filterStr = 'brightness(102%) contrast(105%) saturate(100%)';
          if (photoFilter === 'hd_crisp') filterStr = 'brightness(110%) contrast(130%) saturate(110%)';
          if (photoFilter === 'warm')     filterStr = 'brightness(105%) contrast(108%) saturate(115%) sepia(15%)';
          if (photoFilter === 'cool')     filterStr = 'brightness(104%) contrast(110%) saturate(95%) hue-rotate(10deg)';
          if (photoFilter === 'bw_id')    filterStr = 'brightness(110%) contrast(130%) saturate(0%) grayscale(100%)';

          ctx.filter = filterStr;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.filter = 'none';

          // Sharpness via unsharp mask (convolution kernel)
          if (sharpness > 0) {
            const amount = sharpness === 1 ? 0.3 : sharpness === 2 ? 0.6 : 1.0;
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const d = imageData.data;
            const w = canvas.width;
            // Simple unsharp: subtract blurred version
            const blurred = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let y = 1; y < canvas.height - 1; y++) {
              for (let x = 1; x < w - 1; x++) {
                const idx = (y * w + x) * 4;
                for (let c = 0; c < 3; c++) {
                  const orig = d[idx + c];
                  const avg = (d[idx - 4 + c] + d[idx + 4 + c] + d[idx - w * 4 + c] + d[idx + w * 4 + c]) / 4;
                  blurred.data[idx + c] = Math.min(255, Math.max(0, orig + amount * (orig - avg)));
                }
                blurred.data[idx + 3] = d[idx + 3];
              }
            }
            ctx.putImageData(blurred, 0, 0);
          }

          resolve(canvas.toDataURL('image/jpeg', 0.97));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Generate live preview of enhancements
  const handlePreviewEnhancement = async () => {
    if (!passportFile) return;
    const dataUri = await applyEnhancements(passportFile);
    setEnhancedPreview(dataUri);
  };

  // Convert data URI to File for passing to the generator
  const dataUriToFile = (dataUri, filename) => {
    const arr = dataUri.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  // Handle Passport Photo Generation
  const handleGeneratePassport = async () => {
    if (!passportFile) {
      alert('Please upload a portrait photograph first.');
      return;
    }

    setGenerating(true);
    try {
      // Apply enhancements first, then pass enhanced image to generator
      let fileToProcess = passportFile;
      try {
        const enhancedUri = await applyEnhancements(passportFile);
        fileToProcess = dataUriToFile(enhancedUri, 'enhanced_photo.jpg');
      } catch (enhErr) {
        console.warn('Enhancement notice, using original:', enhErr.message);
      }

      // 1. Instant High-Res Client Canvas Engine
      const clientRes = await generatePassportSheetClient(fileToProcess, {
        spec,
        quantity,
        paperType,
        paddingGutter,
        bgColor,
        zoom,
        includeCutLines: true
      });
      setPassportResult(clientRes);
    } catch (clientErr) {
      console.warn('Client engine notice, trying API fallback:', clientErr.message);
      try {
        const data = new FormData();
        data.append('photo', passportFile);
        data.append('spec', spec);
        data.append('quantity', quantity);
        data.append('paperType', paperType);
        data.append('paddingGutter', paddingGutter);
        data.append('bgColor', bgColor);
        data.append('zoom', zoom);
        data.append('includeCutLines', 'true');

        const res = await api.generatePassportSheet(data);
        if (res.success) {
          setPassportResult(res);
        }
      } catch (err) {
        alert(err.message || 'Passport generation failed');
      }
    } finally {
      setGenerating(false);
    }
  };

  // 100% Reliable In-Memory Blob Download Triggers for Chrome / Edge / Mobile
  const handleDownloadJpg = () => {
    if (!passportResult) return;
    const uri = passportResult.sheetJpgUrl || passportResult.downloadUrlJpg || passportResult.dataUri;
    if (!uri) return;
    const filename = passportResult.result?.jpgName || `shree-passport-${quantity}photos.jpg`;

    try {
      const parts = uri.split(',');
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      const a = document.createElement('a');
      a.href = uri;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDownloadPdf = () => {
    if (!passportResult) return;
    const uri = passportResult.pdfDataUri || passportResult.downloadUrlPdf || passportResult.sheetPdfUrl || passportResult.downloadUrl;
    if (!uri) return;
    const filename = passportResult.result?.pdfName || passportResult.result?.fileName || `shree-passport-${quantity}photos.pdf`;

    try {
      const parts = uri.split(',');
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      const a = document.createElement('a');
      a.href = uri;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Handle Signature Processing
  const handleProcessSignature = async () => {
    if (!sigFile) {
      alert('Please upload a signature photo or scan.');
      return;
    }

    setSigLoading(true);
    try {
      const clientRes = await processSignatureClient(sigFile, { contrastBoost, invert: invertSig });
      setSigResult(clientRes);
    } catch (clientErr) {
      console.warn('Client engine notice, trying API fallback:', clientErr.message);
      try {
        const data = new FormData();
        data.append('image', sigFile);
        data.append('contrastBoost', contrastBoost);
        data.append('invert', invertSig);

        const res = await api.processSignature(data);
        if (res.success) {
          setSigResult(res);
        }
      } catch (err) {
        alert(err.message || 'Signature processing failed');
      }
    } finally {
      setSigLoading(false);
    }
  };

  // Handle General Image Transform — 100% client-side, no server call
  const handleTransformImage = async () => {
    if (!transFile) {
      alert('Please upload an image to transform.');
      return;
    }
    setTransLoading(true);
    try {
      const img = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const image = new window.Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error('Failed to load image'));
          image.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsDataURL(transFile);
      });

      // Determine output dimensions
      const outW = targetWidth ? parseInt(targetWidth) : img.width;
      const outH = targetHeight ? parseInt(targetHeight) : Math.round(img.height * (outW / img.width));

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, outW, outH);

      const mimeMap = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
      const mime = mimeMap[targetFormat] || 'image/jpeg';
      const quality = targetQuality / 100;
      const dataUri = canvas.toDataURL(mime, quality);

      const extMap = { jpeg: 'jpg', png: 'png', webp: 'webp' };
      const ext = extMap[targetFormat] || 'jpg';
      const approxSize = Math.round((dataUri.length * 3) / 4);

      setTransResult({
        success: true,
        downloadUrl: dataUri,
        result: {
          fileName: `resized-${Date.now()}.${ext}`,
          width: outW,
          height: outH,
          size: approxSize
        }
      });
    } catch (err) {
      alert('Image transform failed: ' + err.message);
    } finally {
      setTransLoading(false);
    }
  };

  // Handle Background Removal
  const handleRemoveBg = async () => {
    if (!bgFile) {
      alert('Please upload an image to remove the background.');
      return;
    }
    setBgLoading(true);
    try {
      // Run the @imgly ML model client-side
      const blob = await removeBackground(bgFile);
      const url = URL.createObjectURL(blob);
      setBgResult({
        downloadUrl: url,
        result: {
          fileName: `bg-removed-${Date.now()}.png`
        }
      });
    } catch (err) {
      alert('Error removing background: ' + err.message);
    } finally {
      setBgLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Camera size={24} color="var(--primary-500)" />
            <span>Shree Online — Passport Photo Studio (Easy-Cut Padding)</span>
          </h1>
          <p className="page-subtitle">
            Mahuli, S.K.N • A4 format (6 photos/line, 7 lines, 42 photos max) with comfortable cutting padding & guidelines for easy scissor trimming.
          </p>
        </div>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeSubTab === 'passport' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('passport')}
        >
          <Camera size={16} /> Passport Photo Sheet (Easy-Cut Padding • 6/Line)
        </button>
        <button 
          className={`tab-btn ${activeSubTab === 'signature' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('signature')}
        >
          <Scissors size={16} /> Signature Crop & Enhance
        </button>
        <button 
          className={`tab-btn ${activeSubTab === 'transform' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('transform')}
        >
          <Sliders size={16} /> Resize, Format & Compress
        </button>
        <button 
          className={`tab-btn ${activeSubTab === 'bg-remover' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('bg-remover')}
        >
          <Layers size={16} /> AI Background Remover
        </button>
      </div>

      {/* 1. PASSPORT PHOTO GENERATOR */}
      {activeSubTab === 'passport' && (
        <div className="tool-workspace">
          {/* Controls Panel */}
          <div className="tool-panel">
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Camera size={18} color="var(--primary-500)" />
                  <span>Passport Photo Specifications & Easy-Cut Padding</span>
                </div>
                <span className="badge badge-completed" style={{ fontSize: '0.7rem' }}>
                  6 Photos / Line • 7 Lines
                </span>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Upload Portrait Photograph</label>
                  <FileUploadZone 
                    multiple={false}
                    accept="image/*"
                    onFilesSelected={(file) => {
                      setPassportFile(file);
                      setPassportResult(null);
                    }}
                    title="Upload single photograph"
                    subtitle="Clear front face photo (JPG, PNG)"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Paper Sheet Format</label>
                  <select 
                    className="form-select"
                    value={paperType}
                    onChange={e => {
                      setPaperType(e.target.value);
                      if (e.target.value === 'A4' && quantity > 42) setQuantity(42);
                      if (e.target.value === '4x6' && quantity > 6) setQuantity(6);
                    }}
                  >
                    <option value="A4">A4 Document Paper (6 Photos per Line • 7 Lines • 42 Total)</option>
                    <option value="4x6">4 x 6 Inch Glossy Photo Paper (3 Photos per Line • 6 Total)</option>
                  </select>
                </div>

                {/* Cutting Gutter Padding Selector */}
                <div className="form-group">
                  <label className="form-label">Scissors & Cutter Spacing (Cutting Padding)</label>
                  <select 
                    className="form-select"
                    value={paddingGutter}
                    onChange={e => setPaddingGutter(e.target.value)}
                  >
                    <option value="standard">Standard Cutting Padding (Easy Scissor & Trimming Gutter - Recommended)</option>
                    <option value="wide">Wide Gutter (Extra Spacing for Fast Manual Slicing)</option>
                    <option value="compact">Compact Gutter (Minimal Padding)</option>
                  </select>
                </div>

                {/* Flexible Quantity Stepper Controller */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Number of Photos to Print</label>
                    <span style={{ fontSize: '0.78rem', color: 'var(--primary-400)', fontWeight: '700' }}>
                      {fullLines > 0 ? `${fullLines} Line${fullLines > 1 ? 's' : ''}` : ''} {remainder > 0 ? `+ ${remainder} extra` : '(Full Line)'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleDecreaseQty}
                      style={{ width: '46px', height: '46px', fontSize: '1.4rem', fontWeight: '800', padding: 0 }}
                      title="Decrease Photo Quantity"
                    >
                      <Minus size={18} />
                    </button>

                    <input 
                      type="number"
                      min="1"
                      max={maxPhotos}
                      className="form-input"
                      style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: '800', height: '46px' }}
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, Math.min(maxPhotos, Number(e.target.value) || 1)))}
                    />

                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleIncreaseQty}
                      style={{ width: '46px', height: '46px', fontSize: '1.4rem', fontWeight: '800', padding: 0 }}
                      title="Increase Photo Quantity"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* Quick Preset Buttons (Lines of 6) */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {paperType === 'A4' ? (
                      <>
                        <button type="button" className={`btn btn-sm ${quantity === 6 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setQuantity(6)}>
                          6 (1 Line)
                        </button>
                        <button type="button" className={`btn btn-sm ${quantity === 12 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setQuantity(12)}>
                          12 (2 Lines)
                        </button>
                        <button type="button" className={`btn btn-sm ${quantity === 18 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setQuantity(18)}>
                          18 (3 Lines)
                        </button>
                        <button type="button" className={`btn btn-sm ${quantity === 24 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setQuantity(24)}>
                          24 (4 Lines)
                        </button>
                        <button type="button" className={`btn btn-sm ${quantity === 30 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setQuantity(30)}>
                          30 (5 Lines)
                        </button>
                        <button type="button" className={`btn btn-sm ${quantity === 36 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setQuantity(36)}>
                          36 (6 Lines)
                        </button>
                        <button type="button" className={`btn btn-sm ${quantity === 42 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setQuantity(42)}>
                          42 (7 Lines • Full A4)
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className={`btn btn-sm ${quantity === 3 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setQuantity(3)}>
                          3 (1 Line)
                        </button>
                        <button type="button" className={`btn btn-sm ${quantity === 6 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setQuantity(6)}>
                          6 (2 Lines • 4x6)
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Standard Photo Dimensions</label>
                  <select 
                    className="form-select"
                    value={spec}
                    onChange={e => setSpec(e.target.value)}
                  >
                    <option value="standard_35x45">Standard Indian Passport (35 x 45 mm)</option>
                    <option value="us_visa_2x2">US Visa / 2x2 Inch (51 x 51 mm)</option>
                    <option value="stamp_size">Stamp Size (25 x 30 mm)</option>
                    <option value="id_card_30x40">ID Card / Driving License (30 x 40 mm)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Background Replacement Color</label>
                    <select 
                      className="form-select"
                      value={bgColor}
                      onChange={e => setBgColor(e.target.value)}
                    >
                      <option value="original">Keep Original Background</option>
                      <option value="white">Clean Studio White (Passport / Visa Standard)</option>
                      <option value="sky_blue">Sky Blue (Official SSC / UPSC / NTA / Indian Exam)</option>
                      <option value="exam_blue">Vivid Exam Navy Blue (State Board / Police / Railway)</option>
                      <option value="soft_blue">Soft Light Blue (Formal Certificate Style)</option>
                      <option value="light_grey">Professional Light Grey (Studio Neutral)</option>
                      <option value="crimson">Studio Crimson Red (Uniform / ID Standard)</option>
                      <option value="cream">Warm Cream / Light Yellow (Classic Studio)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Face Zoom ({zoom}x)</label>
                    <input 
                      type="range" 
                      min="0.8" 
                      max="1.6" 
                      step="0.05" 
                      value={zoom}
                      onChange={e => setZoom(Number(e.target.value))}
                      style={{ width: '100%', marginTop: '8px' }}
                    />
                  </div>
                </div>

                {/* ---- PHOTO ENHANCEMENT PANEL ---- */}
                <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: '10px', padding: '16px', marginTop: '14px', marginBottom: '12px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Sparkles size={16} color="#f59e0b" />
                    <span style={{ fontWeight: '800', color: '#f1f5f9', fontSize: '0.88rem' }}>HD Photo Enhancement</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#64748b', fontWeight: '600' }}>2× Upscale + Sharpening</span>
                  </div>

                  {/* Preset Filters */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preset Filter</div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'none',     label: 'Manual',     color: '#64748b' },
                        { id: 'studio',   label: '📸 Studio',  color: '#3b82f6' },
                        { id: 'vivid',    label: '🌈 Vivid',   color: '#8b5cf6' },
                        { id: 'hd_crisp', label: '✨ HD Crisp', color: '#f59e0b' },
                        { id: 'natural',  label: '🌿 Natural', color: '#10b981' },
                        { id: 'warm',     label: '🍂 Warm',    color: '#ea580c' },
                        { id: 'cool',     label: '❄️ Cool',    color: '#0ea5e9' },
                        { id: 'bw_id',    label: '⬛ B&W ID',  color: '#475569' },
                      ].map(f => (
                        <button key={f.id} type="button" onClick={() => setPhotoFilter(f.id)}
                          style={{ padding: '4px 9px', fontSize: '0.7rem', fontWeight: '800', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            background: photoFilter === f.id ? f.color : 'rgba(255,255,255,0.08)',
                            color: photoFilter === f.id ? '#fff' : '#cbd5e1', transition: 'all 0.15s' }}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual Sliders */}
                  {photoFilter === 'none' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      {[
                        { label: 'Brightness', value: brightness, set: setBrightness, min: 60,  max: 160 },
                        { label: 'Contrast',   value: contrast,   set: setContrast,   min: 60,  max: 180 },
                        { label: 'Saturation', value: saturation, set: setSaturation, min: 0,   max: 200 },
                      ].map(ctrl => (
                        <div key={ctrl.label}>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span>{ctrl.label}</span><span style={{ color: '#f1f5f9', fontWeight: '700' }}>{ctrl.value}%</span>
                          </div>
                          <input type="range" min={ctrl.min} max={ctrl.max} value={ctrl.value}
                            onChange={e => ctrl.set(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#f59e0b' }} />
                        </div>
                      ))}
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '3px' }}>Sharpness</div>
                        <select value={sharpness} onChange={e => setSharpness(Number(e.target.value))}
                          style={{ width: '100%', background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', borderRadius: '6px', padding: '5px 8px', fontSize: '0.75rem' }}>
                          <option value={0}>Off (Smooth)</option>
                          <option value={1}>Light Sharpen</option>
                          <option value={2}>Medium Sharpen</option>
                          <option value={3}>Strong Sharpen</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Preview Button + Result */}
                  {passportFile && (
                    <button type="button" onClick={handlePreviewEnhancement}
                      style={{ width: '100%', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '6px', padding: '7px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                      👁 Preview HD Enhancement
                    </button>
                  )}
                  {enhancedPreview && (
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                      <img src={enhancedPreview} alt="Enhanced Preview" style={{ maxHeight: '160px', borderRadius: '6px', border: '2px solid #f59e0b', objectFit: 'contain' }} />
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>↑ Enhanced preview (applied to final sheet)</div>
                    </div>
                  )}
                </div>

                <button 
                  className="btn btn-primary btn-lg w-full"
                  disabled={!passportFile || generating}
                  onClick={handleGeneratePassport}
                  style={{ marginTop: '4px' }}
                >
                  {generating ? (
                    <><RefreshCw size={16} className="animate-spin" /> Generating {quantity} HD Enhanced Photos...</>
                  ) : (
                    <><Sparkles size={16} /> Generate {quantity}x HD Passport Sheet</>
                  )}
                </button>

              </div>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="tool-panel">
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Image size={18} color="var(--accent-emerald)" />
                  <span>Print-Ready Sheet Preview ({quantity} Photos • Easy-Cut Padding)</span>
                </div>
              </div>
              <div className="card-body">
                {!passportResult ? (
                  <div className="preview-box">
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Camera size={48} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                      <p style={{ fontWeight: '600', marginBottom: '4px' }}>No Sheet Generated Yet</p>
                      <p style={{ fontSize: '0.8rem' }}>Upload photo, choose padding, adjust quantity and click Generate.</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="preview-box" style={{ background: '#ffffff', padding: '16px' }}>
                      <img 
                        src={getFullUrl(passportResult.downloadUrlJpg || passportResult.sheetJpgUrl || passportResult.downloadUrl || `/uploads/processed/${passportResult.result?.jpgName}`)} 
                        alt="Passport Sheet Preview" 
                        className="preview-img"
                      />
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button 
                        type="button"
                        onClick={handleDownloadJpg}
                        className="btn btn-primary flex-1"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Download size={14} /> Download JPG (300 DPI)
                      </button>
                      <button 
                        type="button"
                        onClick={handleDownloadPdf}
                        className="btn btn-secondary flex-1"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Download size={14} /> Download Print PDF ({paperType})
                      </button>
                      <button 
                        type="button"
                        className="btn btn-success"
                        onClick={() => {
                          api.createPrintJob({
                            title: `Passport Photos (${quantity}x A4 Easy-Cut Sheet)`,
                            copies: 1,
                            colorMode: 'color',
                            paperSize: paperType,
                            cost: Math.max(20, quantity * 4)
                          });
                          alert(`Queued ${quantity}x Passport Photo Sheet in Shree Online Print Station!`);
                        }}
                      >
                        <Printer size={14} /> Send to Print Queue
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SIGNATURE PROCESSING */}
      {activeSubTab === 'signature' && (
        <div className="tool-workspace">
          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Signature Crop & B&W Threshold</span></div></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Upload Raw Signature Photo / Scan</label>
                  <FileUploadZone 
                    multiple={false}
                    accept="image/*"
                    onFilesSelected={(file) => { setSigFile(file); setSigResult(null); }}
                    title="Upload phone photo of signature on paper"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contrast Boost ({contrastBoost}x)</label>
                  <input 
                    type="range" 
                    min="1.0" 
                    max="3.0" 
                    step="0.1" 
                    value={contrastBoost}
                    onChange={e => setContrastBoost(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="invertSig"
                    checked={invertSig}
                    onChange={e => setInvertSig(e.target.checked)}
                  />
                  <label htmlFor="invertSig" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                    Invert Colors (White ink on black background)
                  </label>
                </div>

                <button 
                  className="btn btn-primary btn-lg w-full"
                  disabled={!sigFile || sigLoading}
                  onClick={handleProcessSignature}
                >
                  {sigLoading ? 'Enhancing Signature...' : 'Clean & Enhance Signature'}
                </button>
              </div>
            </div>
          </div>

          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Processed Clean Signature</span></div></div>
              <div className="card-body">
                {!sigResult ? (
                  <div className="preview-box"><p style={{ color: 'var(--text-muted)' }}>Enhanced signature will appear here.</p></div>
                ) : (
                  <div>
                    <div className="preview-box" style={{ background: '#fff' }}>
                      <img src={getFullUrl(sigResult.downloadUrl)} alt="Clean Signature" className="preview-img" />
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <a href={getFullUrl(sigResult.downloadUrl)} download={sigResult.result.fileName} className="btn btn-primary w-full">
                        <Download size={14} /> Download Clean Signature (PNG)
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. RESIZE & TRANSFORM */}
      {activeSubTab === 'transform' && (
        <div className="tool-workspace">
          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Image Resizer & Format Converter</span></div></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Upload Image to Resize</label>
                  <FileUploadZone 
                    multiple={false}
                    accept="image/*"
                    onFilesSelected={(file) => { setTransFile(file); setTransResult(null); }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Width (px)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 200"
                      value={targetWidth}
                      onChange={e => setTargetWidth(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Height (px)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 230"
                      value={targetHeight}
                      onChange={e => setTargetHeight(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Target Format</label>
                    <select className="form-select" value={targetFormat} onChange={e => setTargetFormat(e.target.value)}>
                      <option value="jpeg">JPG / JPEG</option>
                      <option value="png">PNG (Lossless)</option>
                      <option value="webp">WebP (Optimized)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quality ({targetQuality}%)</label>
                    <input 
                      type="range" 
                      min="30" 
                      max="100" 
                      value={targetQuality}
                      onChange={e => setTargetQuality(Number(e.target.value))}
                      style={{ width: '100%', marginTop: '8px' }}
                    />
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-lg w-full"
                  disabled={!transFile || transLoading}
                  onClick={handleTransformImage}
                >
                  {transLoading ? 'Resizing Image...' : 'Transform & Resize Image'}
                </button>
              </div>
            </div>
          </div>

          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Transformed Image Preview</span></div></div>
              <div className="card-body">
                {!transResult ? (
                  <div className="preview-box"><p style={{ color: 'var(--text-muted)' }}>Transformed result preview.</p></div>
                ) : (
                  <div>
                    <div className="preview-box">
                      <img src={transResult.downloadUrl} alt="Transformed Result" className="preview-img" />
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {transResult.result.width} x {transResult.result.height} px • {Math.round(transResult.result.size / 1024)} KB
                      </span>
                      <a href={transResult.downloadUrl} download={transResult.result.fileName} className="btn btn-primary btn-sm">
                        <Download size={14} /> Download File
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. AI BACKGROUND REMOVER */}
      {activeSubTab === 'bg-remover' && (
        <div className="tool-workspace">
          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>AI Background Remover</span></div></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Upload Image</label>
                  <FileUploadZone 
                    multiple={false}
                    accept="image/*"
                    onFilesSelected={(file) => { setBgFile(file); setBgResult(null); }}
                    title="Upload photo to remove background"
                  />
                </div>
                
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '12px', fontSize: '0.85rem', color: '#1e3a8a', marginBottom: '16px' }}>
                  <strong>Note:</strong> The AI model runs entirely on your device browser. The first time you use it, it will download a small model (~40MB). Subsequent uses will be instant.
                </div>

                <button 
                  className="btn btn-primary btn-lg w-full"
                  disabled={!bgFile || bgLoading}
                  onClick={handleRemoveBg}
                >
                  {bgLoading ? (
                    <><RefreshCw size={16} className="animate-spin" /> Processing AI Background Removal (Please wait)...</>
                  ) : (
                    <><Sparkles size={16} /> Remove Background (Transparent PNG)</>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="tool-panel">
            <div className="card">
              <div className="card-header"><div className="card-title"><span>Result (Transparent PNG)</span></div></div>
              <div className="card-body">
                {!bgResult ? (
                  <div className="preview-box"><p style={{ color: 'var(--text-muted)' }}>Transparent PNG result will appear here.</p></div>
                ) : (
                  <div>
                    <div className="preview-box" style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h10v10H0zm10 10h10v10H10z\' fill=\'%23e5e7eb\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}>
                      <img src={bgResult.downloadUrl} alt="Background Removed" className="preview-img" />
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <a href={bgResult.downloadUrl} download={bgResult.result.fileName} className="btn btn-primary w-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                        <Download size={14} /> Download Transparent PNG
                      </a>
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
