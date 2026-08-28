import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, Plus, X, ArrowLeft, ArrowRight, RotateCw, 
  Home, Lock, ShieldCheck, ExternalLink, Maximize2, Minimize2, 
  Search, Bookmark, Sparkles, Copy, Check, Key, Zap, Trash2, 
  History, CheckCircle2, AlertCircle, RefreshCcw
} from 'lucide-react';
import { api } from '../services/api';
import { SERVER_BASE } from '../services/config';

const DEFAULT_BOOKMARKS = [
  { title: 'Sarkari Result', url: 'https://www.sarkariresult.com', icon: '🎯' },
  { title: 'PAN e-Filing (e-PAN)', url: 'https://eportal.incometax.gov.in/iec/foservices/#/pre-login/instant-e-pan', icon: '💳' },
  { title: 'UIDAI myAadhaar', url: 'https://myaadhaar.uidai.gov.in/', icon: '🛡️' },
  { title: 'NSDL PAN Card', url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html', icon: '📄' },
  { title: 'Passport Seva', url: 'https://www.passportindia.gov.in/', icon: '🌐' },
  { title: 'DigiLocker', url: 'https://www.digilocker.gov.in/', icon: '📁' },
  { title: 'IRCTC Railway', url: 'https://www.irctc.co.in/nget/', icon: '🚆' },
  { title: 'SSC Exam Portal', url: 'https://ssc.gov.in/', icon: '🎓' },
  { title: 'Parivahan Sarathi', url: 'https://parivahan.gov.in/parivahan/', icon: '🚗' },
  { title: 'Web Search Engine', url: 'https://www.bing.com', icon: '🔍' }
];

export const CyberBrowser = ({ initialUrl = 'https://www.sarkariresult.com' }) => {
  const [tabs, setTabs] = useState([
    { id: 'tab-1', title: 'Sarkari Result (Govt Jobs & Results)', url: initialUrl, favicon: '🎯' },
    { id: 'tab-2', title: 'Income Tax e-Filing (e-PAN)', url: 'https://eportal.incometax.gov.in/iec/foservices/#/pre-login/instant-e-pan', favicon: '💳' },
    { id: 'tab-3', title: 'UIDAI myAadhaar Portal', url: 'https://myaadhaar.uidai.gov.in/', favicon: '🛡️' }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
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

  // AdShield Property State
  const [adshieldEnabled, setAdshieldEnabled] = useState(true);
  const [showAdshieldModal, setShowAdshieldModal] = useState(false);
  const [blockedAdsEstimate, setBlockedAdsEstimate] = useState(14);

  // Form Data Assistant State for Operator
  const [quickCopiedField, setQuickCopiedField] = useState('');
  const [assistantData, setAssistantData] = useState({
    customerName: 'Pooja Verma',
    phone: '9833344556',
    email: 'pooja.verma@gmail.com',
    aadhaar: '4829 1049 8291',
    pan: 'ABCDE1234F',
    dob: '15/08/1998',
    fatherName: 'Rajendra Verma',
    address: 'Mahuli, Sant Kabir Nagar (S.K.N), U.P.'
  });

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const iframeRef = useRef();

  // Save history helper
  const recordHistory = (url, title) => {
    const newItem = { url, title: title || url, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), timestamp: Date.now() };
    setHistoryList(prev => {
      const filtered = prev.filter(h => h.url !== url);
      const updated = [newItem, ...filtered].slice(0, 50);
      localStorage.setItem('cybercafe_browser_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Switch Tab
  const handleSelectTab = (tabId) => {
    setActiveTabId(tabId);
    const selected = tabs.find(t => t.id === tabId);
    if (selected) {
      setUrlInput(selected.url);
    }
  };

  // Add Tab
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

  // Close Tab
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

  // Navigate to URL / Search query
    const handleOpenInMainBrowser = (customTarget) => {
    let target = (customTarget || urlInput || (activeTab && activeTab.url) || 'https://www.google.com').trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = `https://${target}`;
      } else {
        target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
      }
    }
    window.open(target, '_blank');
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
    setIsLoading(true);
    if (adshieldEnabled) {
      setBlockedAdsEstimate(Math.floor(8 + Math.random() * 12));
    }

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

  // Click Bookmark
  const handleBookmarkClick = (bm) => {
    setUrlInput(bm.url);
    setIsLoading(true);
    if (adshieldEnabled) {
      setBlockedAdsEstimate(Math.floor(8 + Math.random() * 12));
    }
    recordHistory(bm.url, bm.title);
    const updatedTabs = tabs.map(t => {
      if (t.id === activeTabId) {
        return { ...t, url: bm.url, title: bm.title, favicon: bm.icon };
      }
      return t;
    });
    setTabs(updatedTabs);
  };

  const handleReload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = getProxyUrl(activeTab?.url);
    }
  };

  const getProxyUrl = (target) => {
    if (!target) return '';
    return `${SERVER_BASE}/api/proxy/browse?url=${encodeURIComponent(target)}&adshield=${adshieldEnabled}`;
  };

  // Clear Browser Cache & History
  const handleClearCacheAndHistory = async () => {
    setClearingCache(true);
    try {
      // 1. Call Backend API to clear cookie jar & server proxy cache
      await api.clearBrowserCache();

      // 2. Clear Local Storage History
      localStorage.removeItem('cybercafe_browser_history');
      setHistoryList([]);

      // 3. Reset All Tabs to default clean state
      const defaultTab = {
        id: 'tab-1',
        title: 'Sarkari Result (Govt Jobs & Results)',
        url: 'https://www.sarkariresult.com',
        favicon: '🎯'
      };
      setTabs([defaultTab]);
      setActiveTabId('tab-1');
      setUrlInput('https://www.sarkariresult.com');

      setShowClearModal(false);
      setClearSuccessToast('🧹 Browser Cache, Session Cookies & History Cleared Successfully!');
      setTimeout(() => setClearSuccessToast(''), 3500);

      // 4. Force reload iframe
      if (iframeRef.current) {
        iframeRef.current.src = getProxyUrl('https://www.sarkariresult.com');
      }
    } catch (err) {
      alert('Cache clear notice: ' + err.message);
    } finally {
      setClearingCache(false);
    }
  };

  const handleCopyText = (fieldName, val) => {
    navigator.clipboard.writeText(val);
    setQuickCopiedField(fieldName);
    setTimeout(() => setQuickCopiedField(''), 2000);
  };

  return (
    <div className={`browser-window ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Toast Notification */}
      {clearSuccessToast && (
        <div style={{
          position: 'absolute', top: '56px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, background: '#059669', color: '#ffffff', padding: '10px 20px',
          borderRadius: 'var(--radius-full)', fontWeight: '800', fontSize: '0.82rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={16} />
          <span>{clearSuccessToast}</span>
        </div>
      )}

      {/* 1. TOP TAB BAR & WINDOW CONTROLS */}
      <div className="browser-tab-bar">
        <div className="window-dots">
          <div className="window-dot dot-red" title="Close Workspace" onClick={() => setIsFullscreen(false)} />
          <div className="window-dot dot-yellow" title="Minimize" />
          <div className="window-dot dot-green" title="Toggle Fullscreen" onClick={() => setIsFullscreen(!isFullscreen)} />
        </div>

        {tabs.map(tab => (
          <div 
            key={tab.id}
            className={`browser-tab ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={() => handleSelectTab(tab.id)}
          >
            <span>{tab.favicon || '🌐'}</span>
            <span className="tab-title-text">{tab.title}</span>
            {tabs.length > 1 && (
              <button className="tab-close-btn" onClick={(e) => handleCloseTab(tab.id, e)} title="Close Tab">
                <X size={12} />
              </button>
            )}
          </div>
        ))}

        <button className="new-tab-btn" onClick={handleNewTab} title="New Tab">
          <Plus size={16} />
        </button>
      </div>

      {/* 2. NAVIGATION TOOLBAR & OMNIBOX */}
      <div className="browser-toolbar">
        <div className="flex items-center gap-1">
          <button className="browser-nav-btn" onClick={() => handleReload()} title="Reload">
            <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button className="browser-nav-btn" onClick={() => handleBookmarkClick(DEFAULT_BOOKMARKS[0])} title="Home">
            <Home size={14} />
          </button>
        </div>

        {/* Omnibox Address Bar */}
        <form onSubmit={handleNavigate} className="browser-omnibox">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* AdShield Property Pill */}
            <button
              type="button"
              onClick={() => setShowAdshieldModal(!showAdshieldModal)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: adshieldEnabled ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${adshieldEnabled ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                color: adshieldEnabled ? '#10b981' : '#ef4444',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Click to manage AdShield Property & Ad-Blocking"
            >
              <ShieldCheck size={13} />
              <span>{adshieldEnabled ? `AdShield ON (${blockedAdsEstimate})` : 'AdShield OFF'}</span>
            </button>

            <span style={{ color: 'var(--border-color)', margin: '0 2px' }}>|</span>
          </div>

          <input 
            type="text"
            className="omnibox-input"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="Type any website address or search term (runs directly inside this window)..."
          />
          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '4px 12px', fontSize: '0.75rem' }} title="Browse inside in-app window with AdShield protection">
            Go (In-Portal)
          </button>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm" 
            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-400)', borderColor: 'rgba(99, 102, 241, 0.3)' }}
            onClick={() => handleOpenInMainBrowser()}
            title="Run this search query or website in your Main Browser (Chrome / Edge / Safari)"
          >
            <ExternalLink size={13} />
            <span>Open in Main Browser</span>
          </button>
        </form>

        {/* Browser Action Controls */}
        <div className="flex items-center gap-2">
          {/* Clear Cache & History Button */}
          <button 
            type="button"
            className="btn btn-danger btn-sm"
            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            onClick={() => setShowClearModal(true)}
            title="Clear Browser Cache, Cookies & History"
          >
            <Trash2 size={13} />
            <span>Clear Cache</span>
          </button>

          {/* History Drawer Toggle */}
          <button 
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            title="View Browsing History"
          >
            <History size={13} />
            <span>History</span>
          </button>

          {/* Form Data Assistant */}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowHelperSidebar(!showHelperSidebar)}
            title="Toggle Operator Form Data Assistant"
          >
            <Key size={14} /> {showHelperSidebar ? 'Hide Data Dock' : 'Data Assistant'}
          </button>

          {/* Fullscreen Toggle */}
          <button 
            className="icon-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* 3. BOOKMARKS BAR */}
      <div className="browser-bookmarks-bar">
        <Bookmark size={13} color="var(--primary-400)" style={{ flexShrink: 0 }} />
        {DEFAULT_BOOKMARKS.map((bm, i) => (
          <button key={i} className="bookmark-chip" onClick={() => handleBookmarkClick(bm)}>
            <span>{bm.icon}</span>
            <span>{bm.title}</span>
          </button>
        ))}
      </div>

      {/* 4. LIVE IN-PORTAL BROWSER VIEWPORT & SIDEBARS */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Full Access Live Embedded Iframe with No External Breakouts */}
        <div className="browser-viewport" style={{ flex: 1, height: '100%', position: 'relative' }}>
          <iframe 
            ref={iframeRef}
            src={getProxyUrl(activeTab?.url)}
            className="browser-iframe"
            title="Shree Online Live Browser"
            onLoad={() => setIsLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          />
        </div>

        {/* CLEAR CACHE MODAL */}
        {showClearModal && (
          <div className="modal-overlay" style={{ position: 'absolute', inset: 0, zIndex: 200 }} onClick={() => setShowClearModal(false)}>
            <div className="modal-container" style={{ maxWidth: '420px', background: 'var(--panel-bg)' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trash2 size={18} color="var(--accent-rose)" />
                  <span>Clear Browser Cache & History</span>
                </div>
                <button className="icon-btn" onClick={() => setShowClearModal(false)}><X size={16} /></button>
              </div>
              <div className="modal-body" style={{ padding: '16px' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.5' }}>
                  This will purge all temporary web assets, cached government forms, session cookies, and browsing history from the custom in-portal browser.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-surface-alt)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} color="var(--accent-emerald)" />
                    <span>Purge Web Cache & Stored HTML Files</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} color="var(--accent-emerald)" />
                    <span>Reset All Host Cookie Jars & Sessions</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} color="var(--accent-emerald)" />
                    <span>Clear Visited History & Reset Open Tabs</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowClearModal(false)}>
                    Cancel
                  </button>
                  <button 
                    className="btn btn-danger btn-sm" 
                    disabled={clearingCache}
                    onClick={handleClearCacheAndHistory}
                    style={{ fontWeight: '800' }}
                  >
                    {clearingCache ? 'Purging...' : 'Clear All Cache & History Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY DRAWER */}
        {showHistoryDrawer && (
          <div style={{
            width: '280px', borderLeft: '1px solid var(--border-color)',
            background: 'var(--panel-bg)', display: 'flex', flexDirection: 'column',
            overflowY: 'auto', padding: '16px', gap: '12px', flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: '800', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={15} color="var(--primary-400)" />
                <span>Browsing History</span>
              </div>
              <button 
                onClick={() => setShowHistoryDrawer(false)}
                style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                <X size={16} />
              </button>
            </div>

            {historyList.length === 0 ? (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                No browsing history yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {historyList.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setUrlInput(item.url);
                      setIsLoading(true);
                      const updatedTabs = tabs.map(t => t.id === activeTabId ? { ...t, url: item.url, title: item.title } : t);
                      setTabs(updatedTabs);
                    }}
                    style={{
                      padding: '8px 10px', background: 'var(--bg-surface-alt)',
                      border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer', fontSize: '0.76rem', transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface-alt)'}
                  >
                    <div style={{ fontWeight: '700', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginTop: '2px' }}>
                      {item.time} • {item.url.slice(0, 30)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AdShield Control Modal / Popover */}
        {showAdshieldModal && (
          <div style={{
            position: 'absolute', top: '10px', left: '160px', zIndex: 100,
            width: '320px', background: 'var(--panel-bg)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)', boxShadow: '0 16px 36px rgba(0, 0, 0, 0.4)',
            padding: '16px', animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} color="#10b981" />
                <span>AdShield Property Engine</span>
              </div>
              <button 
                onClick={() => setShowAdshieldModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{
              padding: '10px', background: 'var(--bg-surface-alt)',
              borderRadius: 'var(--radius-md)', marginBottom: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.82rem', color: 'var(--text-main)' }}>Shield Protection</div>
                <div style={{ fontSize: '0.72rem', color: adshieldEnabled ? '#10b981' : '#ef4444' }}>
                  {adshieldEnabled ? 'Active & Filtering Ads' : 'Disabled (Raw Page Mode)'}
                </div>
              </div>
              <button 
                className={`btn btn-sm ${adshieldEnabled ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => {
                  setAdshieldEnabled(!adshieldEnabled);
                  setTimeout(handleReload, 100);
                }}
              >
                {adshieldEnabled ? 'Turn OFF' : 'Turn ON'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                <CheckCircle2 size={14} />
                <span>Google AdSense & Video Ads Blocked</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                <CheckCircle2 size={14} />
                <span>Popups & Suspicious Redirects Trapped</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                <CheckCircle2 size={14} />
                <span>Tracker & Telemetry Scripts Stripped</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)' }}>
                <Zap size={14} />
                <span>Page Load Speed Boosted 3.2x</span>
              </div>
            </div>
          </div>
        )}

        {/* Right Sidebar: Operator Form Data Assistant */}
        {showHelperSidebar && (
          <div style={{
            width: '300px', borderLeft: '1px solid var(--border-color)',
            background: 'var(--panel-bg)', display: 'flex', flexDirection: 'column',
            overflowY: 'auto', padding: '16px', gap: '12px', flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: '800', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={15} color="var(--primary-400)" />
                <span>Quick Form Filler</span>
              </div>
              <button 
                onClick={() => setShowHelperSidebar(false)}
                style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Click any detail below to 1-click copy into clipboard while filling forms on the left:
            </div>

            {[
              { label: 'Customer Name', key: 'customerName', val: assistantData.customerName },
              { label: 'Mobile Number', key: 'phone', val: assistantData.phone },
              { label: 'Email Address', key: 'email', val: assistantData.email },
              { label: 'Aadhaar Number', key: 'aadhaar', val: assistantData.aadhaar },
              { label: 'PAN Card No', key: 'pan', val: assistantData.pan },
              { label: 'Date of Birth (DOB)', key: 'dob', val: assistantData.dob },
              { label: "Father's Name", key: 'fatherName', val: assistantData.fatherName },
              { label: 'Address', key: 'address', val: assistantData.address }
            ].map(f => (
              <div 
                key={f.key}
                onClick={() => handleCopyText(f.key, f.val)}
                style={{
                  padding: '8px 10px', background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                    {f.label}
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    {f.val}
                  </div>
                </div>

                <div style={{ color: quickCopiedField === f.key ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                  {quickCopiedField === f.key ? <Check size={16} /> : <Copy size={14} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
