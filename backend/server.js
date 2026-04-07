const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { getConnection, sql, testConnection } = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory for temporary storage
const uploadsDir = path.join(__dirname, 'uploads');
const driversUploadDir = path.join(__dirname, 'uploads/drivers');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(driversUploadDir)) {
    fs.mkdirSync(driversUploadDir, { recursive: true });
}

// File upload middleware setup
const multer = require('multer');

// Configure storage for temporary files
const storage = multer.memoryStorage(); // Store in memory for DB insertion

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'));
        }
    }
});

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002','http://luxeelanka.publicvm.com',     // Your domain
        'https://luxeelanka.publicvm.com',    // HTTPS version (if you add SSL)
        'http://112.134.199.25'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log('🚀 Starting Luxe Lanka Backend Server...');

// ============= HELPER FUNCTION FOR YOUTUBE EMBED =============
function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    let videoId = null;
    
    // Format 1: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        videoId = urlParams.get('v');
    }
    // Format 2: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    // Format 3: https://www.youtube.com/embed/VIDEO_ID
    else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
    }
    // Format 4: https://www.youtube.com/shorts/VIDEO_ID
    else if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('shorts/')[1]?.split('?')[0];
    }
    
    if (videoId) {
        // Return embed URL with enhanced security and privacy parameters
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0&showinfo=0&controls=1&fs=1&iv_load_policy=3&enablejsapi=1&origin=${process.env.FRONTEND_URL || 'http://localhost:3000'}`;
    }
    
    // If it's already an embed URL, return as is
    if (url.includes('youtube.com/embed/')) {
        return url;
    }
    
    return url;
}

// ============= AUTH MIDDLEWARE =============
const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');
    
    if (!token) {
        console.log('⚠️  No token provided, but allowing access for mock mode');
        req.user = { id: 1, username: 'admin' };
        return next();
    }
    
    try {
        if (token.startsWith('mock-jwt-token')) {
            req.user = { id: 1, username: 'admin' };
            return next();
        }
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Upload image to database
app.post('/api/upload/driver', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Return the image data as base64 for preview
        const base64Image = req.file.buffer.toString('base64');
        const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
        
        console.log('✅ Image processed for upload');
        console.log('📁 File name:', req.file.originalname);
        console.log('📁 File size:', req.file.size, 'bytes');
        console.log('📁 MIME type:', req.file.mimetype);
        
        res.json({ 
            imageData: base64Image,
            imageUrl: imageUrl,
            contentType: req.file.mimetype,
            filename: req.file.originalname,
            message: 'Image processed successfully' 
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed: ' + error.message });
    }
});

// ============= DATABASE INITIALIZATION =============
let dbConnected = false;

async function initializeDatabase() {
    try {
        dbConnected = await testConnection();
        if (dbConnected) {
            console.log('✅ Database is ready to use');
        } else {
            console.log('⚠️  Using mock data (database not connected)');
        }
    } catch (error) {
        console.log('⚠️  Using mock data (database connection failed)');
        dbConnected = false;
    }
}

// ============= MOCK DATA (Fallback) =============
let mockPackages = [
    { id: 1, title: "Cultural Triangle", description: "Sigiriya, Kandy, Polonnaruwa - Ancient cities", price: 190, image_url: "https://images.pexels.com/photos/1603650/sigiriya-lion-rock-sri-lanka-1603650.jpg", category: "tour" },
    { id: 2, title: "Hill Country Escape", description: "Ella, Nuwara Eliya - Tea plantations", price: 250, image_url: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg", category: "tour" },
    { id: 3, title: "Beach Paradise", description: "Mirissa, Bentota, Galle - Sun and sand", price: 210, image_url: "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg", category: "tour" }
];

let mockVehicles = [
    { id: 1, name: "Economy Sedan", description: "Comfortable for city tours", price_per_day: 35, image_url: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg", category: "economy" },
    { id: 2, name: "Luxury Minivan", description: "Spacious for families", price_per_day: 55, image_url: "https://images.pexels.com/photos/210182/pexels-photo-210182.jpeg", category: "luxury" },
    { id: 3, name: "4x4 SUV", description: "Perfect for adventures", price_per_day: 85, image_url: "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg", category: "suv" }
];

let mockDrivers = [
    { id: 1, name: "Nuwan Perera", bio: "Expert driver with deep knowledge of Sri Lankan culture and history", experience_years: 12, image_url: "https://randomuser.me/api/portraits/men/32.jpg", specialty: "Cultural Tours", image_data: null, image_content_type: null },
    { id: 2, name: "Kamal Rathnayake", bio: "Safari specialist and wildlife enthusiast", experience_years: 8, image_url: "https://randomuser.me/api/portraits/men/45.jpg", specialty: "Safari & Wildlife", image_data: null, image_content_type: null },
    { id: 3, name: "Dilini Jayawardena", bio: "Hill country expert with great photography skills", experience_years: 6, image_url: "https://randomuser.me/api/portraits/women/68.jpg", specialty: "Hill Country Tours", image_data: null, image_content_type: null }
];

let mockVideos = [
    { id: 1, title: "Cultural Triangle Experience", youtube_url: "https://www.youtube.com/watch?v=5Y1lzirP9kY", embed_code: getYouTubeEmbedUrl("https://www.youtube.com/watch?v=5Y1lzirP9kY"), category: "home" },
    { id: 2, title: "Luxury Fleet Overview", youtube_url: "https://www.youtube.com/watch?v=MIU6P3iJQzc", embed_code: getYouTubeEmbedUrl("https://www.youtube.com/watch?v=MIU6P3iJQzc"), category: "vehicle" },
    { id: 3, title: "Driver Testimonial", youtube_url: "https://www.youtube.com/watch?v=3BzXQpYwFg0", embed_code: getYouTubeEmbedUrl("https://www.youtube.com/watch?v=3BzXQpYwFg0"), category: "driver" }
];

let mockReviews = [
    { id: 1, name: "Emma Watson", text: "Amazing experience! The driver was very professional and knowledgeable. Highly recommend!", rating: 5, created_at: "2024-01-15", is_approved: true },
    { id: 2, name: "Marco Rossi", text: "Great service and comfortable vehicle. Sri Lanka is beautiful!", rating: 5, created_at: "2024-01-10", is_approved: true },
    { id: 3, name: "Sarah Johnson", text: "The cultural triangle tour was incredible. Our guide Nuwan was fantastic!", rating: 5, created_at: "2024-01-05", is_approved: true }
];

let mockMessages = [
    { id: 1, name: "John Smith", email: "john@example.com", message: "I'm interested in the Cultural Triangle package. Can you provide more details?", created_at: "2024-01-14", is_read: false },
    { id: 2, name: "Maria Garcia", email: "maria@example.com", message: "Looking for a 5-day tour with luxury vehicle. Please share options.", created_at: "2024-01-13", is_read: false },
    { id: 3, name: "Alex Turner", email: "alex@example.com", message: "Thank you for the amazing service! Will recommend to friends.", created_at: "2024-01-10", is_read: true }
];

let mockRoundTours = [
    { id: 1, days: 7, title: "7 Days - Cultural & Nature Explorer", duration: "7 Days / 6 Nights", price: "$650", description: "Perfect for first-time visitors. Experience the cultural triangle, hill country, and beautiful beaches.", image_url: "https://images.pexels.com/photos/1603650/sigiriya-lion-rock-sri-lanka-1603650.jpg", total_days: 7 },
    { id: 2, days: 8, title: "8 Days - Heritage & Wildlife Journey", duration: "8 Days / 7 Nights", price: "$750", description: "Extended tour with more wildlife safaris and cultural experiences.", image_url: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg", total_days: 8 },
    { id: 3, days: 9, title: "9 Days - Complete Island Experience", duration: "9 Days / 8 Nights", price: "$850", description: "Comprehensive tour covering all major attractions across the island.", image_url: "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg", total_days: 9 },
    { id: 4, days: 10, title: "10 Days - Ultimate Sri Lanka Adventure", duration: "10 Days / 9 Nights", price: "$950", description: "In-depth exploration with more time at each destination.", image_url: "https://images.pexels.com/photos/1603650/sigiriya-lion-rock-sri-lanka-1603650.jpg", total_days: 10 },
    { id: 5, days: 11, title: "11 Days - Luxury & Culture Fusion", duration: "11 Days / 10 Nights", price: "$1200", description: "Premium accommodations with exclusive experiences.", image_url: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg", total_days: 11 },
    { id: 6, days: 12, title: "12 Days - Off the Beaten Path", duration: "12 Days / 11 Nights", price: "$1100", description: "Discover hidden gems and less touristy locations.", image_url: "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg", total_days: 12 },
    { id: 7, days: 13, title: "13 Days - Deep Cultural Immersion", duration: "13 Days / 12 Nights", price: "$1250", description: "Extended cultural experience with local interactions.", image_url: "https://images.pexels.com/photos/1603650/sigiriya-lion-rock-sri-lanka-1603650.jpg", total_days: 13 },
    { id: 8, days: 14, title: "14 Days - Grand Sri Lanka Tour", duration: "14 Days / 13 Nights", price: "$1450", description: "Complete two-week journey covering every major region.", image_url: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg", total_days: 14 }
];

let mockItineraries = {
    1: [
        { id: 1, tour_id: 1, day_number: 1, title: "Arrival & Sigiriya", image_url: "https://images.pexels.com/photos/1603650/sigiriya-lion-rock-sri-lanka-1603650.jpg", activities: JSON.stringify(["Arrival at Colombo International Airport", "Meet & greet by your personal driver", "Transfer to Sigiriya (approx 3.5 hours)", "Check-in at hotel", "Evening village tour with traditional Sri Lankan dinner", "Overnight stay in Sigiriya"]) },
        { id: 2, tour_id: 1, day_number: 2, title: "Sigiriya & Polonnaruwa", image_url: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg", activities: JSON.stringify(["Early morning Sigiriya Lion Rock climb", "Ancient rock fortress exploration", "Visit Polonnaruwa ancient city", "Gal Vihara rock temple", "Evening leisure time at hotel"]) }
    ]
};

// ============= API ROUTES =============

// Test route
app.get('/api/test', (req, res) => {
    res.json({
        message: dbConnected ? 'Backend with SQL Server is running!' : 'Backend with mock data is running!',
        database: dbConnected ? 'Connected to SQL Server' : 'Using mock data',
        timestamp: new Date().toISOString(),
        status: 'online'
    });
});

// ============= PACKAGES ROUTES =============
app.get('/api/packages', async (req, res) => {
    try {
        if (dbConnected) {
            const pool = await getConnection();
            const result = await pool.request().query('SELECT * FROM Packages ORDER BY id');
            res.json(result.recordset);
        } else {
            res.json(mockPackages);
        }
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.json(mockPackages);
    }
});

app.post('/api/packages', authMiddleware, async (req, res) => {
    try {
        const { title, description, price, image_url, category } = req.body;

        if (dbConnected) {
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
        } else {
            const newPackage = { id: mockPackages.length + 1, title, description, price, image_url, category };
            mockPackages.push(newPackage);
            res.status(201).json(newPackage);
        }
    } catch (error) {
        console.error('Error creating package:', error);
        res.status(500).json({ message: 'Error creating package' });
    }
});

app.put('/api/packages/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, image_url, category } = req.body;

        if (dbConnected) {
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
        } else {
            const index = mockPackages.findIndex(p => p.id === parseInt(id));
            if (index !== -1) {
                mockPackages[index] = { ...mockPackages[index], title, description, price, image_url, category };
                res.json({ message: 'Package updated' });
            } else {
                res.status(404).json({ message: 'Package not found' });
            }
        }
    } catch (error) {
        console.error('Error updating package:', error);
        res.status(500).json({ message: 'Error updating package' });
    }
});

app.delete('/api/packages/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (dbConnected) {
            const pool = await getConnection();
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Packages WHERE id = @id');
            res.json({ message: 'Package deleted' });
        } else {
            const index = mockPackages.findIndex(p => p.id === parseInt(id));
            if (index !== -1) {
                mockPackages.splice(index, 1);
                res.json({ message: 'Package deleted' });
            } else {
                res.status(404).json({ message: 'Package not found' });
            }
        }
    } catch (error) {
        console.error('Error deleting package:', error);
        res.status(500).json({ message: 'Error deleting package' });
    }
});

// ============= VEHICLES ROUTES =============
app.get('/api/vehicles', async (req, res) => {
    try {
        if (dbConnected) {
            const pool = await getConnection();
            const result = await pool.request().query('SELECT * FROM Vehicles ORDER BY id');
            res.json(result.recordset);
        } else {
            res.json(mockVehicles);
        }
    } catch (error) {
        res.json(mockVehicles);
    }
});

app.post('/api/vehicles', authMiddleware, async (req, res) => {
    try {
        const { name, description, price_per_day, image_url, category } = req.body;

        if (dbConnected) {
            const pool = await getConnection();
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
        res.status(500).json({ message: 'Error creating vehicle' });
    }
});

app.put('/api/vehicles/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price_per_day, image_url, category } = req.body;

        if (dbConnected) {
            const pool = await getConnection();
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
        res.status(500).json({ message: 'Error updating vehicle' });
    }
});

app.delete('/api/vehicles/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (dbConnected) {
            const pool = await getConnection();
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
        res.status(500).json({ message: 'Error deleting vehicle' });
    }
});

// ============= DRIVERS ROUTES WITH IMAGE STORAGE =============

// GET all drivers
app.get('/api/drivers', async (req, res) => {
    try {
        if (dbConnected) {
            const pool = await getConnection();
            const result = await pool.request()
                .query('SELECT id, name, bio, experience_years, specialty, image_data, image_content_type, created_at, updated_at FROM Drivers ORDER BY id DESC');
            
            const drivers = result.recordset.map(driver => {
                let imageUrl = null;
                if (driver.image_data && driver.image_content_type) {
                    const base64 = driver.image_data.toString('base64');
                    imageUrl = `data:${driver.image_content_type};base64,${base64}`;
                }
                return {
                    id: driver.id,
                    name: driver.name,
                    bio: driver.bio,
                    experience_years: driver.experience_years,
                    specialty: driver.specialty,
                    image_url: imageUrl,
                    created_at: driver.created_at,
                    updated_at: driver.updated_at
                };
            });
            
            console.log(`📋 Retrieved ${drivers.length} drivers from database`);
            res.json(drivers);
        } else {
            res.json(mockDrivers);
        }
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ message: 'Error fetching drivers', error: error.message });
    }
});

// GET single driver by ID
app.get('/api/drivers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (dbConnected) {
            const pool = await getConnection();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT id, name, bio, experience_years, specialty, image_data, image_content_type, created_at, updated_at FROM Drivers WHERE id = @id');
            
            if (result.recordset.length === 0) {
                return res.status(404).json({ message: 'Driver not found' });
            }
            
            const driver = result.recordset[0];
            let imageUrl = null;
            if (driver.image_data && driver.image_content_type) {
                const base64 = driver.image_data.toString('base64');
                imageUrl = `data:${driver.image_content_type};base64,${base64}`;
            }
            
            res.json({
                id: driver.id,
                name: driver.name,
                bio: driver.bio,
                experience_years: driver.experience_years,
                specialty: driver.specialty,
                image_url: imageUrl,
                created_at: driver.created_at,
                updated_at: driver.updated_at
            });
        } else {
            const driver = mockDrivers.find(d => d.id === parseInt(id));
            if (!driver) {
                return res.status(404).json({ message: 'Driver not found' });
            }
            res.json(driver);
        }
    } catch (error) {
        console.error('Error fetching driver:', error);
        res.status(500).json({ message: 'Error fetching driver', error: error.message });
    }
});

// CREATE new driver with image
app.post('/api/drivers', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { name, bio, experience_years, specialty } = req.body;

        if (!name || !bio || !experience_years || !specialty) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        console.log('📝 Creating new driver:', { name, bio, experience_years, specialty });

        if (dbConnected) {
            const pool = await getConnection();
            
            let imageData = null;
            let imageContentType = null;
            
            if (req.file) {
                imageData = req.file.buffer;
                imageContentType = req.file.mimetype;
            }
            
            const result = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('bio', sql.NVarChar, bio)
                .input('experience_years', sql.Int, experience_years)
                .input('specialty', sql.NVarChar, specialty)
                .input('image_data', sql.VarBinary, imageData)
                .input('image_content_type', sql.NVarChar, imageContentType)
                .query(`
                    INSERT INTO Drivers (name, bio, experience_years, specialty, image_data, image_content_type, created_at, updated_at) 
                    VALUES (@name, @bio, @experience_years, @specialty, @image_data, @image_content_type, GETDATE(), GETDATE());
                    SELECT SCOPE_IDENTITY() AS id
                `);
            
            const newDriverId = result.recordset[0].id;
            console.log(`✅ Driver created with ID: ${newDriverId}`);
            
            res.status(201).json({ 
                message: 'Driver created successfully', 
                driverId: newDriverId
            });
        } else {
            const newDriver = { 
                id: mockDrivers.length + 1, 
                name, 
                bio, 
                experience_years: parseInt(experience_years), 
                image_url: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null,
                specialty,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            mockDrivers.push(newDriver);
            res.status(201).json({ message: 'Driver created successfully (mock)', driver: newDriver });
        }
    } catch (error) {
        console.error('Error creating driver:', error);
        res.status(500).json({ message: 'Error creating driver', error: error.message });
    }
});

// UPDATE driver with image
app.put('/api/drivers/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, bio, experience_years, specialty } = req.body;

        if (!name || !bio || !experience_years || !specialty) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        console.log(`📝 Updating driver ID ${id}:`, { name, bio, experience_years, specialty });

        if (dbConnected) {
            const pool = await getConnection();
            
            const checkResult = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT id FROM Drivers WHERE id = @id');
            
            if (checkResult.recordset.length === 0) {
                return res.status(404).json({ message: 'Driver not found' });
            }
            
            let imageData = null;
            let imageContentType = null;
            
            if (req.file) {
                imageData = req.file.buffer;
                imageContentType = req.file.mimetype;
            }
            
            await pool.request()
                .input('id', sql.Int, id)
                .input('name', sql.NVarChar, name)
                .input('bio', sql.NVarChar, bio)
                .input('experience_years', sql.Int, experience_years)
                .input('specialty', sql.NVarChar, specialty)
                .input('image_data', sql.VarBinary, imageData)
                .input('image_content_type', sql.NVarChar, imageContentType)
                .query(`
                    UPDATE Drivers 
                    SET name = @name, bio = @bio, experience_years = @experience_years, 
                        specialty = @specialty, 
                        image_data = ISNULL(@image_data, image_data),
                        image_content_type = ISNULL(@image_content_type, image_content_type),
                        updated_at = GETDATE() 
                    WHERE id = @id
                `);
            
            console.log(`✅ Driver ID ${id} updated successfully`);
            res.json({ message: 'Driver updated successfully' });
        } else {
            const index = mockDrivers.findIndex(d => d.id === parseInt(id));
            if (index !== -1) {
                mockDrivers[index] = { 
                    ...mockDrivers[index], 
                    name, 
                    bio, 
                    experience_years: parseInt(experience_years), 
                    specialty,
                    image_url: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : mockDrivers[index].image_url,
                    updated_at: new Date().toISOString()
                };
                res.json({ message: 'Driver updated successfully (mock)' });
            } else {
                res.status(404).json({ message: 'Driver not found' });
            }
        }
    } catch (error) {
        console.error('Error updating driver:', error);
        res.status(500).json({ message: 'Error updating driver', error: error.message });
    }
});

// DELETE driver
app.delete('/api/drivers/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (dbConnected) {
            const pool = await getConnection();
            
            const checkResult = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT id FROM Drivers WHERE id = @id');
            
            if (checkResult.recordset.length === 0) {
                return res.status(404).json({ message: 'Driver not found' });
            }
            
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Drivers WHERE id = @id');
            
            res.json({ message: 'Driver deleted successfully' });
        } else {
            const index = mockDrivers.findIndex(d => d.id === parseInt(id));
            if (index !== -1) {
                mockDrivers.splice(index, 1);
                res.json({ message: 'Driver deleted successfully (mock)' });
            } else {
                res.status(404).json({ message: 'Driver not found' });
            }
        }
    } catch (error) {
        console.error('Error deleting driver:', error);
        res.status(500).json({ message: 'Error deleting driver', error: error.message });
    }
});

// ============= VIDEOS ROUTES WITH YOUTUBE EMBED FIX =============

// GET all videos
app.get('/api/videos', async (req, res) => {
    try {
        const { category } = req.query;
        if (dbConnected) {
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
            
            // Process each video to ensure proper embed URL
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

// CREATE new video
app.post('/api/videos', authMiddleware, async (req, res) => {
    try {
        let { title, youtube_url, category, embed_code } = req.body;
        
        // Generate proper embed code from YouTube URL
        const properEmbedCode = getYouTubeEmbedUrl(youtube_url || embed_code);
        
        console.log('📹 Creating video:', { title, youtube_url, category, embed_code: properEmbedCode });

        if (dbConnected) {
            const pool = await getConnection();
            const result = await pool.request()
                .input('title', sql.NVarChar, title)
                .input('youtube_url', sql.NVarChar, youtube_url)
                .input('category', sql.NVarChar, category)
                .input('embed_code', sql.NVarChar, properEmbedCode)
                .query(`
                    INSERT INTO Videos (title, youtube_url, category, embed_code, created_at, updated_at) 
                    VALUES (@title, @youtube_url, @category, @embed_code, GETDATE(), GETDATE());
                    SELECT SCOPE_IDENTITY() AS id
                `);
            res.status(201).json({ 
                id: result.recordset[0].id, 
                message: 'Video created successfully',
                embed_code: properEmbedCode
            });
        } else {
            const newVideo = { 
                id: mockVideos.length + 1, 
                title, 
                youtube_url, 
                category, 
                embed_code: properEmbedCode,
                created_at: new Date(),
                updated_at: new Date()
            };
            mockVideos.push(newVideo);
            res.status(201).json({ 
                message: 'Video created successfully (mock)',
                embed_code: properEmbedCode
            });
        }
    } catch (error) {
        console.error('Error creating video:', error);
        res.status(500).json({ message: 'Error creating video', error: error.message });
    }
});

// UPDATE video
app.put('/api/videos/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        let { title, youtube_url, category, embed_code } = req.body;
        
        // Generate proper embed code from YouTube URL
        const properEmbedCode = getYouTubeEmbedUrl(youtube_url || embed_code);
        
        console.log(`📹 Updating video ID ${id}:`, { title, youtube_url, category });

        if (dbConnected) {
            const pool = await getConnection();
            
            // Check if video exists
            const checkResult = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT id FROM Videos WHERE id = @id');
            
            if (checkResult.recordset.length === 0) {
                return res.status(404).json({ message: 'Video not found' });
            }
            
            await pool.request()
                .input('id', sql.Int, id)
                .input('title', sql.NVarChar, title)
                .input('youtube_url', sql.NVarChar, youtube_url)
                .input('category', sql.NVarChar, category)
                .input('embed_code', sql.NVarChar, properEmbedCode)
                .query(`
                    UPDATE Videos 
                    SET title = @title, youtube_url = @youtube_url, 
                        category = @category, embed_code = @embed_code, updated_at = GETDATE() 
                    WHERE id = @id
                `);
            res.json({ message: 'Video updated successfully' });
        } else {
            const index = mockVideos.findIndex(v => v.id === parseInt(id));
            if (index !== -1) {
                mockVideos[index] = { 
                    ...mockVideos[index], 
                    title, 
                    youtube_url, 
                    category, 
                    embed_code: properEmbedCode,
                    updated_at: new Date()
                };
                res.json({ message: 'Video updated successfully (mock)' });
            } else {
                res.status(404).json({ message: 'Video not found' });
            }
        }
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ message: 'Error updating video', error: error.message });
    }
});

// DELETE video
app.delete('/api/videos/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (dbConnected) {
            const pool = await getConnection();
            
            const checkResult = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT id FROM Videos WHERE id = @id');
            
            if (checkResult.recordset.length === 0) {
                return res.status(404).json({ message: 'Video not found' });
            }
            
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Videos WHERE id = @id');
            res.json({ message: 'Video deleted successfully' });
        } else {
            const index = mockVideos.findIndex(v => v.id === parseInt(id));
            if (index !== -1) {
                mockVideos.splice(index, 1);
                res.json({ message: 'Video deleted successfully (mock)' });
            } else {
                res.status(404).json({ message: 'Video not found' });
            }
        }
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ message: 'Error deleting video', error: error.message });
    }
});

// ============= REVIEWS ROUTES =============
app.get('/api/reviews', async (req, res) => {
    try {
        if (dbConnected) {
            const pool = await getConnection();
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

app.get('/api/reviews/admin/all', authMiddleware, async (req, res) => {
    try {
        if (dbConnected) {
            const pool = await getConnection();
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

app.post('/api/reviews', async (req, res) => {
    try {
        const { name, text, rating } = req.body;

        if (dbConnected) {
            const pool = await getConnection();
            await pool.request()
                .input('name', sql.NVarChar, name)
                .input('text', sql.NVarChar, text)
                .input('rating', sql.Int, rating)
                .query(`
                    INSERT INTO Reviews (name, text, rating, is_approved) 
                    VALUES (@name, @text, @rating, 1)
                `);
            res.json({ message: 'Review submitted successfully!' });
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
            res.json({ message: 'Review submitted successfully!' });
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ message: 'Error submitting review' });
    }
});

app.delete('/api/reviews/admin/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (dbConnected) {
            const pool = await getConnection();
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Reviews WHERE id = @id');
            res.json({ message: 'Review deleted successfully' });
        } else {
            const index = mockReviews.findIndex(r => r.id === parseInt(id));
            if (index !== -1) {
                mockReviews.splice(index, 1);
                res.json({ message: 'Review deleted successfully' });
            } else {
                res.status(404).json({ message: 'Review not found' });
            }
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Error deleting review' });
    }
});

// ============= CONTACT MESSAGES ROUTES =============
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        console.log(`📧 New message from ${name}: ${message}`);

        if (dbConnected) {
            const pool = await getConnection();
            await pool.request()
                .input('name', sql.NVarChar, name)
                .input('email', sql.NVarChar, email)
                .input('message', sql.NVarChar, message)
                .query(`
                    INSERT INTO ContactMessages (name, email, message) 
                    VALUES (@name, @email, @message)
                `);
        } else {
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

        res.json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
});

app.get('/api/contact/admin/all', authMiddleware, async (req, res) => {
    try {
        if (dbConnected) {
            const pool = await getConnection();
            const result = await pool.request()
                .query('SELECT * FROM ContactMessages ORDER BY created_at DESC');
            res.json(result.recordset);
        } else {
            res.json(mockMessages);
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.json(mockMessages);
    }
});

app.delete('/api/contact/admin/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (dbConnected) {
            const pool = await getConnection();
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM ContactMessages WHERE id = @id');
            res.json({ message: 'Message deleted successfully' });
        } else {
            const index = mockMessages.findIndex(m => m.id === parseInt(id));
            if (index !== -1) {
                mockMessages.splice(index, 1);
                res.json({ message: 'Message deleted successfully' });
            } else {
                res.status(404).json({ message: 'Message not found' });
            }
        }
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Error deleting message' });
    }
});

// ============= ROUND TOURS ROUTES =============
app.get('/api/round-tours', async (req, res) => {
    try {
        if (dbConnected) {
            const pool = await getConnection();
            const result = await pool.request()
                .query('SELECT * FROM RoundTours ORDER BY days');
            res.json(result.recordset);
        } else {
            res.json(mockRoundTours);
        }
    } catch (error) {
        console.error('Error fetching round tours:', error);
        res.status(500).json({ message: 'Error fetching round tours' });
    }
});

app.get('/api/round-tours/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (dbConnected) {
            const pool = await getConnection();
            const tourResult = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM RoundTours WHERE id = @id');

            if (tourResult.recordset.length === 0) {
                return res.status(404).json({ message: 'Tour not found' });
            }

            const daysResult = await pool.request()
                .input('tour_id', sql.Int, id)
                .query('SELECT * FROM TourItineraryDays WHERE tour_id = @tour_id ORDER BY day_number');

            res.json({
                tour: tourResult.recordset[0],
                itinerary: daysResult.recordset
            });
        } else {
            const tour = mockRoundTours.find(t => t.id === parseInt(id));
            if (!tour) {
                return res.status(404).json({ message: 'Tour not found' });
            }
            const itinerary = mockItineraries[id] || [];
            res.json({ tour, itinerary });
        }
    } catch (error) {
        console.error('Error fetching round tour:', error);
        res.status(500).json({ message: 'Error fetching round tour' });
    }
});

app.post('/api/round-tours', authMiddleware, async (req, res) => {
    try {
        const { days, title, duration, price, description, image_url, total_days, itinerary } = req.body;

        if (dbConnected) {
            const pool = await getConnection();
            const tourResult = await pool.request()
                .input('days', sql.Int, days)
                .input('title', sql.NVarChar, title)
                .input('duration', sql.NVarChar, duration)
                .input('price', sql.NVarChar, price)
                .input('description', sql.NVarChar, description)
                .input('image_url', sql.NVarChar, image_url)
                .input('total_days', sql.Int, total_days)
                .query(`
                    INSERT INTO RoundTours (days, title, duration, price, description, image_url, total_days) 
                    VALUES (@days, @title, @duration, @price, @description, @image_url, @total_days);
                    SELECT SCOPE_IDENTITY() AS id
                `);

            const tourId = tourResult.recordset[0].id;

            if (itinerary && itinerary.length > 0) {
                for (const day of itinerary) {
                    await pool.request()
                        .input('tour_id', sql.Int, tourId)
                        .input('day_number', sql.Int, day.day_number)
                        .input('title', sql.NVarChar, day.title)
                        .input('image_url', sql.NVarChar, day.image_url)
                        .input('activities', sql.NVarChar, JSON.stringify(day.activities))
                        .query(`
                            INSERT INTO TourItineraryDays (tour_id, day_number, title, image_url, activities) 
                            VALUES (@tour_id, @day_number, @title, @image_url, @activities)
                        `);
                }
            }

            res.status(201).json({ id: tourId, message: 'Round tour created successfully' });
        } else {
            const newTour = {
                id: mockRoundTours.length + 1,
                days, title, duration, price, description, image_url, total_days
            };
            mockRoundTours.push(newTour);
            mockItineraries[newTour.id] = itinerary || [];
            res.status(201).json({ id: newTour.id, message: 'Round tour created (mock)' });
        }
    } catch (error) {
        console.error('Error creating round tour:', error);
        res.status(500).json({ message: 'Error creating round tour' });
    }
});

app.put('/api/round-tours/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { days, title, duration, price, description, image_url, total_days, itinerary } = req.body;

        if (dbConnected) {
            const pool = await getConnection();
            await pool.request()
                .input('id', sql.Int, id)
                .input('days', sql.Int, days)
                .input('title', sql.NVarChar, title)
                .input('duration', sql.NVarChar, duration)
                .input('price', sql.NVarChar, price)
                .input('description', sql.NVarChar, description)
                .input('image_url', sql.NVarChar, image_url)
                .input('total_days', sql.Int, total_days)
                .query(`
                    UPDATE RoundTours 
                    SET days = @days, title = @title, duration = @duration, price = @price, 
                        description = @description, image_url = @image_url, total_days = @total_days,
                        updated_at = GETDATE() 
                    WHERE id = @id
                `);

            await pool.request()
                .input('tour_id', sql.Int, id)
                .query('DELETE FROM TourItineraryDays WHERE tour_id = @tour_id');

            if (itinerary && itinerary.length > 0) {
                for (const day of itinerary) {
                    await pool.request()
                        .input('tour_id', sql.Int, id)
                        .input('day_number', sql.Int, day.day_number)
                        .input('title', sql.NVarChar, day.title)
                        .input('image_url', sql.NVarChar, day.image_url)
                        .input('activities', sql.NVarChar, JSON.stringify(day.activities))
                        .query(`
                            INSERT INTO TourItineraryDays (tour_id, day_number, title, image_url, activities) 
                            VALUES (@tour_id, @day_number, @title, @image_url, @activities)
                        `);
                }
            }

            res.json({ message: 'Round tour updated successfully' });
        } else {
            const index = mockRoundTours.findIndex(t => t.id === parseInt(id));
            if (index !== -1) {
                mockRoundTours[index] = { ...mockRoundTours[index], days, title, duration, price, description, image_url, total_days };
                mockItineraries[id] = itinerary || [];
                res.json({ message: 'Round tour updated (mock)' });
            } else {
                res.status(404).json({ message: 'Tour not found' });
            }
        }
    } catch (error) {
        console.error('Error updating round tour:', error);
        res.status(500).json({ message: 'Error updating round tour' });
    }
});

app.delete('/api/round-tours/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (dbConnected) {
            const pool = await getConnection();
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM RoundTours WHERE id = @id');
            res.json({ message: 'Round tour deleted successfully' });
        } else {
            const index = mockRoundTours.findIndex(t => t.id === parseInt(id));
            if (index !== -1) {
                mockRoundTours.splice(index, 1);
                delete mockItineraries[id];
                res.json({ message: 'Round tour deleted (mock)' });
            } else {
                res.status(404).json({ message: 'Tour not found' });
            }
        }
    } catch (error) {
        console.error('Error deleting round tour:', error);
        res.status(500).json({ message: 'Error deleting round tour' });
    }
});

// ============= AUTH ROUTES =============
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    console.log('🔐 Login attempt:', username);

    if (username === 'admin' && password === 'admin123') {
        res.json({
            token: 'mock-jwt-token-' + Date.now(),
            username: 'admin',
            message: 'Login successful'
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials. Use admin/admin123' });
    }
});

// 404 handler
app.use((req, res) => {
    console.log('❌ 404 - Route not found:', req.method, req.url);
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
    console.error('❌ Server Error:', err);
    res.status(500).json({
        message: 'Something went wrong!',
        error: err.message
    });
});

// Start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log('\n' + '='.repeat(50));
        
        console.log(`📊 Database status: ${dbConnected ? 'Connected to SQL Server' : 'Using mock data'}`);
        console.log('='.repeat(50) + '\n');

        console.log('📡 Available Endpoints:');
        console.log('\n📦 PACKAGES:');
        console.log('   GET    /api/packages           - Get all packages');
        console.log('   POST   /api/packages           - Create package');
        console.log('   PUT    /api/packages/:id       - Update package');
        console.log('   DELETE /api/packages/:id       - Delete package');
        
        console.log('\n🚗 VEHICLES:');
        console.log('   GET    /api/vehicles           - Get all vehicles');
        console.log('   POST   /api/vehicles           - Create vehicle');
        console.log('   PUT    /api/vehicles/:id       - Update vehicle');
        console.log('   DELETE /api/vehicles/:id       - Delete vehicle');
        
        console.log('\n👨 DRIVERS (with image storage):');
        console.log('   GET    /api/drivers            - Get all drivers');
        console.log('   GET    /api/drivers/:id        - Get single driver');
        console.log('   POST   /api/drivers            - Create driver with image');
        console.log('   PUT    /api/drivers/:id        - Update driver with image');
        console.log('   DELETE /api/drivers/:id        - Delete driver');
        
        console.log('\n🎥 VIDEOS (YouTube Embed Fixed):');
        console.log('   GET    /api/videos             - Get all videos');
        console.log('   POST   /api/videos             - Create video');
        console.log('   PUT    /api/videos/:id         - Update video');
        console.log('   DELETE /api/videos/:id         - Delete video');
        
        console.log('\n⭐ REVIEWS:');
        console.log('   GET    /api/reviews            - Get approved reviews');
        console.log('   GET    /api/reviews/admin/all  - Get all reviews (admin)');
        console.log('   POST   /api/reviews            - Submit review');
        console.log('   DELETE /api/reviews/admin/:id  - Delete review (admin)');
        
        console.log('\n📧 CONTACT:');
        console.log('   POST   /api/contact            - Send contact message');
        console.log('   GET    /api/contact/admin/all  - Get all messages (admin)');
        console.log('   DELETE /api/contact/admin/:id  - Delete message (admin)');
        
        console.log('\n🗺️ ROUND TOURS:');
        console.log('   GET    /api/round-tours        - Get all round tours');
        console.log('   GET    /api/round-tours/:id    - Get single round tour');
        console.log('   POST   /api/round-tours        - Create round tour');
        console.log('   PUT    /api/round-tours/:id    - Update round tour');
        console.log('   DELETE /api/round-tours/:id    - Delete round tour');
        
        console.log('\n🔐 AUTH:');
        console.log('   POST   /api/auth/login         - Admin login\n');
        
        console.log('💡 YOUTUBE EMBED FIX:');
        console.log('   Supports all YouTube URL formats:');
        console.log('   - https://www.youtube.com/watch?v=VIDEO_ID');
        console.log('   - https://youtu.be/VIDEO_ID');
        console.log('   - https://www.youtube.com/embed/VIDEO_ID');
        console.log('   - https://www.youtube.com/shorts/VIDEO_ID\n');
    });
});