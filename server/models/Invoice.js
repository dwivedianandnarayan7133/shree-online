const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  requestId: { type: String, default: '' },
  customerName: { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  items: [invoiceItemSchema],
  subtotal: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true, default: 0 },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'online', 'pending'], default: 'cash' },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'cancelled'], default: 'paid' },
  operatorName: { type: String, default: 'Admin Operator' },
  notes: { type: String, default: 'Thank you for visiting Cyber Cafe Portal!' }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
