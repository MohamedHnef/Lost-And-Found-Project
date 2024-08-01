// controllers/itemDetailsController.js

const pool = require('../db');
const logger = require('../logger');

const getItemDetails = (req, res) => {
  const itemId = req.params.id;

  logger.info(`Fetching detailed item information with ID: ${itemId}`);

  // Fetch basic details from tbl_123_claim_requests
  const claimQuery = 'SELECT * FROM tbl_123_claim_requests WHERE itemId = ?';

  pool.query(claimQuery, [itemId], (err, claimResults) => {
    if (err) {
      logger.error(`Error querying tbl_123_claim_requests: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    logger.info(`Claim query results: ${JSON.stringify(claimResults)}`);

    let item = claimResults[0];

    if (!item) {
      logger.warn(`Item not found in tbl_123_claim_requests for itemId: ${itemId}`);
      return res.status(404).json({ error: 'Item not found' });
    }

    // Determine the correct table to fetch additional details
    const additionalQuery = 'SELECT category, color, foundDate, locationFound FROM tbl_123_founditems WHERE id = ?';

    pool.query(additionalQuery, [itemId], (additionalErr, additionalResults) => {
      if (additionalErr) {
        logger.error(`Error querying additional details: ${additionalErr.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      logger.info(`Additional query results: ${JSON.stringify(additionalResults)}`);

      let additionalDetails = additionalResults[0];

      if (additionalDetails) {
        item = { ...item, ...additionalDetails };
      }

      res.json(item);
    });
  });
};

const getClaimCounts = (req, res) => {
  const approvedQuery = 'SELECT COUNT(*) AS count FROM tbl_123_claim_requests WHERE status = "Approved"';
  const rejectedQuery = 'SELECT COUNT(*) AS count FROM tbl_123_claim_requests WHERE status = "Rejected"';
  const pendingQuery = 'SELECT COUNT(*) AS count FROM tbl_123_claim_requests WHERE status = "PendingApproval"';

  pool.query(approvedQuery, (approvedErr, approvedResults) => {
    if (approvedErr) {
      logger.error(`Error querying approved claims: ${approvedErr.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    pool.query(rejectedQuery, (rejectedErr, rejectedResults) => {
      if (rejectedErr) {
        logger.error(`Error querying rejected claims: ${rejectedErr.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      pool.query(pendingQuery, (pendingErr, pendingResults) => {
        if (pendingErr) {
          logger.error(`Error querying pending claims: ${pendingErr.message}`);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json({
          approved: approvedResults[0].count,
          rejected: rejectedResults[0].count,
          pending: pendingResults[0].count,
        });
      });
    });
  });
};

module.exports = {
  getItemDetails,
  getClaimCounts,
};