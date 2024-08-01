// routes/items.js

const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/itemsController');
const { authenticateToken } = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction ? 'https://lost-and-found-project.onrender.com' : 'http://localhost:3000';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });




router.post('/upload', upload.single('image'), itemsController.uploadImage);
router.get('/lost-items', itemsController.getLostItems);
router.get('/found-items', itemsController.getFoundItems);
router.get('/lost-items/:id', itemsController.getLostItemById);
router.get('/found-items/:id', itemsController.getFoundItemById);
router.get('/all-items', itemsController.getAllItems);
router.get('/user-items', itemsController.getUserItems);
router.get('/items/:id', itemsController.getItemById);
router.put('/items/:id', upload.single('image'), itemsController.updateItem);
router.delete('/items/:id', itemsController.deleteItem);
router.post('/lost-items', upload.single('image'), itemsController.reportLostItem);
router.post('/found-items', upload.single('image'), itemsController.reportFoundItem);
router.post('/claim-item/:id', authenticateToken, itemsController.claimItem);
router.get('/claim-requests', authenticateToken, itemsController.getClaimRequests);
router.put('/claim-requests/:id', authenticateToken, itemsController.updateClaimStatus);
router.get('/admin/dashboard-data', authenticateToken, itemsController.getDashboardData);
router.post('/log-activity', authenticateToken, itemsController.logActivity);
router.get('/recent-activities', authenticateToken, itemsController.getRecentActivities);

module.exports = router;