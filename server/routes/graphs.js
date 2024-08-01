const express = require('express');
const router = express.Router();
const graphsController = require('../controllers/graphsController');

router.get('/profile-graph-data', graphsController.getProfileGraphData);
router.get('/home-graph-data', graphsController.getHomeGraphData);

module.exports = router;
