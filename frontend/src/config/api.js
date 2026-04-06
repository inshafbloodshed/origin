// API Configuration based on environment
const getApiUrl = () => {
    // Production environment
    if (process.env.NODE_ENV === 'production') {
        return process.env.REACT_APP_API_URL || 'http://luxeelanka.publicvm.com:5000/api';
    }
    // Development environment
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();

// Helper function for API calls
export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    try {
        const response = await fetch(url, defaultOptions);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Specific API endpoints
export const endpoints = {
    packages: '/packages',
    vehicles: '/vehicles',
    drivers: '/drivers',
    videos: '/videos',
    reviews: '/reviews',
    contact: '/contact',
    login: '/auth/login'
};