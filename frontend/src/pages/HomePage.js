import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import '../styles/HomePage.css';
// Use environment variable for API URL (will work in both development and production)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function HomePage() {
    const [activeSection, setActiveSection] = useState('home');
    const [packages, setPackages] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [videos, setVideos] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contactFormData, setContactFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [reviewFormData, setReviewFormData] = useState({
        name: '',
        review: '',
        rating: '5'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [packagesRes, vehiclesRes, driversRes, videosRes, reviewsRes] = await Promise.all([
                axios.get(`${API_URL}/packages`),
                axios.get(`${API_URL}/vehicles`),
                axios.get(`${API_URL}/drivers`),
                axios.get(`${API_URL}/videos`),
                axios.get(`${API_URL}/reviews`)
            ]);

            setPackages(packagesRes.data || []);
            setVehicles(vehiclesRes.data || []);
            setDrivers(driversRes.data || []);
            setVideos(videosRes.data || []);
            setReviews(reviewsRes.data || []);

            console.log('Videos loaded:', videosRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();

        // Format message for WhatsApp
        const whatsappMessage = `*New Tour Inquiry*%0A%0A*Name:* ${contactFormData.name}%0A*Email:* ${contactFormData.email}%0A*Message:* ${contactFormData.message}%0A%0A*Sent from Luxe Lanka Website*`;

        // Open WhatsApp with pre-filled message
        const whatsappUrl = `https://wa.me/94725335460?text=${whatsappMessage}`;
        window.open(whatsappUrl, '_blank');

        // Optional: Also send to your backend if you want to store inquiries
        try {
            await axios.post(`${API_URL}/contact`, contactFormData);
            console.log('Contact form data saved to database');
        } catch (error) {
            console.error('Error saving contact form:', error);
            // Don't show error to user since WhatsApp already opened
        }

        // Show success message
        alert('Message prepared for WhatsApp! Click send to complete.');

        // Reset form
        setContactFormData({ name: '', email: '', message: '' });
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            name: reviewFormData.name,
            text: reviewFormData.review,
            rating: parseInt(reviewFormData.rating)
        };
        try {
            await axios.post(`${API_URL}/reviews`, formData);
            alert('Thank you for your review!');
            setReviewFormData({ name: '', review: '', rating: '5' });
            fetchData();
        } catch (error) {
            alert('Error submitting review. Please try again.');
        }
    };

    const handleContactInputChange = (e) => {
        setContactFormData({
            ...contactFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleReviewInputChange = (e) => {
        setReviewFormData({
            ...reviewFormData,
            [e.target.name]: e.target.value
        });
    };

    const getFilteredVideos = (category) => {
        if (!videos || videos.length === 0) return [];
        return videos.filter(v => v.category === category);
    };

    const getHomeVideos = () => {
        const homeVideos = getFilteredVideos('home');
        if (homeVideos.length > 0) return homeVideos;
        return videos.slice(0, 3);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading Luxe Lanka...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-card">
                    <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: '#dc3545' }}></i>
                    <h2>Connection Error</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-glass-round">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="homepage">
            <nav className="glass-nav">
                <div className="nav-container">
                    <div className="logo">
                        <img src="/Emojii.png" alt="emoji" className="logo-emoji" 
                        style={{ width: "60px", height: "60px", verticalAlign: "middle" }}/>                        Zayaan Tours SriLanka
                    </div>                    <button className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <i className="fas fa-bars"></i>
                    </button>
                    <div className={`nav-links ${mobileMenuOpen ? 'show' : ''}`}>
                        <button onClick={() => { setActiveSection('home'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'home' ? 'active' : ''}`}>
                            <i className="fas fa-home"></i> Home
                        </button>
                        <button onClick={() => { setActiveSection('packages'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'packages' ? 'active' : ''}`}>
                            <i className="fas fa-umbrella-beach"></i> Tour Packages
                        </button>
                        {/* Add Round Tours Link */}
                        <a href="/round-tours" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
                            <i className="fas fa-map-marked-alt"></i> Round Tours
                        </a>
                        <button onClick={() => { setActiveSection('vehicle'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'vehicle' ? 'active' : ''}`}>
                            <i className="fas fa-car"></i> Vehicle Packages
                        </button>
                        <button onClick={() => { setActiveSection('drivers'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'drivers' ? 'active' : ''}`}>
                            <i className="fas fa-users"></i> About Drivers
                        </button>
                        <button onClick={() => { setActiveSection('reviews'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'reviews' ? 'active' : ''}`}>
                            <i className="fas fa-star"></i> Reviews
                        </button>
                        <button onClick={() => { setActiveSection('contact'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'contact' ? 'active' : ''}`}>
                            <i className="fas fa-envelope"></i> Contact
                        </button>
                    </div>
                </div>
            </nav>

            <nav className="glass-nav">
                {/* Top Info Bar */}
                <div className="top-info-bar">
                    <div className="info-bar-content">
                        <span><i className="fas fa-phone-alt"></i> +94 72 533 5460</span>
                        <span><i className="fas fa-envelope"></i> hello@luxelanka.com</span>
                        <span><i className="fas fa-clock"></i> 24/7 Support</span>
                    </div>
                </div>
                <div className="nav-container">
                    {/* Rest of your navigation */}
                </div>
            </nav>

            {/* Floating Social Media Icons - WhatsApp and Instagram */}
            <div className="floating-social">
                <a
                    href="https://wa.me/94725335460"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="float-glass-btn whatsapp"
                    aria-label="Chat on WhatsApp"
                >
                    <img
                        src="https://static.vecteezy.com/system/resources/previews/024/398/617/non_2x/whatsapp-logo-icon-isolated-on-transparent-background-free-png.png"
                        style={{ width: "80px", height: "80px" }}
                        alt="WhatsApp"
                    />
                </a>
                <a
                    href="https://instagram.com/luxelanka"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="float-glass-btn instagram"
                    aria-label="Follow on Instagram"
                >
                    <img
                        src="https://static.vecteezy.com/system/resources/thumbnails/018/930/413/small/instagram-logo-instagram-icon-transparent-free-png.png"
                        style={{ width: "90px", height: "90px" }}
                        alt="Instagram"
                    />
                </a>
            </div>

            <main className="container">
                {/* Home Section */}
                {activeSection === 'home' && (
                    <section className="section active-section">
                        <div className="hero" style={{ minHeight: "50vh" }}>
                            <h1>Explore Sri Lanka in Style</h1>
                            <p>Luxury vehicles, expert drivers, and handcrafted journeys — discover paradise with us.</p>
                            <button onClick={() => setActiveSection('packages')} className="btn-glass-round">
                                View Packages <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>

                        <div className="video-section">
                            <h2 className="section-title">
                                <i className="fas fa-video"></i> Video Reviews
                                <span className="orange-badge">Travel Stories</span>
                            </h2>
                            {getHomeVideos().length > 0 ? (
                                <div className="video-grid">
                                    {getHomeVideos().map(video => (
                                        <div key={video.id} className="video-glass-card">
                                            <iframe
                                                src={video.embed_code || video.youtube_url}
                                                title={video.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                            <div className="video-title">{video.title}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-videos-message">
                                    <p>No videos available yet. Check back soon for travel stories!</p>
                                </div>
                            )}
                        </div>

                        <div className="reviews-section">
                            <h2 className="section-title">
                                <i className="fas fa-star"></i> Traveler Reviews
                            </h2>
                            {reviews.length > 0 ? (
                                <div className="reviews-carousel">
                                    <Swiper
                                        modules={[Autoplay, Pagination, Navigation]}
                                        spaceBetween={20}
                                        slidesPerView={1}
                                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                                        pagination={{ clickable: true }}
                                        navigation
                                        breakpoints={{
                                            640: { slidesPerView: 2 },
                                            1024: { slidesPerView: 3 }
                                        }}
                                    >
                                        {reviews.map(review => (
                                            <SwiperSlide key={review.id}>
                                                <div className="review-card">
                                                    <i className="fas fa-quote-left" style={{ color: '#ff7b2c', fontSize: '1.5rem' }}></i>
                                                    <p>“{review.text.substring(0, 150)}”</p>
                                                    <strong>{review.name}</strong>
                                                    <div className="rating">{'⭐'.repeat(review.rating)}</div>
                                                    <small>{new Date(review.created_at).toLocaleDateString()}</small>
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                            ) : (
                                <div className="no-reviews-message">
                                    <p>No reviews yet. Be the first to share your experience!</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Packages Section */}
                {activeSection === 'packages' && (
                    <section className="section">
                        <h2 className="section-title">
                            <i className="fas fa-umbrella-beach"></i> Signature Tours
                        </h2>
                        {packages.length > 0 ? (
                            <div className="card-grid">
                                {packages.map(pkg => (
                                    <div key={pkg.id} className="glass-card">
                                        <img className="card-img" src={pkg.image_url} alt={pkg.title} onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                        }} />
                                        <div className="card-content">
                                            <h3>{pkg.title}</h3>
                                            <p>{pkg.description}</p>
                                            <div className="price">${pkg.price}</div>
                                            <button className="btn-outline-glass" onClick={() => window.open('https://wa.me/94725335460', '_blank')}>
                                                <i className="fab fa-whatsapp"></i> Inquire
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <p>No packages available. Please check back later.</p>
                            </div>
                        )}

                        <div className="video-section">
                            <h3><i className="fas fa-video"></i> Tour Videos</h3>
                            {getFilteredVideos('tour').length > 0 ? (
                                <div className="video-grid">
                                    {getFilteredVideos('tour').map(video => (
                                        <div key={video.id} className="video-glass-card">
                                            <iframe
                                                src={video.embed_code || video.youtube_url}
                                                title={video.title}
                                                frameBorder="0"
                                                allowFullScreen
                                            ></iframe>
                                            <div className="video-title">{video.title}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No tour videos available.</p>
                            )}
                        </div>
                    </section>
                )}

                {/* Vehicle Section */}
                {activeSection === 'vehicle' && (
                    <section className="section">
                        <h2 className="section-title">
                            <i className="fas fa-car"></i> Premium Fleet
                        </h2>
                        {vehicles.length > 0 ? (
                            <div className="card-grid">
                                {vehicles.map(vehicle => (
                                    <div key={vehicle.id} className="glass-card">
                                        <img className="card-img" src={vehicle.image_url} alt={vehicle.name} onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                        }} />
                                        <div className="card-content">
                                            <h3>{vehicle.name}</h3>
                                            <p>{vehicle.description}</p>
                                            <div className="price">${vehicle.price_per_day}/day</div>
                                            <button className="btn-outline-glass" onClick={() => window.open('https://wa.me/94725335460', '_blank')}>
                                                <i className="fab fa-whatsapp"></i> Inquire
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <p>No vehicles available. Please check back later.</p>
                            </div>
                        )}

                        <div className="video-section">
                            <h3><i className="fas fa-video"></i> Vehicle Videos</h3>
                            {getFilteredVideos('vehicle').length > 0 ? (
                                <div className="video-grid">
                                    {getFilteredVideos('vehicle').map(video => (
                                        <div key={video.id} className="video-glass-card">
                                            <iframe
                                                src={video.embed_code || video.youtube_url}
                                                title={video.title}
                                                frameBorder="0"
                                                allowFullScreen
                                            ></iframe>
                                            <div className="video-title">{video.title}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No vehicle videos available.</p>
                            )}
                        </div>
                    </section>
                )}

                {/* Drivers Section */}
                {activeSection === 'drivers' && (
                    <section className="section">
                        <h2 className="section-title">
                            <i className="fas fa-users"></i> Meet Your Expert Drivers
                        </h2>
                        {drivers.length > 0 ? (
                            <div className="driver-grid">
                                {drivers.map(driver => (
                                    <div key={driver.id} className="driver-glass-card">
                                        <img className="driver-img" src={driver.image_url} alt={driver.name} onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                        }} />
                                        <div className="driver-info">
                                            <div className="driver-name">{driver.name}</div>
                                            <span className="orange-badge">
                                                <i className="fas fa-calendar-alt"></i> {driver.experience_years}+ years
                                            </span>
                                            <p className="driver-bio">{driver.bio}</p>
                                            <small><i className="fas fa-tag"></i> {driver.specialty}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <p>No drivers available. Please check back later.</p>
                            </div>
                        )}

                        <div className="video-section">
                            <h3><i className="fas fa-video"></i> Driver Stories</h3>
                            {getFilteredVideos('driver').length > 0 ? (
                                <div className="video-grid">
                                    {getFilteredVideos('driver').map(video => (
                                        <div key={video.id} className="video-glass-card">
                                            <iframe
                                                src={video.embed_code || video.youtube_url}
                                                title={video.title}
                                                frameBorder="0"
                                                allowFullScreen
                                            ></iframe>
                                            <div className="video-title">{video.title}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No driver stories available.</p>
                            )}
                        </div>
                    </section>
                )}

                {/* Reviews Section */}
                {activeSection === 'reviews' && (
                    <section className="section">
                        <h2 className="section-title">
                            <i className="fas fa-star"></i> Guest Reviews
                        </h2>
                        {reviews.length > 0 ? (
                            <div className="reviews-list">
                                {reviews.map(review => (
                                    <div key={review.id} className="review-item">
                                        <strong>{review.name}</strong>
                                        <div className="rating">{'⭐'.repeat(review.rating)}</div>
                                        <p>{review.text}</p>
                                        <small><i className="fas fa-calendar-alt"></i> {new Date(review.created_at).toLocaleDateString()}</small>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <p>No reviews yet. Be the first to share your experience!</p>
                            </div>
                        )}

                        <div className="review-form">
                            <h3><i className="fas fa-edit"></i> Share Your Experience</h3>
                            <form onSubmit={handleReviewSubmit}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your name"
                                    value={reviewFormData.name}
                                    onChange={handleReviewInputChange}
                                    required
                                />
                                <textarea
                                    name="review"
                                    rows="3"
                                    placeholder="Write your review..."
                                    value={reviewFormData.review}
                                    onChange={handleReviewInputChange}
                                    required
                                ></textarea>
                                <select
                                    name="rating"
                                    value={reviewFormData.rating}
                                    onChange={handleReviewInputChange}
                                    required
                                >
                                    <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                                    <option value="4">⭐⭐⭐⭐ - Very Good</option>
                                    <option value="3">⭐⭐⭐ - Good</option>
                                    <option value="2">⭐⭐ - Fair</option>
                                    <option value="1">⭐ - Poor</option>
                                </select>
                                <button type="submit" className="btn-glass-round">
                                    <i className="fas fa-paper-plane"></i> Post Review
                                </button>
                            </form>
                        </div>
                    </section>
                )}

                {/* Contact Section - Enhanced UI with Mobile Optimizations */}
                {activeSection === 'contact' && (
                    <section className="section contact-section-enhanced">
                        <div className="contact-header">
                            <h2 className="section-title">
                                <i className="fas fa-phone-alt"></i> Plan Your Journey
                            </h2>
                            <p className="contact-subtitle">Let's craft your perfect Sri Lankan adventure together</p>
                        </div>

                        <div className="contact-wrapper-enhanced">
                            {/* Contact Info Card */}
                            <div className="contact-info-card">
                                <div className="info-card-header">
                                    <i className="fas fa-headset"></i>
                                    <h3>Get in Touch</h3>
                                    <p>We're here to help you 24/7</p>
                                </div>

                                <div className="info-items">
                                    <img scr="" />
                                    <div className="info-item">
                                        <div className="info-icon call-bg">
                                            <img
                                                src="https://cdn.iconscout.com/icon/free/png-256/free-apple-phone-icon-svg-download-png-493154.png?f=webp"
                                                style={{ width: "50px", height: "50px" }}
                                            />
                                            <i className="fas fa-phone-alt"></i>
                                        </div>
                                        <div className="info-details">
                                            <span>Call Us</span>
                                            <a href="tel:+94725335460">+94 72 533 5460</a>
                                            <small>Available 8AM - 10PM</small>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <div className="info-icon email-bg">
                                            <img
                                                src="https://static.vecteezy.com/system/resources/previews/058/072/357/non_2x/gmail-app-icon-on-transparent-background-free-png.png"
                                                style={{ width: "80px", height: "80px" }}
                                            />
                                            <i className="fas fa-envelope"></i>
                                        </div>
                                        <div className="info-details">
                                            <span>Email</span>
                                            <a href="mailto:hello@luxelanka.com">hello@luxelanka.com</a>
                                            <small>We'll respond within 24hrs</small>
                                        </div>
                                    </div>

                                    {/* <div className="info-item">
                                        <div className="info-icon whatsapp-bg">
                                            <i className="fab fa-whatsapp"></i>
                                        </div>
                                        <div className="info-details">
                                            <span>WhatsApp</span>
                                            <a href="https://wa.me/94725335460" target="_blank" rel="noopener noreferrer">
                                                +94 72 533 5460
                                            </a>
                                            <small>Quick response within minutes</small>
                                        </div>
                                    </div> */}
                                </div>

                                <div className="business-hours">
                                    <h4><i className="fas fa-clock"></i> Business Hours</h4>
                                    <p>Monday - Sunday: 8:00 AM - 10:00 PM</p>
                                    <p>Emergency Support: 24/7</p>
                                </div>
                            </div>

                            {/* Contact Form Card */}
                            <div className="contact-form-card">
                                <div className="form-card-header">
                                    <i className="fas fa-paper-plane"></i>
                                    <h3>Send a Message</h3>
                                    <p>We'll get back to you via WhatsApp</p>
                                </div>

                                <form onSubmit={handleContactSubmit} className="contact-form-enhanced">
                                    <div className="form-group">
                                        <label htmlFor="name">
                                            <i className="fas fa-user"></i> Your Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={contactFormData.name}
                                            onChange={handleContactInputChange}
                                            placeholder="John Doe"
                                            required
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">
                                            <i className="fas fa-envelope"></i> Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={contactFormData.email}
                                            onChange={handleContactInputChange}
                                            placeholder="john@example.com"
                                            required
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="message">
                                            <i className="fas fa-comment-dots"></i> Your Message
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows="5"
                                            value={contactFormData.message}
                                            onChange={handleContactInputChange}
                                            placeholder="Tell us about your dream Sri Lankan tour..."
                                            required
                                            className="form-textarea"
                                        ></textarea>
                                    </div>

                                    <div className="form-options">
                                        <div className="preferred-contact">
                                            <i className="fab fa-whatsapp"></i>
                                            <span>We'll reply via WhatsApp</span>
                                        </div>
                                    </div>

                                    <button type="submit" className="submit-btn-enhanced">
                                        <i className="fab fa-whatsapp"></i>
                                        Send via WhatsApp
                                        <i className="fas fa-arrow-right"></i>
                                    </button>

                                    <p className="form-note">
                                        <i className="fas fa-lock"></i> Your information is secure and will only be used to respond to your inquiry
                                    </p>
                                </form>
                            </div>
                        </div>

                        {/* Quick Inquiry Options */}
                        <div className="quick-inquiry">
                            <h3><i className="fas fa-bolt"></i> Quick Inquiry</h3>
                            <div className="quick-buttons">
                                <button
                                    onClick={() => {
                                        const message = "Hi! I'm interested in your tour packages. Can you help me plan my Sri Lanka trip?";
                                        window.open(`https://wa.me/94725335460?text=${encodeURIComponent(message)}`, '_blank');
                                    }}
                                    className="quick-btn"
                                >
                                    <i className="fas fa-umbrella-beach"></i> Tour Packages
                                </button>
                                <button
                                    onClick={() => {
                                        const message = "Hi! I'd like to know more about your vehicle rentals. What vehicles do you have available?";
                                        window.open(`https://wa.me/94725335460?text=${encodeURIComponent(message)}`, '_blank');
                                    }}
                                    className="quick-btn"
                                >
                                    <i className="fas fa-car"></i> Vehicle Rental
                                </button>
                                <button
                                    onClick={() => {
                                        const message = "Hi! Can you share more information about your drivers and their experience?";
                                        window.open(`https://wa.me/94725335460?text=${encodeURIComponent(message)}`, '_blank');
                                    }}
                                    className="quick-btn"
                                >
                                    <i className="fas fa-users"></i> Driver Service
                                </button>
                                <button
                                    onClick={() => {
                                        const message = "Hi! I need a custom itinerary for my Sri Lanka tour. Can you help?";
                                        window.open(`https://wa.me/94725335460?text=${encodeURIComponent(message)}`, '_blank');
                                    }}
                                    className="quick-btn"
                                >
                                    <i className="fas fa-map-marked-alt"></i> Custom Tour
                                </button>
                            </div>
                        </div>

                        {/* Map Section */}
                        <div className="map-section">
                            <h3><i className="fas fa-map-marker-alt"></i> Explore Sri Lanka</h3>
                            <div className="map-container">
                                <iframe
                                    title="Sri Lanka Map"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4047277.479412064!2d79.56546606379061!3d7.873053671188431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593cf65a1e9d%3A0xe13da4b400e2d38c!2sSri%20Lanka!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk"
                                    width="100%"
                                    height="300"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <footer>
                <p>© 2025 Luxe Lanka — Premium Driver & Tour Experts</p>
                <div className="footer-social">
                    <a href="https://wa.me/94725335460" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-whatsapp"></i>
                    </a>
                    <a href="https://instagram.com/luxelanka" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-instagram"></i>
                    </a>
                    <a href="mailto:hello@luxelanka.com">
                        <i className="fas fa-envelope"></i>
                    </a>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;