const express = require('express');
const { getConnection, sql } = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query('SELECT * FROM Drivers ORDER BY id');
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { name, bio, experience_years, image_url, specialty } = req.body;
        const pool = await getConnection();
        
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('bio', sql.NVarChar, bio)
            .input('experience_years', sql.Int, experience_years)
            .input('image_url', sql.NVarChar, image_url)
            .input('specialty', sql.NVarChar, specialty)
            .query(`INSERT INTO Drivers (name, bio, experience_years, image_url, specialty) 
                    VALUES (@name, @bio, @experience_years, @image_url, @specialty);
                    SELECT SCOPE_IDENTITY() AS id`);
        
        res.status(201).json({ id: result.recordset[0].id, message: 'Driver created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const { name, bio, experience_years, image_url, specialty } = req.body;
        const { id } = req.params;
        const pool = await getConnection();
        
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('bio', sql.NVarChar, bio)
            .input('experience_years', sql.Int, experience_years)
            .input('image_url', sql.NVarChar, image_url)
            .input('specialty', sql.NVarChar, specialty)
            .query(`UPDATE Drivers SET name = @name, bio = @bio, 
                    experience_years = @experience_years, image_url = @image_url, 
                    specialty = @specialty, updated_at = GETDATE() WHERE id = @id`);
        
        res.json({ message: 'Driver updated successfully' });
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
            .query('DELETE FROM Drivers WHERE id = @id');
        
        res.json({ message: 'Driver deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;