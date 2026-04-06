const express = require('express');
const { getConnection, sql } = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query('SELECT * FROM Vehicles ORDER BY id');
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { name, description, price_per_day, image_url, category } = req.body;
        const pool = await getConnection();
        
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('description', sql.NVarChar, description)
            .input('price_per_day', sql.Decimal, price_per_day)
            .input('image_url', sql.NVarChar, image_url)
            .input('category', sql.NVarChar, category)
            .query(`INSERT INTO Vehicles (name, description, price_per_day, image_url, category) 
                    VALUES (@name, @description, @price_per_day, @image_url, @category);
                    SELECT SCOPE_IDENTITY() AS id`);
        
        res.status(201).json({ id: result.recordset[0].id, message: 'Vehicle created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const { name, description, price_per_day, image_url, category } = req.body;
        const { id } = req.params;
        const pool = await getConnection();
        
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('description', sql.NVarChar, description)
            .input('price_per_day', sql.Decimal, price_per_day)
            .input('image_url', sql.NVarChar, image_url)
            .input('category', sql.NVarChar, category)
            .query(`UPDATE Vehicles SET name = @name, description = @description, 
                    price_per_day = @price_per_day, image_url = @image_url, 
                    category = @category, updated_at = GETDATE() WHERE id = @id`);
        
        res.json({ message: 'Vehicle updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Vehicles WHERE id = @id');
        
        res.json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;