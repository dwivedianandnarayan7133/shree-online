const PrintJob = require('../models/PrintJob');
const { generatePrintJobId } = require('../utils/idGenerator');
const { broadcastPrintJobUpdate } = require('../services/socketService');

// Create Print Job
const createPrintJob = async (req, res) => {
  try {
    const file = req.file;
    const {
      title,
      copies = 1,
      colorMode = 'bw',
      paperSize = 'A4',
      orientation = 'portrait',
      pageRange = 'all',
      doubleSided = false,
      customerName = 'Walk-in Customer',
      cost = 5,
      operatorNotes = ''
    } = req.body;

    const fileName = file ? file.filename : 'document_direct_print.pdf';
    const filePath = file ? file.path : 'direct_buffer';
    const fileSize = file ? file.size : 0;

    const jobId = generatePrintJobId();

    const printJob = await PrintJob.create({
      jobId,
      title: title || (file ? file.originalname : 'Quick Print Job'),
      fileName,
      filePath,
      fileSize,
      copies: Number(copies),
      colorMode,
      paperSize,
      orientation,
      pageRange,
      doubleSided: doubleSided === 'true' || doubleSided === true,
      customerName,
      cost: Number(cost),
      operatorNotes,
      status: 'pending'
    });

    broadcastPrintJobUpdate(printJob);

    res.status(201).json({
      success: true,
      message: 'Print job added to queue.',
      printJob
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Print Queue
const getPrintJobs = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const printJobs = await PrintJob.find(query).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, printJobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Print Job Status (Pending -> Printing -> Completed)
const updatePrintJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const printJob = await PrintJob.findById(id);
    if (!printJob) {
      return res.status(404).json({ success: false, message: 'Print job not found.' });
    }

    printJob.status = status;
    if (status === 'completed') {
      printJob.completedAt = new Date();
    }

    await printJob.save();
    broadcastPrintJobUpdate(printJob);

    res.json({ success: true, message: `Print job marked as ${status}.`, printJob });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createPrintJob,
  getPrintJobs,
  updatePrintJobStatus
};
