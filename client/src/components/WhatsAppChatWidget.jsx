import React, { useState } from 'react';
import { MessageCircle, Send, X, Phone, ShieldCheck, ExternalLink, Sparkles, User, Clock } from 'lucide-react';

const WHATSAPP_NUMBERS = [
  {
    name: 'Shree Online Desk 1 (Primary)',
    number: '9161400719',
    display: '+91 9161400719',
    badge: 'Main Counter • Mahuli',
    status: 'Online'
  },
  {
    name: 'Shree Online Desk 2 (Operator Helpline)',
    number: '8090794210',
    display: '+91 8090794210',
    badge: 'Form Filling & Support',
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
          width: '350px',
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
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: '#ffffff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#075e54', fontWeight: 'bold'
              }}>
                <MessageCircle size={22} color="#075e54" />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>Shree Online WhatsApp</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#25d366', display: 'inline-block' }} />
                  <span>Mahuli, S.K.N • Instant Support</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.8 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '16px', maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Number Selector Cards */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '8px' }}>Select WhatsApp Number:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {WHATSAPP_NUMBERS.map(wa => (
                  <div 
                    key={wa.number}
                    onClick={() => setSelectedNumber(wa.number)}
                    style={{
                      padding: '10px 12px',
                      background: selectedNumber === wa.number ? 'rgba(37, 211, 102, 0.1)' : 'var(--bg-surface-alt)',
                      border: `1.5px solid ${selectedNumber === wa.number ? '#25d366' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        {wa.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#25d366', fontWeight: '800', marginTop: '2px' }}>
                        {wa.display}
                      </div>
                    </div>
                    <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>
                      {wa.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Topic Chips */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '6px' }}>Quick Message Prompts:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {QUICK_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleStartChat(selectedNumber, topic)}
                    style={{
                      padding: '8px 10px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.74rem',
                      textAlign: 'left',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => e.target.style.background = 'var(--bg-surface-alt)'}
                    onMouseLeave={e => e.target.style.background = 'var(--bg-surface)'}
                  >
                    💬 {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message Input */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '6px' }}>Custom Message:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Type your question..."
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleStartChat(selectedNumber, customMsg); }}
                  style={{ fontSize: '0.82rem' }}
                />
                <button 
                  className="btn btn-primary"
                  style={{ background: '#25d366', borderColor: '#25d366', padding: '0 14px' }}
                  onClick={() => handleStartChat(selectedNumber, customMsg)}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '10px 16px',
            background: 'var(--bg-surface-alt)',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            📍 Shree Online • Main Market, Mahuli, Sant Kabir Nagar (S.K.N)
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
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Chat on WhatsApp (+91 9161400719 / +91 8090794210)"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};
