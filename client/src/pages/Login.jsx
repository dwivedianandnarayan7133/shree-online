import React, { useState } from 'react';
import { Layers, Lock, Mail, User, ShieldCheck, ArrowRight, MapPin, MessageCircle, Phone, Sparkles, CheckCircle2, RotateCw, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Login = () => {
  const { login, loginWithDemo } = useAuth();
  const [authMethod, setAuthMethod] = useState('whatsapp'); // 'whatsapp' (default) or 'password'
  const [isRegister, setIsRegister] = useState(false);

  // Password Login state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // OTP state (Gmail + WhatsApp)
  const [waPhone, setWaPhone] = useState('');
  const [waEmail, setWaEmail] = useState('');
  const [waName, setWaName] = useState('');
  const [waOtp, setWaOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [ownerLink1, setOwnerLink1] = useState('');
  const [ownerLink2, setOwnerLink2] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Standard Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({ name, email, password, phone, role: 'customer' });
        if (res.success) {
          login(res.user, res.token);
        }
      } else {
        const res = await api.login({ email, password });
        if (res.success) {
          login(res.user, res.token);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // 1. Send OTP via Google Gmail & Forwarded by Owner WhatsApp
  const handleSendWhatsAppOtp = async (e) => {
    if (e) e.preventDefault();
    if (!waPhone && !waEmail) {
      setError('Please enter a valid mobile number or Gmail address.');
      return;
    }

    setError('');
    setOtpLoading(true);
    try {
      const res = await api.sendWhatsAppOtp({
        phone: waPhone,
        email: waEmail,
        name: waName,
        type: isRegister ? 'register' : 'login'
      });

      if (res.success) {
        setOtpSent(true);
        setOwnerLink1(res.waOwnerLink1 || 'https://wa.me/919161400719');
        setOwnerLink2(res.waOwnerLink2 || 'https://wa.me/918090794210');
        setSuccessMsg(res.message || `OTP dispatched via Gmail and forwarded by Owner WhatsApp.`);
        
        // Open owner WhatsApp in new tab for instant delivery if requested
        if (res.waOwnerLink1 && waPhone) {
          window.open(res.waOwnerLink1, '_blank');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to request OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyWhatsAppOtp = async (e) => {
    e.preventDefault();
    if (!waOtp || waOtp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code received on Gmail / WhatsApp.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.verifyWhatsAppOtp({
        phone: waPhone,
        email: waEmail,
        otp: waOtp.trim(),
        name: waName,
        role: 'customer'
      });

      if (res.success) {
        login(res.user, res.token);
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP code. Please check your Gmail / WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'radial-gradient(circle at top right, rgba(37,99,235,0.15), transparent 50%), radial-gradient(circle at bottom left, rgba(6,182,212,0.12), transparent 50%), var(--bg-main)'
    }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '8px' }}>
        <div style={{ textAlign: 'center', padding: '20px 16px 10px 16px' }}>
          <div className="brand-icon-wrapper" style={{ margin: '0 auto 12px auto', width: '52px', height: '52px' }}>
            <Layers size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Shree Online
          </h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-400)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '800', margin: '4px 0 6px 0' }}>
            <MapPin size={12} /> Mahuli, S.K.N • Est. 2013
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            One Window. Every Digital Service.
          </p>
        </div>

        {/* Auth Method Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '0 16px 12px 16px' }}>
          <button
            type="button"
            className={`btn btn-sm ${authMethod === 'whatsapp' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={() => { setAuthMethod('whatsapp'); setError(''); setSuccessMsg(''); }}
          >
            <MessageCircle size={15} /> WhatsApp & Gmail OTP
          </button>
          <button
            type="button"
            className={`btn btn-sm ${authMethod === 'password' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={() => { setAuthMethod('password'); setError(''); setSuccessMsg(''); }}
          >
            <Lock size={15} /> Password Login
          </button>
        </div>

        <div className="card-body" style={{ paddingTop: 0 }}>
          {error && (
            <div style={{
              background: 'var(--status-canc-bg)', color: 'var(--status-canc-text)',
              border: '1px solid var(--status-canc-border)', padding: '10px 14px',
              borderRadius: 'var(--radius-md)', fontSize: '0.82rem', marginBottom: '14px'
            }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(37, 211, 102, 0.12)', color: '#25d366',
              border: '1px solid rgba(37, 211, 102, 0.3)', padding: '10px 14px',
              borderRadius: 'var(--radius-md)', fontSize: '0.82rem', marginBottom: '14px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. WHATSAPP & GMAIL OTP LOGIN / REGISTER */}
          {authMethod === 'whatsapp' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendWhatsAppOtp}>
                  {isRegister && (
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text"
                        className="form-input"
                        placeholder="Enter full name"
                        value={waName}
                        onChange={e => setWaName(e.target.value)}
                        required={isRegister}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">WhatsApp Mobile Number</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{
                        padding: '10px 14px', background: 'var(--bg-surface-alt)',
                        border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                        fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)'
                      }}>
                        +91
                      </div>
                      <input 
                        type="tel"
                        className="form-input"
                        placeholder="91614 00719"
                        maxLength="10"
                        value={waPhone}
                        onChange={e => setWaPhone(e.target.value)}
                        style={{ flex: 1, letterSpacing: '1px', fontWeight: '700' }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Or Gmail Address (For Email OTP)</label>
                    <input 
                      type="email"
                      className="form-input"
                      placeholder="customer@gmail.com"
                      value={waEmail}
                      onChange={e => setWaEmail(e.target.value)}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      🔒 OTP sent via Gmail & forwarded by Owner (+91 9161400719 / +91 8090794210)
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="btn btn-primary btn-lg w-full"
                    disabled={otpLoading}
                    style={{ background: '#25d366', borderColor: '#25d366', color: '#ffffff', fontWeight: '800', marginTop: '6px' }}
                  >
                    {otpLoading ? (
                      <><RotateCw size={16} className="animate-spin" /> Dispatching via Gmail & WhatsApp...</>
                    ) : (
                      <><MessageCircle size={18} /> Request OTP via Gmail & WhatsApp</>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyWhatsAppOtp}>
                  <div style={{ background: 'var(--bg-surface-alt)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>OTP dispatched via Gmail / Owner WhatsApp for</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#25d366', marginTop: '2px' }}>
                      {waPhone ? `+91 ${waPhone.slice(-10)}` : waEmail}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      Please check your Gmail inbox / WhatsApp chat to enter the 6-digit code.
                    </div>
                  </div>

                  {/* Direct Link to Owner & Admin WhatsApp */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <a
                      href={ownerLink1}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-secondary flex-1"
                      style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <MessageCircle size={12} color="#25d366" />
                      <span>Owner (9161400719)</span>
                      <ExternalLink size={10} />
                    </a>
                    <a
                      href={ownerLink2}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-secondary flex-1"
                      style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <MessageCircle size={12} color="#25d366" />
                      <span>Admin (8090794210)</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Enter 6-Digit Verification OTP</label>
                    <input 
                      type="text"
                      maxLength="6"
                      className="form-input"
                      style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '6px', fontWeight: '900', height: '52px' }}
                      placeholder="••••••"
                      value={waOtp}
                      onChange={e => setWaOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="btn btn-primary btn-lg w-full"
                    disabled={loading}
                    style={{ background: '#25d366', borderColor: '#25d366', color: '#ffffff', fontWeight: '800' }}
                  >
                    {loading ? 'Verifying...' : 'Verify OTP & Enter Portal'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <button 
                      type="button"
                      onClick={() => { setOtpSent(false); setWaOtp(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      ← Change Identifier
                    </button>

                    <button 
                      type="button"
                      onClick={handleSendWhatsAppOtp}
                      disabled={otpLoading}
                      style={{ background: 'none', border: 'none', color: '#25d366', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 2. STANDARD PASSWORD LOGIN */}
          {authMethod === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
              {isRegister && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Enter full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email"
                  className="form-input"
                  placeholder="kdshree778@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              {isRegister && (
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel"
                    className="form-input"
                    placeholder="+91 91614 00719"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-full"
                disabled={loading}
                style={{ marginTop: '8px' }}
              >
                {loading ? 'Please wait...' : isRegister ? 'Create Customer Account (with Google Welcome Mail)' : 'Sign In to Shree Online'}
              </button>
            </form>
          )}

          {/* Quick 1-Click Demo Logins */}
          <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '8px' }}>
              ⚡ 1-Click Demo Accounts
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => loginWithDemo('admin')}
              >
                👔 Admin (Kamal Narayan)
              </button>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => loginWithDemo('operator')}
              >
                🖥️ Operator Demo
              </button>
            </div>
            <button 
              type="button"
              className="btn btn-outline btn-sm w-full"
              style={{ marginTop: '6px' }}
              onClick={() => loginWithDemo('customer')}
            >
              👤 Customer / Student Demo
            </button>
          </div>

          {/* Official Helplines */}
          <div style={{
            marginTop: '16px', padding: '10px 12px',
            background: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '0.75rem'
          }}>
            <div style={{ fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <MessageCircle size={14} color="#25d366" />
              <span>Owner & Admin Desks (Mahuli, S.K.N):</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '6px', fontWeight: '800', color: '#25d366', fontSize: '0.72rem' }}>
              <a href="https://wa.me/919161400719" target="_blank" rel="noreferrer" style={{ color: '#25d366', textDecoration: 'none' }}>
                Krishan Narayan: 9161400719
              </a>
              <span style={{ color: 'var(--border-color)' }}>•</span>
              <a href="https://wa.me/918090794210" target="_blank" rel="noreferrer" style={{ color: '#25d366', textDecoration: 'none' }}>
                Kamal Narayan: 8090794210
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
