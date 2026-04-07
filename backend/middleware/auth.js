// middleware/auth.js
const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');
    
    if (!token) {
        console.log('⚠️ No token provided, using mock admin mode');
        req.user = { id: 1, username: 'admin' };
        return next();
    }
    
    try {
        // For mock JWT tokens
        if (token.startsWith('mock-jwt-token')) {
            req.user = { id: 1, username: 'admin' };
            return next();
        }
        
        // Verify real JWT token if you have one
        // const jwt = require('jsonwebtoken');
        // const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        // req.user = decoded;
        
        req.user = { id: 1, username: 'admin' };
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { authMiddleware };