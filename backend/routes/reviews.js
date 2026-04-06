const express = require('express');
const { getConnection, sql } = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query('SELECT * FROM Reviews WHERE is_approved = 1 ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, text, rating } = req.body;
        const pool = await getConnection();
        
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('text', sql.NVarChar, text)
            .input('rating', sql.Int, rating)
            .query(`INSERT INTO Reviews (name, text, rating, is_approved) 
                    VALUES (@name, @text, @rating, 1);
                    SELECT SCOPE_IDENTITY() AS id`);
        
        res.status(201).json({ id: result.recordset[0].id, message: 'Review submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin endpoints
router.get('/admin/all', auth, async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query('SELECT * FROM Reviews ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/admin/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Reviews WHERE id = @id');
        
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;