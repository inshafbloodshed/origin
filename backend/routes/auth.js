const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection, sql } = require('../config/db');

const router = express.Router();

// Mock admin for fallback
const mockAdmin = {
    id: 1,
    username: 'admin',
    password_hash: '$2a$10$YourHashedPasswordHere' // In production, use real hash
};

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if username is admin (simple auth for now)
        if (username === 'admin' && password === 'admin123') {
            const token = jwt.sign(
                { id: 1, username: 'admin' },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '7d' }
            );
            return res.json({ token, username: 'admin', message: 'Login successful' });
        }
        
        // Try database authentication if available
        const pool = await getConnection();
        if (pool) {
            const result = await pool.request()
                .input('username', sql.NVarChar, username)
                .query('SELECT * FROM Admins WHERE username = @username');
            
            if (result.recordset.length > 0) {
                const admin = result.recordset[0];
                const isValid = await bcrypt.compare(password, admin.password_hash);
                
                if (isValid) {
                    const token = jwt.sign(
                        { id: admin.id, username: admin.username },
                        process.env.JWT_SECRET || 'your_jwt_secret',
                        { expiresIn: '7d' }
                    );
                    return res.json({ token, username: admin.username, message: 'Login successful' });
                }
            }
        }
        
        return res.status(401).json({ message: 'Invalid credentials. Use admin/admin123' });
    } catch (error) {
        console.error('Login error:', error);
        // Fallback for demo
        const { username, password } = req.body;
        if (username === 'admin' && password === 'admin123') {
            const token = jwt.sign(
                { id: 1, username: 'admin' },
                'your_jwt_secret',
                { expiresIn: '7d' }
            );
            return res.json({ token, username: 'admin', message: 'Login successful' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;