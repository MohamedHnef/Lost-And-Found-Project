const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const logger = require('./logger');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration to allow all origins in development and specific origins in production
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://lost-and-found-project.onrender.com', 'http://se.shenkar.ac.il']
  : '*';

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins === '*' || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
  }
}));

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

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
  console.log(`Server is running on ${process.env.NODE_ENV === 'production' ? 'https://lost-and-found-project.onrender.com' : `http://localhost:${port}`}`);
});

module.exports = app;
