

// routes/notifications.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:userId', (req, res) => {
    const userId = req.params.userId;

    pool.query('SELECT * FROM tbl_123_notifications WHERE userId = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Internal Server Error' });
        res.json(results);
    });
});

router.put('/mark-read', (req, res) => {
    const { notificationIds } = req.body;

    pool.query('UPDATE tbl_123_notifications SET isRead = 1 WHERE id IN (?)', [notificationIds], (err) => {
        if (err) return res.status(500).json({ error: 'Internal Server Error' });
        res.json({ success: true });
    });
});

module.exports = router;
