const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/dashboard-data', authenticateToken, adminController.getDashboardData);
router.get('/claim-requests', authenticateToken, adminController.getClaimRequests);

module.exports = router;
