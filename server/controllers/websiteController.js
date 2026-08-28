const WebsiteShortcut = require('../models/WebsiteShortcut');

// Get all website shortcuts
const getShortcuts = async (req, res) => {
  try {
    const { category } = req.query;
    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }

    const shortcuts = await WebsiteShortcut.find(query).sort({ order: 1, title: 1 });
    res.json({ success: true, shortcuts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add new shortcut (Admin only)
const createShortcut = async (req, res) => {
  try {
    const { title, url, category, description, icon, badge } = req.body;
    if (!title || !url || !category) {
      return res.status(400).json({ success: false, message: 'Title, URL and Category are required.' });
    }

    const shortcut = await WebsiteShortcut.create({
      title,
      url,
      category,
      description: description || '',
      icon: icon || 'Globe',
      badge: badge || 'Official'
    });

    res.status(201).json({ success: true, message: 'Shortcut added.', shortcut });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete shortcut
const deleteShortcut = async (req, res) => {
  try {
    const { id } = req.params;
    await WebsiteShortcut.findByIdAndDelete(id);
    res.json({ success: true, message: 'Shortcut deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getShortcuts,
  createShortcut,
  deleteShortcut
};
