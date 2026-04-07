const express = require('express');
const { getConnection, sql } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Mock data fallback
let mockDrivers = [
    { id: 1, name: "Nuwan Perera", bio: "Expert driver with deep knowledge of Sri Lankan culture and history", experience_years: 12, image_url: "https://randomuser.me/api/portraits/men/32.jpg", specialty: "Cultural Tours" },
    { id: 2, name: "Kamal Rathnayake", bio: "Safari specialist and wildlife enthusiast", experience_years: 8, image_url: "https://randomuser.me/api/portraits/men/45.jpg", specialty: "Safari & Wildlife" },
    { id: 3, name: "Dilini Jayawardena", bio: "Hill country expert with great photography skills", experience_years: 6, image_url: "https://randomuser.me/api/portraits/women/68.jpg", specialty: "Hill Country Tours" }
];

router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        if (pool) {
            const result = await pool.request()
                .query('SELECT * FROM Drivers ORDER BY id');
            res.json(result.recordset);
        } else {
            res.json(mockDrivers);
        }
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.json(mockDrivers);
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, bio, experience_years, image_url, specialty } = req.body;
        const pool = await getConnection();
        
        if (pool) {
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
        } else {
            const newDriver = { 
                id: mockDrivers.length + 1, 
                name, 
                bio, 
                experience_years: parseInt(experience_years), 
                image_url,
                specialty
            };
            mockDrivers.push(newDriver);
            res.status(201).json({ message: 'Driver created successfully (mock)', driver: newDriver });
        }
    } catch (error) {
        console.error('Error creating driver:', error);
        res.status(500).json({ message: 'Error creating driver' });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { name, bio, experience_years, image_url, specialty } = req.body;
        const { id } = req.params;
        const pool = await getConnection();
        
        if (pool) {
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
        } else {
            const index = mockDrivers.findIndex(d => d.id === parseInt(id));
            if (index !== -1) {
                mockDrivers[index] = { ...mockDrivers[index], name, bio, experience_years: parseInt(experience_years), image_url, specialty };
            } else {
                return res.status(404).json({ message: 'Driver not found' });
            }
        }
        
        res.json({ message: 'Driver updated successfully' });
    } catch (error) {
        console.error('Error updating driver:', error);
        res.status(500).json({ message: 'Error updating driver' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        if (pool) {
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Drivers WHERE id = @id');
        } else {
            const index = mockDrivers.findIndex(d => d.id === parseInt(id));
            if (index !== -1) {
                mockDrivers.splice(index, 1);
            } else {
                return res.status(404).json({ message: 'Driver not found' });
            }
        }
        
        res.json({ message: 'Driver deleted successfully' });
    } catch (error) {
        console.error('Error deleting driver:', error);
        res.status(500).json({ message: 'Error deleting driver' });
    }
});

module.exports = router;