const express = require('express');
const router = express.Router();
const path = require('path');
const logger = require('../logger');


// Serve the profileGraph.json file
router.get('/profile-graph-data', (req, res) => {
    const filePath = path.join(__dirname, '../..', 'data', 'profileGraph.json');
    res.sendFile(filePath, (err) => {
      if (err) {
        logger.error(`Error serving profileGraph.json: ${err.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  });
  
  // Serve the homeGraph.json file
  router.get('/home-graph-data', (req, res) => {
    const filePath = path.join(__dirname, '../..', 'data', 'homeGraph.json');
    res.sendFile(filePath, (err) => {
      if (err) {
        logger.error(`Error serving homeGraph.json: ${err.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  });

  module.exports = router;