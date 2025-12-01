import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import Sidebar from '../sidebar/Sidebar';
import './reviews.css';

const Reviews = ({ user, onLogout }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const { markAsSeen } = useNotifications();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    markAsSeen('reviews');
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleRateClick = (review) => {
    if (review.status === 'Rate') {
      setSelectedOrder(review);
      setRating(5);
      setFeedback('');
      setShowRateModal(true);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: selectedOrder.raw_order_id,
          rating,
          feedback
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Review submitted successfully');
        setShowRateModal(false);
        fetchReviews();
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= count ? 'filled' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="support-container">
          <div className="support-header">
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search by Invoice ID or Customer Name"
                className="search-input"
              />
              <button className="notification-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#6B7280" strokeWidth="2" fill="none"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#6B7280" strokeWidth="2" fill="none"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="reviews-section">
            <h1>{isAdmin ? 'All Reviews' : 'Reviews & feedbacks'}</h1>
            <p className="reviews-subtitle">
              {isAdmin ? 'View customer feedback' : 'Rate your delivery experiences...'}
            </p>
            
            {loading ? (
              <div className="loading">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="empty-state">No reviews found</div>
            ) : (
              <div className="reviews-table">
                <div className="table-header">
                  <div className="header-cell">Order ID</div>
                  <div className="header-cell">Date</div>
                  {isAdmin && <div className="header-cell">Merchant</div>}
                  <div className="header-cell">Rating</div>
                  <div className="header-cell">Feedbacks</div>
                  {!isAdmin && <div className="header-cell">Action</div>}
                </div>
                
                <div className="table-body">
                  {reviews.map((review, index) => (
                    <div key={index} className="table-row">
                      <div 
                        className="table-cell order-id clickable" 
                        onClick={() => navigate(`/orders/${review.raw_order_id || review.order_number}`)}
                        style={{ cursor: 'pointer', color: '#f59e0b' }}
                      >
                        {isAdmin ? `#ORD-${review.order_number}` : review.orderId}
                      </div>
                      <div className="table-cell date">
                        {new Date(review.date || review.created_at).toLocaleString()}
                      </div>
                      {isAdmin && (
                        <div className="table-cell">
                          {review.business_name || `${review.first_name} ${review.last_name}`}
                        </div>
                      )}
                      <div className="table-cell rating">
                        {review.rating > 0 ? (
                          <div className="stars">
                            {renderStars(review.rating)}
                          </div>
                        ) : (
                          <span className="no-rating">-</span>
                        )}
                      </div>
                      <div className="table-cell feedback">{review.feedback}</div>
                      {!isAdmin && (
                        <div className="table-cell action">
                          <button 
                            className={`action-btn ${review.status.toLowerCase()}`}
                            onClick={() => handleRateClick(review)}
                            disabled={review.status === 'Rated'}
                          >
                            {review.status}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rate Modal */}
          {showRateModal && (
            <div className="modal-overlay" onClick={() => setShowRateModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Rate Order {selectedOrder?.orderId}</h2>
                  <button className="close-btn" onClick={() => setShowRateModal(false)}>×</button>
                </div>
                <form onSubmit={handleSubmitReview} className="rate-form">
                  <div className="form-group">
                    <label>Rating</label>
                    <div className="star-rating-input">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`star-input ${star <= rating ? 'filled' : ''}`}
                          onClick={() => setRating(star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Feedback</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Share your experience..."
                      rows="4"
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="cancel-btn" onClick={() => setShowRateModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
