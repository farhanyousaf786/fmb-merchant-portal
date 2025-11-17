import React from 'react';
import Sidebar from '../sidebar/Sidebar';
import './reviews.css';

const Support = ({ user, onLogout }) => {
  const reviewsData = [
    {
      orderId: '#ORD-2356',
      date: 'Nov 1, 2025, 11:03 AM',
      rating: 5,
      feedback: 'Great service!',
      status: 'Rated'
    },
    {
      orderId: '#ORD-2357',
      date: 'Nov 2, 2025, 1:52 PM',
      rating: 2,
      feedback: '-',
      status: 'Rated'
    },
    {
      orderId: '#ORD-2359',
      date: 'Nov 3, 2025, 8:14 AM',
      rating: 0,
      feedback: '-',
      status: 'Rate'
    },
    {
      orderId: '#ORD-2358',
      date: 'Nov 2, 2025, 4:28 PM',
      rating: 1,
      feedback: 'Driver delayed.',
      status: 'Rated'
    },
    {
      orderId: '#ORD-2360',
      date: 'Nov 3, 2025, 12:57 PM',
      rating: 0,
      feedback: '-',
      status: 'Rate'
    },
    {
      orderId: '#ORD-2360',
      date: 'Nov 3, 2025, 12:57 PM',
      rating: 4,
      feedback: 'Bread reduced by one!',
      status: 'Rated'
    }
  ];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

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
            <h1>Reviews & feedbacks</h1>
            <p className="reviews-subtitle">Rate your delivery experiences...</p>
            
            <div className="reviews-table">
              <div className="table-header">
                <div className="header-cell">Order ID</div>
                <div className="header-cell">Date</div>
                <div className="header-cell">Rating</div>
                <div className="header-cell">Feedbacks</div>
                <div className="header-cell">Action</div>
              </div>
              
              <div className="table-body">
                {reviewsData.map((review, index) => (
                  <div key={index} className="table-row">
                    <div className="table-cell order-id">{review.orderId}</div>
                    <div className="table-cell date">{review.date}</div>
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
                    <div className="table-cell action">
                      <button className={`action-btn ${review.status.toLowerCase()}`}>
                        {review.status}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
