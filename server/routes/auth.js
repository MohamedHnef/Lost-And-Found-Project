const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction ? 'https://lost-and-found-project.onrender.com' : 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const DEFAULT_PROFILE_PIC = `${baseUrl}/uploads/default-profile-pic.png`;

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

router.post('/register', upload.single('profilePic'), async (req, res) => {
    try {
        let { username, email, password, phone } = req.body;
        if (!username || !email || !password || !phone) {
            logger.error('Missing required fields in the registration request');
            return res.status(400).json({ error: 'All fields are required' });
        }

        username = username.trim().toLowerCase();
        email = email.trim();

        logger.info(`Checking if username ${username} already exists`);

        // Correcting the query result handling
        pool.query('SELECT * FROM tbl_123_users WHERE username = ?', [username], (err, results) => {
            if (err) {
                logger.error(`Error fetching user: ${err.message}`);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (results.length > 0) {
                logger.error('Username already exists');
                return res.status(400).json({ error: 'Username already exists' });
            }

            // Continue with user creation if username does not exist
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    logger.error(`Error hashing password: ${err.message}`);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                const profilePicture = req.file ? `${baseUrl}/uploads/${req.file.filename}` : DEFAULT_PROFILE_PIC;
                const newUser = {
                    username,
                    email,
                    password: hashedPassword,
                    phone,
                    profile_pic: profilePicture,
                    role: 'user' // Default role
                };

                pool.query('INSERT INTO tbl_123_users SET ?', newUser, (err, result) => {
                    if (err) {
                        logger.error(`Error registering new user: ${err.message}`);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }
                    logger.info(`User registered with ID: ${result.insertId}`);
                    res.json({ id: result.insertId, ...newUser });
                });
            });
        });
    } catch (error) {
        logger.error(`Server error: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



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

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        logger.info(`User logged in: ${user.username}`);
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                profilePicture: user.profile_pic
            }
        });
    });
});

module.exports = router;