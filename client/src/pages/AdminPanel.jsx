import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Users, Clock, ShieldCheck, 
  Trash2, HardDrive, Edit3, CheckCircle2, RefreshCw,
  PlusCircle, UserPlus, Save, Award, Layout, FileText,
  IndianRupee, Lock, Eye, EyeOff, AlertCircle, Upload, Camera, Image as ImageIcon
} from 'lucide-react';
import { api, getFullUrl } from '../services/api';

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('static_pages');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [uploadingTarget, setUploadingTarget] = useState(null);

  const ownerPhotoInputRef = useRef(null);
  const adminPhotoInputRef = useRef(null);
  const opPhotoInputRef = useRef(null);
  const [activeOpIdForUpload, setActiveOpIdForUpload] = useState(null);

  // 1. Static Page & Footer State
  const [config, setConfig] = useState({
    portalName: 'Shree Online (Mahuli, S.K.N)',
    tagline: 'One Window. Every Digital Service.',
    establishedYear: '2013',
    aboutUsText: '',
    ownerName: 'Krishan Narayan Dwivedi',
    ownerRole: 'Founder & Managing Owner',
    ownerPhone: '9161400719',
    ownerEmail: 'onlinebaba111111@gmail.com',
    ownerPhoto: '',
    ownerQuote: '',
    adminName: 'Kamal Narayan Dwivedi',
    adminRole: 'Managing Director & Main Controller',
    adminPhone: '8090794210',
    adminEmail: 'kdshree778@gmail.com',
    adminPhoto: '',
    adminQuote: '',
    cyberCafeAddress: 'Main Market, Mahuli, Sant Kabir Nagar (S.K.N), Uttar Pradesh - 272172',
    footerTimings: 'Monday – Sunday (08:00 AM – 09:00 PM)',
    footerCopyright: '© 2013 – 2026 Shree Online Sewa Kendra • Mahuli, Sant Kabir Nagar (S.K.N), U.P. All rights reserved.',
    retentionHours: 24,
    adShieldEnabled: true
  });

  // 2. Operators State
  const [users, setUsers] = useState([]);
  const [showAddOpModal, setShowAddOpModal] = useState(false);
  const [newOp, setNewOp] = useState({ name: '', email: '', phone: '', password: '', role: 'operator' });

  // 3. Pricing Catalog State
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: '', category: 'online_form', price: '', description: '' });
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [newPrice, setNewPrice] = useState(0);

  // 4. Logs & Storage State
  const [logs, setLogs] = useState([]);
  const [cleanupResult, setCleanupResult] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [servRes, confRes, logRes, userRes] = await Promise.all([
        api.getPricing(),
        api.getSystemConfig(),
        api.getAuditLogs('limit=30'),
        api.getUsers()
      ]);

      if (servRes.success) setServices(servRes.services);
      if (confRes.success && confRes.config) {
        setConfig(prev => ({ ...prev, ...confRes.config }));
      }
      if (logRes.success) setLogs(logRes.logs);
      if (userRes.success) setUsers(userRes.users);
    } catch (err) {
      console.error('Failed to load admin panel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Save Static Pages & Footer Config
  const handleSaveStaticPages = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await api.updateSystemConfig(config);
      if (res.success) {
        setSaveSuccess('Static pages, leadership profiles, and footer updated successfully.');
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    }
  };

  // Photo Upload Handler (Owner, Admin, Operators)
  const handlePhotoUpload = async (e, target) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('target', target);

    setUploadingTarget(target);
    try {
      const res = await api.uploadProfilePhoto(formData);
      if (res.success) {
        if (target === 'owner') {
          setConfig(prev => ({ ...prev, ownerPhoto: res.photoUrl }));
        } else if (target === 'admin') {
          setConfig(prev => ({ ...prev, adminPhoto: res.photoUrl }));
        }
        fetchAdminData();
        setSaveSuccess(`Profile photo uploaded successfully for ${target === 'owner' ? 'Owner' : target === 'admin' ? 'Admin MD' : 'Operator'}.`);
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Photo upload failed');
    } finally {
      setUploadingTarget(null);
      if (e.target) e.target.value = '';
    }
  };

  // Operator Actions
  const handleCreateOperator = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createOperator(newOp);
      if (res.success) {
        setShowAddOpModal(false);
        setNewOp({ name: '', email: '', phone: '', password: '', role: 'operator' });
        fetchAdminData();
        setSaveSuccess('New operator account created successfully.');
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to create operator');
    }
  };

  const handleToggleOperatorStatus = async (user) => {
    try {
      const res = await api.updateOperator(user._id, { isActive: !user.isActive });
      if (res.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update operator status');
    }
  };

  const handleDeleteOperator = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete operator "${name}"?`)) return;
    try {
      const res = await api.deleteOperator(id);
      if (res.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete operator');
    }
  };

  // Service Pricing Actions
  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createServiceItem(newService);
      if (res.success) {
        setNewService({ name: '', category: 'online_form', price: '', description: '' });
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Failed to add service');
    }
  };

  const handleUpdatePrice = async (serviceId) => {
    try {
      const res = await api.updatePrice(serviceId, { price: Number(newPrice) });
      if (res.success) {
        setEditingPriceId(null);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update price');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service from catalog?')) return;
    try {
      const res = await api.deleteServiceItem(id);
      if (res.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete service');
    }
  };

  // Storage Cleanup
  const handleTriggerCleanup = async () => {
    if (!window.confirm('Trigger manual storage cleanup now?')) return;
    try {
      const res = await api.triggerCleanup({});
      if (res.success) {
        setCleanupResult(res.result);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Cleanup failed');
    }
  };

  const ownerPhotoUrl = config.ownerPhoto ? getFullUrl(config.ownerPhoto) : null;
  const adminPhotoUrl = config.adminPhoto ? getFullUrl(config.adminPhoto) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hidden file input for operator photo uploads */}
      <input 
        type="file" 
        ref={opPhotoInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={(e) => handlePhotoUpload(e, activeOpIdForUpload)}
      />

      {/* Managing Director & Admin Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-400)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>
            <Award size={13} color="#f59e0b" />
            <span>Managing Director & Main Controller Desk</span>
          </div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Admin Control Center</span>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>Kamal Narayan Dwivedi</span>
          </h1>
          <p className="page-subtitle">
            Central controller for static content, large circular profile photos, operators, pricing catalog, and system logs.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAdminData}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      {saveSuccess && (
        <div style={{
          background: 'rgba(37, 211, 102, 0.15)', color: '#25d366',
          border: '1px solid rgba(37, 211, 102, 0.3)', padding: '12px 16px',
          borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: '700',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <CheckCircle2 size={18} />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div style={{
        display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-color)',
        paddingBottom: '8px', overflowX: 'auto', flexWrap: 'wrap'
      }}>
        {[
          { id: 'static_pages', label: 'Static Pages & Photos', icon: Layout },
          { id: 'operators', label: 'Operators & Profiles', icon: Users },
          { id: 'pricing', label: 'Service Pricing Catalog', icon: IndianRupee },
          { id: 'retention', label: 'Storage & Retention', icon: HardDrive },
          { id: 'logs', label: 'Security Audit Logs', icon: Clock },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. STATIC PAGES, LEADERSHIP MESSAGES & BIG CIRCULAR PHOTO UPLOADS */}
      {activeTab === 'static_pages' && (
        <form onSubmit={handleSaveStaticPages} className="card">
          <div className="card-header">
            <div className="card-title">
              <Layout size={18} color="var(--primary-500)" />
              <span>Manage About Us, Leadership Profiles, Photos & Footer Content</span>
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              <Save size={14} /> Save All Changes
            </button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Center Branding */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary-400)', marginBottom: '12px' }}>
                🏢 Center Identity & Branding
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Portal Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={config.portalName} 
                    onChange={e => setConfig({ ...config, portalName: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tagline</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={config.tagline} 
                    onChange={e => setConfig({ ...config, tagline: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Established Year</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={config.establishedYear} 
                    onChange={e => setConfig({ ...config, establishedYear: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            {/* About Us Summary */}
            <div className="form-group">
              <label className="form-label">About Us Overview Narrative</label>
              <textarea 
                className="form-input" 
                rows="3" 
                value={config.aboutUsText} 
                onChange={e => setConfig({ ...config, aboutUsText: e.target.value })} 
              />
            </div>

            {/* Leadership Profiles & BIG Circular Photo Uploads */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
              
              {/* OWNER PROFILE & BIG CIRCULAR PHOTO UPLOADER */}
              <div style={{ background: 'var(--bg-surface-alt)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#f59e0b', margin: 0 }}>
                    👑 Founder & Managing Owner
                  </h4>
                  <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>Krishan Narayan</span>
                </div>

                {/* BIG Circular Photo Preview (130px) & Upload Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {ownerPhotoUrl ? (
                      <img 
                        src={ownerPhotoUrl} 
                        alt="Owner" 
                        style={{
                          width: '130px', height: '130px', borderRadius: '50%',
                          objectFit: 'cover', border: '5px solid #f59e0b',
                          boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)',
                          aspectRatio: '1/1'
                        }} 
                      />
                    ) : (
                      <div style={{
                        width: '130px', height: '130px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '900', fontSize: '2.8rem', border: '5px solid #f59e0b',
                        boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)',
                        aspectRatio: '1/1'
                      }}>
                        KD
                      </div>
                    )}
                    <div style={{
                      position: 'absolute', bottom: '2px', right: '2px',
                      background: '#f59e0b', color: '#000', borderRadius: '50%',
                      width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.85rem', fontWeight: '900', border: '2px solid #fff'
                    }}>
                      👑
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input 
                      type="file" 
                      ref={ownerPhotoInputRef} 
                      style={{ display: 'none' }} 
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'owner')} 
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => ownerPhotoInputRef.current?.click()}
                      disabled={uploadingTarget === 'owner'}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Camera size={15} />
                      <span>{uploadingTarget === 'owner' ? 'Uploading...' : 'Upload Owner Photo'}</span>
                    </button>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      Large high-res circular photo<br />(Auto cropped to 1:1 circle)
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={config.ownerName} 
                    onChange={e => setConfig({ ...config, ownerName: e.target.value })} 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Mobile</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={config.ownerPhone} 
                      onChange={e => setConfig({ ...config, ownerPhone: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={config.ownerEmail} 
                      onChange={e => setConfig({ ...config, ownerEmail: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Owner Official Message (~500 Words Address)</label>
                  <textarea 
                    className="form-input" 
                    rows="8" 
                    value={config.ownerQuote} 
                    onChange={e => setConfig({ ...config, ownerQuote: e.target.value })} 
                  />
                </div>
              </div>

              {/* ADMIN PROFILE & BIG CIRCULAR PHOTO UPLOADER */}
              <div style={{ background: 'var(--bg-surface-alt)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#10b981', margin: 0 }}>
                    🛡️ Managing Director & Main Controller
                  </h4>
                  <span className="badge badge-completed" style={{ fontSize: '0.75rem' }}>Kamal Narayan</span>
                </div>

                {/* BIG Circular Photo Preview (130px) & Upload Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {adminPhotoUrl ? (
                      <img 
                        src={adminPhotoUrl} 
                        alt="Admin MD" 
                        style={{
                          width: '130px', height: '130px', borderRadius: '50%',
                          objectFit: 'cover', border: '5px solid #10b981',
                          boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                          aspectRatio: '1/1'
                        }} 
                      />
                    ) : (
                      <div style={{
                        width: '130px', height: '130px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '900', fontSize: '2.8rem', border: '5px solid #10b981',
                        boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                        aspectRatio: '1/1'
                      }}>
                        KD
                      </div>
                    )}
                    <div style={{
                      position: 'absolute', bottom: '2px', right: '2px',
                      background: '#10b981', color: '#fff', borderRadius: '50%',
                      width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.85rem', fontWeight: '900', border: '2px solid #fff'
                    }}>
                      🛡️
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input 
                      type="file" 
                      ref={adminPhotoInputRef} 
                      style={{ display: 'none' }} 
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'admin')} 
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => adminPhotoInputRef.current?.click()}
                      disabled={uploadingTarget === 'admin'}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Camera size={15} />
                      <span>{uploadingTarget === 'admin' ? 'Uploading...' : 'Upload Admin Photo'}</span>
                    </button>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      Large high-res circular photo<br />(Auto cropped to 1:1 circle)
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={config.adminName} 
                    onChange={e => setConfig({ ...config, adminName: e.target.value })} 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Mobile</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={config.adminPhone} 
                      onChange={e => setConfig({ ...config, adminPhone: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={config.adminEmail} 
                      onChange={e => setConfig({ ...config, adminEmail: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Admin MD Official Message (~500 Words Address)</label>
                  <textarea 
                    className="form-input" 
                    rows="8" 
                    value={config.adminQuote} 
                    onChange={e => setConfig({ ...config, adminQuote: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            {/* Footer Details */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary-400)', marginBottom: '12px' }}>
                📌 Global Footer Settings
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Center Address</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={config.cyberCafeAddress} 
                    onChange={e => setConfig({ ...config, cyberCafeAddress: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Operating Hours</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={config.footerTimings} 
                    onChange={e => setConfig({ ...config, footerTimings: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Copyright Notice</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={config.footerCopyright} 
                    onChange={e => setConfig({ ...config, footerCopyright: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button type="submit" className="btn btn-primary btn-lg">
                <Save size={16} /> Save All Page & Footer Changes
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 2. OPERATORS, USERS & OPERATOR PHOTO UPLOADS */}
      {activeTab === 'operators' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Users size={18} color="var(--primary-500)" />
              <span>Desk Operators & Profile Photos</span>
            </div>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddOpModal(true)}
            >
              <UserPlus size={14} /> Add New Operator
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>User / Operator</th>
                    <th>Role</th>
                    <th>Mobile</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const avatarUrl = u.avatar ? getFullUrl(u.avatar) : null;
                    return (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {avatarUrl ? (
                              <img 
                                src={avatarUrl} 
                                alt={u.name} 
                                style={{
                                  width: '46px', height: '46px', borderRadius: '50%',
                                  objectFit: 'cover', border: '2px solid var(--primary-500)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                  aspectRatio: '1/1'
                                }} 
                              />
                            ) : (
                              <div style={{
                                width: '46px', height: '46px', borderRadius: '50%',
                                background: 'var(--primary-600)', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: '800', fontSize: '1rem',
                                aspectRatio: '1/1'
                              }}>
                                {u.name ? u.name[0].toUpperCase() : 'U'}
                              </div>
                            )}
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                              onClick={() => {
                                setActiveOpIdForUpload(u._id);
                                opPhotoInputRef.current?.click();
                              }}
                              title="Upload Operator Profile Photo"
                            >
                              <Camera size={12} /> Photo
                            </button>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '700' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td>
                          <span className={`role-tag ${u.role}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>{u.phone || '—'}</td>
                        <td>
                          <span className={`badge ${u.isActive !== false ? 'badge-completed' : 'badge-cancelled'}`}>
                            {u.isActive !== false ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                              onClick={() => handleToggleOperatorStatus(u)}
                            >
                              {u.isActive !== false ? 'Disable' : 'Enable'}
                            </button>
                            {u.email !== 'kdshree778@gmail.com' && u.email !== 'onlinebaba111111@gmail.com' && (
                              <button
                                className="btn btn-danger btn-sm"
                                style={{ padding: '3px 8px' }}
                                onClick={() => handleDeleteOperator(u._id, u.name)}
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Operator Modal */}
          {showAddOpModal && (
            <div className="modal-overlay" onClick={() => setShowAddOpModal(false)}>
              <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                <div className="modal-header">
                  <div style={{ fontWeight: '800', fontSize: '1rem' }}>Create New Operator Account</div>
                  <button className="icon-btn" onClick={() => setShowAddOpModal(false)}>✕</button>
                </div>
                <form onSubmit={handleCreateOperator} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Ramesh Chandra" 
                      value={newOp.name} 
                      onChange={e => setNewOp({ ...newOp, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="operator@shreeonline.local" 
                      value={newOp.email} 
                      onChange={e => setNewOp({ ...newOp, email: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="98765 43210" 
                      value={newOp.phone} 
                      onChange={e => setNewOp({ ...newOp, phone: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Login Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="••••••••" 
                      value={newOp.password} 
                      onChange={e => setNewOp({ ...newOp, password: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Account Role</label>
                    <select 
                      className="form-select"
                      value={newOp.role}
                      onChange={e => setNewOp({ ...newOp, role: e.target.value })}
                    >
                      <option value="operator">Desk Operator</option>
                      <option value="admin">System Admin</option>
                    </select>
                  </div>
                  <div className="modal-footer" style={{ padding: '12px 0 0 0' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddOpModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Create Operator</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. PRICING & SERVICE CATALOG */}
      {activeTab === 'pricing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <PlusCircle size={18} color="var(--primary-500)" />
                <span>Add New Service to Catalog</span>
              </div>
            </div>
            <form onSubmit={handleAddService} className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) 120px 120px', gap: '12px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Service Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Police Bharti Registration" 
                  value={newService.name} 
                  onChange={e => setNewService({ ...newService, name: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <select 
                  className="form-select"
                  value={newService.category}
                  onChange={e => setNewService({ ...newService, category: e.target.value })}
                >
                  <option value="online_form">Govt & Online Form</option>
                  <option value="photo">Passport Photo</option>
                  <option value="printing">Laser & Color Print</option>
                  <option value="scan_doc">Scan & Document Restore</option>
                  <option value="lamination">Lamination</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Base Price (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="50" 
                  value={newService.price} 
                  onChange={e => setNewService({ ...newService, price: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Short Description</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Standard fee" 
                  value={newService.description} 
                  onChange={e => setNewService({ ...newService, description: e.target.value })} 
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                Add Service
              </button>
            </form>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <IndianRupee size={18} color="var(--accent-emerald)" />
                <span>Service Price Catalog & Rate Card</span>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Service Name</th>
                      <th>Category</th>
                      <th>Price (₹)</th>
                      <th>Description</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(s => (
                      <tr key={s._id}>
                        <td style={{ fontWeight: '700' }}>{s.name}</td>
                        <td>
                          <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                            {s.category.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {editingPriceId === s._id ? (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <input 
                                type="number" 
                                className="form-input" 
                                style={{ width: '80px', height: '30px' }} 
                                value={newPrice} 
                                onChange={e => setNewPrice(e.target.value)} 
                              />
                              <button 
                                className="btn btn-primary btn-sm" 
                                style={{ padding: '2px 8px' }} 
                                onClick={() => handleUpdatePrice(s._id)}
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontWeight: '800', color: 'var(--accent-emerald)' }}>₹{s.price}</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.description || '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              style={{ padding: '3px 8px' }}
                              onClick={() => { setEditingPriceId(s._id); setNewPrice(s.price); }}
                            >
                              <Edit3 size={12} /> Edit Price
                            </button>
                            <button 
                              className="btn btn-danger btn-sm" 
                              style={{ padding: '3px 8px' }}
                              onClick={() => handleDeleteService(s._id)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. STORAGE & RETENTION CONTROLLER */}
      {activeTab === 'retention' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Clock size={18} color="var(--accent-amber)" />
                <span>Temporary File Auto-Cleanup Policy</span>
              </div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Auto-Retention Duration</label>
                <select 
                  className="form-select"
                  value={config.retentionHours}
                  onChange={e => setConfig({ ...config, retentionHours: Number(e.target.value) })}
                >
                  <option value={1}>1 Hour (Aggressive Disk Save)</option>
                  <option value={6}>6 Hours (Daily Standard)</option>
                  <option value={12}>12 Hours (Half Day)</option>
                  <option value={24}>24 Hours (Standard Safe Window)</option>
                  <option value={48}>48 Hours (2 Days)</option>
                  <option value={168}>7 Days (1 Week Retention)</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  id="adshield_toggle" 
                  checked={config.adShieldEnabled} 
                  onChange={e => setConfig({ ...config, adShieldEnabled: e.target.checked })} 
                />
                <label htmlFor="adshield_toggle" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Enable AdShield™ Deep Ad & Tracker Blocker by Default
                </label>
              </div>

              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleSaveStaticPages}
              >
                <Save size={14} /> Update Retention Policy
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Trash2 size={18} color="var(--accent-rose)" />
                <span>Manual Storage Purge</span>
              </div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Immediately scans and deletes all temporary session files that have exceeded the retention threshold.
              </p>

              <button 
                type="button"
                className="btn btn-danger btn-lg"
                onClick={handleTriggerCleanup}
              >
                <Trash2 size={16} /> Execute Storage Cleanup Now
              </button>

              {cleanupResult && (
                <div style={{ background: 'var(--bg-surface-alt)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: '700', color: 'var(--accent-emerald)' }}>Cleanup Completed:</div>
                  <div>Deleted Files: <b>{cleanupResult.deletedFiles ?? 0}</b></div>
                  <div>Space Reclaimed: <b>{cleanupResult.reclaimedMb ?? '0.00'} MB</b></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShieldCheck size={18} color="var(--primary-500)" />
              <span>System Security & Audit Activity Logs</span>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        No audit logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    logs.map(l => (
                      <tr key={l._id}>
                        <td style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                          {new Date(l.createdAt).toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                            {l.action}
                          </span>
                        </td>
                        <td style={{ fontWeight: '600' }}>{l.user}</td>
                        <td>
                          <span className={`role-tag ${l.role}`}>
                            {l.role}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {l.ipAddress || '127.0.0.1'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
