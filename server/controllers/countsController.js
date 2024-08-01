// controllers/countsController.js

const pool = require('../db');
const logger = require('../logger');

const getLostItemsCount = (req, res) => {
  const query = 'SELECT COUNT(*) AS lostCount FROM tbl_123_lostitems WHERE status = "lost"';
  
  pool.query(query, (error, results) => {
    if (error) {
      logger.error('Error fetching lost items count:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results[0]);
  });
};

const getFoundItemsCount = (req, res) => {
  const query = 'SELECT COUNT(*) AS foundCount FROM tbl_123_founditems WHERE status = "found"';
  
  pool.query(query, (error, results) => {
    if (error) {
      logger.error('Error fetching found items count:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results[0]);
  });
};

const getClaimedItemsCount = (req, res) => {
  const query = 'SELECT COUNT(*) AS claimedCount FROM tbl_123_claim_requests WHERE status = "Approved"';
  
  pool.query(query, (error, results) => {
    if (error) {
      logger.error('Error fetching claimed items count:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results[0]);
  });
};

const getUnclaimedItemsCount = (req, res) => {
  const query = 'SELECT COUNT(*) AS unclaimedCount FROM tbl_123_claim_requests WHERE status = "Rejected"';
  
  pool.query(query, (error, results) => {
    if (error) {
      logger.error('Error fetching unclaimed items count:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results[0]);
  });
};

module.exports = {
  getLostItemsCount,
  getFoundItemsCount,
  getClaimedItemsCount,
  getUnclaimedItemsCount
};