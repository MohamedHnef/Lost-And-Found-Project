const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../logger');
const { authenticateToken } = require('../middleware/authMiddleware');
const { emailCampaignsApi, SibApiV3Sdk } = require('./sendEmail');

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
  const status = req.query.status;

  console.log('Fetching item with ID:', itemId, 'and Status:', status);

  let query;
  if (status === 'PendingApproval') {
    query = 'SELECT * FROM tbl_123_claim_requests WHERE id = ?';
  } else if (status === 'Found') {
    query = 'SELECT * FROM tbl_123_founditems WHERE id = ?';
  } else if (status === 'Lost') {
    query = 'SELECT * FROM tbl_123_lostitems WHERE id = ?';
  } else {
    console.error('Invalid status:', status);
    return res.status(400).json({ error: 'Invalid status' });
  }

  console.log('Executing query:', query, 'with itemId:', itemId);

  pool.query(query, [itemId], (err, results) => {
    if (err) {
      console.error(`Error querying items: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const item = results[0];

    if (!item) {
      console.log(`Item not found in table for status: ${status}`);

      // If item not found in claim_requests, check founditems or lostitems based on status
      if (status === 'PendingApproval') {
        // Check founditems if not found in claim_requests
        const fallbackQuery = 'SELECT * FROM tbl_123_founditems WHERE id = ?';
        pool.query(fallbackQuery, [itemId], (fallbackErr, fallbackResults) => {
          if (fallbackErr) {
            console.error(`Error querying fallback items: ${fallbackErr.message}`);
            return res.status(500).json({ error: 'Internal Server Error' });
          }

          const fallbackItem = fallbackResults[0];

          if (!fallbackItem) {
            console.error(`Item not found with ID: ${itemId} in founditems`);
            return res.status(404).json({ error: 'Item not found' });
          }

          res.json(fallbackItem);
        });
      } else if (status === 'Found' || status === 'Lost') {
        // Check lostitems if not found in founditems
        const fallbackQuery = 'SELECT * FROM tbl_123_lostitems WHERE id = ?';
        pool.query(fallbackQuery, [itemId], (fallbackErr, fallbackResults) => {
          if (fallbackErr) {
            console.error(`Error querying fallback items: ${fallbackErr.message}`);
            return res.status(500).json({ error: 'Internal Server Error' });
          }

          const fallbackItem = fallbackResults[0];

          if (!fallbackItem) {
            console.error(`Item not found with ID: ${itemId} in lostitems`);
            return res.status(404).json({ error: 'Item not found' });
          }

          res.json(fallbackItem);
        });
      }
    } else {
      res.json(item);
    }
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

      // Call matchFoundItem function to match with lost items
      matchFoundItem(newItem).then(() => {
          res.json(newItem);
      }).catch(err => {
          logger.error(`Error matching found item: ${err.message}`);
          res.status(500).json({ error: 'Error matching found item', details: err.message });
      });
  });
});

// Endpoint to handle claim submission
router.post('/claim-item/:id', authenticateToken, async (req, res) => {
  const itemId = req.params.id;
  const { answer, status, itemName, claimant } = req.body;
  const userId = req.user.id;

  try {
      const [item] = await new Promise((resolve, reject) => {
          pool.query(
              status === 'Found' ? 'SELECT * FROM tbl_123_founditems WHERE id = ?' : 'SELECT * FROM tbl_123_lostitems WHERE id = ?',
              [itemId],
              (err, results) => err ? reject(err) : resolve(results)
          );
      });

      if (!item) {
          return res.status(404).json({ error: 'Item not found' });
      }

      if (answer === item.securityAnswer) {
          const claimRequest = {
              itemId,
              userId,
              status: 'PendingApproval',
              claimedAt: new Date(),
              securityQuestion: item.securityQuestion,
              securityAnswer: item.securityAnswer,
              itemName: itemName || item.itemName,
              claimant: claimant || req.user.username,
          };

          await new Promise((resolve, reject) => {
              pool.query('INSERT INTO tbl_123_claim_requests SET ?', claimRequest, (err) => err ? reject(err) : resolve());
          });

          res.json({ success: true, message: 'Claim request has been submitted for admin approval.' });
      } else {
          res.status(401).json({ error: 'Incorrect answer' });
      }
  } catch (err) {
      console.error(`Error handling claim request: ${err.message}`, err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});



router.get('/claim-requests', authenticateToken, (req, res) => {
  const claimStatus = req.query.claimStatus || 'pendingApproval';

  const query = `
    SELECT 
      cr.id, 
      cr.itemId, 
      cr.userId, 
      cr.status, 
      cr.claimedAt, 
      cr.securityQuestion, 
      cr.securityAnswer, 
      COALESCE(l.itemName, f.itemName) AS itemName, 
      u.username AS claimant
    FROM tbl_123_claim_requests cr
    JOIN tbl_123_users u ON cr.userId = u.id
    LEFT JOIN tbl_123_lostitems l ON cr.itemId = l.id
    LEFT JOIN tbl_123_founditems f ON cr.itemId = f.id
    WHERE cr.status = ?
  `;

  pool.query(query, [claimStatus], (err, results) => {
      if (err) {
          console.error('Error fetching claim requests:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.json(results);
  });
});

// Endpoint to update claim status
router.put('/claim-requests/:id', authenticateToken, (req, res) => {
  const requestId = req.params.id;
  const { approved } = req.body;
  const status = approved ? 'Approved' : 'Rejected';

  pool.query('UPDATE tbl_123_claim_requests SET status = ? WHERE id = ?', [status, requestId], (err) => {
      if (err) {
          console.error('Error updating claim status:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.json({ success: true, status });
  });
});

// recent activities admin homepage

router.get('/admin/dashboard-data', authenticateToken, (req, res) => {
  const summaryQuery = `
      SELECT 
          SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approvedCount,
          SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejectedCount,
          SUM(CASE WHEN status = 'PendingApproval' THEN 1 ELSE 0 END) AS pendingCount
      FROM tbl_123_claim_requests;
  `;

  const activitiesQuery = `
      SELECT cr.action, cr.timestamp, cr.itemName, u.username AS claimant
      FROM tbl_123_claim_requests cr
      JOIN tbl_123_users u ON cr.userId = u.id
      WHERE cr.action IS NOT NULL
      ORDER BY cr.timestamp DESC
      LIMIT 10;
  `;

  Promise.all([
      new Promise((resolve, reject) => pool.query(summaryQuery, (err, results) => err ? reject(err) : resolve(results[0]))),
      new Promise((resolve, reject) => pool.query(activitiesQuery, (err, results) => err ? reject(err) : resolve(results)))
  ])
  .then(([summary, recentActivities]) => {
      res.json({ summary, recentActivities });
  })
  .catch(err => {
      console.error('Error fetching dashboard data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
  });
});

router.post('/log-activity', authenticateToken, (req, res) => {
  const { requestId, action } = req.body;

  const query = `
      UPDATE tbl_123_claim_requests
      SET status = ?, action = ?, timestamp = ?
      WHERE id = ?
  `;

  const values = [action, action, new Date(), requestId];

  pool.query(query, values, (err) => {
      if (err) {
          console.error('Error logging activity:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.json({ success: true, message: 'Activity logged successfully' });
  });
});

// Fetch Recent Activities Endpoint
router.get('/recent-activities', authenticateToken, (req, res) => {
  const query = `
      SELECT cr.itemName, u.username AS claimant, cr.action, cr.timestamp
      FROM tbl_123_claim_requests cr
      JOIN tbl_123_users u ON cr.userId = u.id
      WHERE cr.action IS NOT NULL
      ORDER BY cr.timestamp DESC
      LIMIT 10;
  `;

  pool.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching recent activities:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.json(results);
  });
});

// New endpoint to fetch detailed item information for the modal
router.get('/item-details/:id', (req, res) => {
  const itemId = req.params.id;

  console.log('Fetching detailed item information with ID:', itemId);

  // Fetch basic details from tbl_123_claim_requests
  const claimQuery = 'SELECT * FROM tbl_123_claim_requests WHERE itemId = ?';

  pool.query(claimQuery, [itemId], (err, claimResults) => {
    if (err) {
      console.error(`Error querying tbl_123_claim_requests: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    console.log('Claim query results:', claimResults);

    let item = claimResults[0];

    if (!item) {
      console.log(`Item not found in tbl_123_claim_requests for itemId: ${itemId}`);
      return res.status(404).json({ error: 'Item not found' });
    }

    // Determine the correct table to fetch additional details
    const additionalQuery = 'SELECT category, color, foundDate, locationFound FROM tbl_123_founditems WHERE id = ?';

    pool.query(additionalQuery, [itemId], (additionalErr, additionalResults) => {
      if (additionalErr) {
        console.error(`Error querying additional details: ${additionalErr.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      console.log('Additional query results:', additionalResults);

      let additionalDetails = additionalResults[0];

      if (additionalDetails) {
        item = { ...item, ...additionalDetails };
      }

      res.json(item);
    });
  });
});

// Endpoint to fetch counts of approved, rejected, and pending claims
router.get('/claim-counts', (req, res) => {
  const approvedQuery = 'SELECT COUNT(*) AS count FROM tbl_123_claim_requests WHERE status = "Approved"';
  const rejectedQuery = 'SELECT COUNT(*) AS count FROM tbl_123_claim_requests WHERE status = "Rejected"';
  const pendingQuery = 'SELECT COUNT(*) AS count FROM tbl_123_claim_requests WHERE status = "PendingApproval"';

  pool.query(approvedQuery, (approvedErr, approvedResults) => {
    if (approvedErr) {
      console.error(`Error querying approved claims: ${approvedErr.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    pool.query(rejectedQuery, (rejectedErr, rejectedResults) => {
      if (rejectedErr) {
        console.error(`Error querying rejected claims: ${rejectedErr.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      pool.query(pendingQuery, (pendingErr, pendingResults) => {
        if (pendingErr) {
          console.error(`Error querying pending claims: ${pendingErr.message}`);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json({
          approved: approvedResults[0].count,
          rejected: rejectedResults[0].count,
          pending: pendingResults[0].count,
        });
      });
    });
  });
});


// send email API
router.post('/item-found', (req, res) => {
  const { itemId } = req.body;

  // Query the database to get the email of the user who reported the item as lost
  const query = `
      SELECT l.contactEmail AS lostContactEmail, l.itemName, uLost.username AS lostUsername
      FROM tbl_123_founditems AS f
      JOIN tbl_123_lostitems AS l ON f.itemName = l.itemName
      JOIN tbl_123_users AS uLost ON l.userId = uLost.id
      WHERE f.id = ?
  `;

  pool.query(query, [itemId], (err, results) => {
      if (err) {
          console.error('Error querying database:', err);
          return res.status(500).send('Internal Server Error');
      }

      if (results.length === 0) {
          return res.status(404).send('No matching item found');
      }

      const { lostContactEmail, lostUsername, itemName } = results[0];
      console.log(`Sending email to: ${lostContactEmail}`);

      const emailCampaign = new SibApiV3Sdk.CreateEmailCampaign();
      emailCampaign.name = "Item Found Notification";
      emailCampaign.subject = "Good News! Your Lost Item Has Been Found";
      emailCampaign.sender = { name: "Lost and Found Team", email: "amir.kh1232001@gmail.com" }; // Use your verified sender email
      emailCampaign.type = "classic";
      emailCampaign.htmlContent = `Dear ${lostUsername},<br><br>
          We are thrilled to inform you that your lost item, ${itemName}, has been found! Our team has successfully located your item and it is now available for you to claim.<br><br>
          Please log in to your account to view the details and arrange for the pickup or delivery of your item.<br><br>
          Thank you for using our Lost and Found service. We are here to help you recover your belongings.<br><br>
          Best regards,<br>
          The Lost and Found Team`;

      // Temporarily send email directly to the contactEmail for testing
      emailCampaign.recipients = { listIds: [2] }; // Using the list ID from your URL

      emailCampaignsApi.createEmailCampaign(emailCampaign).then(function(data) {
          console.log('API called successfully. Returned data: ' + JSON.stringify(data));
          
          // Send the campaign immediately
          emailCampaignsApi.sendEmailCampaignNow(data.id).then(function(sendData) {
              console.log('Email sent successfully. Returned data: ' + JSON.stringify(sendData));
              res.status(200).send('Notification email sent');
          }, function(sendError) {
              console.error('Error sending email campaign:', sendError);
              res.status(500).send('Error sending email campaign');
          });
      }, function(error) {
          console.error('Error creating email campaign:', error);
          res.status(500).send('Error creating email campaign: ' + JSON.stringify(error));
      });
  });
});

module.exports = router;