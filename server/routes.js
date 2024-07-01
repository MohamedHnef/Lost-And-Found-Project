const express = require('express');
const router = express.Router();
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('./logger'); // Import the logger

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // This allows all origins, which is generally not recommended for production but will solve the CORS issue for now.
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Determine if the environment is production
const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction ? 'https://lost-and-found-project.onrender.com' : 'http://localhost:3000';

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
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

// Endpoint to upload an image
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      logger.warn('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    logger.info(`Image uploaded: ${imageUrl}`);
    res.json({ imageUrl });
  } catch (err) {
    logger.error(`Error handling file upload: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to fetch all items
router.get('/all-items', (req, res) => {
  pool.query('SELECT * FROM tbl_123_posts', (err, results) => {
    if (err) {
      logger.error(`Error fetching all items: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    logger.info('Fetched all items');
    res.json(results);
  });
});

// Endpoint to fetch limited items
router.get('/items', (req, res) => {
  pool.query('SELECT * FROM tbl_123_posts LIMIT 4', (err, results) => {
    if (err) {
      logger.error(`Error fetching limited items: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    logger.info('Fetched limited items');
    res.json(results);
  });
});

// Endpoint to fetch items for a specific user
router.get('/user-items', (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId query parameter' });
  }
  pool.query('SELECT * FROM tbl_123_posts WHERE userId = ?', [userId], (err, results) => {
    if (err) {
      logger.error(`Error fetching user items: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    logger.info(`Fetched items for user ${userId}`);
    res.json(results);
  });
});

// Endpoint to fetch a specific item by name
router.get('/items/:itemName', (req, res) => {
  const itemName = req.params.itemName;
  pool.query('SELECT * FROM tbl_123_posts WHERE itemName = ?', [itemName], (err, results) => {
    if (err) {
      logger.error(`Error fetching item by name: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    if (results.length > 0) {
      logger.info(`Fetched item: ${itemName}`);
      res.json(results[0]);
    } else {
      logger.warn(`Item not found: ${itemName}`);
      res.status(404).json({ error: 'Item not found' });
    }
  });
});

// Endpoint to add a new item
router.post('/items', (req, res) => {
  const newItem = req.body;
  logger.info(`Adding new item: ${JSON.stringify(newItem)}`);
  pool.query('INSERT INTO tbl_123_posts SET ?', newItem, (err, result) => {
    if (err) {
      logger.error(`Error adding new item: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    logger.info(`Item added with ID: ${result.insertId}`);
    res.json({ id: result.insertId, ...newItem });
  });
});

// Endpoint to update an item
router.put('/items/:id', (req, res) => {
  const itemId = req.params.id;
  const updatedItem = req.body;
  logger.info(`Updating item ID ${itemId}: ${JSON.stringify(updatedItem)}`);
  pool.query('UPDATE tbl_123_posts SET ? WHERE id = ?', [updatedItem, itemId], (err) => {
    if (err) {
      logger.error(`Error updating item ID ${itemId}: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    logger.info(`Item ID ${itemId} updated`);
    res.json({ success: true });
  });
});

// Endpoint to delete an item and its image
router.delete('/items/:id', (req, res) => {
  const itemId = req.params.id;
  // First, fetch the item to get the image URL
  pool.query('SELECT imageUrl FROM tbl_123_posts WHERE id = ?', [itemId], (err, results) => {
    if (err) {
      logger.error(`Error fetching item for deletion: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const imageUrl = results[0].imageUrl;
    const imagePath = path.join(__dirname, 'uploads', path.basename(imageUrl));

    // Delete the item from the database
    pool.query('DELETE FROM tbl_123_posts WHERE id = ?', [itemId], (err) => {
      if (err) {
        logger.error(`Error deleting item: ${err.message}`);
        return res.status(500).json({ error: err.message });
      }

      // Delete the image file if it exists
      fs.unlink(imagePath, (err) => {
        if (err) {
          logger.error(`Error deleting image file: ${err.message}`);
        } else {
          logger.info('Image file deleted successfully');
        }
      });

      res.json({ success: true });
    });
  });
});
// Serve the profileGraph.json file
router.get('/profile-graph-data', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'profileGraph.json'));
});
// Serve the homeGraph.json file
router.get('/home-graph-data', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'homeGraph.json'));
});

module.exports = router;
