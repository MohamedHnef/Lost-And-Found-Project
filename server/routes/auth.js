const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register a new user
// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = { username, email, password: hashedPassword, phone };
        pool.query('INSERT INTO tbl_123_users SET ?', newUser, (err, result) => {
            if (err) {
                logger.error(`Error registering new user: ${err.message}`);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            logger.info(`User registered with ID: ${result.insertId}`);
            res.json({ id: result.insertId, ...newUser });
        });
    } catch (error) {
        logger.error(`Server error: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login a user
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt: username=${username}, password=${password}`);

    pool.query('SELECT * FROM tbl_123_users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            logger.error(`Error fetching user: ${err.message}`);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            logger.warn('Invalid username');
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = results[0];
        console.log(`User found: ${JSON.stringify(user)}`);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Password match: ${isMatch}`);

        if (!isMatch) {
            logger.warn('Invalid password');
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

        logger.info(`User logged in: ${user.username}`);
        res.json({ message: 'Login successful', token, user: { username: user.username } });
    });
});

module.exports = router;
