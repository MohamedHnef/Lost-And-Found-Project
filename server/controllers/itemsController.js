const pool = require('../db');
const path = require('path');
const fs = require('fs');
const logger = require('../logger');
const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction ? 'https://lost-and-found-project.onrender.com' : 'http://localhost:3000';

const uploadImage = (req, res) => {
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
};

const getLostItems = (req, res) => {
  pool.query('SELECT * FROM tbl_123_lostitems', (err, results) => {
    if (err) {
      logger.error(`Error fetching lost items: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    logger.info('Fetched lost items');
    res.json(results);
  });
};

const getFoundItems = (req, res) => {
  pool.query('SELECT * FROM tbl_123_founditems', (err, results) => {
    if (err) {
      logger.error(`Error fetching found items: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    logger.info('Fetched found items');
    res.json(results);
  });
};

const getLostItemById = (req, res) => {
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
};

const getFoundItemById = (req, res) => {
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
};

const getAllItems = (req, res) => {
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
};

const getUserItems = (req, res) => {
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
};

const getItemById = (req, res) => {
  const itemId = req.params.id;
  const status = req.query.status;

  let query;
  if (status === 'PendingApproval') {
    query = 'SELECT * FROM tbl_123_claim_requests WHERE id = ?';
  } else if (status === 'Found') {
    query = 'SELECT * FROM tbl_123_founditems WHERE id = ?';
  } else if (status === 'Lost') {
    query = 'SELECT * FROM tbl_123_lostitems WHERE id = ?';
  } else {
    return res.status(400).json({ error: 'Invalid status' });
  }

  pool.query(query, [itemId], (err, results) => {
    if (err) {
      logger.error(`Error fetching item by id: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  });
};

const updateItem = (req, res) => {
  const itemId = req.params.id;
  const updatedItem = req.body;
  const tableName = updatedItem.status === 'Lost' ? 'tbl_123_lostitems' : 'tbl_123_founditems';

  const query = `SELECT * FROM ${tableName} WHERE id = ?`;

  pool.query(query, [itemId], (err, results) => {
    if (err) {
      logger.error(`Error fetching item for update: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const currentItem = results[0];

    if (req.file) {
      const oldImagePath = currentItem.imageUrl ? path.join(__dirname, '../uploads', path.basename(currentItem.imageUrl)) : null;
      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      updatedItem.imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    } else {
      updatedItem.imageUrl = currentItem.imageUrl;
    }

    if (tableName === 'tbl_123_lostitems') {
      delete updatedItem.locationFound;
      delete updatedItem.foundDate;
      delete updatedItem.foundTime;
    } else if (tableName === 'tbl_123_founditems') {
      delete updatedItem.locationLost;
      delete updatedItem.lostDate;
      delete updatedItem.timeLost;
    }

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
      res.json({ success: true });
    });
  });
};

const deleteItem = (req, res) => {
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
        fs.unlinkSync(imagePath);
      }

      res.json({ success: true });
    });
  }).catch(err => {
    logger.error(`Error fetching item for deletion: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  });
};

const reportLostItem = (req, res) => {
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
    res.json(newItem);
  });
};

const reportFoundItem = (req, res) => {
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
    matchFoundItem(newItem).then(() => {
      res.json(newItem);
    }).catch(err => {
      logger.error(`Error matching found item: ${err.message}`);
      res.status(500).json({ error: 'Error matching found item', details: err.message });
    });
  });
};


const claimItem = async (req, res) => {
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
    logger.error(`Error handling claim request: ${err.message}`, err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
};

const getClaimRequests = (req, res) => {
  const claimStatus = req.query.claimStatus || 'PendingApproval';

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
      logger.error(`Error fetching claim requests: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
};

const updateClaimStatus = (req, res) => {
  const requestId = req.params.id;
  const { approved } = req.body;
  const status = approved ? 'Approved' : 'Rejected';

  pool.query('UPDATE tbl_123_claim_requests SET status = ? WHERE id = ?', [status, requestId], (err) => {
    if (err) {
      logger.error(`Error updating claim status: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json({ success: true, status });
  });
};

const getDashboardData = (req, res) => {
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
    logger.error(`Error fetching dashboard data: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  });
};

const logActivity = (req, res) => {
  const { requestId, action } = req.body;

  const query = `
    UPDATE tbl_123_claim_requests
    SET status = ?, action = ?, timestamp = ?
    WHERE id = ?
  `;

  const values = [action, action, new Date(), requestId];

  pool.query(query, values, (err) => {
    if (err) {
      logger.error(`Error logging activity: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json({ success: true, message: 'Activity logged successfully' });
  });
};

const getRecentActivities = (req, res) => {
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
      logger.error(`Error fetching recent activities: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
};

const matchFoundItem = async (foundItem) => {
  try {
    const frontendBaseUrl = process.env.FRONTEND_BASE_URL ;
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
        resolve(results);
      });
    });

    if (Array.isArray(results) && results.length > 0) {
      for (const lostItem of results) {
        const itemUrl = `${frontendBaseUrl}/item.html?id=${foundItem.id}&status=Found`;
        const message = `Your lost item "${lostItem.itemName}" might have been found. Check the found items list. <a href="${itemUrl}">View Item</a>`;
        const notification = {
          userId: lostItem.userId,
          message: message,
          isRead: false
        };
        await new Promise((resolve, reject) => {
          pool.query('INSERT INTO tbl_123_notifications SET ?', notification, (err) => {
            if (err) {
              logger.error(`Error inserting notification: ${err.message}`);
              return reject(err);
            }
            resolve();
          });
        });
      }
    }
    return results;
  } catch (err) {
    logger.error(`Error matching found item: ${err.message}`);
    throw new Error('Error matching found item');
  }
};



module.exports = {
  uploadImage,
  getLostItems,
  getFoundItems,
  getLostItemById,
  getFoundItemById,
  getAllItems,
  getUserItems,
  getItemById,
  updateItem,
  deleteItem,
  reportLostItem,
  reportFoundItem,
  claimItem,
  getClaimRequests,
  updateClaimStatus,
  getDashboardData,
  logActivity,
  getRecentActivities
};
