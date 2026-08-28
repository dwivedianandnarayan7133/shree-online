import React, { useState } from 'react';
import { Layers, Lock, Mail, User, ShieldCheck, ArrowRight, MapPin, Phone, Sparkles, CheckCircle2, RotateCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Login = () => {
  const { login, loginWithDemo } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Standard Password Login / Register
  const handleSubmit = async (e) => {
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
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'radial-gradient(circle at top right, rgba(37,99,235,0.15), transparent 50%), radial-gradient(circle at bottom left, rgba(16,185,129,0.12), transparent 50%), var(--bg-main)'
    }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '8px' }}>
        <div style={{ textAlign: 'center', padding: '24px 16px 14px 16px' }}>
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
            onClick={() => { setIsRegister(false); setError(''); setSuccessMsg(''); }}
          >
            <Lock size={14} /> Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm ${isRegister ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={() => { setIsRegister(true); setError(''); setSuccessMsg(''); }}
          >
            <User size={14} /> Register New
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

          {/* Clean Login / Register Form */}
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
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
                <label className="form-label">Mobile Number</label>
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
              {loading ? (
                <><RotateCw size={16} className="animate-spin" /> Processing...</>
              ) : isRegister ? (
                'Create Account & Enter'
              ) : (
                'Sign In to Shree Online'
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Logins */}
          <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '8px' }}>
              ⚡ 1-Click Fast Logins
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => loginWithDemo('admin')}
              >
                🛡️ Admin MD (Kamal)
              </button>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => loginWithDemo('owner')}
              >
                👑 Owner (Krishan)
              </button>
            </div>
            <button 
              type="button"
              className="btn btn-outline btn-sm w-full"
              style={{ marginTop: '6px' }}
              onClick={() => loginWithDemo('operator')}
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
