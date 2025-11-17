import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/signin');
  };

  const isAdmin = user?.role === 'admin';
  
  // Add business info for merchants if not present
  const merchantInfo = {
    businessName: user?.businessName || 'Famous Moms Bakery',
    merchantId: user?.merchantId || '007S1260'
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '/assets/icons/dashboard-icon.png',
      path: '/dashboard'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: '/assets/icons/orders-icon.png',
      path: '/orders'
    },
    {
      id: 'catalogs',
      label: 'Catalogs',
      icon: '/assets/icons/catalog-icon.png',
      path: '/catalogs'
    },
    {
      id: 'trackings',
      label: 'Trackings',
      icon: '/assets/icons/tracking-icon.png',
      path: '/trackings'
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: '/assets/icons/support-icon.png',
      path: '/support'
    },
    {
      id: 'support',
      label: 'Support',
      icon: '/assets/icons/support-icon.png',
      path: '/support-page'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '/assets/icons/setting-icon.png',
      path: '/settings'
    },
    {
      id: 'logout',
      label: 'Log out',
      icon: '/assets/icons/logut-icon.png',
      isLogout: true
    }
  ];

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        {!isAdmin && (
          <div className="merchant-info">
            <div className="merchant-avatar">
              <span className="avatar-text">
                {merchantInfo.businessName[0].toUpperCase()}
              </span>
            </div>
            <div className="merchant-details">
              <h3 className="merchant-name">
                {merchantInfo.businessName}
              </h3>
              <p className="merchant-id">
                Merchant ID: {merchantInfo.merchantId}
              </p>
            </div>
            <button className="expand-btn" aria-label="Expand">
              <span>›</span>
            </button>
          </div>
        )}
        {isAdmin && (
          <div className="user-info">
            <div className="user-avatar">
              {user?.first_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.first_name} {user?.last_name}</div>
              <div className="user-role">{user?.role || 'Role'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            if (item.isLogout) {
              return (
                <li key={item.id} className="nav-item">
                  <button
                    className="nav-link logout-nav-btn"
                    onClick={handleLogout}
                  >
                    <span className="nav-icon">
                      <img 
                        src={item.icon} 
                        alt={item.label} 
                        className="nav-icon-img"
                        onError={(e) => {
                          console.log('Icon failed to load:', item.icon);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'inline';
                        }}
                      />
                      <span className="nav-icon-fallback" style={{display: 'none'}}>🚪</span>
                    </span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                </li>
              );
            }
            
            return (
              <li key={item.id} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${
                    location.pathname === item.path ? 'active' : ''
                  }`}
                >
                  <span className="nav-icon">
                    <img 
                      src={item.icon} 
                      alt={item.label} 
                      className="nav-icon-img"
                      onError={(e) => {
                        console.log('Icon failed to load:', item.icon);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline';
                      }}
                    />
                    <span className="nav-icon-fallback" style={{display: 'none'}}>
                      {item.id === 'dashboard' ? '📊' : 
                       item.id === 'users' ? '👥' :
                       item.id === 'orders' ? '🛒' : 
                       item.id === 'catalogs' ? '📋' : 
                       item.id === 'checkouts' ? '💳' : 
                       item.id === 'invoices' ? '🧾' : 
                       item.id === 'trackings' ? '📦' : 
                       item.id === 'support' ? '❓' : 
                       item.id === 'settings' ? '⚙️' : '📄'}
                    </span>
                  </span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Promotional Banner */}
      <div className="promo-banner">
        <div className="promo-image">
          <img 
            src="/assets/images/side-bar-image.png" 
            alt="Promotional banner" 
            className="bread-image"
            onError={(e) => {
              console.log('Bottom image failed to load');
              e.target.src = "/api/placeholder/200/120";
            }}
          />
        </div>
        <div className="promo-content">
          <h4 className="promo-title">New Batch of Sliced bread now AVAILABLE!</h4>
          <p className="promo-subtitle">
            Quick send make an order before it is full distributed
          </p>
          <button className="order-btn">Order Now</button>
        </div>
        <button className="close-promo">×</button>
      </div>
    </div>
  );
};

export default Sidebar;
