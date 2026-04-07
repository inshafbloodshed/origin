const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// Mock data fallback
let mockPackages = [
    { id: 1, title: "Cultural Triangle", description: "Sigiriya, Kandy, Polonnaruwa - Ancient cities", price: 190, image_url: "https://images.pexels.com/photos/1603650/sigiriya-lion-rock-sri-lanka-1603650.jpg", category: "tour" },
    { id: 2, title: "Hill Country Escape", description: "Ella, Nuwara Eliya - Tea plantations", price: 250, image_url: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg", category: "tour" },
    { id: 3, title: "Beach Paradise", description: "Mirissa, Bentota, Galle - Sun and sand", price: 210, image_url: "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg", category: "tour" }
];

router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Packages ORDER BY id');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.json(mockPackages);
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, price, image_url, category } = req.body;
        const pool = await getConnection();
        const result = await pool.request()
            .input('title', sql.NVarChar, title)
            .input('description', sql.NVarChar, description)
            .input('price', sql.Decimal, price)
            .input('image_url', sql.NVarChar, image_url)
            .input('category', sql.NVarChar, category)
            .query(`
                INSERT INTO Packages (title, description, price, image_url, category) 
                VALUES (@title, @description, @price, @image_url, @category);
                SELECT SCOPE_IDENTITY() AS id
            `);
        res.status(201).json({ id: result.recordset[0].id, message: 'Package created' });
    } catch (error) {
        console.error('Error creating package:', error);
        const { title, description, price, image_url, category } = req.body;
        const newPackage = { id: mockPackages.length + 1, title, description, price, image_url, category };
        mockPackages.push(newPackage);
        res.status(201).json(newPackage);
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, image_url, category } = req.body;
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar, title)
            .input('description', sql.NVarChar, description)
            .input('price', sql.Decimal, price)
            .input('image_url', sql.NVarChar, image_url)
            .input('category', sql.NVarChar, category)
            .query(`
                UPDATE Packages 
                SET title = @title, description = @description, price = @price, 
                    image_url = @image_url, category = @category, updated_at = GETDATE() 
                WHERE id = @id
            `);
        res.json({ message: 'Package updated' });
    } catch (error) {
        console.error('Error updating package:', error);
        res.status(500).json({ message: 'Error updating package' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Packages WHERE id = @id');
        res.json({ message: 'Package deleted' });
    } catch (error) {
        console.error('Error deleting package:', error);
        res.status(500).json({ message: 'Error deleting package' });
    }
});

module.exports = router;