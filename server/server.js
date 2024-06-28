const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const logger = require('./logger'); // Import the logger

const app = express();
const port = process.env.PORT || 3000;

// Determine the environment
const isProduction = process.env.NODE_ENV === 'production';
const corsOrigin = isProduction ? 'https://lost-and-found-project.onrender.com' : 'http://127.0.0.1:5501';

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: corsOrigin }));

// Serve static files from the 'first_submition' directory
app.use(express.static(path.join(__dirname, '..')));

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api', routes);

// Logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server is running on ${isProduction ? 'https://lost-and-found-project.onrender.com' : `http://localhost:${port}`}`);
});

module.exports = app;
