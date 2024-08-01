const pool = require('../db');
const logger = require('../logger');

const getUserNotifications = (req, res) => {
  const userId = req.params.userId;

  pool.query('SELECT * FROM tbl_123_notifications WHERE userId = ?', [userId], (err, results) => {
    if (err) {
      logger.error(`Error fetching notifications for user ${userId}: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
};

const markNotificationsRead = (req, res) => {
  const { notificationIds } = req.body;

  pool.query('UPDATE tbl_123_notifications SET isRead = 1 WHERE id IN (?)', [notificationIds], (err) => {
    if (err) {
      logger.error(`Error marking notifications as read: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json({ success: true });
  });
};

module.exports = {
  getUserNotifications,
  markNotificationsRead
};
