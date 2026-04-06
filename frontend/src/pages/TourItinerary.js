import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/TourItinerary.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function TourItinerary() {
  const { id } = useParams(); // Changed from { days } to { id }
  const navigate = useNavigate();
  const [tourData, setTourData] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [itineraryDays, setItineraryDays] = useState([]);

  useEffect(() => {
    const fetchTourData = async () => {
      setLoading(true);
      try {
        // Fetch tour details by ID
        const response = await axios.get(`${API_URL}/round-tours/${id}`);
        
        if (response.data && response.data.tour) {
          setTourData(response.data.tour);
          
          // Parse activities from JSON string if they exist
          const parsedItinerary = (response.data.itinerary || []).map(day => ({
            ...day,
            activities: typeof day.activities === 'string' ? JSON.parse(day.activities) : (day.activities || [])
          }));
          setItineraryDays(parsedItinerary);
        } else {
          setError('Tour not found');
        }
      } catch (err) {
        console.error('Error loading tour data:', err);
        setError('Failed to load itinerary. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchTourData();
    } else {
      setError('Invalid tour ID');
      setLoading(false);
    }
  }, [id]);

  const getDayActivities = (dayNumber) => {
    const day = itineraryDays.find(d => d.day_number === dayNumber);
    if (day) {
      return {
        title: day.title,
        image: day.image_url,
        activities: day.activities
      };
    }
    return {
      title: `Day ${dayNumber} - Sri Lanka Exploration`,
      image: "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg",
      activities: ["Activity details not available"]
    };
  };

  const handleInquiry = () => {
    const message = `Hi! I'm interested in the ${tourData?.title} (${tourData?.duration}). Can you provide more details and availability for this tour?`;
    window.open(`https://wa.me/94725335460?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDayInquiry = (day) => {
    const message = `Hi! I'm interested in Day ${day} of the ${tourData?.title} (${tourData?.duration}). Can you provide more details about this day's activities and pricing?`;
    window.open(`https://wa.me/94725335460?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your itinerary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Error Loading Itinerary</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/round-tours')} className="btn-glass-round">
            Back to Tours
          </button>
        </div>
      </div>
    );
  }

  if (!tourData) {
    return null;
  }

  const totalDays = tourData.total_days || itineraryDays.length || tourData.days;

  return (
    <div className="itinerary-page">
      {/* Main Navigation Bar */}
      <nav className="main-nav">
        <div className="nav-container">
          <div className="logo">🌴 Luxe Lanka Tours</div>
          <button className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className="fas fa-bars"></i>
          </button>
          <div className={`nav-links ${mobileMenuOpen ? 'show' : ''}`}>
            <Link to="/" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-home"></i> Home
            </Link>
            <Link to="/#packages" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-umbrella-beach"></i> Tour Packages
            </Link>
            <Link to="/round-tours" className="glass-nav-btn active" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-map-marked-alt"></i> Round Tours
            </Link>
            <Link to="/#vehicle" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-car"></i> Vehicle Packages
            </Link>
            <Link to="/#drivers" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-users"></i> About Drivers
            </Link>
            <Link to="/#reviews" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-star"></i> Reviews
            </Link>
            <Link to="/#contact" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-envelope"></i> Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Orange Info Bar */}
      <div className="info-bar">
        <div className="info-bar-content">
          <span><i className="fas fa-phone-alt"></i> +94 72 533 5460</span>
          <span><i className="fas fa-envelope"></i> hello@luxelanka.com</span>
          <span><i className="fas fa-clock"></i> 24/7 Support</span>
        </div>
      </div>

      {/* Floating Social Icons */}
      <div className="floating-social">
        <a href="https://wa.me/94725335460" target="_blank" rel="noopener noreferrer" className="float-glass-btn whatsapp">
        <img src="https://static.vecteezy.com/system/resources/previews/024/398/617/non_2x/whatsapp-logo-icon-isolated-on-transparent-background-free-png.png" alt="WhatsApp" />
        </a>
        <a href="https://instagram.com/luxelanka" target="_blank" rel="noopener noreferrer" className="float-glass-btn instagram">
          <img src="https://static.vecteezy.com/system/resources/thumbnails/018/930/413/small/instagram-logo-instagram-icon-transparent-free-png.png" alt="Instagram" />
        </a>
      </div>

      <main className="itinerary-content">
        <button className="back-button" onClick={() => navigate('/round-tours')}>
          <i className="fas fa-arrow-left"></i> 
        </button>

        <div className="itinerary-header">
          <h1>{tourData.title}</h1>
          <div className="tour-meta">
            <span><i className="fas fa-clock"></i> {tourData.duration}</span>
            <span><i className="fas fa-tag"></i> {tourData.price}</span>
            <span><i className="fas fa-map-marker-alt"></i> Sri Lanka</span>
          </div>
          <p className="description">{tourData.description}</p>
          <button className="inquiry-button" onClick={handleInquiry}>
            <i className="fab fa-whatsapp"></i> Inquire About This Tour
          </button>
        </div>

        <div className="itinerary-days">
          <div className="day-navigation">
            {[...Array(totalDays)].map((_, index) => {
              const dayNumber = index + 1;
              return (
                <button
                  key={dayNumber}
                  className={`day-nav-btn ${activeDay === dayNumber ? 'active' : ''}`}
                  onClick={() => setActiveDay(dayNumber)}
                >
                  Day {dayNumber}
                </button>
              );
            })}
          </div>

          <div className="day-detail">
            <div className="day-image">
              <img src={getDayActivities(activeDay).image} alt={`Day ${activeDay}`} loading="lazy" />
            </div>
            <div className="day-content">
              <h3>Day {activeDay}: {getDayActivities(activeDay).title}</h3>
              <ul className="activities-list">
                {getDayActivities(activeDay).activities.map((activity, idx) => (
                  <li key={idx}>
                    <i className="fas fa-check-circle"></i>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
              <div className="day-actions">
                <button className="day-inquiry" onClick={() => handleDayInquiry(activeDay)}>
                  <i className="fab fa-whatsapp"></i> Inquire About Day {activeDay}
                </button>
                <button className="share-day" onClick={() => {
                  const message = `Check out Day ${activeDay} of the ${tourData.title} tour: ${getDayActivities(activeDay).title}`;
                  navigator.clipboard.writeText(message);
                  alert('Day details copied to clipboard!');
                }}>
                  <i className="fas fa-share-alt"></i> Share
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="tour-summary">
          <h3>Tour Highlights</h3>
          <div className="highlights-grid">
            <div className="highlight-item"><i className="fas fa-hotel"></i><span>Premium Accommodations</span></div>
            <div className="highlight-item"><i className="fas fa-car"></i><span>Private Vehicle & Driver</span></div>
            <div className="highlight-item"><i className="fas fa-utensils"></i><span>Authentic Local Cuisine</span></div>
            <div className="highlight-item"><i className="fas fa-camera"></i><span>Photo Opportunities</span></div>
            <div className="highlight-item"><i className="fas fa-hiking"></i><span>Guided Excursions</span></div>
            <div className="highlight-item"><i className="fas fa-water"></i><span>Scenic Landscapes</span></div>
          </div>
        </div>

        <div className="includes-section">
          <h3><i className="fas fa-gift"></i> Package Includes</h3>
          <div className="includes-grid">
            <div><i className="fas fa-check-circle"></i> Private air-conditioned vehicle</div>
            <div><i className="fas fa-check-circle"></i> English-speaking driver/guide</div>
            <div><i className="fas fa-check-circle"></i> Accommodation with breakfast</div>
            <div><i className="fas fa-check-circle"></i> Airport pickup and drop-off</div>
            <div><i className="fas fa-check-circle"></i> Fuel and parking charges</div>
            <div><i className="fas fa-check-circle"></i> 24/7 customer support</div>
            <div><i className="fas fa-check-circle"></i> Local SIM card with data</div>
            <div><i className="fas fa-check-circle"></i> Bottled water during tours</div>
          </div>
        </div>

        <div className="flexible-booking">
          <div className="flexible-content">
            <i className="fas fa-calendar-alt"></i>
            <div>
              <h4>Flexible Booking</h4>
              <p>Customize your itinerary, add or remove days, and tailor the tour to your preferences</p>
            </div>
            <button className="customize-btn" onClick={handleInquiry}>
              Customize This Tour <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </main>

      <footer>
        <p>© 2025 Luxe Lanka — Premium Driver & Tour Experts</p>
        <div className="footer-social">
          <a href="https://wa.me/94725335460" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp"></i></a>
          <a href="https://instagram.com/luxelanka" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
          <a href="mailto:hello@luxelanka.com"><i className="fas fa-envelope"></i></a>
        </div>
      </footer>
    </div>
  );
}

export default TourItinerary;