const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// Mock data fallback
let mockVehicles = [
    { id: 1, name: "Economy Sedan", description: "Comfortable for city tours", price_per_day: 35, image_url: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg", category: "economy" },
    { id: 2, name: "Luxury Minivan", description: "Spacious for families", price_per_day: 55, image_url: "https://images.pexels.com/photos/210182/pexels-photo-210182.jpeg", category: "luxury" },
    { id: 3, name: "4x4 SUV", description: "Perfect for adventures", price_per_day: 85, image_url: "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg", category: "suv" }
];

// GET all vehicles
router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        if (pool) {
            const result = await pool.request().query('SELECT * FROM Vehicles ORDER BY id');
            res.json(result.recordset);
        } else {
            res.json(mockVehicles);
        }
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.json(mockVehicles);
    }
});

// CREATE vehicle - FIXED: removed the object, added proper callback
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description, price_per_day, image_url, category } = req.body;

        const pool = await getConnection();
        if (pool) {
            const result = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('description', sql.NVarChar, description)
                .input('price_per_day', sql.Decimal, price_per_day)
                .input('image_url', sql.NVarChar, image_url)
                .input('category', sql.NVarChar, category)
                .query(`
                    INSERT INTO Vehicles (name, description, price_per_day, image_url, category) 
                    VALUES (@name, @description, @price_per_day, @image_url, @category);
                    SELECT SCOPE_IDENTITY() AS id
                `);
            res.status(201).json({ id: result.recordset[0].id, message: 'Vehicle created' });
        } else {
            const newVehicle = { id: mockVehicles.length + 1, name, description, price_per_day, image_url, category };
            mockVehicles.push(newVehicle);
            res.status(201).json(newVehicle);
        }
    } catch (error) {
        console.error('Error creating vehicle:', error);
        res.status(500).json({ message: 'Error creating vehicle' });
    }
});

// UPDATE vehicle
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price_per_day, image_url, category } = req.body;

        const pool = await getConnection();
        if (pool) {
            await pool.request()
                .input('id', sql.Int, id)
                .input('name', sql.NVarChar, name)
                .input('description', sql.NVarChar, description)
                .input('price_per_day', sql.Decimal, price_per_day)
                .input('image_url', sql.NVarChar, image_url)
                .input('category', sql.NVarChar, category)
                .query(`
                    UPDATE Vehicles 
                    SET name = @name, description = @description, price_per_day = @price_per_day, 
                        image_url = @image_url, category = @category, updated_at = GETDATE() 
                    WHERE id = @id
                `);
            res.json({ message: 'Vehicle updated' });
        } else {
            const index = mockVehicles.findIndex(v => v.id === parseInt(id));
            if (index !== -1) {
                mockVehicles[index] = { ...mockVehicles[index], name, description, price_per_day, image_url, category };
                res.json({ message: 'Vehicle updated' });
            } else {
                res.status(404).json({ message: 'Vehicle not found' });
            }
        }
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({ message: 'Error updating vehicle' });
    }
});

// DELETE vehicle
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await getConnection();
        if (pool) {
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Vehicles WHERE id = @id');
            res.json({ message: 'Vehicle deleted' });
        } else {
            const index = mockVehicles.findIndex(v => v.id === parseInt(id));
            if (index !== -1) {
                mockVehicles.splice(index, 1);
                res.json({ message: 'Vehicle deleted' });
            } else {
                res.status(404).json({ message: 'Vehicle not found' });
            }
        }
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ message: 'Error deleting vehicle' });
    }
});

module.exports = router;