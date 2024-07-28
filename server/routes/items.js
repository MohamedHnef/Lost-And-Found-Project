const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../logger');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

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
    logger.error(`Error handling file upload: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to fetch all items
router.get('/all-items', (req, res) => {
  const queryLostItems = 'SELECT *, "lost" as itemType FROM tbl_123_lostitems';
  const queryFoundItems = 'SELECT *, "found" as itemType FROM tbl_123_founditems';

  pool.query(`${queryLostItems} UNION ${queryFoundItems}`, (err, results) => {
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
  const queryLostItems = 'SELECT *, "lost" as itemType FROM tbl_123_lostitems LIMIT 4';
  const queryFoundItems = 'SELECT *, "found" as itemType FROM tbl_123_founditems LIMIT 4';

  pool.query(`${queryLostItems} UNION ${queryFoundItems}`, (err, results) => {
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
  const queryLostItems = 'SELECT *, "lost" as itemType FROM tbl_123_lostitems WHERE userId = ?';
  const queryFoundItems = 'SELECT *, "found" as itemType FROM tbl_123_founditems WHERE userId = ?';

  pool.query(`${queryLostItems} UNION ${queryFoundItems}`, [userId, userId], (err, results) => {
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
  const queryLostItems = 'SELECT *, "lost" as itemType FROM tbl_123_lostitems WHERE id = ?';
  const queryFoundItems = 'SELECT *, "found" as itemType FROM tbl_123_founditems WHERE id = ?';

  pool.query(`${queryLostItems} UNION ${queryFoundItems}`, [itemId, itemId], (err, results) => {
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

// Endpoint to add a new item
router.post('/items', (req, res) => {
  const newItem = req.body;
  const table = newItem.type === 'lost' ? 'tbl_123_lostitems' : 'tbl_123_founditems';
  logger.info(`Adding new item: ${JSON.stringify(newItem)}`);
  pool.query(`INSERT INTO ${table} SET ?`, newItem, (err, result) => {
    if (err) {
      logger.error(`Error adding new item: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    logger.info(`Item added with ID: ${result.insertId}`);
    res.json({ id: result.insertId, ...newItem });
  });
});

// Endpoint to update an item
router.put('/items/:id', upload.single('editAddImage'), (req, res) => {
  const itemId = req.params.id;
  const updatedItem = req.body;
  const table = updatedItem.type === 'lost' ? 'tbl_123_lostitems' : 'tbl_123_founditems';

  if (req.file) {
      updatedItem.imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
  }

  if (updatedItem.locationLost) {
      updatedItem.locationFound = updatedItem.locationLost;
  }

  logger.info(`Updating item ID ${itemId}: ${JSON.stringify(updatedItem)}`);
  pool.query(`UPDATE ${table} SET ? WHERE id = ?`, [updatedItem, itemId], (err) => {
      if (err) {
          logger.error(`Error updating item ID ${itemId}: ${err.message}`);
          return res.status(500).json({ error: 'Internal Server Error' });
      }
      logger.info(`Item ID ${itemId} updated`);
      res.json({ success: true });
  });
});

// Endpoint to delete an item and its image
router.delete('/items/:id', (req, res) => {
  const itemId = req.params.id;
  // First, fetch the item to get the image URL
  const queryLostItems = 'SELECT imageUrl FROM tbl_123_lostitems WHERE id = ?';
  const queryFoundItems = 'SELECT imageUrl FROM tbl_123_founditems WHERE id = ?';

  pool.query(`${queryLostItems} UNION ${queryFoundItems}`, [itemId, itemId], (err, results) => {
    if (err) {
      logger.error(`Error fetching item for deletion: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const imageUrl = results[0].imageUrl;
    const imagePath = imageUrl ? path.join(__dirname, '../uploads', path.basename(imageUrl)) : null;
    const table = results[0].itemType === 'lost' ? 'tbl_123_lostitems' : 'tbl_123_founditems';

    // Delete the item from the database
    pool.query(`DELETE FROM ${table} WHERE id = ?`, [itemId], (err) => {
      if (err) {
        logger.error(`Error deleting item: ${err.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (imagePath) {
        // Delete the image file if it exists
        fs.unlink(imagePath, (err) => {
          if (err) {
            logger.error(`Error deleting image file: ${err.message}`);
          } else {
            logger.info('Image file deleted successfully');
          }
        });
      }

      res.json({ success: true });
    });
  });
});

// Endpoint to report a found item
router.post('/found-items', upload.none(), (req, res) => {
  const { itemName, locationFound, foundDate, category, color, description, contactEmail, contactPhone, securityQuestion, securityAnswer, imageUrl, userId } = req.body;

  console.log('Received Data:', req.body); // Debugging log

  if (!itemName || !locationFound || !foundDate || !category || !color || !contactEmail || !contactPhone || !securityQuestion || !securityAnswer) {
    return res.status(400).json({ error: 'All fields except description are required' });
  }

  const newItem = {
    itemName,
    locationFound,
    foundDate,
    category,
    color,
    description: description || null,
    contactEmail,
    contactPhone,
    securityQuestion,
    securityAnswer,
    status: 'Found',
    imageUrl: imageUrl || null,
    userId: userId
  };

  pool.query('INSERT INTO tbl_123_founditems SET ?', newItem, (err, result) => {
    if (err) {
      logger.error(`Error reporting found item: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    logger.info(`Item added with ID: ${result.insertId}`);
    res.json({ id: result.insertId, ...newItem });
  });
});

// Endpoint to report a lost item
router.post('/lost-items', upload.none(), (req, res) => {
  const { itemName, locationLost, lostDate, category, color, description, contactEmail, contactPhone, securityQuestion, securityAnswer, imageUrl, userId } = req.body;

  console.log('Received Data:', req.body); // Debugging log

  if (!itemName || !locationLost || !lostDate || !category || !color || !contactEmail || !contactPhone || !securityQuestion || !securityAnswer) {
    return res.status(400).json({ error: 'All fields except description are required' });
  }

  const newItem = {
    itemName,
    locationLost,
    lostDate,
    category,
    color,
    description: description || null,
    contactEmail,
    contactPhone,
    securityQuestion,
    securityAnswer,
    status: 'Lost',
    imageUrl: imageUrl || null,
    userId: userId
  };

  pool.query('INSERT INTO tbl_123_lostitems SET ?', newItem, (err, result) => {
    if (err) {
      logger.error(`Error reporting lost item: ${err.message}`);
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

  const queryLostItems = 'SELECT securityAnswer FROM tbl_123_lostitems WHERE id = ?';
  const queryFoundItems = 'SELECT securityAnswer FROM tbl_123_founditems WHERE id = ?';

  pool.query(`${queryLostItems} UNION ${queryFoundItems}`, [itemId, itemId], (err, results) => {
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


// ******************************************************************************************
// Endpoint to update claim status for an item (for admin)
router.put('/items/claim/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const itemId = req.params.id;
  const { approved } = req.body; //true or false
  const claimStatus = approved ? 'Approved' : 'Rejected';

  const table = claimStatus === 'Approved' ? 'tbl_123_founditems' : 'tbl_123_lostitems';

  pool.query(`UPDATE ${table} SET claimStatus = ? WHERE id = ?`, [claimStatus, itemId], (err, result) => {
    if (err) {
      logger.error(`Error updating claim status for item ID ${itemId}: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    logger.info(`Claim status updated for item ID ${itemId} to ${claimStatus}`);
    res.json({ success: true, claimStatus });
  });
});

module.exports = router;
