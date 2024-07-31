// routes/itemDetails.js

const express = require('express');
const router = express.Router();
const itemDetailsController = require('../controllers/itemDetailsController');

router.get('/item-details/:id', itemDetailsController.getItemDetails);
router.get('/claim-counts', itemDetailsController.getClaimCounts);

module.exports = router;
