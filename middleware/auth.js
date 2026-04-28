const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const [scheme, token] = authHeader ? authHeader.split(' ') : [];

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Access denied. Bearer token required.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Contains user ID
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
