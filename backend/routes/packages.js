const express = require('express');
const { getConnection, sql } = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all packages
router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query('SELECT * FROM Packages ORDER BY id');
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create package (admin only)
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, price, image_url, category } = req.body;
        const pool = await getConnection();
        
        const result = await pool.request()
            .input('title', sql.NVarChar, title)
            .input('description', sql.NVarChar, description)
            .input('price', sql.Decimal, price)
            .input('image_url', sql.NVarChar, image_url)
            .input('category', sql.NVarChar, category)
            .query(`INSERT INTO Packages (title, description, price, image_url, category) 
                    VALUES (@title, @description, @price, @image_url, @category);
                    SELECT SCOPE_IDENTITY() AS id`);
        
        res.status(201).json({ id: result.recordset[0].id, message: 'Package created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update package (admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, description, price, image_url, category } = req.body;
        const { id } = req.params;
        const pool = await getConnection();
        
        await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar, title)
            .input('description', sql.NVarChar, description)
            .input('price', sql.Decimal, price)
            .input('image_url', sql.NVarChar, image_url)
            .input('category', sql.NVarChar, category)
            .query(`UPDATE Packages SET title = @title, description = @description, 
                    price = @price, image_url = @image_url, category = @category,
                    updated_at = GETDATE() WHERE id = @id`);
        
        res.json({ message: 'Package updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete package (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Packages WHERE id = @id');
        
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;