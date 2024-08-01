const express = require('express');
const router = express.Router();
const countsController = require('../controllers/countsController');

router.get('/lost-items-count', countsController.getLostItemsCount);
router.get('/found-items-count', countsController.getFoundItemsCount);
router.get('/claimed-items-count', countsController.getClaimedItemsCount);
router.get('/unclaimed-items-count', countsController.getUnclaimedItemsCount);

module.exports = router;
