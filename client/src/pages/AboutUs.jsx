import React from 'react';
import { 
  Award, ShieldCheck, Clock, MapPin, Phone, MessageCircle, 
  Sparkles, CheckCircle2, Users, FileCheck, Layers, ArrowRight,
  HeartHandshake, Landmark, Star, Compass
} from 'lucide-react';

export const AboutUs = ({ setActivePage }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. HERO BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(16, 185, 129, 0.08) 50%, rgba(99, 102, 241, 0.14) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 28px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '780px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-400)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: '800', marginBottom: '14px' }}>
            <Award size={14} color="#f59e0b" />
            <span>Serving Citizens & Students Since 2013 (13+ Years of Trust)</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: '1.2' }}>
            Shree Online Sewa Kendra
          </h1>
          <p style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--primary-400)', marginTop: '4px' }}>
            Mahuli, Sant Kabir Nagar (S.K.N), Uttar Pradesh
          </p>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.6' }}>
            Established in <b>2013</b>, Shree Online Sewa Kendra has been the most trusted and reliable digital services landmark in Mahuli and surrounding regions of Sant Kabir Nagar. We deliver error-free government applications, student exam services, instant passport photo creation, universal document restoration, and citizen welfare assistance under one unified window.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontWeight: '700' }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
              <span>Est. 2013 (13+ Years Service)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontWeight: '700' }}>
              <Users size={16} color="var(--accent-cyan)" />
              <span>50,000+ Happy Customers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontWeight: '700' }}>
              <ShieldCheck size={16} color="var(--primary-400)" />
              <span>100% Reliable & Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OWNER & ADMIN LEADERSHIP MESSAGES WITH CIRCULAR PHOTOS */}
      <div>
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HeartHandshake size={22} color="var(--primary-500)" />
            <span>Leadership & Operational Messages</span>
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Meet the visionaries behind Shree Online Sewa Kendra, Mahuli, S.K.N
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {/* OWNER PROFILE CARD */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              {/* Circular Photo Avatar Frame */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  padding: '3px',
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444, #3b82f6)',
                  boxShadow: '0 8px 20px rgba(245, 158, 11, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#1e293b',
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '900',
                    fontSize: '1.7rem',
                    border: '2px solid #ffffff'
                  }}>
                    <span>AD</span>
                  </div>
                </div>
                <div style={{
                  position: 'absolute', bottom: '-2px', right: '-2px',
                  background: '#f59e0b', color: '#ffffff', borderRadius: '50%',
                  width: '26px', height: '26px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold',
                  border: '2px solid var(--panel-bg)'
                }}>
                  👑
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', color: '#f59e0b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Founder & Managing Owner
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-main)', marginTop: '2px' }}>
                  Anand Narayan Dwivedi
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Shree Online Sewa Kendra • Est. 2013
                </div>
              </div>
            </div>

            {/* Owner Quote / Message */}
            <div style={{
              background: 'var(--bg-surface-alt)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              position: 'relative'
            }}>
              <div style={{ fontSize: '1.8rem', color: '#f59e0b', position: 'absolute', top: '8px', left: '12px', opacity: 0.3, fontFamily: 'serif' }}>“</div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: '1.6', fontStyle: 'italic', position: 'relative', zIndex: 1, paddingLeft: '14px' }}>
                "Since founding Shree Online Sewa Kendra in <b>2013</b> here in Mahuli, our single goal has been to provide every student, youth, and family in Sant Kabir Nagar with reliable, honest, and high-speed digital services. Over these 13+ years, thousands of candidates have filled exam forms and received certificates through our center. We remain dedicated to your success and trust."
              </p>
            </div>

            {/* Owner Direct Contact */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <Phone size={14} color="var(--primary-400)" />
                <span>+91 9161400719</span>
              </div>
              <a
                href="https://wa.me/919161400719?text=Hello%20Shree%20Online%20Owner%20Desk,%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-success"
                style={{ fontSize: '0.75rem', padding: '4px 12px' }}
              >
                <MessageCircle size={14} /> WhatsApp Owner
              </a>
            </div>
          </div>

          {/* ADMIN PROFILE CARD */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              {/* Circular Photo Avatar Frame */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  padding: '3px',
                  background: 'linear-gradient(135deg, #10b981, #06b6d4, #6366f1)',
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#0f172a',
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '900',
                    fontSize: '1.7rem',
                    border: '2px solid #ffffff'
                  }}>
                    <span>KV</span>
                  </div>
                </div>
                <div style={{
                  position: 'absolute', bottom: '-2px', right: '-2px',
                  background: '#10b981', color: '#ffffff', borderRadius: '50%',
                  width: '26px', height: '26px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold',
                  border: '2px solid var(--panel-bg)'
                }}>
                  🛡️
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Technical Admin & Systems Architect
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-main)', marginTop: '2px' }}>
                  Krish Verma
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Cyber Infrastructure & Digital Operations
                </div>
              </div>
            </div>

            {/* Admin Quote / Message */}
            <div style={{
              background: 'var(--bg-surface-alt)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              position: 'relative'
            }}>
              <div style={{ fontSize: '1.8rem', color: '#10b981', position: 'absolute', top: '8px', left: '12px', opacity: 0.3, fontFamily: 'serif' }}>“</div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: '1.6', fontStyle: 'italic', position: 'relative', zIndex: 1, paddingLeft: '14px' }}>
                "We have engineered this portal with modern AdShield cyber protection, automatic NIC protocol fallbacks, and AI document studios to ensure 100% smooth operations. Whether generating A4 passport photo sheets with scissor guides or converting scanned papers to Word and Excel, our systems are built for supreme reliability."
              </p>
            </div>

            {/* Admin Direct Contact */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <Phone size={14} color="var(--primary-400)" />
                <span>+91 8090794210</span>
              </div>
              <a
                href="https://wa.me/918090794210?text=Hello%20Shree%20Online%20Admin,%20I%20need%20assistance"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.75rem', padding: '4px 12px' }}
              >
                <MessageCircle size={14} /> WhatsApp Helpline
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CORE MILESTONES TIMELINE (2013 - 2026) */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Landmark size={20} color="var(--primary-500)" />
            <span>Shree Online Journey & Milestones (2013 – 2026)</span>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              { year: '2013', title: 'Center Established', desc: 'Inception of Shree Online Sewa Kendra in Main Market, Mahuli, Sant Kabir Nagar (S.K.N).' },
              { year: '2016', title: 'CSC Digital India', desc: 'Authorized Common Service Center integration for Aadhaar, PAN, and citizen welfare schemes.' },
              { year: '2019', title: '25,000+ Citizens Served', desc: 'Achieved milestone of 25,000+ verified government exam applications and certificate issuances.' },
              { year: '2023', title: 'Studio Modernization', desc: 'Integrated high-speed laser printing, biometric verification, and digital photo studios.' },
              { year: '2026', title: 'Portal & AI Studio Launch', desc: 'Launched full-stack Cyber Cafe Management Portal with in-app browser, AdShield, and WhatsApp OTP.' }
            ].map((m, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                position: 'relative'
              }}>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary-400)',
                  fontWeight: '900',
                  fontSize: '0.85rem',
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-full)',
                  marginBottom: '8px'
                }}>
                  {m.year}
                </div>
                <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {m.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {m.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. CORE SERVICES OFFERED */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Sparkles size={20} color="var(--accent-emerald)" />
            <span>Comprehensive Digital Services at Mahuli, S.K.N</span>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {[
              { icon: '🎯', title: 'Govt Job & Exam Forms', desc: 'UPSSSC, SSC, Railway, Police, UPSC, NEET, JEE & Teaching recruitments.' },
              { icon: '📷', title: 'A4 Passport Photo Studio', desc: 'Exam sky-blue background replacement with 6 photos/line and easy-cut padding.' },
              { icon: '📄', title: 'Doc Restore & OCR Studio', desc: 'Multi-format text & table extraction to Word (.docx) & Excel (.xlsx).' },
              { icon: '💳', title: 'PAN & Aadhaar Services', desc: 'Instant e-PAN, NSDL/UTI correction, biometric sync and plastic card printing.' },
              { icon: '🏛️', title: 'e-District Uttar Pradesh', desc: 'Income, Caste, Domicile, Birth & Death certificates generation.' },
              { icon: '🖨️', title: 'High-Speed Printing & Scan', desc: 'A4/Legal Black & White, Color prints, Document lamination and book binding.' }
            ].map((srv, i) => (
              <div key={i} style={{
                display: 'flex', gap: '12px', padding: '12px 14px',
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{srv.icon}</div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>{srv.title}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>{srv.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {setActivePage && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                className="btn btn-primary"
                onClick={() => setActivePage('customer-portal')}
              >
                <span>Submit a Service Request Online</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
