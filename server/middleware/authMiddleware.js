
const jwt = require('jsonwebtoken');
const logger = require('../logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = {
    authenticateToken
};
