const mongoose = require('mongoose');

const serviceItemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { 
    type: String, 
    enum: ['Document Tools', 'Image Tools', 'Conversion & OCR', 'Printing & Scanning', 'Govt & CSC Services', 'Utilities'],
    required: true 
  },
  basePrice: { type: Number, required: true, default: 10 },
  unit: { type: String, default: 'per page/copy' },
  description: { type: String, default: '' },
  estimatedMinutes: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
  icon: { type: String, default: 'FileText' }
}, { timestamps: true });

module.exports = mongoose.model('ServiceItem', serviceItemSchema);