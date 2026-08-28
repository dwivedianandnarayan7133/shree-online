import React from 'react';
import { 
  Layers, MapPin, Phone, MessageCircle, Clock, ShieldCheck, 
  Award, ArrowUp, Sparkles, FileText, Camera, HeartHandshake,
  CheckCircle2, ExternalLink
} from 'lucide-react';

export const Footer = ({ setActivePage }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{
      marginTop: '40px',
      background: 'var(--panel-bg)',
      borderTop: '1px solid var(--border-color)',
      color: 'var(--text-main)',
      position: 'relative'
    }}>
      {/* Upper Footer: 4 Grid Columns */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '36px 24px 24px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '32px'
      }}>
        {/* Column 1: Brand & Legacy (Est. 2013) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div className="brand-icon-wrapper" style={{ width: '36px', height: '36px' }}>
              <Layers size={18} />
            </div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                Shree Online
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--primary-400)', fontWeight: '800', textTransform: 'uppercase' }}>
                Sewa Kendra • Est. 2013
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '14px' }}>
            Established in <b>2013</b>, Shree Online Sewa Kendra is Mahuli's premier digital services, CSC Seva, online government recruitment, and document processing center.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', fontWeight: '800' }}>
            <Award size={13} />
            <span>13+ Years of Continuous Service</span>
          </div>
        </div>

        {/* Column 2: Digital Studios & Services */}
        <div>
          <div style={{ fontWeight: '800', fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Digital Studios
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
            <button 
              onClick={() => { setActivePage('passport-photo'); scrollToTop(); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textAlign: 'left', cursor: 'pointer', padding: 0 }}
              onMouseEnter={e => e.target.style.color = 'var(--primary-400)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >
              📷 A4 Passport Photo Studio (6/Line)
            </button>
            <button 
              onClick={() => { setActivePage('conversion-studio'); scrollToTop(); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textAlign: 'left', cursor: 'pointer', padding: 0 }}
              onMouseEnter={e => e.target.style.color = 'var(--primary-400)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >
              ✨ Old Doc Restore & OCR (Word/Excel)
            </button>
            <button 
              onClick={() => { setActivePage('document-tools'); scrollToTop(); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textAlign: 'left', cursor: 'pointer', padding: 0 }}
              onMouseEnter={e => e.target.style.color = 'var(--primary-400)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >
              📄 Images to PDF & Merge Studio
            </button>
            <button 
              onClick={() => { setActivePage('customer-portal'); scrollToTop(); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textAlign: 'left', cursor: 'pointer', padding: 0 }}
              onMouseEnter={e => e.target.style.color = 'var(--primary-400)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >
              🌐 Online Form Submission & Live Tracking
            </button>
            <button 
              onClick={() => { setActivePage('about-us'); scrollToTop(); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textAlign: 'left', cursor: 'pointer', padding: 0 }}
              onMouseEnter={e => e.target.style.color = 'var(--primary-400)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >
              👥 About Us & Leadership Messages
            </button>
          </div>
        </div>

        {/* Column 3: Contact & Direct WhatsApp Desks */}
        <div>
          <div style={{ fontWeight: '800', fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Owner Desk & Helplines
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>Owner Desk (Primary WhatsApp):</div>
              <a 
                href="https://wa.me/919161400719" 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#25d366', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}
              >
                <MessageCircle size={14} />
                <span>+91 9161400719 (Krishan Narayan Dwivedi (onlinebaba111111@gmail.com))</span>
              </a>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>Technical Admin & Helpline:</div>
              <a 
                href="https://wa.me/918090794210" 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#25d366', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}
              >
                <MessageCircle size={14} />
                <span>+91 8090794210 (Kamal Narayan Dwivedi (kdshree778@gmail.com))</span>
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
              <Clock size={13} color="var(--primary-400)" />
              <span>Timings: Mon – Sun (08:00 AM – 09:00 PM)</span>
            </div>
          </div>
        </div>

        {/* Column 4: Location & Security Badges */}
        <div>
          <div style={{ fontWeight: '800', fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Service Location
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
            <MapPin size={16} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <b>Shree Online Sewa Kendra</b><br />
              Main Market, Mahuli, Sant Kabir Nagar (S.K.N),<br />
              Uttar Pradesh - 272172
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-emerald)' }}>
              <ShieldCheck size={14} />
              <span>256-Bit SSL Encrypted & AdShield Protected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary-400)' }}>
              <CheckCircle2 size={14} />
              <span>Authorized CSC & e-District Seva Center</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Back to Top */}
      <div style={{
        borderTop: '1px solid var(--border-color)',
        padding: '16px 24px',
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.76rem',
        color: 'var(--text-muted)'
      }}>
        <div>
          © 2013 – 2026 <b>Shree Online Sewa Kendra</b> • Mahuli, Sant Kabir Nagar (S.K.N), U.P. All rights reserved.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontStyle: 'italic', fontWeight: '600', color: 'var(--text-secondary)' }}>
            “One Window. Every Digital Service.”
          </span>
          <button 
            onClick={scrollToTop}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 10px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Scroll Back to Top"
          >
            <ArrowUp size={12} />
            <span>Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
