const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public route to view and search job alerts
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);

// Protected routes for Admin & Operators to manage job postings
router.post('/', verifyToken, requireRole('admin', 'operator'), jobController.createJob);
router.put('/:id', verifyToken, requireRole('admin', 'operator'), jobController.updateJob);
router.delete('/:id', verifyToken, requireRole('admin'), jobController.deleteJob);

module.exports = router;
