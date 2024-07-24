const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes'); // Ensure this is correctly set up
const logger = require('./logger');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = [
  'https://lost-and-found-project.onrender.com',
  'http://localhost:3000',
  'http://127.0.0.1:5501',
  'http://se.shenkar.ac.il'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Middleware to parse JSON and URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the main directory
app.use(express.static(path.join(__dirname, '..')));

// Serve uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Serve index.html for the root URL
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Lost and Found API' });
});

// API routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server is running on ${process.env.NODE_ENV === 'production' ? 'https://lost-and-found-project.onrender.com' : `http://localhost:${port}`}`);
  logger.info(`Server is running on ${process.env.NODE_ENV === 'production' ? 'https://lost-and-found-project.onrender.com' : `http://localhost:${port}`}`);
});

module.exports = app;
