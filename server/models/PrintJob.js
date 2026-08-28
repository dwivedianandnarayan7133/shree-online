const mongoose = require('mongoose');

const printJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, default: 0 },
  copies: { type: Number, default: 1, min: 1 },
  colorMode: { type: String, enum: ['bw', 'color'], default: 'bw' },
  paperSize: { type: String, enum: ['A4', '4x6', 'Letter', 'Legal', 'A3'], default: 'A4' },
  orientation: { type: String, enum: ['portrait', 'landscape'], default: 'portrait' },
  pageRange: { type: String, default: 'all' },
  doubleSided: { type: Boolean, default: false },
  customerName: { type: String, default: 'Walk-in Customer' },
  status: { type: String, enum: ['pending', 'printing', 'completed', 'cancelled'], default: 'pending', index: true },
  cost: { type: Number, default: 5 },
  operatorNotes: { type: String, default: '' },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('PrintJob', printJobSchema);