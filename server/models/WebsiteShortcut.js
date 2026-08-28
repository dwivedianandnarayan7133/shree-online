const mongoose = require('mongoose');

const websiteShortcutSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['Government Services', 'Education & Exams', 'Banking & Financial', 'Railway & Travel', 'Employment & CSC', 'Utility Services', 'Document Tools'],
    required: true 
  },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Globe' },
  badge: { type: String, default: 'Official' },
  isVerified: { type: Boolean, default: true },
  requiresNewTab: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteShortcut', websiteShortcutSchema);