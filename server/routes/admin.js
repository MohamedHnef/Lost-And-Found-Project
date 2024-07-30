const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');
const logger = require('../logger');

router.get('/dashboard-data', authenticateToken, async (req, res) => {
    try {
        logger.info('Fetching total approved claims');
        const [totalApproved] = await new Promise((resolve, reject) => {
            pool.query('SELECT COUNT(*) AS count FROM tbl_123_claim_requests WHERE status = "Approved"', (err, results) => {
                if (err) {
                    logger.error('Error fetching total approved claims:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        logger.info('Fetching total rejected claims');
        const [totalRejected] = await new Promise((resolve, reject) => {
            pool.query('SELECT COUNT(*) AS count FROM tbl_123_claim_requests WHERE status = "Rejected"', (err, results) => {
                if (err) {
                    logger.error('Error fetching total rejected claims:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        logger.info('Fetching total pending claims');
        const [totalPending] = await new Promise((resolve, reject) => {
            pool.query('SELECT COUNT(*) AS count FROM tbl_123_claim_requests WHERE status = "PendingApproval"', (err, results) => {
                if (err) {
                    logger.error('Error fetching total pending claims:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        logger.info('Fetching recent activities');
        const recentActivities = await new Promise((resolve, reject) => {
            pool.query(`
                SELECT cr.id, cr.status, cr.claimedAt AS timestamp, fi.itemName, u.username AS claimant
                FROM tbl_123_claim_requests cr
                JOIN tbl_123_founditems fi ON cr.itemId = fi.id
                JOIN tbl_123_users u ON cr.userId = u.id
                ORDER BY cr.claimedAt DESC LIMIT 10
            `, (err, results) => {
                if (err) {
                    logger.error('Error fetching recent activities:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        res.json({
            totalApproved: totalApproved.count,
            totalRejected: totalRejected.count,
            totalPending: totalPending.count,
            recentActivities
        });
    } catch (err) {
        logger.error('Error fetching dashboard data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/claim-requests', authenticateToken, (req, res) => {
    const claimStatus = req.query.claimStatus || 'PendingApproval';

    pool.query('SELECT * FROM tbl_123_claim_requests WHERE status = ?', [claimStatus], (err, results) => {
        if (err) {
            console.error('Error fetching claim requests:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(results);
    });
});

module.exports = router;
