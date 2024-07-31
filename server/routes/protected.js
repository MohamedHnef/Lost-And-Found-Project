const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');
const logger = require('../logger');

router.get('/protected', authenticateToken, (req, res) => {
    pool.query('SELECT * FROM tbl_123_users WHERE id = ?', [req.user.id], (err, results) => {
        if (err) {
            logger.error(`Error fetching user: ${err.message}`);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user: results[0] });
    });
});

module.exports = router;