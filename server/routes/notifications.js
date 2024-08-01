// routes/notifications.js

const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');

router.get('/:userId', notificationsController.getUserNotifications);
router.put('/mark-read', notificationsController.markNotificationsRead);

module.exports = router;
