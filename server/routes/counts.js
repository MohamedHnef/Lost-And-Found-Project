const express = require('express');
const pool = require('../db');
const router = express.Router();

// Endpoint to get the count of lost items
router.get('/lost-items-count', (req, res) => {
    const lostItemsCountQuery = 'SELECT COUNT(*) AS lostCount FROM tbl_123_lostitems WHERE status = "lost"';
    
    pool.query(lostItemsCountQuery, (error, results) => {
        if (error) {
            console.error('Error fetching lost items count:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(results[0]);
    });
});

// Endpoint to get the count of found items
router.get('/found-items-count', (req, res) => {
    const foundItemsCountQuery = 'SELECT COUNT(*) AS foundCount FROM tbl_123_founditems WHERE status = "found"';
    
    pool.query(foundItemsCountQuery, (error, results) => {
        if (error) {
            console.error('Error fetching found items count:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(results[0]);
    });
});

// Endpoint to get the count of claimed items
router.get('/claimed-items-count', (req, res) => {
    const claimedItemsCountQuery = 'SELECT COUNT(*) AS claimedCount FROM tbl_123_claim_requests WHERE status = "Approved"';
    
    pool.query(claimedItemsCountQuery, (error, results) => {
        if (error) {
            console.error('Error fetching claimed items count:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(results[0]);
    });
});

// Endpoint to get the count of unclaimed items
router.get('/unclaimed-items-count', (req, res) => {
    const unclaimedItemsCountQuery = 'SELECT COUNT(*) AS unclaimedCount FROM tbl_123_claim_requests WHERE status = "Rejected"';
    
    pool.query(unclaimedItemsCountQuery, (error, results) => {
        if (error) {
            console.error('Error fetching unclaimed items count:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(results[0]);
    });
});

module.exports = router;