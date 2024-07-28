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



// Endpoint to fetch lost items
router.get('/lost-items', (req, res) => {
  pool.query('SELECT * FROM tbl_123_lostitems', (err, results) => {
    if (err) {
      logger.error(`Error fetching lost items: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    logger.info('Fetched lost items');
    res.json(results);
  });
});

// Endpoint to fetch found items
router.get('/found-items', (req, res) => {
  pool.query('SELECT * FROM tbl_123_founditems', (err, results) => {
    if (err) {
      logger.error(`Error fetching found items: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    logger.info('Fetched found items');
    res.json(results);
  });
});

// Endpoint to fetch a specific lost item by id
router.get('/lost-items/:id', (req, res) => {
  const itemId = req.params.id;
  pool.query('SELECT * FROM tbl_123_lostitems WHERE id = ?', [itemId], (err, results) => {
      if (err) {
          logger.error(`Error fetching lost item by id: ${err.message}`);
          return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (results.length > 0) {
          logger.info(`Fetched lost item with id: ${itemId}`);
          res.json(results[0]);
      } else {
          logger.warn(`Lost item not found with id: ${itemId}`);
          res.status(404).json({ error: 'Lost item not found' });
      }
  });
});

// Endpoint to fetch a specific found item by id
router.get('/found-items/:id', (req, res) => {
  const itemId = req.params.id;
  pool.query('SELECT * FROM tbl_123_founditems WHERE id = ?', [itemId], (err, results) => {
      if (err) {
          logger.error(`Error fetching found item by id: ${err.message}`);
          return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (results.length > 0) {
          logger.info(`Fetched found item with id: ${itemId}`);
          res.json(results[0]);
      } else {
          logger.warn(`Found item not found with id: ${itemId}`);
          res.status(404).json({ error: 'Found item not found' });
      }
  });
});


// Endpoint to fetch all items (lost and found)
router.get('/all-items', (req, res) => {
  const lostItemsQuery = 'SELECT * FROM tbl_123_lostitems';
  const foundItemsQuery = 'SELECT * FROM tbl_123_founditems';
  
  Promise.all([
    new Promise((resolve, reject) => pool.query(lostItemsQuery, (err, results) => err ? reject(err) : resolve(results))),
    new Promise((resolve, reject) => pool.query(foundItemsQuery, (err, results) => err ? reject(err) : resolve(results)))
  ])
  .then(([lostItems, foundItems]) => {
    const allItems = [...lostItems, ...foundItems];
    logger.info('Fetched all items');
    res.json(allItems);
  })
  .catch(err => {
    logger.error(`Error fetching all items: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});

// Endpoint to fetch items for a specific user
router.get('/user-items', (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId query parameter' });
  }
  
  const lostItemsQuery = 'SELECT * FROM tbl_123_lostitems WHERE userId = ?';
  const foundItemsQuery = 'SELECT * FROM tbl_123_founditems WHERE userId = ?';
  
  Promise.all([
    new Promise((resolve, reject) => pool.query(lostItemsQuery, [userId], (err, results) => err ? reject(err) : resolve(results))),
    new Promise((resolve, reject) => pool.query(foundItemsQuery, [userId], (err, results) => err ? reject(err) : resolve(results)))
  ])
  .then(([lostItems, foundItems]) => {
    const userItems = [...lostItems, ...foundItems];
    logger.info(`Fetched items for user ${userId}`);
    res.json(userItems);
  })
  .catch(err => {
    logger.error(`Error fetching user items: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});


// Endpoint to fetch a specific item by id (used in edit functionality)
router.get('/items/:id', (req, res) => {
  const itemId = req.params.id;

  const lostItemQuery = 'SELECT * FROM tbl_123_lostitems WHERE id = ?';
  const foundItemQuery = 'SELECT * FROM tbl_123_founditems WHERE id = ?';

  Promise.all([
    new Promise((resolve, reject) => pool.query(lostItemQuery, [itemId], (err, results) => err ? reject(err) : resolve(results))),
    new Promise((resolve, reject) => pool.query(foundItemQuery, [itemId], (err, results) => err ? reject(err) : resolve(results)))
  ]).then(([lostItemResults, foundItemResults]) => {
    const item = lostItemResults[0] || foundItemResults[0];

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  }).catch(err => {
    logger.error(`Error fetching item: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});

router.put('/items/:id', upload.single('image'), (req, res) => {
  const itemId = req.params.id;
  const updatedItem = req.body;
  const tableName = updatedItem.status === 'Lost' ? 'tbl_123_lostitems' : 'tbl_123_founditems';

  logger.info(`Update request received for item ID: ${itemId}, Status: ${updatedItem.status}, Table: ${tableName}`);

  const query = `SELECT * FROM ${tableName} WHERE id = ?`;

  pool.query(query, [itemId], (err, results) => {
      if (err) {
          logger.error(`Error fetching item for update: ${err.message}`, err);
          return res.status(500).json({ error: 'Internal Server Error', details: err.message });
      }

      if (results.length === 0) {
          logger.warn(`Item not found with ID: ${itemId} in table: ${tableName}`);
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

      // Remove fields that do not exist in the table for the specific item status
      if (tableName === 'tbl_123_lostitems') {
          delete updatedItem.locationFound;
          delete updatedItem.foundDate;
          delete updatedItem.foundTime;
      } else if (tableName === 'tbl_123_founditems') {
          delete updatedItem.locationLost;
          delete updatedItem.lostDate;
          delete updatedItem.timeLost;
      }

      // Remove empty fields from the update object
      Object.keys(updatedItem).forEach(key => {
          if (updatedItem[key] === '') {
              delete updatedItem[key];
          }
      });

      pool.query(`UPDATE ${tableName} SET ? WHERE id = ?`, [updatedItem, itemId], (err) => {
          if (err) {
              logger.error(`Error updating item ID ${itemId} in table: ${tableName}: ${err.message}`, err);
              return res.status(500).json({ error: 'Internal Server Error', details: err.message });
          }
          logger.info(`Item ID ${itemId} updated successfully in table: ${tableName}`);
          res.json({ success: true });
      });
  });
});




// Endpoint to delete an item and its image
router.delete('/items/:id', (req, res) => {
  const itemId = req.params.id;

  const lostItemQuery = 'SELECT imageUrl FROM tbl_123_lostitems WHERE id = ?';
  const foundItemQuery = 'SELECT imageUrl FROM tbl_123_founditems WHERE id = ?';
  
  Promise.all([
    new Promise((resolve, reject) => pool.query(lostItemQuery, [itemId], (err, results) => err ? reject(err) : resolve(results))),
    new Promise((resolve, reject) => pool.query(foundItemQuery, [itemId], (err, results) => err ? reject(err) : resolve(results)))
  ]).then(([lostItemResults, foundItemResults]) => {
    const item = lostItemResults[0] || foundItemResults[0];
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const imageUrl = item.imageUrl;
    const imagePath = imageUrl ? path.join(__dirname, '../uploads', path.basename(imageUrl)) : null;

    const deleteQuery = `DELETE FROM ${lostItemResults.length > 0 ? 'tbl_123_lostitems' : 'tbl_123_founditems'} WHERE id = ?`;
    
    pool.query(deleteQuery, [itemId], (err) => {
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
  }).catch(err => {
    logger.error(`Error fetching item for deletion: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});

// Endpoint to report a lost item
router.post('/lost-items', upload.single('image'), (req, res) => {
  const { itemName, locationLost, lostDate, timeLost, category, color, description, contactEmail, contactPhone, userId } = req.body;
  const imageUrl = req.file ? `${baseUrl}/uploads/${req.file.filename}` : req.body.imageUrl;

  if (!itemName || !locationLost || !lostDate || !timeLost || !category || !color || !contactEmail || !contactPhone || !userId) {
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
      imageUrl: imageUrl,
      userId: userId
  };

  pool.query('INSERT INTO tbl_123_lostitems SET ?', newItem, (err, result) => {
      if (err) {
          logger.error(`Error reporting lost item: ${err.message}`);
          return res.status(500).json({ error: 'Internal Server Error' });
      }
      newItem.id = result.insertId;
      logger.info(`Lost item added with ID: ${result.insertId}`);
      res.json(newItem);
  });
});

// Function to match found items with lost items and create notifications
const matchFoundItem = async (foundItem) => {
  try {
      logger.info(`Matching found item with ID: ${foundItem.id}`);
      
      const query = `
          SELECT * FROM tbl_123_lostitems
          WHERE itemName = ? AND category = ? AND color = ? AND status = 'Lost'
      `;
      const values = [foundItem.itemName, foundItem.category, foundItem.color];

      const results = await new Promise((resolve, reject) => {
          pool.query(query, values, (err, results) => {
              if (err) {
                  logger.error(`Error executing query: ${err.message}`);
                  return reject(err);
              }
              logger.info(`Query results: ${JSON.stringify(results)}`);
              resolve(results);
          });
      });

      logger.info(`Results from matchFoundItem: ${JSON.stringify(results)}`);

      if (Array.isArray(results) && results.length > 0) {
          for (const lostItem of results) {
              logger.info(`Found match for lost item with ID: ${lostItem.id}`);
              const itemUrl = `${baseUrl}/item.html?id=${foundItem.id}&status=Found`; // Ensure correct foundItem.id is used
              logger.info(`Generated item URL: ${itemUrl}`);
              const message = `Your lost item "${lostItem.itemName}" might have been found. Check the found items list. <a href="${itemUrl}">View Item</a>`;
              const notification = {
                  userId: lostItem.userId,
                  message: message,
                  isRead: false
              };
              logger.info(`Creating notification for userId: ${lostItem.userId}`);
              await new Promise((resolve, reject) => {
                  pool.query('INSERT INTO tbl_123_notifications SET ?', notification, (err) => {
                      if (err) {
                          logger.error(`Error inserting notification: ${err.message}`);
                          return reject(err);
                      }
                      logger.info(`Notification inserted for userId: ${lostItem.userId}`);
                      resolve();
                  });
              });
              logger.info(`Notification sent to user ${lostItem.userId} for lost item ${lostItem.id}`);
          }
      } else {
          logger.info('No matching lost items found.');
      }

      return results;
  } catch (err) {
      logger.error(`Error matching found item: ${err.message}`);
      throw new Error('Error matching found item');
  }
};



// Endpoint to report a found item
router.post('/found-items', upload.single('image'), (req, res) => {
  const { itemName, locationFound, foundDate, foundTime, category, color, description, contactEmail, contactPhone, securityQuestion, securityAnswer, userId } = req.body;
  const imageUrl = req.file ? `${baseUrl}/uploads/${req.file.filename}` : req.body.imageUrl;

  if (!itemName || !locationFound || !foundDate || !foundTime || !category || !color || !contactEmail || !contactPhone || !securityQuestion || !securityAnswer || !userId) {
    return res.status(400).json({ error: 'All fields except description are required' });
  }

  const newItem = {
    itemName,
    locationFound,
    foundDate,
    foundTime,
    category,
    color,
    description: description || null,
    contactEmail,
    contactPhone,
    securityQuestion,
    securityAnswer,
    status: 'Found',
    imageUrl: imageUrl,
    userId: userId
  };

  pool.query('INSERT INTO tbl_123_founditems SET ?', newItem, (err, result) => {
    if (err) {
      logger.error(`Error reporting found item: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    newItem.id = result.insertId;
    logger.info(`Found item added with ID: ${result.insertId}`);
    res.json(newItem);
  });
});

router.post('/claim-item/:id', async (req, res) => {
  const itemId = req.params.id;
  const { answer } = req.body;

  if (!answer) {
      return res.status(400).json({ error: 'Answer is required' });
  }

  try {
      const [lostItems, foundItems] = await Promise.all([
          pool.query('SELECT securityAnswer FROM tbl_123_lostitems WHERE id = ?', [itemId]),
          pool.query('SELECT securityAnswer FROM tbl_123_founditems WHERE id = ?', [itemId])
      ]);

      const item = lostItems[0] || foundItems[0];
      if (!item) {
          return res.status(404).json({ error: 'Item not found' });
      }

      if (answer === item.securityAnswer) {
          logger.info(`Item with ID: ${itemId} claimed successfully`);
          res.json({ success: true });
      } else {
          logger.warn(`Incorrect answer for item with ID: ${itemId}`);
          res.status(401).json({ error: 'Incorrect answer' });
      }
  } catch (err) {
      logger.error(`Error fetching item for claim: ${err.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.post('/test-match', async (req, res) => {
  const foundItem = req.body;
  try {
      const results = await matchFoundItem(foundItem);
      res.json({ success: true, results });
  } catch (error) {
      res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = router;