import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Admin.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Admin Packages Component
function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', image_url: '', category: 'tour'
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/packages`, {
      headers: { 'x-auth-token': token }
    });
    setPackages(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      if (editing) {
        await axios.put(`${API_URL}/packages/${editing}`, formData, {
          headers: { 'x-auth-token': token }
        });
        alert('Package updated successfully!');
      } else {
        await axios.post(`${API_URL}/packages`, formData, {
          headers: { 'x-auth-token': token }
        });
        alert('Package added successfully!');
      }
      resetForm();
      fetchPackages();
    } catch (error) {
      alert('Error saving package: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/packages/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchPackages();
      alert('Package deleted successfully!');
    }
  };

  const handleEdit = (pkg) => {
    setEditing(pkg.id);
    setFormData({
      title: pkg.title,
      description: pkg.description,
      price: pkg.price,
      image_url: pkg.image_url,
      category: pkg.category
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ title: '', description: '', price: '', image_url: '', category: 'tour' });
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2><i className="fas fa-umbrella-beach"></i> Manage Packages</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i> Add Package
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="form-container">
            <h3>{editing ? 'Edit Package' : 'Add New Package'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required rows="3" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL *</label>
                <input type="url" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} required />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-list">
        {packages.map(pkg => (
          <div key={pkg.id} className="admin-item">
            <img src={pkg.image_url} alt={pkg.title} className="item-image" />
            <div className="item-info">
              <h3>{pkg.title}</h3>
              <p>{pkg.description}</p>
              <span className="price">${pkg.price}</span>
              <small>Category: {pkg.category}</small>
            </div>
            <div className="item-actions">
              <button className="btn-edit" onClick={() => handleEdit(pkg)}><i className="fas fa-edit"></i> Edit</button>
              <button className="btn-delete" onClick={() => handleDelete(pkg.id)}><i className="fas fa-trash"></i> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Admin Vehicles Component
function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', price_per_day: '', image_url: '', category: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/vehicles`, {
      headers: { 'x-auth-token': token }
    });
    setVehicles(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      if (editing) {
        await axios.put(`${API_URL}/vehicles/${editing}`, formData, {
          headers: { 'x-auth-token': token }
        });
        alert('Vehicle updated successfully!');
      } else {
        await axios.post(`${API_URL}/vehicles`, formData, {
          headers: { 'x-auth-token': token }
        });
        alert('Vehicle added successfully!');
      }
      resetForm();
      fetchVehicles();
    } catch (error) {
      alert('Error saving vehicle: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/vehicles/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchVehicles();
      alert('Vehicle deleted successfully!');
    }
  };

  const handleEdit = (vehicle) => {
    setEditing(vehicle.id);
    setFormData({
      name: vehicle.name,
      description: vehicle.description,
      price_per_day: vehicle.price_per_day,
      image_url: vehicle.image_url,
      category: vehicle.category
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ name: '', description: '', price_per_day: '', image_url: '', category: '' });
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2><i className="fas fa-car"></i> Manage Vehicles</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i> Add Vehicle
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="form-container">
            <h3>{editing ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required rows="3" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price per Day ($) *</label>
                  <input type="number" step="0.01" value={formData.price_per_day} onChange={(e) => setFormData({...formData, price_per_day: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL *</label>
                <input type="url" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} required />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-list">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="admin-item">
            <img src={vehicle.image_url} alt={vehicle.name} className="item-image" />
            <div className="item-info">
              <h3>{vehicle.name}</h3>
              <p>{vehicle.description}</p>
              <span className="price">${vehicle.price_per_day}/day</span>
              <small>Category: {vehicle.category}</small>
            </div>
            <div className="item-actions">
              <button className="btn-edit" onClick={() => handleEdit(vehicle)}><i className="fas fa-edit"></i> Edit</button>
              <button className="btn-delete" onClick={() => handleDelete(vehicle.id)}><i className="fas fa-trash"></i> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Admin Drivers Component with Optimized Image Upload
// Admin Drivers Component with Image Storage
function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', bio: '', experience_years: '', specialty: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/drivers`, {
      headers: { 'x-auth-token': token }
    });
    setDrivers(response.data);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large! Please select an image under 2MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPEG, PNG, GIF)');
        return;
      }
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('bio', formData.bio);
    formDataToSend.append('experience_years', formData.experience_years);
    formDataToSend.append('specialty', formData.specialty);
    
    if (selectedFile) {
      formDataToSend.append('image', selectedFile);
    }
    
    const token = localStorage.getItem('adminToken');
    
    try {
      setUploading(true);
      
      if (editing) {
        await axios.put(`${API_URL}/drivers/${editing.id}`, formDataToSend, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token 
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        alert('Driver updated successfully!');
      } else {
        await axios.post(`${API_URL}/drivers`, formDataToSend, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token 
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        alert('Driver added successfully!');
      }
      resetForm();
      fetchDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      alert('Error saving driver: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/drivers/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchDrivers();
      alert('Driver deleted successfully!');
    }
  };

  const handleEdit = (driver) => {
    setEditing(driver);
    setFormData({
      name: driver.name,
      bio: driver.bio,
      experience_years: driver.experience_years,
      specialty: driver.specialty
    });
    setImagePreview(driver.image_url);
    setSelectedFile(null);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ name: '', bio: '', experience_years: '', specialty: '' });
    setSelectedFile(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2><i className="fas fa-users"></i> Manage Drivers</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i> Add Driver
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="form-container">
            <div className="form-header">
              <h3>{editing ? 'Edit Driver' : 'Add New Driver'}</h3>
              <button className="close-modal" onClick={resetForm}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="form-group">
                <label>Name *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Bio *</label>
                <textarea 
                  value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                  required 
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Experience (Years) *</label>
                  <input 
                    type="number" 
                    value={formData.experience_years} 
                    onChange={(e) => setFormData({...formData, experience_years: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Specialty *</label>
                  <input 
                    type="text" 
                    value={formData.specialty} 
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Driver Photo</label>
                <div className="image-upload-area">
                  {imagePreview && (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview-img" />
                      <button type="button" className="remove-image-btn" onClick={() => {
                        setImagePreview(null);
                        setSelectedFile(null);
                      }}>
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}
                  <div className="upload-options">
                    <label className="upload-btn">
                      <i className="fas fa-cloud-upload-alt"></i> Choose Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileSelect} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                    <small className="form-hint">
                      <i className="fas fa-info-circle"></i> 
                      Max 2MB. JPG, PNG, GIF supported. Images are stored directly in database.
                    </small>
                  </div>
                  {uploading && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <span>Uploading: {uploadProgress}%</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : (editing ? 'Update Driver' : 'Save Driver')}
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-list">
        {drivers.map(driver => (
          <div key={driver.id} className="admin-item">
            <div className="driver-avatar">
              <img 
                src={driver.image_url || 'https://via.placeholder.com/80x80?text=No+Image'} 
                alt={driver.name} 
              />
            </div>
            <div className="item-info">
              <h3>{driver.name}</h3>
              <p className="driver-bio">{driver.bio}</p>
              <div className="driver-meta">
                <span className="badge"><i className="fas fa-calendar-alt"></i> {driver.experience_years} years</span>
                <span className="badge"><i className="fas fa-tag"></i> {driver.specialty}</span>
              </div>
            </div>
            <div className="item-actions">
              <button className="btn-edit" onClick={() => handleEdit(driver)}><i className="fas fa-edit"></i> Edit</button>
              <button className="btn-delete" onClick={() => handleDelete(driver.id)}><i className="fas fa-trash"></i> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// Admin Videos Component
function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', youtube_url: '', category: ''
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/videos`, {
      headers: { 'x-auth-token': token }
    });
    setVideos(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      if (editing) {
        await axios.put(`${API_URL}/videos/${editing}`, formData, {
          headers: { 'x-auth-token': token }
        });
        alert('Video updated successfully!');
      } else {
        await axios.post(`${API_URL}/videos`, formData, {
          headers: { 'x-auth-token': token }
        });
        alert('Video added successfully!');
      }
      resetForm();
      fetchVideos();
    } catch (error) {
      alert('Error saving video: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/videos/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchVideos();
      alert('Video deleted successfully!');
    }
  };

  const handleEdit = (video) => {
    setEditing(video.id);
    setFormData({
      title: video.title,
      youtube_url: video.youtube_url,
      category: video.category
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ title: '', youtube_url: '', category: '' });
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2><i className="fas fa-video"></i> Manage Videos</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i> Add Video
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="form-container">
            <h3>{editing ? 'Edit Video' : 'Add New Video'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>YouTube URL *</label>
                <input type="url" value={formData.youtube_url} onChange={(e) => setFormData({...formData, youtube_url: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                  <option value="">Select Category</option>
                  <option value="home">Home</option>
                  <option value="tour">Tour</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="driver">Driver</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-list">
        {videos.map(video => (
          <div key={video.id} className="admin-item">
            <div className="item-info">
              <h3>{video.title}</h3>
              <p>Category: {video.category}</p>
              <a href={video.youtube_url} target="_blank" rel="noopener noreferrer">View on YouTube <i className="fas fa-external-link-alt"></i></a>
            </div>
            <div className="item-actions">
              <button className="btn-edit" onClick={() => handleEdit(video)}><i className="fas fa-edit"></i> Edit</button>
              <button className="btn-delete" onClick={() => handleDelete(video.id)}><i className="fas fa-trash"></i> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Admin Reviews Component
function AdminReviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/reviews/admin/all`, {
      headers: { 'x-auth-token': token }
    });
    setReviews(response.data);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/reviews/admin/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchReviews();
      alert('Review deleted successfully!');
    }
  };

  return (
    <div className="admin-section">
      <h2><i className="fas fa-star"></i> Manage Reviews</h2>
      <div className="admin-list">
        {reviews.map(review => (
          <div key={review.id} className="admin-item">
            <div className="item-info">
              <h3>{review.name}</h3>
              <div className="rating">{'⭐'.repeat(review.rating)}</div>
              <p>{review.text}</p>
              <small><i className="fas fa-calendar-alt"></i> {new Date(review.created_at).toLocaleDateString()}</small>
            </div>
            <div className="item-actions">
              <button className="btn-delete" onClick={() => handleDelete(review.id)}><i className="fas fa-trash"></i> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Admin Messages Component
function AdminMessages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/contact/admin/all`, {
      headers: { 'x-auth-token': token }
    });
    setMessages(response.data);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/contact/admin/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchMessages();
      alert('Message deleted successfully!');
    }
  };

  return (
    <div className="admin-section">
      <h2><i className="fas fa-envelope"></i> Contact Messages</h2>
      <div className="admin-list">
        {messages.map(message => (
          <div key={message.id} className="admin-item">
            <div className="item-info">
              <h3>{message.name}</h3>
              <p><i className="fas fa-envelope"></i> {message.email}</p>
              <p><i className="fas fa-comment"></i> {message.message}</p>
              <small><i className="fas fa-clock"></i> {new Date(message.created_at).toLocaleString()}</small>
            </div>
            <div className="item-actions">
              <button className="btn-delete" onClick={() => handleDelete(message.id)}><i className="fas fa-trash"></i> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Admin Round Tours Component
function AdminRoundTours() {
  const [roundTours, setRoundTours] = useState([]);
  const [editingTour, setEditingTour] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    days: '', title: '', duration: '', price: '', description: '', image_url: '', total_days: ''
  });
  const [itineraryDays, setItineraryDays] = useState([]);

  useEffect(() => {
    fetchRoundTours();
  }, []);

  const fetchRoundTours = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/round-tours`, {
        headers: { 'x-auth-token': token }
      });
      setRoundTours(response.data);
    } catch (error) {
      console.error('Error fetching round tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItineraryChange = (index, field, value) => {
    const updatedDays = [...itineraryDays];
    updatedDays[index] = { ...updatedDays[index], [field]: value };
    setItineraryDays(updatedDays);
  };

  const addItineraryDay = () => {
    setItineraryDays([...itineraryDays, { day_number: itineraryDays.length + 1, title: '', image_url: '', activities: [] }]);
  };

  const removeItineraryDay = (index) => {
    const updatedDays = itineraryDays.filter((_, i) => i !== index);
    updatedDays.forEach((day, idx) => { day.day_number = idx + 1; });
    setItineraryDays(updatedDays);
  };

  const addActivity = (dayIndex) => {
    const updatedDays = [...itineraryDays];
    if (!updatedDays[dayIndex].activities) updatedDays[dayIndex].activities = [];
    updatedDays[dayIndex].activities.push('');
    setItineraryDays(updatedDays);
  };

  const updateActivity = (dayIndex, activityIndex, value) => {
    const updatedDays = [...itineraryDays];
    updatedDays[dayIndex].activities[activityIndex] = value;
    setItineraryDays(updatedDays);
  };

  const removeActivity = (dayIndex, activityIndex) => {
    const updatedDays = [...itineraryDays];
    updatedDays[dayIndex].activities = updatedDays[dayIndex].activities.filter((_, i) => i !== activityIndex);
    setItineraryDays(updatedDays);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const dataToSend = { ...formData, days: parseInt(formData.days), total_days: parseInt(formData.total_days), itinerary: itineraryDays };
      if (editingTour) {
        await axios.put(`${API_URL}/round-tours/${editingTour.id}`, dataToSend, { headers: { 'x-auth-token': token } });
        alert('Round tour updated successfully!');
      } else {
        await axios.post(`${API_URL}/round-tours`, dataToSend, { headers: { 'x-auth-token': token } });
        alert('Round tour created successfully!');
      }
      resetForm();
      fetchRoundTours();
    } catch (error) {
      alert('Error saving round tour: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = async (tour) => {
    setEditingTour(tour);
    setFormData({ days: tour.days, title: tour.title, duration: tour.duration, price: tour.price, description: tour.description, image_url: tour.image_url, total_days: tour.total_days });
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/round-tours/${tour.id}`, { headers: { 'x-auth-token': token } });
      if (response.data.itinerary) {
        const itinerary = response.data.itinerary.map(day => ({ day_number: day.day_number, title: day.title, image_url: day.image_url, activities: JSON.parse(day.activities) }));
        setItineraryDays(itinerary);
      }
    } catch (error) { console.error('Error fetching itinerary:', error); }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this round tour? This will also delete all itinerary days.')) {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/round-tours/${id}`, { headers: { 'x-auth-token': token } });
      fetchRoundTours();
      alert('Round tour deleted successfully!');
    }
  };

  const resetForm = () => {
    setEditingTour(null);
    setShowForm(false);
    setFormData({ days: '', title: '', duration: '', price: '', description: '', image_url: '', total_days: '' });
    setItineraryDays([]);
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="admin-round-tours">
      <div className="section-header">
        <h2><i className="fas fa-map-marked-alt"></i> Manage Round Tours</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}><i className="fas fa-plus"></i> Add Round Tour</button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="form-container">
            <h3>{editingTour ? 'Edit Round Tour' : 'Create New Round Tour'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row"><div className="form-group"><label>Days</label><input type="number" name="days" value={formData.days} onChange={handleInputChange} required /></div><div className="form-group"><label>Total Days</label><input type="number" name="total_days" value={formData.total_days} onChange={handleInputChange} required /></div></div>
              <div className="form-group"><label>Title</label><input type="text" name="title" value={formData.title} onChange={handleInputChange} required /></div>
              <div className="form-row"><div className="form-group"><label>Duration (e.g., "7 Days / 6 Nights")</label><input type="text" name="duration" value={formData.duration} onChange={handleInputChange} required /></div><div className="form-group"><label>Price</label><input type="text" name="price" value={formData.price} onChange={handleInputChange} required /></div></div>
              <div className="form-group"><label>Description</label><textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} required></textarea></div>
              <div className="form-group"><label>Image URL</label><input type="url" name="image_url" value={formData.image_url} onChange={handleInputChange} required /></div>
              <h4>Itinerary Days</h4>
              {itineraryDays.map((day, idx) => (
                <div key={idx} className="itinerary-day-card"><div className="day-header"><h5>Day {day.day_number}</h5><button type="button" className="btn-danger-small" onClick={() => removeItineraryDay(idx)}><i className="fas fa-trash"></i> Remove Day</button></div>
                <div className="form-group"><label>Day Title</label><input type="text" value={day.title} onChange={(e) => handleItineraryChange(idx, 'title', e.target.value)} required /></div>
                <div className="form-group"><label>Day Image URL</label><input type="url" value={day.image_url} onChange={(e) => handleItineraryChange(idx, 'image_url', e.target.value)} /></div>
                <div className="form-group"><label>Activities</label>{day.activities && day.activities.map((activity, actIdx) => (<div key={actIdx} className="activity-item"><input type="text" value={activity} onChange={(e) => updateActivity(idx, actIdx, e.target.value)} placeholder="Activity description" /><button type="button" className="btn-icon" onClick={() => removeActivity(idx, actIdx)}><i className="fas fa-times"></i></button></div>))}<button type="button" className="btn-secondary-small" onClick={() => addActivity(idx)}><i className="fas fa-plus"></i> Add Activity</button></div></div>
              ))}
              <button type="button" className="btn-secondary" onClick={addItineraryDay}><i className="fas fa-plus"></i> Add Day</button>
              <div className="form-actions"><button type="submit" className="btn-primary">Save Tour</button><button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-list">
        {roundTours.map(tour => (
          <div key={tour.id} className="admin-item">
            <img src={tour.image_url} alt={tour.title} className="item-image" />
            <div className="item-info"><h3>{tour.title}</h3><p>{tour.duration} - {tour.price}</p><small>{tour.description.substring(0, 100)}...</small></div>
            <div className="item-actions"><button className="btn-edit" onClick={() => handleEdit(tour)}><i className="fas fa-edit"></i> Edit</button><button className="btn-delete" onClick={() => handleDelete(tour.id)}><i className="fas fa-trash"></i> Delete</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Admin Dashboard
function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [username, setUsername] = useState('');
  
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminName = localStorage.getItem('adminUsername');
    if (!token) {
      navigate('/admin-login');
    } else {
      setUsername(adminName || 'Admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/admin-login');
  };

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <div className="admin-nav-container">
          <div className="logo-area"><i className="fas fa-crown" style={{ color: '#ff7b2c', fontSize: '1.5rem' }}></i><h2>Luxe Lanka Admin</h2><span className="admin-badge">Welcome, {username}</span></div>
          <div className="admin-nav-links">
            <button onClick={() => setActiveTab('packages')} className={activeTab === 'packages' ? 'active' : ''}><i className="fas fa-umbrella-beach"></i> Packages</button>
            <button onClick={() => setActiveTab('vehicles')} className={activeTab === 'vehicles' ? 'active' : ''}><i className="fas fa-car"></i> Vehicles</button>
            <button onClick={() => setActiveTab('drivers')} className={activeTab === 'drivers' ? 'active' : ''}><i className="fas fa-users"></i> Drivers</button>
            <button onClick={() => setActiveTab('videos')} className={activeTab === 'videos' ? 'active' : ''}><i className="fas fa-video"></i> Videos</button>
            <button onClick={() => setActiveTab('roundtours')} className={activeTab === 'roundtours' ? 'active' : ''}><i className="fas fa-map-marked-alt"></i> Round Tours</button>
            <button onClick={() => setActiveTab('reviews')} className={activeTab === 'reviews' ? 'active' : ''}><i className="fas fa-star"></i> Reviews</button>
            <button onClick={() => setActiveTab('messages')} className={activeTab === 'messages' ? 'active' : ''}><i className="fas fa-envelope"></i> Messages</button>
            <button onClick={handleLogout} className="logout-btn"><i className="fas fa-sign-out-alt"></i> Logout</button>
          </div>
        </div>
      </nav>
      <div className="admin-content">
        {activeTab === 'packages' && <AdminPackages />}
        {activeTab === 'vehicles' && <AdminVehicles />}
        {activeTab === 'drivers' && <AdminDrivers />}
        {activeTab === 'videos' && <AdminVideos />}
        {activeTab === 'roundtours' && <AdminRoundTours />}
        {activeTab === 'reviews' && <AdminReviews />}
        {activeTab === 'messages' && <AdminMessages />}
      </div>
    </div>
  );
}

export default AdminDashboard;