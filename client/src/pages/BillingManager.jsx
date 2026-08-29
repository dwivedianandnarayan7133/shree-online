import React, { useState, useEffect } from 'react';
import { 
  Receipt, Plus, Printer, IndianRupee, 
  Trash2, CheckCircle2, Search, ArrowRight 
} from 'lucide-react';
import { api } from '../services/api';
import { BillModal } from '../components/BillModal';

export const BillingManager = () => {
  const [invoices, setInvoices] = useState([]);
  const [services, setServices] = useState([]);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  // New Invoice Form State
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState([
    { description: 'Black & White Document Print', quantity: 2, unitPrice: 5, total: 10 }
  ]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash', 'upi', 'card'
  const [viewInvoice, setViewInvoice] = useState(null);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const [invRes, servRes] = await Promise.all([
        api.getInvoices(),
        api.getPricing()
      ]);

      if (invRes.success) {
        setInvoices(invRes.invoices);
        setTodayRevenue(invRes.todayRevenue || 0);
        setTotalRevenue(invRes.totalRevenue || 0);
      }
      if (servRes.success) {
        setServices(servRes.services);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const handleAddItemFromCatalog = (service) => {
    setItems([
      ...items,
      { description: service.name, quantity: 1, unitPrice: service.basePrice, total: service.basePrice }
    ]);
  };

  const handleUpdateItem = (idx, field, val) => {
    const updated = items.map((item, i) => {
      if (i === idx) {
        const newItem = { ...item, [field]: val };
        newItem.total = Number(newItem.quantity || 1) * Number(newItem.unitPrice || 0);
        return newItem;
      }
      return item;
    });
    setItems(updated);
  };

  const handleRemoveItem = (idx) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.total || 0), 0);
  const grandTotal = Math.max(0, subtotal - Number(discount || 0));

  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (!customerName || items.length === 0) {
      alert('Please fill customer name and at least one item.');
      return;
    }

    const localInvoiceNumber = `SO-${Date.now().toString().slice(-6)}`;
    const invoicePayload = {
      invoiceNumber: localInvoiceNumber,
      customerName,
      customerPhone: customerPhone || '9876543210',
      items,
      subtotal,
      discount: Number(discount || 0),
      grandTotal,
      paymentMethod,
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      operatorName: 'Mahuli Desk'
    };

    // Instant local presentation
    setViewInvoice(invoicePayload);
    setInvoices(prev => [invoicePayload, ...prev]);
    setTodayRevenue(prev => prev + grandTotal);
    setTotalRevenue(prev => prev + grandTotal);

    // Sync to backend
    try {
      const res = await api.createInvoice({
        customerName,
        customerPhone,
        items,
        discount: Number(discount),
        paymentMethod,
        paymentStatus: 'paid'
      });
      if (res.success && res.invoice) {
        setViewInvoice(res.invoice);
      }
    } catch (err) {
      console.warn('Backend sync notice (offline mode active):', err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Receipt size={24} color="var(--accent-emerald)" />
            <span>Shree Online POS Billing & Invoicing (Mahuli, S.K.N)</span>
          </h1>
          <p className="page-subtitle">
            Generate instant customer receipts, thermal print invoices, and monitor daily revenue streams.
          </p>
        </div>
      </div>

      {/* Revenue KPI Summary */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div>
            <div className="stat-val" style={{ color: 'var(--accent-emerald)' }}>₹{todayRevenue}</div>
            <div className="stat-label">Today's Sales Revenue</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-val">₹{totalRevenue}</div>
            <div className="stat-label">Total Cumulative Revenue</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary-600)' }}>
            <Receipt size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-val">{invoices.length}</div>
            <div className="stat-label">Invoices Issued</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* POS Two Column Workspace */}
      <div className="tool-workspace">
        {/* Billing Form */}
        <div className="tool-panel">
          <form onSubmit={handleCreateBill} className="card">
            <div className="card-header">
              <div className="card-title">
                <Plus size={18} color="var(--primary-500)" />
                <span>New Invoice / POS Terminal</span>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Service Catalog Quick Add Buttons */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  + Quick Add Service Line Items
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {services.slice(0, 6).map(s => (
                    <button 
                      key={s._id}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleAddItemFromCatalog(s)}
                    >
                      + {s.name.split(' ')[0]} (₹{s.basePrice})
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Items Table */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '16px', background: 'var(--bg-surface-alt)' }}>
                <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '10px' }}>Line Items</div>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 1fr 1fr auto', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={item.description}
                      onChange={e => handleUpdateItem(idx, 'description', e.target.value)}
                      placeholder="Item description"
                      style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                    />
                    <input 
                      type="number" 
                      min="1"
                      className="form-input" 
                      value={item.quantity}
                      onChange={e => handleUpdateItem(idx, 'quantity', e.target.value)}
                      placeholder="Qty"
                      style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                    />
                    <input 
                      type="number" 
                      min="0"
                      className="form-input" 
                      value={item.unitPrice}
                      onChange={e => handleUpdateItem(idx, 'unitPrice', e.target.value)}
                      placeholder="Rate"
                      style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                    />
                    <div style={{ fontWeight: '700', fontSize: '0.85rem', textAlign: 'right' }}>
                      ₹{item.total}
                    </div>
                    <button type="button" onClick={() => handleRemoveItem(idx)} style={{ color: 'var(--accent-rose)', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals & Payment Method */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    <option value="cash">💵 Cash Received</option>
                    <option value="upi">📱 UPI / QR Code</option>
                    <option value="card">💳 Card POS</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Discount (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    className="form-input" 
                    value={discount}
                    onChange={e => setDiscount(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontWeight: '700', fontSize: '1rem' }}>Total Payable:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>₹{grandTotal}</span>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-full">
                <Printer size={16} /> Generate & Print Invoice
              </button>
            </div>
          </form>
        </div>

        {/* Invoices List */}
        <div className="tool-panel">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Receipt size={18} color="var(--primary-500)" />
                <span>Recent Invoices & Receipts</span>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Mode</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv._id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{inv.invoiceNumber}</td>
                        <td>{inv.customerName}</td>
                        <td style={{ fontWeight: '700' }}>₹{inv.grandTotal}</td>
                        <td>
                          <span className="badge badge-completed" style={{ fontSize: '0.68rem' }}>
                            {inv.paymentMethod?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setViewInvoice(inv)}
                          >
                            <Printer size={12} /> Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BillModal 
        isOpen={Boolean(viewInvoice)}
        onClose={() => setViewInvoice(null)}
        invoice={viewInvoice}
      />
    </div>
  );
};
