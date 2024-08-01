// routes/protected.js

const express = require('express');
const router = express.Router();
const protectedController = require('../controllers/protectedController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/protected', authenticateToken, protectedController.getProtectedData);

module.exports = router;
