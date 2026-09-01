import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, X, RefreshCw, KeyRound, 
  RotateCw, UserCheck, Award, Eye, EyeOff 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const generateCaptcha = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const LeadershipModal = ({ isOpen, onClose, setActivePage }) => {
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState('admin'); // 'admin', 'owner', 'operator'
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Security CAPTCHA
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const refreshCaptchaCode = () => {
    setCaptchaCode(generateCaptcha());
    setUserCaptcha('');
    setError('');
  };

  useEffect(() => {
    if (isOpen) {
      refreshCaptchaCode();
      setPassword('');
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, selectedRole]);

  if (!isOpen) return null;

  const roleConfigs = {
    admin: {
      name: 'Kamal Narayan Dwivedi',
      roleTitle: 'Managing Director & Main Controller',
      email: 'kdshree778@gmail.com',
      badge: '🛡️ ADMIN MD',
      color: '#dc2626',
      phone: '+91 8090794210'
    },
    owner: {
      name: 'Krishan Narayan Dwivedi',
      roleTitle: 'Founder & Managing Owner',
      email: 'onlinebaba111111@gmail.com',
      badge: '👑 OWNER',
      color: '#f59e0b',
      phone: '+91 9161400719'
    },
    operator: {
      name: 'Mahuli Desk Operator',
      roleTitle: 'Front Desk Operator (Mahuli Market)',
      email: 'anandnarayan9120@gmail.com',
      badge: '🖥️ OPERATOR',
      color: '#4338ca',
      phone: '+91 8090794210'
    }
  };

  const currentRoleInfo = roleConfigs[selectedRole];

  const handleVerifyAndLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (userCaptcha.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Incorrect CAPTCHA code. Please enter the characters shown in the security box.');
      refreshCaptchaCode();
      return;
    }

    if (!password) {
      setError('Please enter the administrative password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({
        email: currentRoleInfo.email,
        password: password.trim()
      });

      if (res.success) {
        login(res.user, res.token);
        setSuccessMsg(`✅ Authenticated! Welcome, ${res.user.name}.`);
        setTimeout(() => {
          onClose();
          if (setActivePage) setActivePage('dashboard');
        }, 600);
      } else {
        setError(res.message || 'Authentication failed. Please check password.');
        refreshCaptchaCode();
      }
    } catch (err) {
      // Offline / Direct verification fallback for authorized credentials
      const validAdminPass = selectedRole === 'admin' && (password === 'Shiv@241' || password === '8090794210' || password === 'Kamal@2026');
      const validOwnerPass = selectedRole === 'owner' && (password === 'Shiv@241' || password === '9161400719' || password === 'Krishan@2026');
      const validOperatorPass = selectedRole === 'operator' && (password === 'Shiv@241' || password === 'operator');

      if (validAdminPass || validOwnerPass || validOperatorPass) {
        const staffUser = {
          id: `staff-${selectedRole}`,
          name: currentRoleInfo.name,
          email: currentRoleInfo.email,
          role: selectedRole === 'operator' ? 'operator' : 'admin',
          phone: currentRoleInfo.phone
        };
        login(staffUser, 'staff-auth-token-verified');
        setSuccessMsg(`✅ Authenticated! Welcome, ${currentRoleInfo.name}.`);
        setTimeout(() => {
          onClose();
          if (setActivePage) setActivePage('dashboard');
        }, 600);
      } else {
        setError('❌ Invalid administrative password. Access denied.');
        refreshCaptchaCode();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="modal-container" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '440px', width: '92%', borderRadius: '16px' }}
      >
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: '#fff', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              background: 'transparent', display: 'flex',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '1px'
            }}>
              <img src="/logo.png" alt="Shree Online" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                Leadership & Staff Verification
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Shree Online Sewa Kendra (Mahuli, S.K.N)
              </div>
            </div>
          </div>
          <button 
            className="icon-btn" 
            onClick={onClose}
            style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', border: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {error && (
            <div className="notice-banner notice-error" style={{ marginBottom: '14px', fontSize: '0.82rem' }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div className="notice-banner notice-success" style={{ marginBottom: '14px', fontSize: '0.82rem' }}>
              {successMsg}
            </div>
          )}

          {/* Role Tab Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
              Select Leadership Desk
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button
                type="button"
                className={`btn btn-sm ${selectedRole === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedRole('admin')}
                style={{ fontSize: '0.75rem', padding: '8px 4px' }}
              >
                🛡️ Admin MD
              </button>
              <button
                type="button"
                className={`btn btn-sm ${selectedRole === 'owner' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedRole('owner')}
                style={{ fontSize: '0.75rem', padding: '8px 4px' }}
              >
                👑 Owner
              </button>
              <button
                type="button"
                className={`btn btn-sm ${selectedRole === 'operator' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedRole('operator')}
                style={{ fontSize: '0.75rem', padding: '8px 4px' }}
              >
                🖥️ Operator
              </button>
            </div>
          </div>

          {/* Selected Desk Banner */}
          <div style={{
            background: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '800', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                {currentRoleInfo.name}
              </span>
              <span className="badge" style={{ background: currentRoleInfo.color, color: '#fff', fontSize: '0.68rem', fontWeight: '800' }}>
                {currentRoleInfo.badge}
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {currentRoleInfo.email} • {currentRoleInfo.phone}
            </div>
          </div>

          <form onSubmit={handleVerifyAndLogin}>
            {/* Password Input */}
            <div className="form-group">
              <label className="form-label">Secret Administrative Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter access password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: '40px' }}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Security CAPTCHA */}
            <div className="form-group" style={{ background: 'var(--bg-surface-alt)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <label className="form-label" style={{ fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <ShieldCheck size={12} color="#10b981" />
                <span>Security CAPTCHA</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{
                  padding: '6px 12px',
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  fontSize: '1.2rem',
                  fontWeight: '900',
                  letterSpacing: '4px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px dashed #38bdf8',
                  userSelect: 'none',
                  textAlign: 'center',
                  minWidth: '95px'
                }}>
                  {captchaCode}
                </div>

                <button
                  type="button"
                  onClick={refreshCaptchaCode}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 8px', height: '38px' }}
                  title="Refresh CAPTCHA"
                >
                  <RefreshCw size={13} />
                </button>

                <input 
                  type="text"
                  maxLength="5"
                  className="form-input"
                  placeholder="Code"
                  value={userCaptcha}
                  onChange={e => setUserCaptcha(e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800', height: '38px', flex: 1 }}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ marginTop: '8px', fontWeight: '800' }}
            >
              {loading ? (
                <><RotateCw size={16} className="animate-spin" /> Verifying Credentials...</>
              ) : (
                <><KeyRound size={16} /> Verify Password & Enter Desk</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
