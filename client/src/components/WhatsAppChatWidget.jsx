import React, { useState } from 'react';
import { MessageCircle, Send, X, Phone, ShieldCheck, ExternalLink, Sparkles, User, Clock, Mail } from 'lucide-react';

const WHATSAPP_NUMBERS = [
  {
    name: 'Krishan Narayan Dwivedi (Owner Desk)',
    number: '9161400719',
    display: '+91 9161400719',
    email: 'onlinebaba111111@gmail.com',
    badge: 'Founder & Owner • Mahuli',
    status: 'Online'
  },
  {
    name: 'Kamal Narayan Dwivedi (Admin Desk)',
    number: '8090794210',
    display: '+91 8090794210',
    email: 'kdshree778@gmail.com',
    badge: 'Admin & Technical Support',
    status: 'Online'
  }
];

const QUICK_TOPICS = [
  'Hello Shree Online Mahuli, I want to apply for a new online form.',
  'Please check my document and application processing status.',
  'I need urgent passport photo printing & document scanning.',
  'I have a question regarding PAN card / Aadhaar service.'
];

export const WhatsAppChatWidget = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState('9161400719');
  const [customMsg, setCustomMsg] = useState('');

  const handleStartChat = (targetNumber, msgText) => {
    const textToSend = msgText || customMsg || `Hello Shree Online (Mahuli, S.K.N), I am contacting from the digital portal.`;
    const fullMsg = currentUser 
      ? `${textToSend}\n\n— From: ${currentUser.name} (${currentUser.phone || currentUser.email})`
      : textToSend;

    const waUrl = `https://wa.me/91${targetNumber}?text=${encodeURIComponent(fullMsg)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* 1. EXPANDED CONVERSATION WINDOW */}
      {isOpen && (
        <div style={{
          width: '360px',
          background: 'var(--panel-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '14px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #128c7e 0%, #075e54 100%)',
            color: '#ffffff',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <MessageCircle size={22} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.94rem' }}>
                  Shree Online Support Desk
                </div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#25d366', display: 'inline-block' }}></span>
                  <span>Est. 2013 • Mahuli, S.K.N</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent', border: 'none', color: '#ffffff',
                cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center'
              }}
              title="Close WhatsApp Window"
            >
              <X size={18} />
            </button>
          </div>

          {/* Desk Selector */}
          <div style={{ padding: '12px 16px', background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Select Leadership Desk:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {WHATSAPP_NUMBERS.map(num => (
                <div
                  key={num.number}
                  onClick={() => setSelectedNumber(num.number)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: selectedNumber === num.number ? '1.5px solid #25d366' : '1px solid var(--border-color)',
                    background: selectedNumber === num.number ? 'rgba(37, 211, 102, 0.1)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                      {num.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#25d366', fontWeight: '700' }}>
                      {num.display} • {num.badge}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {num.email}
                    </div>
                  </div>
                  {selectedNumber === num.number && (
                    <span style={{ fontSize: '0.72rem', background: '#25d366', color: '#fff', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: '800' }}>
                      Active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Chat Topics */}
          <div style={{ padding: '14px 16px', maxHeight: '200px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              1-Click Quick Inquiries:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {QUICK_TOPICS.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => handleStartChat(selectedNumber, topic)}
                  style={{
                    textAlign: 'left',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 10px',
                    fontSize: '0.76rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#25d366'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <span style={{ flex: 1 }}>{topic}</span>
                  <ExternalLink size={12} color="#25d366" style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            <form onSubmit={(e) => { e.preventDefault(); handleStartChat(selectedNumber, customMsg); }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type message to owner/admin..."
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  style={{ fontSize: '0.8rem', height: '36px' }}
                />
                <button
                  type="submit"
                  className="btn btn-sm btn-primary"
                  style={{ background: '#25d366', borderColor: '#25d366', color: '#fff', padding: '0 12px' }}
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. FLOATING TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Chat with Shree Online Owner & Admin"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={28} />}
        
        {/* Pulse Indicator */}
        <span style={{
          position: 'absolute', top: '2px', right: '2px',
          width: '12px', height: '12px', borderRadius: '50%',
          background: '#ffffff', border: '2px solid #25d366'
        }} />
      </button>
    </div>
  );
};
