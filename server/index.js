
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const graphsRoutes = require('./routes/graphs');
const countsRoutes = require('./routes/counts');
const notificationsRouter = require('./routes/notifications');
const protectedRoutes = require('./routes/protected');
const adminRouter = require('./routes/admin');

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
    process.env.ALLOWED_ORIGIN_1 || 'https://lost-and-found-project.onrender.com',
    process.env.ALLOWED_ORIGIN_2 || 'http://localhost:3000',
    process.env.ALLOWED_ORIGIN_3 || 'http://127.0.0.1:5501',
    process.env.ALLOWED_ORIGIN_4 || 'http://se.shenkar.ac.il'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, '..')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Use routes
app.use('/api', authRoutes);
app.use('/api', itemRoutes);
app.use('/api', graphsRoutes);
app.use('/api/notifications', notificationsRouter);
app.use('/api', protectedRoutes);
app.use('/api/admin', adminRouter);
app.use('/api', countsRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Lost and Found API' });
});

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error-handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
    const url = process.env.NODE_ENV === 'production' ? 'https://lost-and-found-project.onrender.com' : `http://localhost:${port}`;
    console.log(`Server is running on ${url}`);
    logger.info(`Server is running on ${url}`);
});

module.exports = app;
