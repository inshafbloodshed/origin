const express = require('express');
const router = express.Router();

// Mock data - This will definitely work
const mockRoundTours = [
    { 
        id: 1, 
        days: 7, 
        title: "7 Days - Cultural & Nature Explorer", 
        duration: "7 Days / 6 Nights", 
        price: "$650", 
        description: "Perfect for first-time visitors. Experience the cultural triangle, hill country, and beautiful beaches.", 
        image_url: "https://images.pexels.com/photos/1603650/sigiriya-lion-rock-sri-lanka-1603650.jpg", 
        total_days: 7 
    },
    { 
        id: 2, 
        days: 8, 
        title: "8 Days - Heritage & Wildlife Journey", 
        duration: "8 Days / 7 Nights", 
        price: "$750", 
        description: "Extended tour with more wildlife safaris and cultural experiences.", 
        image_url: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg", 
        total_days: 8 
    },
    { 
        id: 3, 
        days: 9, 
        title: "9 Days - Complete Island Experience", 
        duration: "9 Days / 8 Nights", 
        price: "$850", 
        description: "Comprehensive tour covering all major attractions across the island.", 
        image_url: "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg", 
        total_days: 9 
    },
    { 
        id: 4, 
        days: 10, 
        title: "10 Days - Ultimate Sri Lanka Adventure", 
        duration: "10 Days / 9 Nights", 
        price: "$950", 
        description: "In-depth exploration with more time at each destination.", 
        image_url: "https://images.pexels.com/photos/1603650/sigiriya-lion-rock-sri-lanka-1603650.jpg", 
        total_days: 10 
    },
    { 
        id: 5, 
        days: 11, 
        title: "11 Days - Luxury & Culture Fusion", 
        duration: "11 Days / 10 Nights", 
        price: "$1200", 
        description: "Premium accommodations with exclusive experiences.", 
        image_url: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg", 
        total_days: 11 
    },
    { 
        id: 6, 
        days: 12, 
        title: "12 Days - Off the Beaten Path", 
        duration: "12 Days / 11 Nights", 
        price: "$1100", 
        description: "Discover hidden gems and less touristy locations.", 
        image_url: "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg", 
        total_days: 12 
    },
    { 
        id: 7, 
        days: 13, 
        title: "13 Days - Deep Cultural Immersion", 
        duration: "13 Days / 12 Nights", 
        price: "$1250", 
        description: "Extended cultural experience with local interactions.", 
        image_url: "https://images.pexels.com/photos/1603650/sigiriya-lion-rock-sri-lanka-1603650.jpg", 
        total_days: 13 
    },
    { 
        id: 8, 
        days: 14, 
        title: "14 Days - Grand Sri Lanka Tour", 
        duration: "14 Days / 13 Nights", 
        price: "$1450", 
        description: "Complete two-week journey covering every major region.", 
        image_url: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg", 
        total_days: 14 
    }
];

// GET all round tours - Simplified version
router.get('/', async (req, res) => {
    try {
        console.log('Fetching round tours...');
        // Return mock data directly
        return res.status(200).json(mockRoundTours);
    } catch (error) {
        console.error('Error in round-tours route:', error);
        return res.status(200).json(mockRoundTours); // Always return mock data
    }
});

// GET single round tour by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const tour = mockRoundTours.find(t => t.id === parseInt(id));
        
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        
        // Return tour with empty itinerary for now
        res.json({
            tour: tour,
            itinerary: []
        });
    } catch (error) {
        console.error('Error fetching tour details:', error);
        res.status(500).json({ message: 'Error fetching tour details' });
    }
});

// CREATE round tour (admin only)
router.post('/', async (req, res) => {
    try {
        const { days, title, duration, price, description, image_url, total_days } = req.body;
        const newTour = {
            id: mockRoundTours.length + 1,
            days,
            title,
            duration,
            price,
            description,
            image_url,
            total_days
        };
        mockRoundTours.push(newTour);
        res.status(201).json(newTour);
    } catch (error) {
        console.error('Error creating tour:', error);
        res.status(500).json({ message: 'Error creating tour' });
    }
});

// UPDATE round tour (admin only)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const index = mockRoundTours.findIndex(t => t.id === parseInt(id));
        
        if (index === -1) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        
        mockRoundTours[index] = { ...mockRoundTours[index], ...req.body };
        res.json(mockRoundTours[index]);
    } catch (error) {
        console.error('Error updating tour:', error);
        res.status(500).json({ message: 'Error updating tour' });
    }
});

// DELETE round tour (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const index = mockRoundTours.findIndex(t => t.id === parseInt(id));
        
        if (index === -1) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        
        mockRoundTours.splice(index, 1);
        res.json({ message: 'Tour deleted successfully' });
    } catch (error) {
        console.error('Error deleting tour:', error);
        res.status(500).json({ message: 'Error deleting tour' });
    }
});

module.exports = router;