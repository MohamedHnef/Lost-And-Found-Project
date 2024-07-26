const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../logger');

// Determine if the environment is production
const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction ? 'https://lost-and-found-project.onrender.com' : 'http://localhost:3000';

// Multer setup for file uploads
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

// Serve static files from the 'uploads' directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
    logger.error(`Error handling file upload: ${err.message}`, err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Endpoint to fetch all items
router.get('/all-items', (req, res) => {
  pool.query('SELECT * FROM tbl_123_posts', (err, results) => {
    if (err) {
      logger.error(`Error fetching all items: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
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
      return res.status(500).json({ error: 'Internal Server Error' });
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
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    logger.info(`Fetched items for user ${userId}`);
    res.json(results);
  });
});

// Endpoint to fetch a specific item by id
router.get('/items/:id', (req, res) => {
  const itemId = req.params.id;
  pool.query('SELECT * FROM tbl_123_posts WHERE id = ?', [itemId], (err, results) => {
    if (err) {
      logger.error(`Error fetching item by id: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length > 0) {
      logger.info(`Fetched item with id: ${itemId}`);
      res.json(results[0]);
    } else {
      logger.warn(`Item not found with id: ${itemId}`);
      res.status(404).json({ error: 'Item not found' });
    }
  });
});


// Endpoint to update an item
router.put('/items/:id', upload.single('image'), (req, res) => {
  const itemId = req.params.id;
  const updatedItem = req.body;

  pool.query('SELECT * FROM tbl_123_posts WHERE id = ?', [itemId], (err, results) => {
    if (err) {
      logger.error(`Error fetching item for update: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const currentItem = results[0];

    // Handle image update
    if (req.file) {
      const oldImagePath = currentItem.imageUrl ? path.join(__dirname, '../uploads', path.basename(currentItem.imageUrl)) : null;
      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      updatedItem.imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    } else {
      updatedItem.imageUrl = currentItem.imageUrl;
    }

    // Remove empty fields from the update object
    Object.keys(updatedItem).forEach(key => {
      if (updatedItem[key] === '') {
        delete updatedItem[key];
      }
    });

    pool.query('UPDATE tbl_123_posts SET ? WHERE id = ?', [updatedItem, itemId], (err) => {
      if (err) {
        logger.error(`Error updating item ID ${itemId}: ${err.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      logger.info(`Item ID ${itemId} updated`);
      res.json({ success: true });
    });
  });
});


// Endpoint to delete an item and its image
router.delete('/items/:id', (req, res) => {
  const itemId = req.params.id;
  // First, fetch the item to get the image URL
  pool.query('SELECT imageUrl FROM tbl_123_posts WHERE id = ?', [itemId], (err, results) => {
    if (err) {
      logger.error(`Error fetching item for deletion: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const imageUrl = results[0].imageUrl;
    const imagePath = imageUrl ? path.join(__dirname, '../uploads', path.basename(imageUrl)) : null;

    // Delete the item from the database
    pool.query('DELETE FROM tbl_123_posts WHERE id = ?', [itemId], (err) => {
      if (err) {
        logger.error(`Error deleting item: ${err.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (imagePath && fs.existsSync(imagePath)) {
        // Delete the image file if it exists
        fs.unlinkSync(imagePath);
        logger.info('Image file deleted successfully');
      }

      res.json({ success: true });
    });
  });
});

// Endpoint to report a lost item
router.post('/lost-items', upload.single('image'), (req, res) => {
  const { itemName, locationLost, lostDate, timeLost, category, color, description, contactEmail, contactPhone, userId } = req.body;
  const imageUrl = req.file ? `${baseUrl}/uploads/${req.file.filename}` : req.body.imageUrl;

  console.log('Received Lost Item Data:', req.body);
  console.log('Uploaded File:', req.file);

  if (!itemName || !locationLost || !lostDate || !timeLost || !category || !color || !contactEmail || !contactPhone) {
    return res.status(400).json({ error: 'All fields except description are required' });
  }

  const newItem = {
    itemName,
    locationLost,
    lostDate,
    timeLost,
    category,
    color,
    description: description || null,
    contactEmail,
    contactPhone,
    status: 'Lost',
    imageUrl: imageUrl, // Ensure imageUrl is included here
    userId: userId
  };

  console.log('New Item to be Inserted:', newItem);

  pool.query('INSERT INTO tbl_123_posts SET ?', newItem, (err, result) => {
    if (err) {
      logger.error(`Error reporting lost item: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    logger.info(`Item added with ID: ${result.insertId}`);
    res.json({ id: result.insertId, ...newItem });
  });
});

// Endpoint to report a found item
router.post('/found-items', upload.single('image'), (req, res) => {
  const { itemName, locationFound, foundDate, foundTime, category, color, description, contactEmail, contactPhone, securityQuestion, securityAnswer, userId } = req.body;

  console.log('Received Found Item Data:', req.body);

  if (!itemName || !locationFound || !foundDate || !foundTime || !category || !color || !contactEmail || !contactPhone || !securityQuestion || !securityAnswer) {
    return res.status(400).json({ error: 'All fields except description are required' });
  }

  const newItem = {
    itemName,
    locationLost: locationFound,
    lostDate: foundDate,
    timeLost: foundTime,
    category,
    color,
    description: description || null,
    contactEmail,
    contactPhone,
    securityQuestion,
    securityAnswer,
    status: 'Found',
    imageUrl: req.file ? `${baseUrl}/uploads/${req.file.filename}` : req.body.imageUrl,
    userId: userId
  };

  console.log('New Item to be Inserted:', newItem);

  pool.query('INSERT INTO tbl_123_posts SET ?', newItem, (err, result) => {
    if (err) {
      logger.error(`Error reporting found item: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    logger.info(`Item added with ID: ${result.insertId}`);
    res.json({ id: result.insertId, ...newItem });
  });
});

// Endpoint to claim an item with security question verification
router.post('/claim-item/:id', (req, res) => {
  const itemId = req.params.id;
  const { answer } = req.body;

  // Validate input
  if (!answer) {
    return res.status(400).json({ error: 'Answer is required' });
  }

  pool.query('SELECT securityAnswer FROM tbl_123_posts WHERE id = ?', [itemId], (err, results) => {
    if (err) {
      logger.error(`Error fetching item for claim: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const correctAnswer = results[0].securityAnswer;
    if (answer === correctAnswer) {
      logger.info(`Item with ID: ${itemId} claimed successfully`);
      res.json({ success: true });
    } else {
      logger.warn(`Incorrect answer for item with ID: ${itemId}`);
      res.status(401).json({ error: 'Incorrect answer' });
    }
  });
});

module.exports = router;
