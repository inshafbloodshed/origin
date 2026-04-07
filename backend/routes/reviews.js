const express = require('express');
const { getConnection, sql } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Mock data fallback
let mockReviews = [
    { id: 1, name: "Emma Watson", text: "Amazing experience! The driver was very professional and knowledgeable. Highly recommend!", rating: 5, created_at: "2024-01-15", is_approved: true },
    { id: 2, name: "Marco Rossi", text: "Great service and comfortable vehicle. Sri Lanka is beautiful!", rating: 5, created_at: "2024-01-10", is_approved: true }
];

router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        if (pool) {
            const result = await pool.request()
                .query('SELECT * FROM Reviews WHERE is_approved = 1 ORDER BY created_at DESC');
            res.json(result.recordset);
        } else {
            const approvedReviews = mockReviews.filter(r => r.is_approved);
            res.json(approvedReviews);
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.json(mockReviews.filter(r => r.is_approved));
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, text, rating } = req.body;
        const pool = await getConnection();
        
        if (pool) {
            const result = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('text', sql.NVarChar, text)
                .input('rating', sql.Int, rating)
                .query(`INSERT INTO Reviews (name, text, rating, is_approved) 
                        VALUES (@name, @text, @rating, 1);
                        SELECT SCOPE_IDENTITY() AS id`);
            res.status(201).json({ id: result.recordset[0].id, message: 'Review submitted successfully!' });
        } else {
            const newReview = {
                id: mockReviews.length + 1,
                name,
                text,
                rating,
                created_at: new Date().toISOString().split('T')[0],
                is_approved: true
            };
            mockReviews.unshift(newReview);
            res.status(201).json({ message: 'Review submitted successfully!' });
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ message: 'Error submitting review' });
    }
});

// Admin endpoints
router.get('/admin/all', authMiddleware, async (req, res) => {
    try {
        const pool = await getConnection();
        if (pool) {
            const result = await pool.request()
                .query('SELECT * FROM Reviews ORDER BY created_at DESC');
            res.json(result.recordset);
        } else {
            res.json(mockReviews);
        }
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        res.json(mockReviews);
    }
});

router.delete('/admin/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        if (pool) {
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Reviews WHERE id = @id');
        } else {
            const index = mockReviews.findIndex(r => r.id === parseInt(id));
            if (index !== -1) {
                mockReviews.splice(index, 1);
            } else {
                return res.status(404).json({ message: 'Review not found' });
            }
        }
        
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Error deleting review' });
    }
});

module.exports = router;