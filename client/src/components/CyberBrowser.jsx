import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, Plus, X, ArrowLeft, ArrowRight, RotateCw, 
  Home, Lock, ShieldCheck, ExternalLink, Maximize2, Minimize2, 
  Search, Bookmark, Sparkles, Copy, Check, Key, Zap, Trash2, 
  History, CheckCircle2, AlertCircle, RefreshCcw, Layers, MapPin
} from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_BOOKMARKS = [
  { title: 'Sarkari Result', url: 'https://www.sarkariresult.com', icon: '🎯', desc: 'UP Police, SSC, PET & Govt Notifications' },
  { title: 'PAN e-Filing (e-PAN)', url: 'https://eportal.incometax.gov.in/iec/foservices/#/pre-login/instant-e-pan', icon: '💳', desc: 'Instant 10-Minute e-PAN Generation' },
  { title: 'UIDAI myAadhaar', url: 'https://myaadhaar.uidai.gov.in/', icon: '🛡️', desc: 'Aadhaar Download, Update & PVC Order' },
  { title: 'NSDL PAN Card', url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html', icon: '📄', desc: 'New PAN & Correction Assistance' },
  { title: 'DigiLocker', url: 'https://www.digilocker.gov.in/', icon: '📁', desc: 'Issued Marksheets, DL & RC Certificates' },
  { title: 'Passport Seva', url: 'https://www.passportindia.gov.in/', icon: '🌐', desc: 'Fresh Passport & Renewal Registration' },
  { title: 'IRCTC Railway', url: 'https://www.irctc.co.in/nget/', icon: '🚆', desc: 'Train Ticket Reservation & Tatkal' },
  { title: 'SSC Exam Portal', url: 'https://ssc.gov.in/', icon: '🎓', desc: 'Staff Selection Commission OTR & Forms' },
  { title: 'Parivahan Sarathi', url: 'https://parivahan.gov.in/parivahan/', icon: '🚗', desc: 'Driving Licence, Learner & Vehicle RC' },
  { title: 'Web Search Engine', url: 'https://www.bing.com', icon: '🔍', desc: 'Ad-Free Fast Web Search' }
];

export const CyberBrowser = ({ initialUrl = 'https://www.sarkariresult.com' }) => {
  const [tabs, setTabs] = useState([
    { id: 'tab-1', title: 'Sarkari Result (Govt Jobs)', url: 'https://www.sarkariresult.com', favicon: '🎯' },
    { id: 'tab-2', title: 'Income Tax e-PAN Portal', url: 'https://eportal.incometax.gov.in/iec/foservices/#/pre-login/instant-e-pan', favicon: '💳' },
    { id: 'tab-3', title: 'UIDAI myAadhaar', url: 'https://myaadhaar.uidai.gov.in/', favicon: '🛡️' },
    { id: 'tab-4', title: 'DigiLocker Official', url: 'https://www.digilocker.gov.in/', favicon: '📁' }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [urlInput, setUrlInput] = useState('https://www.sarkariresult.com');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelperSidebar, setShowHelperSidebar] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [clearSuccessToast, setClearSuccessToast] = useState('');

  // History state
  const [historyList, setHistoryList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cybercafe_browser_history') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [adshieldEnabled, setAdshieldEnabled] = useState(true);
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

  const recordHistory = (url, title) => {
    const newItem = { url, title: title || url, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), timestamp: Date.now() };
    setHistoryList(prev => {
      const filtered = prev.filter(h => h.url !== url);
      const updated = [newItem, ...filtered].slice(0, 50);
      localStorage.setItem('cybercafe_browser_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectTab = (tabId) => {
    setActiveTabId(tabId);
    const selected = tabs.find(t => t.id === tabId);
    if (selected) {
      setUrlInput(selected.url);
    }
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab = {
      id: newId,
      title: 'Sarkari Result',
      url: 'https://www.sarkariresult.com',
      favicon: '🎯'
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setUrlInput('https://www.sarkariresult.com');
    recordHistory('https://www.sarkariresult.com', 'Sarkari Result');
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

  const handleNavigate = (e) => {
    if (e) e.preventDefault();
    let target = urlInput.trim();
    if (!target) return;

    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = `https://${target}`;
      } else {
        target = `https://www.bing.com/search?q=${encodeURIComponent(target)}`;
      }
    }

    setUrlInput(target);
    const domainName = target.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    recordHistory(target, domainName);

    const updatedTabs = tabs.map(t => {
      if (t.id === activeTabId) {
        return {
          ...t,
          url: target,
          title: domainName
        };
      }
      return t;
    });
    setTabs(updatedTabs);
  };

  const handleBookmarkClick = (bm) => {
    setUrlInput(bm.url);
    recordHistory(bm.url, bm.title);
    const updatedTabs = tabs.map(t => {
      if (t.id === activeTabId) {
        return { ...t, url: bm.url, title: bm.title, favicon: bm.icon };
      }
      return t;
    });
    setTabs(updatedTabs);
  };

  const handleClearCacheAndHistory = async () => {
    setClearingCache(true);
    try {
      localStorage.removeItem('cybercafe_browser_history');
      setHistoryList([]);
      setShowClearModal(false);
      setClearSuccessToast('🧹 Browser Cache & Visited History Cleared Successfully!');
      setTimeout(() => setClearSuccessToast(''), 3500);
    } catch (e) {
    } finally {
      setClearingCache(false);
    }
  };

  const copyToClipboard = (text, fieldKey) => {
    navigator.clipboard.writeText(text);
    setQuickCopiedField(fieldKey);
    setTimeout(() => setQuickCopiedField(''), 2000);
  };

  return (
    <div className={`cyber-browser-container ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      
      {/* 1. TOP TAB STRIP */}
      <div className="browser-tab-bar">
        <div className="browser-tabs-scroll">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`browser-tab ${tab.id === activeTabId ? 'active-tab' : ''}`}
            >
              <span className="tab-favicon">{tab.favicon || '🌐'}</span>
              <span className="tab-title">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  type="button"
                  className="tab-close-btn"
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  title="Close Tab"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" onClick={handleNewTab} className="new-tab-btn" title="Open New Tab">
          <Plus size={16} />
        </button>
      </div>

      {/* 2. NAVIGATION TOOLBAR */}
      <div className="browser-nav-toolbar">
        <div className="nav-btn-group">
          <button type="button" className="icon-btn" onClick={() => handleBookmarkClick(DEFAULT_BOOKMARKS[0])} title="Home">
            <Home size={15} />
          </button>
          <button type="button" className="icon-btn" onClick={() => handleOpenDirect(activeTab?.url)} title="Reload Portal">
            <RotateCw size={15} />
          </button>
        </div>

        {/* Omnibox / URL Search Bar */}
        <form onSubmit={handleNavigate} className="browser-omnibox">
          <div className="security-indicator" title="AdShield™ Active">
            <ShieldCheck size={14} color="#10b981" />
          </div>
          <input
            type="text"
            className="omnibox-input"
            placeholder="Search web or enter official portal address (e.g. digilocker.gov.in)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm" style={{ height: '32px', padding: '0 12px', flexShrink: 0 }}>
            Go
          </button>
        </form>

        {/* Quick Toolbar Action Buttons */}
        <div className="browser-actions-group">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleOpenDirect(activeTab?.url)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}
            title="Launch in Dedicated High-Speed Window"
          >
            <ExternalLink size={14} />
            <span>Open in Dedicated Window</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowHelperSidebar(!showHelperSidebar)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Zap size={14} color="var(--primary-400)" />
            <span className="hide-mobile">Data Assistant</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowClearModal(true)}
            title="Clear Browser Cache & History"
          >
            <Trash2 size={14} color="#ef4444" />
            <span className="hide-mobile">Clear Cache</span>
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* 3. BOOKMARKS CHIPS BAR */}
      <div className="browser-bookmarks-bar">
        <Bookmark size={13} color="var(--primary-400)" style={{ flexShrink: 0 }} />
        {DEFAULT_BOOKMARKS.map((bm, i) => (
          <button key={i} className="bookmark-chip" onClick={() => handleBookmarkClick(bm)}>
            <span>{bm.icon}</span>
            <span>{bm.title}</span>
          </button>
        ))}
      </div>

      {/* Toast Notification */}
      {clearSuccessToast && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.95)', color: '#ffffff',
          padding: '10px 16px', fontSize: '0.85rem', fontWeight: '700',
          textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
        }}>
          {clearSuccessToast}
        </div>
      )}

      {/* 4. MAIN GATEWAY WORKSPACE & SIDEBAR */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        
        {/* INTERACTIVE GOVERNMENT GATEWAY STATION */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'radial-gradient(circle at top right, rgba(37,99,235,0.08), transparent 50%), var(--bg-main)' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            
            {/* Active Portal Header Card */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-alt) 100%)',
              border: '2px solid rgba(37, 99, 235, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              marginBottom: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '3px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', fontWeight: '800', marginBottom: '8px' }}>
                    <ShieldCheck size={13} />
                    <span>Official Verified Portal • AdShield™ Protected</span>
                  </div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                    {activeTab?.title || 'Official Government Portal'}
                  </h2>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.86rem', color: 'var(--primary-400)', wordBreak: 'break-all' }}>
                    🔗 {activeTab?.url}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={() => handleOpenDirect(activeTab?.url)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '900', padding: '12px 24px', boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)' }}
                  >
                    <ExternalLink size={18} />
                    <span>Launch Portal Directly</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Portal Launch Grid */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} color="var(--primary-500)" />
                <span>Popular Government, Exam & Banking Portals</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {DEFAULT_BOOKMARKS.map((bm, idx) => (
                  <div
                    key={idx}
                    className="card"
                    style={{
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: activeTab?.url === bm.url ? '2px solid #2563eb' : '1px solid var(--border-color)',
                      background: activeTab?.url === bm.url ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-surface)'
                    }}
                    onClick={() => handleBookmarkClick(bm)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '10px',
                        background: 'var(--bg-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.3rem', flexShrink: 0
                      }}>
                        {bm.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                          {bm.title}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {bm.desc}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => { e.stopPropagation(); handleOpenDirect(bm.url); }}
                        style={{ padding: '6px 10px' }}
                        title="Launch in New Tab"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Information Banner */}
            <div style={{
              background: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)', padding: '14px 18px', fontSize: '0.78rem', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <MapPin size={18} color="#10b981" style={{ flexShrink: 0 }} />
              <div>
                <b>Shree Online Sewa Kendra (Main Market, Mahuli, S.K.N)</b>: High-speed direct link gateway with built-in form autofill assistance.
              </div>
            </div>

          </div>
        </div>

        {/* 5. OPERATOR FORM DATA ASSISTANT SIDEBAR */}
        {showHelperSidebar && (
          <aside className="browser-helper-sidebar" style={{ width: '300px', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-color)', padding: '16px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div style={{ fontWeight: '800', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} color="var(--primary-500)" />
                <span>Quick Copy Assistant</span>
              </div>
              <button className="icon-btn" onClick={() => setShowHelperSidebar(false)}><X size={14} /></button>
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Click any field to copy to clipboard for instant pasting into government portal forms:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(assistantData).map(([key, val]) => {
                const isCopied = quickCopiedField === key;
                return (
                  <div
                    key={key}
                    onClick={() => copyToClipboard(val, key)}
                    style={{
                      background: isCopied ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface-alt)',
                      border: isCopied ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                      borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                      {isCopied ? <span style={{ color: '#10b981', fontWeight: '800' }}>COPIED!</span> : <Copy size={11} />}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '2px', wordBreak: 'break-all' }}>
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

      </div>

      {/* CLEAR CACHE MODAL */}
      {showClearModal && (
        <div className="modal-overlay" onClick={() => setShowClearModal(false)}>
          <div className="modal-container" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={18} color="#ef4444" />
                <span>Clear Browser Cache & History</span>
              </div>
              <button className="icon-btn" onClick={() => setShowClearModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ padding: '16px' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                This will clear temporary browsing sessions and visited token history from this device.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowClearModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-danger btn-sm" 
                  disabled={clearingCache}
                  onClick={handleClearCacheAndHistory}
                >
                  {clearingCache ? 'Clearing...' : 'Clear History & Cache'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
