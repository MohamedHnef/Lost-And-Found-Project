// controllers/protectedController.js

const pool = require('../db');
const logger = require('../logger');

const getProtectedData = (req, res) => {
  pool.query('SELECT * FROM tbl_123_users WHERE id = ?', [req.user.id], (err, results) => {
    if (err) {
      logger.error(`Error fetching protected data for user ${req.user.id}: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: results[0] });
  });
};

module.exports = {
  getProtectedData
};
