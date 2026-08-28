import React, { useState } from 'react';
import { Layers, Lock, Mail, User, ShieldCheck, ArrowLeft, MapPin, Phone, Sparkles, CheckCircle2, RotateCw, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Login = ({ setActivePage }) => {
  const { login, loginWithDemo } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Registration OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Standard Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      if (res.success) {
        login(res.user, res.token);
        if (setActivePage) {
          setActivePage((res.user?.role === 'admin' || res.user?.role === 'operator') ? 'dashboard' : 'customer-portal');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send Registration OTP to Gmail
  const handleSendRegisterOtp = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in Name, Gmail Address, and Password.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setOtpLoading(true);

    try {
      const res = await api.sendRegisterOtp({
        name,
        email,
        password,
        phone,
        role: 'customer'
      });

      if (res.success) {
        setOtpSent(true);
        setSuccessMsg(res.message || `A 6-digit OTP has been sent to ${email}. Please check your Gmail.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP to Gmail. Please check your email address.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Verify Registration OTP & Complete Account Creation
  const handleVerifyRegisterOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit OTP sent to your Gmail.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.verifyRegisterOtp({
        email,
        otp: otpCode.trim()
      });

      if (res.success) {
        login(res.user, res.token);
        if (setActivePage) {
          setActivePage('customer-portal');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP code. Please check your Gmail.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role) => {
    await loginWithDemo(role);
    if (setActivePage) {
      setActivePage((role === 'admin' || role === 'operator') ? 'dashboard' : 'customer-portal');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'radial-gradient(circle at top right, rgba(37,99,235,0.15), transparent 50%), radial-gradient(circle at bottom left, rgba(16,185,129,0.12), transparent 50%), var(--bg-main)'
    }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '8px' }}>
        
        {/* Back to Public Portal Button */}
        {setActivePage && (
          <div style={{ padding: '8px 12px 0 12px' }}>
            <button
              type="button"
              onClick={() => setActivePage('customer-portal')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
            >
              <ArrowLeft size={13} />
              <span>Back to Public Services</span>
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', padding: '16px 16px 14px 16px' }}>
          <div className="brand-icon-wrapper" style={{ margin: '0 auto 12px auto', width: '52px', height: '52px' }}>
            ⚡
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Shree Online
          </h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '800', margin: '4px 0 6px 0' }}>
            <MapPin size={12} /> Mahuli, S.K.N • Est. 2013
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            One Window. Every Digital Service.
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Register */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '0 16px 14px 16px' }}>
          <button
            type="button"
            className={`btn btn-sm ${!isRegister ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={() => { setIsRegister(false); setOtpSent(false); setError(''); setSuccessMsg(''); }}
          >
            <Lock size={14} /> Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm ${isRegister ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={() => { setIsRegister(true); setOtpSent(false); setError(''); setSuccessMsg(''); }}
          >
            <User size={14} /> Register with Gmail OTP
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

          {/* 1. SIGN IN FORM */}
          {!isRegister ? (
            <form onSubmit={handleSignIn}>
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
                {loading ? <><RotateCw size={16} className="animate-spin" /> Signing in...</> : 'Sign In to Shree Online'}
              </button>
            </form>
          ) : (
            /* 2. REGISTRATION WITH GMAIL OTP */
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendRegisterOtp}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. Ramesh Chandra"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gmail Address (For OTP Verification)</label>
                    <input 
                      type="email"
                      className="form-input"
                      placeholder="citizen@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      🔒 A 6-digit OTP will be dispatched to this Gmail address for verification.
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input 
                      type="tel"
                      className="form-input"
                      placeholder="+91 91614 00719"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Create Login Password</label>
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
                    disabled={otpLoading}
                    style={{ marginTop: '8px' }}
                  >
                    {otpLoading ? (
                      <><RotateCw size={16} className="animate-spin" /> Sending OTP to Gmail...</>
                    ) : (
                      <><Mail size={16} /> Send 6-Digit OTP to Gmail</>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyRegisterOtp}>
                  <div style={{ background: 'var(--bg-surface-alt)', padding: '14px', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verification OTP dispatched to:</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary-400)', marginTop: '2px' }}>{email}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                      Please check your Gmail inbox and spam folder for the 6-digit code.
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Enter 6-Digit OTP</label>
                    <input 
                      type="text"
                      maxLength="6"
                      className="form-input"
                      style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '6px', fontWeight: '900', height: '52px' }}
                      placeholder="••••••"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-full"
                    disabled={loading}
                  >
                    {loading ? 'Activating Account...' : 'Verify OTP & Complete Registration'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <button 
                      type="button"
                      onClick={() => { setOtpSent(false); setOtpCode(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      ← Change Details
                    </button>
                    <button 
                      type="button"
                      onClick={handleSendRegisterOtp}
                      disabled={otpLoading}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-400)', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Quick 1-Click Staff Demo Logins */}
          <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '8px' }}>
              ⚡ Staff Quick Logins
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleDemoClick('admin')}
              >
                🛡️ Admin MD (Kamal)
              </button>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleDemoClick('owner')}
              >
                👑 Owner (Krishan)
              </button>
            </div>
            <button 
              type="button"
              className="btn btn-outline btn-sm w-full"
              style={{ marginTop: '6px' }}
              onClick={() => handleDemoClick('operator')}
            >
              🖥️ Operator Desk Demo
            </button>
          </div>

          {/* Center Info Footer */}
          <div style={{
            marginTop: '16px', padding: '10px 12px',
            background: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '0.75rem'
          }}>
            <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>
              Shree Online Sewa Kendra • Mahuli Market
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '2px' }}>
              Helpline: 8090794210 (MD) • 9161400719 (Owner)
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
