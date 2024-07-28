const express = require('express');
const router = express.Router();
const pool = require('../db');
const logger = require('../logger');

// Endpoint to fetch notifications for a user
router.get('/:userId', (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        logger.warn('Missing userId parameter');
        return res.status(400).json({ error: 'Missing userId parameter' });
    }

    const query = 'SELECT * FROM tbl_123_notifications WHERE userId = ?';
    pool.query(query, [userId], (err, results) => {
        if (err) {
            logger.error(`Error fetching notifications for user ${userId}: ${err.message}`);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        logger.info(`Fetched notifications for user ${userId}`);
        res.json(results);
    });
});

// Endpoint to mark notifications as read
router.put('/mark-read', (req, res) => {
    const { notificationIds } = req.body;
    
    if (!notificationIds || notificationIds.length === 0) {
        logger.warn('No notification IDs provided');
        return res.status(400).json({ error: 'No notification IDs provided' });
    }

    const query = 'UPDATE tbl_123_notifications SET isRead = 1 WHERE id IN (?)';
    pool.query(query, [notificationIds], (err) => {
        if (err) {
            logger.error(`Error marking notifications as read: ${err.message}`);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        logger.info(`Marked notifications as read: ${notificationIds.join(', ')}`);
        res.json({ success: true });
    });
});

module.exports = router;
