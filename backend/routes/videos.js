const express = require('express');
const { getConnection, sql } = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Extract YouTube video ID from URL
function getYouTubeEmbedUrl(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const pool = await getConnection();
        
        let query = 'SELECT * FROM Videos';
        if (category) {
            query += ' WHERE category = @category';
        }
        query += ' ORDER BY id DESC';
        
        const request = pool.request();
        if (category) {
            request.input('category', sql.NVarChar, category);
        }
        
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { title, youtube_url, category } = req.body;
        const embed_code = getYouTubeEmbedUrl(youtube_url);
        const pool = await getConnection();
        
        const result = await pool.request()
            .input('title', sql.NVarChar, title)
            .input('youtube_url', sql.NVarChar, youtube_url)
            .input('category', sql.NVarChar, category)
            .input('embed_code', sql.NVarChar, embed_code)
            .query(`INSERT INTO Videos (title, youtube_url, category, embed_code) 
                    VALUES (@title, @youtube_url, @category, @embed_code);
                    SELECT SCOPE_IDENTITY() AS id`);
        
        res.status(201).json({ id: result.recordset[0].id, message: 'Video created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const { title, youtube_url, category } = req.body;
        const { id } = req.params;
        const embed_code = getYouTubeEmbedUrl(youtube_url);
        const pool = await getConnection();
        
        await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar, title)
            .input('youtube_url', sql.NVarChar, youtube_url)
            .input('category', sql.NVarChar, category)
            .input('embed_code', sql.NVarChar, embed_code)
            .query(`UPDATE Videos SET title = @title, youtube_url = @youtube_url, 
                    category = @category, embed_code = @embed_code, updated_at = GETDATE() 
                    WHERE id = @id`);
        
        res.json({ message: 'Video updated successfully' });
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
            .query('DELETE FROM Videos WHERE id = @id');
        
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;