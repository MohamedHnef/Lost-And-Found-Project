const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

router.post('/item-found', emailController.sendItemFoundEmail);

module.exports = router;
