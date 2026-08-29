import React from 'react';
import { X, Printer } from 'lucide-react';

export const BillModal = ({ isOpen, onClose, invoice }) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    const receiptContent = document.getElementById('printable-receipt');
    if (!receiptContent) {
      window.print();
      return;
    }

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${invoice.invoiceNumber || 'INV'}</title>
          <style>
            @page { margin: 4mm; size: auto; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, monospace, sans-serif; 
              margin: 0; 
              padding: 6px; 
              color: #000; 
              background: #fff; 
            }
            .receipt-paper { 
              max-width: 320px; 
              margin: 0 auto; 
              padding: 12px; 
              border: 1px dashed #666;
              box-sizing: border-box;
            }
            .receipt-header { text-align: center; margin-bottom: 10px; }
            .receipt-header h3 { margin: 0; font-size: 18px; font-weight: 900; }
            .receipt-header p { margin: 2px 0; font-size: 11px; }
            .receipt-line { display: flex; justify-content: space-between; font-size: 11px; margin: 4px 0; }
            .receipt-total { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 6px 0; margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="receipt-paper">
            ${receiptContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      setTimeout(() => {
        try {
          document.body.removeChild(printFrame);
        } catch (e) {}
      }, 1500);
    }, 250);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div style={{ fontWeight: '700', fontSize: '1rem' }}>Receipt / Bill Preview — Shree Online</div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ background: '#f8fafc', padding: '24px 16px' }}>
          <div className="receipt-paper" id="printable-receipt">
            <div className="receipt-header">
              <img src="/logo.png" alt="Shree Online" style={{ height: '36px', display: 'block', margin: '0 auto 6px auto', background: '#000', padding: '2px', borderRadius: '6px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', textTransform: 'uppercase', color: '#1e293b' }}>SHREE ONLINE</h3>
              <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#4338ca' }}>Digital Seva & CSC Center • Mahuli, S.K.N</p>
              <p style={{ fontSize: '0.72rem', color: '#555' }}>Main Market, Mahuli, Sant Kabir Nagar (S.K.N), U.P.</p>
              <p style={{ fontSize: '0.72rem', color: '#555' }}>WhatsApp: +91 9161400719 / +91 8090794210 • Reg: CSC-SKN-MAHULI-01</p>
              <div style={{ margin: '8px 0', borderTop: '1px dashed #000' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>Bill: <b>{invoice.invoiceNumber || 'INV-2026-001'}</b></span>
                <span>Date: {new Date(invoice.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
              <div style={{ textAlign: 'left', fontSize: '0.75rem', marginTop: '4px' }}>
                Customer: <b>{invoice.customerName}</b> {invoice.customerPhone ? `(${invoice.customerPhone})` : ''}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div className="receipt-line" style={{ fontWeight: '700', borderBottom: '1px solid #000', paddingBottom: '4px' }}>
                <span style={{ width: '55%' }}>Item / Service</span>
                <span style={{ width: '15%', textAlign: 'center' }}>Qty</span>
                <span style={{ width: '30%', textAlign: 'right' }}>Amount</span>
              </div>
              {invoice.items?.map((item, idx) => (
                <div key={idx} className="receipt-line">
                  <span style={{ width: '55%' }}>{item.description}</span>
                  <span style={{ width: '15%', textAlign: 'center' }}>{item.quantity}</span>
                  <span style={{ width: '30%', textAlign: 'right' }}>₹{item.total || item.unitPrice * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="receipt-total">
              <div className="receipt-line">
                <span>Subtotal:</span>
                <span>₹{invoice.subtotal}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="receipt-line" style={{ color: '#059669' }}>
                  <span>Discount:</span>
                  <span>- ₹{invoice.discount}</span>
                </div>
              )}
              <div className="receipt-line" style={{ fontSize: '1.05rem', fontWeight: '800', marginTop: '4px' }}>
                <span>Grand Total:</span>
                <span>₹{invoice.grandTotal}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#555', marginTop: '8px' }}>
              <p>Payment Mode: <b>{invoice.paymentMethod?.toUpperCase()} ({invoice.paymentStatus?.toUpperCase()})</b></p>
              <p style={{ marginTop: '4px' }}>Operator: {invoice.operatorName || 'Shree Online Desk'}</p>
              <p style={{ marginTop: '8px', fontStyle: 'italic', fontWeight: '600' }}>“One Window. Every Digital Service.”</p>
              <p>Thank you for visiting Shree Online, Mahuli, S.K.N!</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print Receipt
          </button>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
