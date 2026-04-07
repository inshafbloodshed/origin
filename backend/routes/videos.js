const express = require('express');
const { getConnection, sql } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Mock data fallback
let mockVideos = [];

// Extract YouTube video ID from URL
function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    
    let videoId = null;
    
    if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        videoId = urlParams.get('v');
    }
    else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
    }
    else if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('shorts/')[1]?.split('?')[0];
    }
    
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0&showinfo=0&controls=1`;
    }
    
    return url;
}

router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const pool = await getConnection();
        
        if (pool) {
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
            const videos = result.recordset.map(video => ({
                ...video,
                embed_code: getYouTubeEmbedUrl(video.youtube_url || video.embed_code)
            }));
            res.json(videos);
        } else {
            let filtered = mockVideos;
            if (category) {
                filtered = mockVideos.filter(v => v.category === category);
            }
            res.json(filtered);
        }
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.json(mockVideos);
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, youtube_url, category } = req.body;
        const embed_code = getYouTubeEmbedUrl(youtube_url);
        const pool = await getConnection();
        
        if (pool) {
            const result = await pool.request()
                .input('title', sql.NVarChar, title)
                .input('youtube_url', sql.NVarChar, youtube_url)
                .input('category', sql.NVarChar, category)
                .input('embed_code', sql.NVarChar, embed_code)
                .query(`INSERT INTO Videos (title, youtube_url, category, embed_code) 
                        VALUES (@title, @youtube_url, @category, @embed_code);
                        SELECT SCOPE_IDENTITY() AS id`);
            
            res.status(201).json({ id: result.recordset[0].id, message: 'Video created successfully' });
        } else {
            const newVideo = { 
                id: mockVideos.length + 1, 
                title, 
                youtube_url, 
                category, 
                embed_code,
                created_at: new Date(),
                updated_at: new Date()
            };
            mockVideos.push(newVideo);
            res.status(201).json({ message: 'Video created successfully (mock)' });
        }
    } catch (error) {
        console.error('Error creating video:', error);
        res.status(500).json({ message: 'Error creating video' });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { title, youtube_url, category } = req.body;
        const { id } = req.params;
        const embed_code = getYouTubeEmbedUrl(youtube_url);
        const pool = await getConnection();
        
        if (pool) {
            await pool.request()
                .input('id', sql.Int, id)
                .input('title', sql.NVarChar, title)
                .input('youtube_url', sql.NVarChar, youtube_url)
                .input('category', sql.NVarChar, category)
                .input('embed_code', sql.NVarChar, embed_code)
                .query(`UPDATE Videos SET title = @title, youtube_url = @youtube_url, 
                        category = @category, embed_code = @embed_code, updated_at = GETDATE() 
                        WHERE id = @id`);
        } else {
            const index = mockVideos.findIndex(v => v.id === parseInt(id));
            if (index !== -1) {
                mockVideos[index] = { ...mockVideos[index], title, youtube_url, category, embed_code };
            } else {
                return res.status(404).json({ message: 'Video not found' });
            }
        }
        
        res.json({ message: 'Video updated successfully' });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ message: 'Error updating video' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        if (pool) {
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Videos WHERE id = @id');
        } else {
            const index = mockVideos.findIndex(v => v.id === parseInt(id));
            if (index !== -1) {
                mockVideos.splice(index, 1);
            } else {
                return res.status(404).json({ message: 'Video not found' });
            }
        }
        
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ message: 'Error deleting video' });
    }
});

module.exports = router;