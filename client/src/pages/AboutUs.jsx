import React, { useState, useEffect } from 'react';
import { 
  Award, ShieldCheck, HeartHandshake, Phone, Mail, 
  MapPin, CheckCircle2, MessageCircle, Clock, Sparkles,
  Layers, Users, Calendar, ArrowRight, ExternalLink
} from 'lucide-react';
import { api, getFullUrl } from '../services/api';
import { DEFAULT_CONFIG } from '../services/defaultConfig';

export const AboutUs = ({ setActivePage }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    api.getSystemConfig().then(res => {
      if (res && res.success && res.config) {
        setConfig(res.config);
      }
    }).catch(err => console.warn('AboutUs background sync:', err));
  }, []);

  const adminPhoto = config?.adminPhoto ? getFullUrl(config.adminPhoto) : '/admin-photo.jpg';
  const ownerPhoto = config?.ownerPhoto ? getFullUrl(config.ownerPhoto) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* 1. HERO & ESTABLISHMENT HEADER */}
      <section style={{ textAlign: 'center', padding: '30px 16px 20px 16px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ margin: '0 auto 16px auto', width: '120px', height: '70px', background: '#000000', padding: '6px', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo.png" alt="Shree Online" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(16, 185, 129, 0.12)', color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 18px',
          borderRadius: 'var(--radius-full)', fontSize: '0.86rem', fontWeight: '800', marginBottom: '16px'
        }}>
          <Award size={16} />
          <span>Established into {config?.establishedYear || '2013'} • 13+ Years of Continuous Service Excellence</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          Shree Online Sewa Kendra
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--primary-400)', fontWeight: '700', maxWidth: '750px', margin: '0 auto 16px auto' }}>
          {config?.tagline || 'One Window. Every Digital Service.'}
        </p>
        <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: '1.7', maxWidth: '900px', margin: '0 auto' }}>
          {config?.aboutUsText || 'Established in 2013, Shree Online Sewa Kendra has been the most trusted digital services landmark in Mahuli and across Sant Kabir Nagar. We deliver error-free government applications, student exam services, instant passport photo creation, universal document restoration, and citizen welfare assistance under one unified window.'}
        </p>

        {/* Center Highlights Bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px',
          marginTop: '28px', padding: '18px 24px', background: 'var(--bg-surface-alt)',
          borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#10b981' }}>13+ Years</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>Continuous Trust (Est. 2013)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--primary-400)' }}>100,000+</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>Exam & Citizen Forms Processed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#f59e0b' }}>100% Verified</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>Multi-Layer Form Accuracy</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#6366f1' }}>Fast Laser & AI</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>Instant Photo & OCR Studios</div>
          </div>
        </div>
      </section>

      {/* 2. FIRST OFFICIAL ADDRESS: MANAGING DIRECTOR & MAIN CONTROLLER (KAMAL NARAYAN DWIVEDI) */}
      <section style={{
        padding: '36px 28px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column', gap: '24px'
      }}>
        {/* Header Profile Info with BIG Circular Photo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
          {/* BIG Circular Photo (140px diameter) */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img 
              src={adminPhoto} 
              alt="Kamal Narayan Dwivedi" 
              style={{
                width: '140px', height: '140px', borderRadius: '50%',
                objectFit: 'cover', border: '5px solid #10b981',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                aspectRatio: '1/1'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/admin-photo.jpg';
              }}
            />
            <div style={{
              position: 'absolute', bottom: '4px', right: '4px',
              background: '#10b981', color: '#fff', borderRadius: '50%',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: '900', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', border: '2px solid #fff'
            }} title="Managing Director & Main Controller">
              🛡️
            </div>
          </div>

          {/* Name & Contact Desk */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
                {config?.adminName || 'Kamal Narayan Dwivedi'}
              </h2>
              <span className="badge badge-completed" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                {config?.adminRole || 'Managing Director & Main Controller'}
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '10px' }}>
              System Administrator & Technical Director • Shree Online Digital Architecture
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '0.88rem' }}>
              <a 
                href={`https://wa.me/91${config?.adminPhone || '8090794210'}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#25d366', fontWeight: '800', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <MessageCircle size={16} />
                <span>+91 {config?.adminPhone || '8090794210'}</span>
              </a>
              <a 
                href={`mailto:${config?.adminEmail || 'kdshree778@gmail.com'}`}
                style={{ color: 'var(--primary-400)', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Mail size={16} />
                <span>{config?.adminEmail || 'kdshree778@gmail.com'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Full In-Depth 500-Word Message Narrative */}
        <div style={{
          fontSize: '1rem',
          lineHeight: '1.9',
          color: 'var(--text-secondary)',
          textAlign: 'justify',
          background: 'var(--bg-surface)',
          padding: '28px 32px',
          borderRadius: 'var(--radius-lg)',
          borderLeft: '5px solid #10b981'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#10b981', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Managing Director & Main Controller's Technical & Operational Address</span>
          </h3>
          {(config?.adminQuote || '').split('\n\n').map((para, pIdx) => (
            <p key={pIdx} style={{ marginBottom: '16px' }}>
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* 3. SECOND OFFICIAL ADDRESS: FOUNDER & MANAGING OWNER (KRISHAN NARAYAN DWIVEDI) */}
      <section style={{
        padding: '36px 28px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column', gap: '24px'
      }}>
        {/* Header Profile Info with BIG Circular Photo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
          {/* BIG Circular Photo (140px diameter) */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {ownerPhoto ? (
              <img 
                src={ownerPhoto} 
                alt="Krishan Narayan Dwivedi" 
                style={{
                  width: '140px', height: '140px', borderRadius: '50%',
                  objectFit: 'cover', border: '5px solid #f59e0b',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
                  aspectRatio: '1/1'
                }}
              />
            ) : (
              <div style={{
                width: '140px', height: '140px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3rem', fontWeight: '900', border: '5px solid #f59e0b',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
                aspectRatio: '1/1'
              }}>
                KD
              </div>
            )}
            <div style={{
              position: 'absolute', bottom: '4px', right: '4px',
              background: '#f59e0b', color: '#000', borderRadius: '50%',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: '900', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', border: '2px solid #fff'
            }} title="Founder & Owner">
              👑
            </div>
          </div>

          {/* Name & Contact Desk */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
                {config?.ownerName || 'Krishan Narayan Dwivedi'}
              </h2>
              <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                {config?.ownerRole || 'Founder & Managing Owner'}
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '10px' }}>
              Pioneer of Digital Seva in Mahuli • Established Shree Online in 2013
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '0.88rem' }}>
              <a 
                href={`https://wa.me/91${config?.ownerPhone || '9161400719'}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#25d366', fontWeight: '800', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <MessageCircle size={16} />
                <span>+91 {config?.ownerPhone || '9161400719'}</span>
              </a>
              <a 
                href={`mailto:${config?.ownerEmail || 'onlinebaba111111@gmail.com'}`}
                style={{ color: 'var(--primary-400)', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Mail size={16} />
                <span>{config?.ownerEmail || 'onlinebaba111111@gmail.com'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Full In-Depth 500-Word Message Narrative */}
        <div style={{
          fontSize: '1rem',
          lineHeight: '1.9',
          color: 'var(--text-secondary)',
          textAlign: 'justify',
          background: 'var(--bg-surface)',
          padding: '28px 32px',
          borderRadius: 'var(--radius-lg)',
          borderLeft: '5px solid #f59e0b'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#f59e0b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Founder & Managing Owner's Message to Citizens & Students</span>
          </h3>
          {(config?.ownerQuote || '').split('\n\n').map((para, pIdx) => (
            <p key={pIdx} style={{ marginBottom: '16px' }}>
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* 4. SERVICES & CITIZEN CHARTER */}
      <section style={{ padding: '0 16px 30px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
            Core Operations & Digital Studios Under One Window
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Available 7 days a week from 08:00 AM to 09:00 PM at Mahuli Main Market
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {[
            { title: 'Recruitment & Exam Forms', desc: 'UP Police, SSC, Railway, UPSSSC PET, UPPSC, Teaching eligibility, and all Central & State exams with instant fee receipts.', icon: '📝' },
            { title: 'Citizen & Revenue Services', desc: 'Aadhaar updates, PAN card generation, Income/Caste/Domicile certificates, PM Kisan, and Bhulekh revenue land records.', icon: '📜' },
            { title: 'A4 Passport Photo Studio', desc: '6 photos per line, up to 42 photos on glossy sheet, with AI auto-background segmentation and exam guidelines.', icon: '📷' },
            { title: 'Document OCR & Restoration', desc: 'Scanned image & PDF restoration into fully editable Microsoft Word (.docx) and Excel spreadsheets.', icon: '✨' },
          ].map((s, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-surface-alt)', padding: '18px 20px',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontWeight: '800', fontSize: '0.96rem', color: 'var(--text-main)', marginBottom: '4px' }}>{s.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
