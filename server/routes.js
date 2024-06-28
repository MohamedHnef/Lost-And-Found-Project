const express = require('express');
const router = express.Router();
const pool = require('./db');
const multer = require('multer');
const path = require('path');

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Endpoint to fetch all items
router.get('/all-items', (req, res) => {
    pool.query('SELECT * FROM tbl_123_posts', (err, results) => {
        if (err) {
            console.error('Error fetching all items:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Endpoint to fetch limited items
router.get('/items', (req, res) => {
    pool.query('SELECT * FROM tbl_123_posts LIMIT 4', (err, results) => {
        if (err) {
            console.error('Error fetching limited items:', err);
            return res.status(500).json({ error: err.message });
        }
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
            console.error('Error fetching user items:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Endpoint to fetch a specific item by name
router.get('/items/:itemName', (req, res) => {
    const itemName = req.params.itemName;
    pool.query('SELECT * FROM tbl_123_posts WHERE itemName = ?', [itemName], (err, results) => {
        if (err) {
            console.error('Error fetching item by name:', err);
            return res.status(500).json({ error: err.message });
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    });
});

// Endpoint to add a new item
router.post('/items', (req, res) => {
    const newItem = req.body;
    console.log('New Item:', newItem); // Log the new item data
    pool.query('INSERT INTO tbl_123_posts SET ?', newItem, (err, result) => {
        if (err) {
            console.error('Error adding new item:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: result.insertId, ...newItem });
    });
});

// Endpoint to update an item
router.put('/items/:id', (req, res) => {
    const itemId = req.params.id;
    const updatedItem = req.body;
    console.log('Updated Item:', updatedItem); // Log the updated item data
    pool.query('UPDATE tbl_123_posts SET ? WHERE id = ?', [updatedItem, itemId], (err) => {
        if (err) {
            console.error('Error updating item:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// Endpoint to delete an item
router.delete('/items/:id', (req, res) => {
    const itemId = req.params.id;
    pool.query('DELETE FROM tbl_123_posts WHERE id = ?', [itemId], (err) => {
        if (err) {
            console.error('Error deleting item:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// Endpoint to upload an image
router.post('/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
        res.json({ imageUrl });
    } catch (err) {
        console.error('Error handling file upload:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
