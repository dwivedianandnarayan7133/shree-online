const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  originalName: { type: String, required: true },
  fileName: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  actionType: { type: String, default: 'uploaded' },
  fileData: { type: Buffer },
  isTemporary: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now }
});

const requestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true, index: true },
  customerName: { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  customerEmail: { type: String, trim: true, default: '' },
  customerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  serviceCategory: { 
    type: String, 
    enum: ['Government Application', 'Document & Printing', 'Photo & ID', 'Conversion & OCR', 'Form Filling & Exam', 'General Digital Service'],
    default: 'General Digital Service' 
  },
  serviceName: { type: String, required: true, trim: true },
  instructions: { type: String, default: '' },
  submittedFiles: [fileSchema],
  processedFiles: [fileSchema],
  status: { 
    type: String, 
    enum: ['new', 'processing', 'waiting_customer', 'completed', 'cancelled', 'archived'], 
    default: 'new',
    index: true
  },
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    updatedBy: { type: String, default: 'System' }
  }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedOperatorName: { type: String, default: 'Unassigned' },
  operatorNotes: { type: String, default: '' },
  priority: { type: String, enum: ['normal', 'urgent', 'high'], default: 'normal' },
  totalCost: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);