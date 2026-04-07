const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import routes
const packagesRoutes = require('../routes/packages');
const vehiclesRoutes = require('../routes/vehicles');
const driversRoutes = require('../routes/drivers');
const videosRoutes = require('../routes/videos');
const reviewsRoutes = require('../routes/reviews');
const contactRoutes = require('../routes/contact');
const roundToursRoutes = require('../routes/roundTours');
const authRoutes = require('../routes/auth');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',') : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://luxeelanka.publicvm.com',
        'https://luxeelanka.publicvm.com',
        'http://112.134.199.25'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Luxe Lanka Backend is running on Vercel Serverless!',
        status: 'online',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/packages', packagesRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/round-tours', roundToursRoutes);
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.url,
        available_endpoints: [
            '/api/test',
            '/api/packages',
            '/api/vehicles',
            '/api/drivers',
            '/api/drivers/:id',
            '/api/videos',
            '/api/reviews',
            '/api/reviews/admin/all',
            '/api/contact',
            '/api/contact/admin/all',
            '/api/round-tours',
            '/api/round-tours/:id',
            '/api/upload/driver',
            '/api/auth/login'
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Export for Vercel
module.exports = app;