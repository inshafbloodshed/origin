const express = require('express');
const axios = require('axios');
const { getConnection, sql } = require('../config/db');

const router = express.Router();

// WhatsApp number for notifications
const WHATSAPP_NUMBER = '94725335460'; // Your WhatsApp number

router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const pool = await getConnection();
        
        // Save to database
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('message', sql.NVarChar, message)
            .query(`INSERT INTO ContactMessages (name, email, message) 
                    VALUES (@name, @email, @message);
                    SELECT SCOPE_IDENTITY() AS id`);
        
        // Send WhatsApp notification via WhatsApp Business API or CallMeBot
        try {
            const whatsappMessage = `New Contact Message from ${name}%0AEmail: ${email}%0AMessage: ${message}`;
            // Using CallMeBot API (free for personal use)
            await axios.get(`https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUMBER}&text=${whatsappMessage}&apikey=YOUR_API_KEY`);
        } catch (whatsappError) {
            console.error('WhatsApp notification failed:', whatsappError.message);
        }
        
        res.status(201).json({ message: 'Message sent successfully' });
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
            .query('SELECT * FROM ContactMessages ORDER BY created_at DESC');
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
            .query('DELETE FROM ContactMessages WHERE id = @id');
        
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;