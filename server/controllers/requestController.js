const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Request = require('../models/Request');
const { generateRequestId } = require('../utils/idGenerator');
const { logAudit } = require('../utils/logger');
const { broadcastRequestUpdate, broadcastNotification } = require('../services/socketService');
const emailService = require('../services/emailService');

// Customer or Operator creates request
const createRequest = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      serviceCategory,
      serviceName,
      instructions,
      priority = 'normal'
    } = req.body;

    if (!customerName || !customerPhone || !serviceName) {
      return res.status(400).json({ success: false, message: 'Please provide Customer Name, Phone, and Service Name.' });
    }

    const files = req.files || [];
    const submittedFiles = files.map(file => ({
      fileId: uuidv4(),
      originalName: file.originalname,
      fileName: file.filename || `${Date.now()}-${uuidv4().substring(0,6)}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      path: file.path || 'database-binary',
      size: file.size,
      mimeType: file.mimetype,
      actionType: 'uploaded',
      fileData: file.buffer || null
    }));

    const requestId = generateRequestId();

    const request = await Request.create({
      requestId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      customerUser: req.user ? req.user._id : null,
      serviceCategory: serviceCategory || 'General Digital Service',
      serviceName,
      instructions: instructions || '',
      submittedFiles,
      priority,
      status: 'new',
      statusHistory: [{
        status: 'new',
        timestamp: new Date(),
        note: 'Request received and queued.',
        updatedBy: req.user ? req.user.name : 'Customer'
      }]
    });

    await logAudit({
      action: 'REQUEST_CREATED',
      user: req.user ? req.user.name : customerName,
      role: req.user ? req.user.role : 'customer',
      details: { requestId, serviceName, filesCount: submittedFiles.length }
    });

    // Send email notifications asynchronously without blocking the response
    if (customerEmail) {
      emailService.sendNewRequestEmailToCustomer(customerEmail, request).catch(e => console.error('Customer Mail err', e));
    }
    emailService.sendNewRequestEmailToOperator(request).catch(e => console.error('Operator Mail err', e));

    // Real-time broadcast to dashboard operators
    broadcastRequestUpdate(request.toObject ? request.toObject() : request);
    broadcastNotification({
      title: 'New Service Request',
      message: `Request ${requestId} received from ${customerName} for ${serviceName}`,
      type: 'info'
    });

    res.status(201).json({
      success: true,
      message: 'Request created successfully.',
      request
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get requests with search, filters, pagination
const getRequests = async (req, res) => {
  try {
    const { status, search, limit = 50, page = 1, myRequestsOnly } = req.query;
    const query = {};

    // If customer user requesting their own requests
    if (myRequestsOnly && req.user) {
      query.$or = [
        { customerUser: req.user._id },
        { customerPhone: req.user.phone },
        { customerEmail: req.user.email }
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(sanitized, 'i');
      query.$or = [
        { requestId: searchRegex },
        { tokenNumber: searchRegex },
        { customerName: searchRegex },
        { customerPhone: searchRegex },
        { customerEmail: searchRegex },
        { serviceName: searchRegex }
      ];
    }

    const total = await Request.countDocuments(query);
    const requests = await Request.find(query)
      .select('-submittedFiles.fileData -processedFiles.fileData')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      requests
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single request by ID or requestId string (e.g. CA-2026-123456)
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    let request;

    if (id.startsWith('CA-')) {
      request = await Request.findOne({ requestId: id }).select('-submittedFiles.fileData -processedFiles.fileData');
    } else {
      request = await Request.findById(id).select('-submittedFiles.fileData -processedFiles.fileData');
    }

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update request status (New -> Processing -> Waiting -> Completed -> Cancelled)
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note = '', operatorNotes } = req.body;

    const request = await Request.findOne({ $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { requestId: id }] });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    request.status = status;
    if (operatorNotes !== undefined) request.operatorNotes = operatorNotes;
    if (status === 'completed') request.completedAt = new Date();

    request.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`,
      updatedBy: req.user ? req.user.name : 'Operator'
    });

    await request.save();

    await logAudit({
      action: 'REQUEST_STATUS_UPDATED',
      user: req.user ? req.user.name : 'Operator',
      role: req.user ? req.user.role : 'operator',
      details: { requestId: request.requestId, newStatus: status, note }
    });

    broadcastRequestUpdate(request.toObject ? request.toObject() : request);
    broadcastNotification({
      title: `Request ${request.requestId} Updated`,
      message: `Status is now: ${status.toUpperCase()}`,
      type: status === 'completed' ? 'success' : 'info'
    });

    res.json({ success: true, message: 'Request updated.', request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Attach processed file to request
const addProcessedFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType = 'processed', notes = '' } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const request = await Request.findOne({ $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { requestId: id }] });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const processedFile = {
      fileId: uuidv4(),
      originalName: file.originalname,
      fileName: file.filename || `${Date.now()}-${uuidv4().substring(0,6)}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      path: file.path || 'database-binary',
      size: file.size,
      mimeType: file.mimetype,
      actionType,
      notes,
      fileData: file.buffer || null,
      uploadedAt: new Date()
    };

    request.processedFiles.push(processedFile);
    request.status = 'completed';
    request.completedAt = new Date();
    request.statusHistory.push({
      status: 'completed',
      timestamp: new Date(),
      note: `Processed file ${file.originalname} attached. Service complete.`,
      updatedBy: req.user ? req.user.name : 'Operator'
    });

    await request.save();

    broadcastRequestUpdate(request.toObject ? request.toObject() : request);
    broadcastNotification({
      title: `Processed File Ready: ${request.requestId}`,
      message: `${file.originalname} has been delivered for customer ${request.customerName}.`,
      type: 'success'
    });

    res.json({ success: true, message: 'File attached and request marked completed.', request, file: processedFile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Assign operator to request
const assignOperator = async (req, res) => {
  try {
    const { id } = req.params;
    const { operatorId, operatorName } = req.body;

    const request = await Request.findOne({ $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { requestId: id }] });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    request.assignedTo = operatorId || null;
    request.assignedOperatorName = operatorName || 'Unassigned';
    request.statusHistory.push({
      status: request.status,
      timestamp: new Date(),
      note: `Assigned to ${operatorName}`,
      updatedBy: req.user.name
    });

    await request.save();
    broadcastRequestUpdate(request.toObject ? request.toObject() : request);

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  addProcessedFile,
  assignOperator
};
