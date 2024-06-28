const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const logger = require('./logger'); // Import the logger

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = [
  'https://lost-and-found-project.onrender.com',
  'https://lost-and-found-project-3.onrender.com'
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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
