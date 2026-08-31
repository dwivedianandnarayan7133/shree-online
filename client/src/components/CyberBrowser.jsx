import React, { useState, useEffect } from 'react';
import { 
  Globe, Plus, X, ArrowLeft, ArrowRight, RotateCw, 
  Home, Lock, ShieldCheck, ExternalLink, Maximize2, Minimize2, 
  Search, Bookmark, Sparkles, Copy, Check, Key, Zap, Trash2, 
  History, CheckCircle2, AlertCircle, RefreshCcw, Layers, MapPin,
  FileText, CreditCard, UserCheck, Briefcase, GraduationCap, Train, Shield
} from 'lucide-react';

const PORTAL_DIRECTORY = [
  { id: 'sarkari', category: 'exams', title: 'Sarkari Result', url: 'https://www.sarkariresult.com', icon: '🎯', badge: 'Popular', desc: 'Latest UP Police, SSC, PET, Railway & Govt Job notifications' },
  { id: 'epan', category: 'pan', title: 'Income Tax e-Filing (Instant e-PAN)', url: 'https://eportal.incometax.gov.in/iec/foservices/#/pre-login/instant-e-pan', icon: '💳', badge: '10-Min e-PAN', desc: 'Instant paperless e-PAN card generation via Aadhaar OTP' },
  { id: 'uidai', category: 'pan', title: 'UIDAI myAadhaar Official', url: 'https://myaadhaar.uidai.gov.in/', icon: '🛡️', badge: 'Official', desc: 'Download e-Aadhaar, address update, verify email & PVC order' },
  { id: 'nsdl', category: 'pan', title: 'NSDL / Protean PAN Portal', url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html', icon: '📄', badge: 'New / Correction', desc: 'Online application for new physical PAN & correction in card' },
  { id: 'digilocker', category: 'govt', title: 'DigiLocker Government Wallet', url: 'https://www.digilocker.gov.in/', icon: '📁', badge: 'Digital Locker', desc: 'Legally valid digital marksheets, driving licence & RC book' },
  { id: 'passport', category: 'govt', title: 'Passport Seva Official', url: 'https://www.passportindia.gov.in/', icon: '🌐', badge: 'Ministry of EA', desc: 'Fresh Indian passport, renewal & police clearance appointment' },
  { id: 'irctc', category: 'travel', title: 'IRCTC Railway NextGen', url: 'https://www.irctc.co.in/nget/', icon: '🚆', badge: 'Train Tickets', desc: 'Online train ticket reservation, tatkal bookings & PNR tracking' },
  { id: 'ssc', category: 'exams', title: 'SSC Exam Portal (Staff Selection)', url: 'https://ssc.gov.in/', icon: '🎓', badge: 'Central Exams', desc: 'SSC CGL, CHSL, GD Constable, MTS one-time registration (OTR)' },
  { id: 'parivahan', category: 'travel', title: 'Parivahan Sarathi (Vahan & DL)', url: 'https://parivahan.gov.in/parivahan/', icon: '🚗', badge: 'Govt of India', desc: 'Learner licence, driving licence renewal & vehicle RC status' },
  { id: 'edistrict', category: 'govt', title: 'e-District Uttar Pradesh', url: 'https://edistrict.up.gov.in/', icon: '🏛️', badge: 'UP Seva', desc: 'Online Aay, Jati, Niwas Praman Patra & Revenue services' },
  { id: 'upsssc', category: 'exams', title: 'UPSSSC Portal (PET & Lekhpal)', url: 'https://upsssc.gov.in/', icon: '📋', badge: 'UP Recruitment', desc: 'Uttar Pradesh Subordinate Services Selection Commission' },
  { id: 'csc', category: 'govt', title: 'Digital Seva CSC Connect', url: 'https://digitalseva.csc.gov.in/', icon: '⚡', badge: 'CSC Portal', desc: 'Common Services Center citizen utility & banking gateway' }
];

export const CyberBrowser = () => {
  const [tabs, setTabs] = useState([
    { id: 'tab-1', title: 'Sarkari Result', url: 'https://www.sarkariresult.com', icon: '🎯' },
    { id: 'tab-2', title: 'Income Tax e-PAN', url: 'https://eportal.incometax.gov.in/iec/foservices/#/pre-login/instant-e-pan', icon: '💳' },
    { id: 'tab-3', title: 'UIDAI myAadhaar', url: 'https://myaadhaar.uidai.gov.in/', icon: '🛡️' },
    { id: 'tab-4', title: 'DigiLocker Portal', url: 'https://www.digilocker.gov.in/', icon: '📁' }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [urlInput, setUrlInput] = useState('https://www.sarkariresult.com');
  const [searchFilter, setSearchFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showHelperSidebar, setShowHelperSidebar] = useState(false);
  const [quickCopiedField, setQuickCopiedField] = useState('');

  // Operator Data Assistant State
  const [assistantData, setAssistantData] = useState({
    customerName: 'Anand Narayan Dwivedi',
    phone: '9161400719',
    email: 'kdshree778@gmail.com',
    aadhaar: '4829 1049 8291',
    pan: 'ABCDE1234F',
    dob: '15/08/1998',
    fatherName: 'Kamal Narayan Dwivedi',
    address: 'Main Market, Mahuli, Sant Kabir Nagar (S.K.N), U.P. - 272172'
  });

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const handleSelectTab = (tab) => {
    setActiveTabId(tab.id);
    setUrlInput(tab.url);
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab = { id: newId, title: 'Web Search', url: 'https://www.google.com', icon: '🔍' };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setUrlInput('https://www.google.com');
  };

  const handleCloseTab = (tabId, e) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const remaining = tabs.filter(t => t.id !== tabId);
    setTabs(remaining);
    if (activeTabId === tabId) {
      setActiveTabId(remaining[0].id);
      setUrlInput(remaining[0].url);
    }
  };

  const handleOpenDirect = (targetUrl) => {
    const url = targetUrl || urlInput || activeTab?.url || 'https://www.sarkariresult.com';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    let target = urlInput.trim();
    if (!target) return;

    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = `https://${target}`;
      } else {
        target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
      }
    }

    setUrlInput(target);
    const domain = target.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    const updated = tabs.map(t => t.id === activeTabId ? { ...t, url: target, title: domain } : t);
    setTabs(updated);
    handleOpenDirect(target);
  };

  const handleCardClick = (portal) => {
    setUrlInput(portal.url);
    const updated = tabs.map(t => t.id === activeTabId ? { ...t, url: portal.url, title: portal.title, icon: portal.icon } : t);
    setTabs(updated);
  };

  const copyToClipboard = (text, fieldKey) => {
    navigator.clipboard.writeText(text);
    setQuickCopiedField(fieldKey);
    setTimeout(() => setQuickCopiedField(''), 2000);
  };

  const filteredPortals = PORTAL_DIRECTORY.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = !searchFilter.trim() || 
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
      p.desc.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.url.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 1. BROWSER CHROME FRAME */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
      }}>
        
        {/* TAB BAR */}
        <div style={{
          background: 'var(--bg-surface-alt)',
          padding: '8px 12px 0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderBottom: '1px solid var(--border-color)',
          overflowX: 'auto'
        }}>
          {tabs.map(t => {
            const isActive = t.id === activeTabId;
            return (
              <div
                key={t.id}
                onClick={() => handleSelectTab(t)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '10px 10px 0 0',
                  background: isActive ? 'var(--bg-surface)' : 'transparent',
                  border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                  borderBottom: isActive ? '1px solid var(--bg-surface)' : 'none',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? '800' : '600',
                  color: isActive ? 'var(--primary-500)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{t.icon || '🌐'}</span>
                <span>{t.title}</span>
                {tabs.length > 1 && (
                  <span 
                    onClick={(e) => handleCloseTab(t.id, e)}
                    style={{ marginLeft: '4px', opacity: 0.6, fontSize: '0.7rem' }}
                  >
                    ✕
                  </span>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleNewTab}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px', height: '28px', borderRadius: '6px', marginBottom: '4px' }}
            title="Open New Tab"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* NAVIGATION BAR & SEARCH INPUT */}
        <div style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <button 
            type="button" 
            className="navbar-tool-btn icon-only" 
            onClick={() => handleOpenDirect(activeTab?.url)}
            title="Reload Portal"
          >
            <RotateCw size={14} />
          </button>

          {/* OMNIBOX */}
          <form onSubmit={handleSearchSubmit} style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#10b981',
              fontSize: '0.74rem',
              fontWeight: '800'
            }}>
              <Lock size={13} />
              <span className="hide-mobile">AdShield™</span>
            </div>

            <input 
              type="text"
              className="form-input"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search or enter official portal address (e.g. digilocker.gov.in)"
              style={{
                paddingLeft: '110px',
                paddingRight: '120px',
                height: '42px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}
            />

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ position: 'absolute', right: '6px', height: '30px', fontWeight: '800' }}
            >
              🚀 Launch
            </button>
          </form>

          {/* DATA ASSISTANT TOGGLE */}
          <button
            type="button"
            className={`btn btn-sm ${showHelperSidebar ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowHelperSidebar(!showHelperSidebar)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '42px' }}
          >
            <Zap size={14} />
            <span className="hide-mobile">Data Assistant</span>
          </button>
        </div>

        {/* 2. MAIN BROWSER CONTENT & DATA ASSISTANT */}
        <div style={{ display: 'flex', minHeight: '520px' }}>
          
          {/* LEFT: PORTAL LAUNCH STATION & BROWSER IFRAME */}
          <div style={{ flex: 1, padding: '0', background: 'var(--bg-main)', position: 'relative' }}>
            {activeTab?.url ? (
              <iframe
                key={activeTab.id}
                src={activeTab.url}
                title="AdShield Secure Browser Window"
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '600px',
                  border: 'none',
                  background: '#ffffff',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
                }}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Please enter a URL or select a portal to launch.
              </div>
            )}
          </div>

          {/* RIGHT: DATA ASSISTANT SIDEBAR */}
          {showHelperSidebar && (
            <aside style={{ width: '320px', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-color)', padding: '16px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <div style={{ fontWeight: '800', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={15} color="var(--primary-500)" />
                  <span>Applicant Form Assistant</span>
                </div>
                <button className="icon-btn" onClick={() => setShowHelperSidebar(false)}><X size={14} /></button>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Click any credential to copy directly for pasting into application forms:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(assistantData).map(([k, v]) => {
                  const isCopied = quickCopiedField === k;
                  return (
                    <div
                      key={k}
                      onClick={() => copyToClipboard(v, k)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: isCopied ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface-alt)',
                        border: isCopied ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        <span>{k.replace(/([A-Z])/g, ' $1')}</span>
                        {isCopied ? <span style={{ color: '#10b981', fontWeight: '800' }}>COPIED!</span> : <Copy size={11} />}
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '2px', wordBreak: 'break-all' }}>
                        {v}
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>
          )}

        </div>

      </div>

    </div>
  );
};
