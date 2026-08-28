const Invoice = require('../models/Invoice');
const ServiceItem = require('../models/ServiceItem');
const { generateInvoiceId } = require('../utils/idGenerator');
const { logAudit } = require('../utils/logger');

// Create Invoice / Bill
const createInvoice = async (req, res) => {
  try {
    const {
      requestId = '',
      customerName,
      customerPhone,
      items,
      discount = 0,
      taxPercent = 0,
      paymentMethod = 'cash',
      paymentStatus = 'paid',
      notes
    } = req.body;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide customer name and invoice items.' });
    }

    const calculatedItems = items.map(item => ({
      description: item.description,
      quantity: Number(item.quantity || 1),
      unitPrice: Number(item.unitPrice || 0),
      total: Number(item.quantity || 1) * Number(item.unitPrice || 0)
    }));

    const subtotal = calculatedItems.reduce((acc, item) => acc + item.total, 0);
    const disc = Number(discount || 0);
    const taxP = Number(taxPercent || 0);
    const taxAmount = ((subtotal - disc) * taxP) / 100;
    const grandTotal = Math.max(0, subtotal - disc + taxAmount);

    const invoiceNumber = generateInvoiceId();

    const invoice = await Invoice.create({
      invoiceNumber,
      requestId,
      customerName,
      customerPhone: customerPhone || '',
      items: calculatedItems,
      subtotal,
      discount: disc,
      taxPercent: taxP,
      taxAmount,
      grandTotal,
      paymentMethod,
      paymentStatus,
      operatorName: req.user ? req.user.name : 'Operator',
      notes: notes || 'Thank you for visiting Cyber Cafe Portal!'
    });

    await logAudit({
      action: 'INVOICE_CREATED',
      user: req.user ? req.user.name : 'Operator',
      details: { invoiceNumber, customerName, grandTotal }
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully.',
      invoice
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Invoices
const getInvoices = async (req, res) => {
  try {
    const { search, limit = 50, page = 1 } = req.query;
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { invoiceNumber: searchRegex },
        { customerName: searchRegex },
        { customerPhone: searchRegex }
      ];
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    // Summary calculations
    const allInvoices = await Invoice.find({});
    const totalRevenue = allInvoices.reduce((acc, inv) => acc + (inv.paymentStatus === 'paid' ? inv.grandTotal : 0), 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = allInvoices
      .filter(inv => new Date(inv.createdAt) >= today && inv.paymentStatus === 'paid')
      .reduce((acc, inv) => acc + inv.grandTotal, 0);

    res.json({
      success: true,
      total,
      totalRevenue,
      todayRevenue,
      invoices
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Pricing Catalog
const getPricingCatalog = async (req, res) => {
  try {
    const services = await ServiceItem.find({}).sort({ category: 1, name: 1 });
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Service Price
const updateServicePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { basePrice, isActive, estimatedMinutes } = req.body;

    const service = await ServiceItem.findById(id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service item not found.' });
    }

    if (basePrice !== undefined) service.basePrice = Number(basePrice);
    if (isActive !== undefined) service.isActive = isActive;
    if (estimatedMinutes !== undefined) service.estimatedMinutes = Number(estimatedMinutes);

    await service.save();
    res.json({ success: true, message: 'Service item updated.', service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getPricingCatalog,
  updateServicePrice
};
