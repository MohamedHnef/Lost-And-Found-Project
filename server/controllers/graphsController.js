
const path = require('path');
const logger = require('../logger');

const getProfileGraphData = (req, res) => {
  const filePath = path.join(__dirname, '../..', 'data', 'profileGraph.json');
  res.sendFile(filePath, (err) => {
    if (err) {
      logger.error(`Error serving profileGraph.json: ${err.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};

const getHomeGraphData = (req, res) => {
  const filePath = path.join(__dirname, '../..', 'data', 'homeGraph.json');
  res.sendFile(filePath, (err) => {
    if (err) {
      logger.error(`Error serving homeGraph.json: ${err.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};

module.exports = {
  getProfileGraphData,
  getHomeGraphData
};
