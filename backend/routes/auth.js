const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection, sql } = require('../config/db');

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const pool = await getConnection();
        
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Admins WHERE username = @username');
        
        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const admin = result.recordset[0];
        const isValid = await bcrypt.compare(password, admin.password_hash);
        
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '7d' }
        );
        
        res.json({ token, username: admin.username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;