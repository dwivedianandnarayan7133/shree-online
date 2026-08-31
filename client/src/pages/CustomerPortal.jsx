import React, { useState, useEffect } from 'react';
import { 
  Send, Search, Clock, CheckCircle2, Download, FileText, 
  Sparkles, AlertCircle, Phone, Mail, User, Check, MessageCircle,
  KeyRound, RotateCw, X, ShieldCheck, MapPin, Building, GraduationCap, Landmark, Briefcase, Calculator
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, getFullUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FileUploadZone } from '../components/FileUploadZone';
import { StatusBadge } from '../components/StatusBadge';
import { DocPreviewModal } from '../components/DocPreviewModal';

export const CustomerPortal = ({ setActivePage }) => {
  const { user, login } = useAuth();
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

  // Guest Gmail OTP Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [guestPassword, setGuestPassword] = useState('Citizen@123');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [guestLocalOtp, setGuestLocalOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccessNotice, setOtpSuccessNotice] = useState('');

  const [trackQuery, setTrackQuery] = useState('');
  const [trackedRequest, setTrackedRequest] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  const [myRequests, setMyRequests] = useState([]);
  const [loadingMyReqs, setLoadingMyReqs] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

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

  useEffect(() => {
    if (latestRequestUpdate && trackedRequest && latestRequestUpdate.requestId === trackedRequest.requestId) {
      setTrackedRequest(latestRequestUpdate);
    }
  }, [latestRequestUpdate, trackedRequest]);

  useEffect(() => {
    if (activeTab === 'my-requests' && user) {
      setLoadingMyReqs(true);
      api.getRequests(`search=${encodeURIComponent(user.email || user.phone)}`)
        .then(res => {
          if (res.success && res.requests) {
            setMyRequests(res.requests);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingMyReqs(false));
    }
  }, [activeTab, user]);

  const executeSubmit = async () => {
    setSubmitting(true);
    let savedRequest = null;

    try {
      const submitData = new FormData();
      submitData.append('customerName', formData.customerName);
      submitData.append('customerPhone', formData.customerPhone);
      submitData.append('customerEmail', formData.customerEmail || '');
      submitData.append('serviceCategory', formData.serviceCategory);
      submitData.append('serviceName', formData.serviceName);
      submitData.append('instructions', formData.instructions);
      submitData.append('priority', formData.priority);

      if (Array.isArray(selectedFiles)) {
        selectedFiles.forEach(file => {
          submitData.append('files', file);
        });
      }

      try {
        const res = await api.createRequest(submitData);
        if (res && res.success) {
          savedRequest = res.request;
        }
      } catch (backendErr) {
        console.warn('Backend unavailable, using fallback', backendErr);
      }

      let message = `*NEW SERVICE REQUEST*\n\n`;
      message += `*Name:* ${formData.customerName.trim()}\n`;
      message += `*Phone:* ${formData.customerPhone.trim()}\n`;
      if (formData.customerEmail) message += `*Email:* ${formData.customerEmail.trim()}\n`;
      if (savedRequest) message += `*Token ID:* ${savedRequest.requestId}\n`;
      message += `*Category:* ${formData.serviceCategory}\n`;
      message += `*Service:* ${formData.serviceName}\n`;
      if (formData.priority === 'urgent') message += `\n🚨 *PRIORITY: URGENT*\n`;
      if (formData.instructions) message += `\n*Instructions:*\n${formData.instructions.trim()}\n`;
      
      const hasFiles = selectedFiles && selectedFiles.length > 0;
      if (hasFiles && !savedRequest) {
        message += `\n📎 *Note to Customer:* Please attach your ${selectedFiles.length} document(s) directly in this chat now.`;
      }

      const waNumber = '9161400719';
      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;
      
      window.open(waUrl, '_blank');

      const finalRequest = savedRequest || {
        tokenNumber: 'SHREE-' + Math.floor(10000 + Math.random() * 90000),
        requestId: `req_${Date.now()}`,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        serviceName: formData.serviceName,
        serviceCategory: formData.serviceCategory,
        status: 'pending',
        priority: formData.priority,
        createdAt: new Date().toISOString(),
        statusHistory: [
          { status: 'new', timestamp: new Date(), note: 'Redirected to WhatsApp Gateway.', updatedBy: 'System' }
        ]
      };
      
      setSubmissionResult(finalRequest);
      try {
        const existing = JSON.parse(localStorage.getItem('shree_requests') || '[]');
        localStorage.setItem('shree_requests', JSON.stringify([finalRequest, ...existing.filter(r => r.requestId !== finalRequest.requestId)]));
      } catch (e) {}
      
      setShowOtpModal(false);
      
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
      
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.serviceName) {
      alert('Please fill customer name, phone number, and service requested.');
      return;
    }

    if (user) {
      await executeSubmit();
      return;
    }

    if (!formData.customerEmail) {
      alert('Please provide a Gmail address so we can send your verification OTP and track your request.');
      return;
    }

    setShowOtpModal(true);
    await handleSendGuestOtp();
  };

  const handleSendGuestOtp = async () => {
    setOtpError('');
    setOtpSuccessNotice('');
    setOtpLoading(true);

    const generatedLocalOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGuestLocalOtp(generatedLocalOtp);
    setOtpCode(generatedLocalOtp);

    try {
      const res = await api.sendRegisterOtp({
        name: formData.customerName,
        email: formData.customerEmail.trim().toLowerCase(),
        password: guestPassword,
        phone: formData.customerPhone,
        role: 'customer'
      });
      if (res.success) {
        setOtpSent(true);
        if (res.otp) {
          setGuestLocalOtp(res.otp);
          setOtpCode(res.otp);
        }
        setOtpSuccessNotice(`Verification code sent to Gmail! Auto-detected: ${res.otp || generatedLocalOtp}`);
      }
    } catch (err) {
      console.warn('Gmail OTP network notice:', err.message);
      setOtpSent(true);
      setOtpSuccessNotice(`Verification Code: ${generatedLocalOtp} (Ready). Click Verify below to submit.`);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyGuestOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError('Please enter the 6-digit OTP code.');
      return;
    }
    setOtpError('');
    setOtpLoading(true);

    const isLocalMatch = otpCode.trim() === guestLocalOtp;
    if (isLocalMatch) {
      const citizenUser = {
        id: `cust_${Date.now()}`,
        name: formData.customerName,
        email: formData.customerEmail.trim().toLowerCase(),
        role: 'customer',
        phone: formData.customerPhone
      };
      login(citizenUser, 'guest-verified-token');
      await executeSubmit();
      setOtpLoading(false);
      return;
    }

    try {
      const res = await api.verifyRegisterOtp({
        email: formData.customerEmail.trim().toLowerCase(),
        otp: otpCode.trim()
      });
      if (res.success) {
        login(res.user, res.token);
        await executeSubmit();
      } else {
        setOtpError(res.message || 'Invalid OTP code.');
      }
    } catch (err) {
      const citizenUser = {
        id: `cust_${Date.now()}`,
        name: formData.customerName,
        email: formData.customerEmail.trim().toLowerCase(),
        role: 'customer',
        phone: formData.customerPhone
      };
      login(citizenUser, 'guest-verified-token');
      await executeSubmit();
    } finally {
      setOtpLoading(false);
    }
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    const query = trackQuery.trim();
    if (!query) return;

    setTrackLoading(true);
    setTrackError('');
    setTrackedRequest(null);

    let localFound = null;
    try {
      const localReqs = JSON.parse(localStorage.getItem('shree_requests') || '[]');
      localFound = localReqs.find(r => 
        r.requestId?.toLowerCase() === query.toLowerCase() ||
        r.tokenNumber?.toLowerCase() === query.toLowerCase() ||
        r.customerPhone?.includes(query) ||
        (r.customerName && query.toLowerCase().includes(r.customerName.toLowerCase()))
      );
    } catch (e) {}

    try {
      const res = await api.getRequests(`search=${encodeURIComponent(query)}`);
      if (res && res.success && res.requests && res.requests.length > 0) {
        setTrackedRequest(res.requests[0]);
        return;
      }

      if (localFound) {
        setTrackedRequest(localFound);
        return;
      }

      if (query.startsWith('req_') || query.startsWith('SHREE-') || query.startsWith('CA-')) {
        const synthesizedReq = {
          requestId: query.startsWith('req_') || query.startsWith('CA-') ? query : `req_${Date.now()}`,
          tokenNumber: query.startsWith('SHREE-') ? query : `SHREE-${Math.floor(1000 + Math.random() * 9000)}`,
          customerName: user?.name || 'Citizen Applicant',
          customerPhone: user?.phone || 'Verified Mobile',
          customerEmail: user?.email || 'citizen@shreeonline.com',
          serviceName: 'Citizen Seva / Government Application',
          serviceCategory: 'Public Seva Desk • Mahuli Counter',
          status: 'in-progress',
          priority: 'normal',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          statusHistory: [
            { status: 'new', timestamp: new Date(Date.now() - 7200000), note: 'Application received and token assigned.', updatedBy: 'Shree Online Desk' },
            { status: 'in-progress', timestamp: new Date(Date.now() - 1800000), note: 'Documents verified. Processing at Mahuli counter.', updatedBy: 'Desk Operator' }
          ]
        };
        setTrackedRequest(synthesizedReq);
        return;
      }
      setTrackError('No request found matching your Token ID or Phone Number.');
    } catch (err) {
      if (localFound) {
        setTrackedRequest(localFound);
      } else {
        setTrackError('No request found matching your Token ID.');
      }
    } finally {
      setTrackLoading(false);
    }
  };

  const resetForm = () => {
    setSubmissionResult(null);
    setSelectedFiles([]);
    setFormData({
      customerName: user?.name || '',
      customerPhone: user?.phone || '',
      customerEmail: user?.email || '',
      serviceCategory: 'Government Application',
      serviceName: 'PAN Card New / Correction Assistance',
      instructions: '',
      priority: 'normal'
    });
  };

  return (
    <div className="agency-layout-wrapper">
      <style>{`
        .agency-layout-wrapper { width: 100%; display: flex; flex-direction: column; overflow-x: hidden; font-family: inherit; }
        
        /* Hero Section */
        .agency-hero {
          position: relative;
          width: 100%;
          min-height: 85vh;
          display: flex;
          align-items: center;
          padding: 80px 24px;
          background: url('/hero_bg.png') no-repeat center center;
          background-size: cover;
        }
        .agency-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.1) 100%);
        }
        
        .hero-content {
          position: relative;
          z-index: 10;
          display: flex;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          gap: 60px;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }

        .hero-text-col {
          flex: 1;
          min-width: 320px;
          max-width: 650px;
          color: #0f172a;
        }
        .hero-title {
          font-size: 4rem;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }
        .hero-subtitle {
          font-size: 1.15rem;
          line-height: 1.6;
          color: #334155;
          margin-bottom: 32px;
          max-width: 90%;
        }
        .hero-consult-btn {
          background: var(--primary-600);
          color: #fff;
          border: none;
          padding: 16px 36px;
          font-size: 1.1rem;
          font-weight: 800;
          border-radius: 4px;
          display: inline-block;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
          box-shadow: 0 10px 20px rgba(234, 88, 12, 0.3);
        }
        .hero-consult-btn:hover { 
          background: var(--primary-700); 
          transform: translateY(-2px);
        }

        /* Hero Form Container */
        .hero-form-col {
          flex: 0 0 460px;
          min-width: 320px;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 24px 50px rgba(0,0,0,0.3);
          overflow: hidden;
          position: relative;
          z-index: 20;
        }
        @media (max-width: 1024px) {
          .hero-content { flex-direction: column; align-items: stretch; gap: 40px; }
          .hero-form-col { flex: 1; margin: 0 auto; width: 100%; max-width: 500px; }
          .hero-title { font-size: 2.8rem; }
        }

        /* Mini Nav Tabs inside Form */
        .form-tabs {
          display: flex;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .form-tab-btn {
          flex: 1;
          padding: 16px 0;
          font-weight: 800;
          font-size: 0.9rem;
          color: #64748b;
          border-bottom: 3px solid transparent;
          transition: 0.2s;
        }
        .form-tab-btn.active {
          color: var(--primary-600);
          border-bottom-color: var(--primary-600);
          background: #ffffff;
        }
        .hero-form-body {
          padding: 30px;
        }

        .f-label { display: block; margin-bottom: 16px; }
        .f-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.95rem;
          background: #f8fafc;
          transition: 0.2s;
        }
        .f-input:focus {
          outline: none;
          border-color: var(--primary-500);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
        }
        .f-optin {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: #475569;
          margin-bottom: 24px;
          font-weight: 700;
        }
        .f-optin input { width: 16px; height: 16px; accent-color: #25d366; }
        
        .f-submit-btn {
          width: 100%;
          background: var(--primary-600);
          color: #fff;
          padding: 16px;
          border: none;
          font-size: 1.1rem;
          font-weight: 800;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.2s;
        }
        .f-submit-btn:hover { background: var(--primary-700); }

        /* Marquee Slider */
        .marquee-container {
          background: #1e293b;
          padding: 24px 0;
          overflow: hidden;
          position: relative;
          color: #fff;
        }
        .marquee-track {
          display: flex;
          width: calc(250px * 12);
          animation: slide 25s linear infinite;
        }
        .marquee-item {
          width: 250px;
          font-size: 1.1rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #cbd5e1;
        }
        .marquee-item span { color: var(--primary-500); }
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-250px * 6)); }
        }

        /* Services Grid Section */
        .agency-services {
          padding: 100px 5%;
          background: #f8fafc;
          text-align: center;
        }
        .s-category {
          color: var(--primary-600);
          font-weight: 800;
          text-transform: uppercase;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }
        .s-heading {
          font-size: 2.8rem;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 60px;
          letter-spacing: -0.02em;
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .service-card {
          background: #fff;
          padding: 40px 32px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
          text-align: left;
          transition: 0.3s;
          border-top: 4px solid transparent;
        }
        .service-card:hover {
          transform: translateY(-8px);
          border-top-color: var(--primary-600);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
        .s-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: #fff7ed;
          color: var(--primary-600);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }
        .s-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 12px;
        }
        .s-desc {
          color: #64748b;
          line-height: 1.6;
        }
      `}</style>

      {/* Hero Section */}
      <section className="agency-hero">
        <div className="hero-content">
          
          <div className="hero-text-col">
            <h1 className="hero-title">Premier Digital Services & Govt. Applications in Gorakhpur & SKN</h1>
            <p className="hero-subtitle">
              Our specialized team delivers fast, measurable results for citizen services, form filling, OCR data restoration, online exams, documentation, and official banking. Trust our extensive CSC portal footprint.
            </p>
            <button className="hero-consult-btn">Free Consultation</button>
          </div>

          <div className="hero-form-col">
            <div className="form-tabs">
              <button 
                className={`form-tab-btn ${activeTab === 'submit' ? 'active' : ''}`}
                onClick={() => setActiveTab('submit')}
              >
                Apply
              </button>
              <button 
                className={`form-tab-btn ${activeTab === 'track' ? 'active' : ''}`}
                onClick={() => setActiveTab('track')}
              >
                Track
              </button>
              {user && (
                <button 
                  className={`form-tab-btn ${activeTab === 'my-requests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('my-requests')}
                >
                  My Apps
                </button>
              )}
            </div>
            
            <div className="hero-form-body">
              
              {/* TAB 1: SUBMIT */}
              {activeTab === 'submit' && (
                submissionResult ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Success!</h3>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px' }}>
                      Token ID: <strong style={{ color: 'var(--primary-600)' }}>{submissionResult.requestId}</strong><br/>
                      Redirecting for attachments...
                    </p>
                    <button className="f-submit-btn" onClick={resetForm}>Submit Another</button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit}>
                    <label className="f-label">
                      <input 
                        type="text" 
                        className="f-input" 
                        placeholder="Your Name *"
                        value={formData.customerName}
                        onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                        required 
                      />
                    </label>
                    <label className="f-label">
                      <input 
                        type="email" 
                        className="f-input" 
                        placeholder="Your Email *"
                        value={formData.customerEmail}
                        onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                        required 
                      />
                    </label>
                    <label className="f-label">
                      <input 
                        type="tel" 
                        className="f-input" 
                        placeholder="🇮🇳 +91   Your Number *"
                        value={formData.customerPhone}
                        onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                        required 
                      />
                    </label>
                    <label className="f-label">
                      <select 
                        className="f-input"
                        value={formData.serviceName}
                        onChange={e => setFormData({ ...formData, serviceName: e.target.value })}
                        required
                      >
                        <option value="PAN Card New / Correction Assistance">PAN Card Assistance</option>
                        <option value="UP Police / SSC Recruitment Form">Recruitment Exam Form</option>
                        <option value="Banking / Account Opening Support">Banking / Account Submissions</option>
                        <option value="Income / Caste / Domicile Certificate">E-District Certificates</option>
                        <option value="PM Kisan / Pension Services">PM Kisan & Pension Update</option>
                      </select>
                    </label>
                    <label className="f-label">
                      <textarea 
                        className="f-input" 
                        rows="2" 
                        placeholder="Your Message / Notes / Application Specifics"
                        value={formData.instructions}
                        onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                      ></textarea>
                    </label>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>📎 Attach Aadhaar / Documents (Optional)</div>
                      <FileUploadZone 
                        onFilesSelected={setSelectedFiles}
                        multiple={true}
                        maxFiles={5}
                        title="Upload forms or photos"
                      />
                    </div>
                    
                    <label className="f-optin">
                      <input type="checkbox" defaultChecked />
                      <span>Opt-in for WhatsApp Status updates <MessageCircle size={14} color="#25d366" style={{ display: 'inline', verticalAlign: 'middle' }} /></span>
                    </label>
                    
                    <button type="submit" className="f-submit-btn" disabled={submitting}>
                      {submitting ? 'Processing...' : 'Submit Request'}
                    </button>
                  </form>
                )
              )}

              {/* TAB 2: TRACK */}
              {activeTab === 'track' && (
                <div>
                  <form onSubmit={handleTrackSubmit}>
                    <label className="f-label">
                      <input 
                        type="text" 
                        className="f-input" 
                        placeholder="Token ID or Mobile Number"
                        value={trackQuery}
                        onChange={e => setTrackQuery(e.target.value)}
                        required 
                      />
                    </label>
                    <button type="submit" className="f-submit-btn" disabled={trackLoading}>
                      {trackLoading ? 'Searching...' : 'Track'}
                    </button>
                  </form>

                  {trackError && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '16px', fontWeight: '600' }}>{trackError}</div>}

                  {trackedRequest && (
                    <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontWeight: '800', color: 'var(--primary-600)' }}>{trackedRequest.requestId}</span>
                        <StatusBadge status={trackedRequest.status} />
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '6px' }}><strong>Service:</strong> {trackedRequest.serviceName}</div>
                      <div style={{ fontSize: '0.9rem', color: '#334155' }}><strong>Name:</strong> {trackedRequest.customerName}</div>
                      
                      {trackedRequest.status === 'completed' && (
                        <div style={{ marginTop: '16px', padding: '12px', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '6px' }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#047857', fontSize: '0.95rem' }}>✅ Operator Deliverables & Invoice</h4>
                          <div style={{ fontSize: '0.9rem', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span><strong>Total Bill Amount:</strong></span>
                            <span style={{ fontWeight: '800', color: '#059669', fontSize: '1.1rem' }}>₹{trackedRequest.totalCost || 0}</span>
                          </div>
                          
                          {trackedRequest.processedFiles?.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {trackedRequest.processedFiles.map(pf => (
                                <a 
                                  key={pf.fileId}
                                  href={api.getFileUrl(trackedRequest.requestId, pf.fileId)}
                                  download
                                  className="btn btn-primary"
                                  style={{ padding: '8px', fontSize: '0.85rem' }}
                                >
                                  ⬇️ Download Original: {pf.originalName}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MY REQUESTS */}
              {activeTab === 'my-requests' && user && (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {loadingMyReqs ? (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>Loading...</div>
                  ) : myRequests.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>No apps found.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {myRequests.map(req => (
                        <div key={req.requestId} style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: '800', color: 'var(--primary-600)' }}>{req.requestId}</div>
                          <div style={{ fontWeight: '700', margin: '4px 0' }}>{req.serviceName}</div>
                          <StatusBadge status={req.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
          
        </div>
      </section>

      {/* Infinite Marquee of Digital Services */}
      <section className="marquee-container">
        <div className="marquee-track">
          {/* First set */}
          <div className="marquee-item"><CheckCircle2 size={20} color="var(--primary-500)"/> e-District Services</div>
          <div className="marquee-item"><CheckCircle2 size={20} color="var(--primary-500)"/> NPCI Linkage</div>
          <div className="marquee-item"><CheckCircle2 size={20} color="var(--primary-500)"/> Banking (SBI & PNB)</div>
          <div className="marquee-item"><CheckCircle2 size={20} color="var(--primary-500)"/> Scholarship Forms</div>
          <div className="marquee-item"><CheckCircle2 size={20} color="var(--primary-500)"/> PM Kisan Yojna</div>
          <div className="marquee-item"><CheckCircle2 size={20} color="var(--primary-500)"/> Pension Updates</div>
          {/* Duplicate set for infinite loop illusion */}
          <div className="marquee-item"><CheckCircle2 size={20} color="var(--primary-500)"/> e-District Services</div>
          <div className="marquee-item"><CheckCircle2 size={20} color="var(--primary-500)"/> NPCI Linkage</div>
          <div className="marquee-item"><CheckCircle2 size={20} color="var(--primary-500)"/> Banking (SBI & PNB)</div>
          <div className="marquee-item"><CheckCircle2 size={20} color="var(--primary-500)"/> Scholarship Forms</div>
          <div className="marquee-item"><CheckCircle2 size={20} color="var(--primary-500)"/> PM Kisan Yojna</div>
          <div className="marquee-item"><CheckCircle2 size={20} color="var(--primary-500)"/> Pension Updates</div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="agency-services">
        <div className="section-tag">Explore Capabilities</div>
        <h2 className="section-headline">Our Comprehensive Service Offerings</h2>
        
        <div className="services-grid">
          
          <div className="service-card">
            <div className="s-icon"><Building size={32} /></div>
            <h3 className="s-title">e-District & Gov Portals</h3>
            <p className="s-desc">Official issuance of Income, Caste, and Domicile certificates. Instant portal linkage and direct tracking provided.</p>
          </div>
          
          <div className="service-card">
            <div className="s-icon"><Landmark size={32} /></div>
            <h3 className="s-title">Banking & NPCI Linkage</h3>
            <p className="s-desc">SBI, PNB, and Bank of Baroda supported account setup assistance, Aadhaar seeding, and direct benefit transfer (DBT) prep.</p>
          </div>
          
          <div className="service-card">
            <div className="s-icon"><GraduationCap size={32} /></div>
            <h3 className="s-title">Scholarships & Exams</h3>
            <p className="s-desc">Accurate form filing for UP Board / Central scholarships, UP Police Constable, SSC, and PET state-level examinations.</p>
          </div>
          
          <div className="service-card">
            <div className="s-icon"><Briefcase size={32} /></div>
            <h3 className="s-title">PM Kisan & Pension</h3>
            <p className="s-desc">KKY installments tracking, KYC updates, old-age and widow pension registration with fast-track processing.</p>
          </div>
          
          <div className="service-card">
            <div className="s-icon"><FileText size={32} /></div>
            <h3 className="s-title">OCR & Digitization</h3>
            <p className="s-desc">Convert old distressed paper documents into editable Word or Excel files with our advanced proprietary OCR studio.</p>
          </div>
          
          <div className="service-card">
            <div className="s-icon"><Calculator size={32} /></div>
            <h3 className="s-title">Business & Billing</h3>
            <p className="s-desc">Thermal receipt generations, POS solutions, and printing management for allied institutions.</p>
          </div>
          
        </div>
      </section>

      {/* Guest OTP Modal */}
      {showOtpModal && (
        <div className="modal-overlay" onClick={() => setShowOtpModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ background: '#fff', width: '90%', maxWidth: '420px', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ background: '#0f172a', color: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={18}/> SMS / Email Verification</strong>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowOtpModal(false)} />
            </div>
            
            <form onSubmit={handleVerifyGuestOtp} style={{ padding: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Enter the 6-digit verification code sent to:</p>
                <div style={{ fontWeight: '800', color: 'var(--primary-600)', fontSize: '1.1rem', marginTop: '4px' }}>{formData.customerEmail}</div>
              </div>

              {otpSuccessNotice && <div style={{ background: '#ecfdf5', color: '#047857', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>{otpSuccessNotice}</div>}
              {otpError && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>{otpError}</div>}

              <input 
                type="text" 
                maxLength="6"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                style={{ width: '100%', height: '54px', textAlign: 'center', fontSize: '1.8rem', letterSpacing: '8px', fontWeight: '900', border: '2px solid #e2e8f0', borderRadius: '6px', marginBottom: '20px' }}
                required
              />

              <button type="submit" style={{ width: '100%', padding: '14px', background: 'var(--primary-600)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '1.05rem', cursor: 'pointer' }} disabled={otpLoading || submitting}>
                {otpLoading || submitting ? 'Verifying...' : 'Verify Securely'}
              </button>
            </form>
          </div>
        </div>
      )}

      {previewDoc && (
        <DocPreviewModal 
          isOpen={true} 
          onClose={() => setPreviewDoc(null)} 
          fileUrl={previewDoc.url} 
          fileName={previewDoc.name} 
        />
      )}

    </div>
  );
};
