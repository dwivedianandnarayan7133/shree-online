import React, { useState, useEffect } from 'react';
import { 
  Globe, Search, ExternalLink, ShieldCheck, 
  CreditCard, BookOpen, Train, Briefcase, Award, Building, Store,
  Compass, LayoutGrid
} from 'lucide-react';
import { api } from '../services/api';
import { CyberBrowser } from '../components/CyberBrowser';

export const WebsiteLauncher = () => {
  const [viewMode, setViewMode] = useState('browser'); // 'browser' (Interactive Multi-tab) or 'directory' (Cards Grid)
  const [shortcuts, setShortcuts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState('https://www.digilocker.gov.in/');

  const categories = [
    'all',
    'Government Services',
    'Education & Exams',
    'Banking & Financial',
    'Railway & Travel',
    'Employment & CSC'
  ];

  const fetchShortcuts = async () => {
    setLoading(true);
    try {
      let query = selectedCategory !== 'all' ? `category=${encodeURIComponent(selectedCategory)}` : '';
      const res = await api.getShortcuts(query);
      if (res.success) {
        setShortcuts(res.shortcuts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortcuts();
  }, [selectedCategory]);

  const filteredShortcuts = shortcuts.filter(s => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return s.title.toLowerCase().includes(term) || s.description?.toLowerCase().includes(term);
  });

  const handleLaunch = (url) => {
    setSelectedUrl(url);
    setViewMode('browser');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Globe size={24} color="var(--primary-400)" />
            <span>Shree Online Official Web Gateway (Mahuli, S.K.N)</span>
          </h1>
          <p className="page-subtitle">
            Integrated multi-tab web workspace with AdShield protection for official government, exam, and banking websites.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button 
            className={`btn btn-sm ${viewMode === 'browser' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('browser')}
          >
            <Compass size={14} /> Multi-Tab Browser View
          </button>
          <button 
            className={`btn btn-sm ${viewMode === 'directory' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('directory')}
          >
            <LayoutGrid size={14} /> Portal Shortcuts Directory
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="notice-banner notice-shield" style={{ marginBottom: '20px' }}>
        <ShieldCheck size={20} style={{ flexShrink: 0 }} />
        <div>
          <b>Security & Privacy Guarantee:</b> Sandboxed navigation blocks intrusive advertisements and tracking scripts. This portal never collects, modifies, or intercepts customer passwords or OTPs.
        </div>
      </div>

      {/* VIEW 1: STANDALONE MULTI-TAB BROWSER WORKSPACE */}
      {viewMode === 'browser' && (
        <div>
          <CyberBrowser initialUrl={selectedUrl} />
        </div>
      )}

      {/* VIEW 2: CATEGORIZED SHORTCUTS DIRECTORY */}
      {viewMode === 'directory' && (
        <div>
          {/* Search & Category Filter Bar */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-body" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {categories.map(c => (
                  <button 
                    key={c}
                    className={`btn btn-sm ${selectedCategory === c ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedCategory(c)}
                  >
                    {c === 'all' ? 'All Portals' : c}
                  </button>
                ))}
              </div>

              <div style={{ minWidth: '260px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search portal name (e.g. Aadhaar, SSC, PAN)..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* Shortcuts Grid */}
          <div className="shortcuts-grid">
            {filteredShortcuts.map(s => (
              <div 
                key={s._id} 
                className="shortcut-card"
                onClick={() => handleLaunch(s.url)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--primary-600), var(--accent-cyan))',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Globe size={22} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-main)' }}>{s.title}</span>
                    <ExternalLink size={14} color="var(--primary-400)" />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.3' }}>
                    {s.description}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="badge badge-completed" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                      {s.badge || 'Official'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {s.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
