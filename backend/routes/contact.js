const express = require('express');
const axios = require('axios');
const { getConnection, sql } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Mock data fallback
let mockMessages = [];

// WhatsApp number for notifications (optional)
const WHATSAPP_NUMBER = '94725335460';

router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        console.log(`📧 New message from ${name}: ${message}`);
        
        const pool = await getConnection();
        
        if (pool) {
            // Save to database
            const result = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('email', sql.NVarChar, email)
                .input('message', sql.NVarChar, message)
                .query(`INSERT INTO ContactMessages (name, email, message) 
                        VALUES (@name, @email, @message);
                        SELECT SCOPE_IDENTITY() AS id`);
        } else {
            // Use mock data
            const newMessage = {
                id: mockMessages.length + 1,
                name,
                email,
                message,
                created_at: new Date().toISOString(),
                is_read: false
            };
            mockMessages.unshift(newMessage);
        }
        
        // Optional: Send WhatsApp notification (comment out if not needed)
        // try {
        //     const whatsappMessage = `New Contact Message from ${name}%0AEmail: ${email}%0AMessage: ${message}`;
        //     await axios.get(`https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUMBER}&text=${whatsappMessage}&apikey=YOUR_API_KEY`);
        // } catch (whatsappError) {
        //     console.error('WhatsApp notification failed:', whatsappError.message);
        // }
        
        res.status(201).json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
});

// Admin endpoints
router.get('/admin/all', authMiddleware, async (req, res) => {
    try {
        const pool = await getConnection();
        if (pool) {
            const result = await pool.request()
                .query('SELECT * FROM ContactMessages ORDER BY created_at DESC');
            res.json(result.recordset);
        } else {
            res.json(mockMessages);
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

router.delete('/admin/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        if (pool) {
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM ContactMessages WHERE id = @id');
        } else {
            const index = mockMessages.findIndex(m => m.id === parseInt(id));
            if (index !== -1) {
                mockMessages.splice(index, 1);
            }
        }
        
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Error deleting message' });
    }
});

module.exports = router;