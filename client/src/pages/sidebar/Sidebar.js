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
      id: 'checkouts',
      label: 'Checkouts',
      icon: '/assets/icons/checkout-icon.png',
      path: '/checkouts'
    },
    {
      id: 'invoices',
      label: 'Invoice/Payments',
      icon: '/assets/icons/invoice-icon.png',
      path: '/invoices'
    },
    {
      id: 'trackings',
      label: 'Trackings',
      icon: '/assets/icons/tracking-icon.png',
      path: '/trackings'
    },
    {
      id: 'support',
      label: 'Support/Issues',
      icon: '/assets/icons/support-icon.png',
      path: '/support'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '/assets/icons/setting-icon.png',
      path: '/settings'
    }
  ];

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="merchant-info">
          <div className="merchant-avatar">
            <span className="avatar-text">M</span>
          </div>
          <div className="merchant-details">
            <h3 className="merchant-name">
              {user?.name || 'Famous Moms Ba...'}
            </h3>
            <p className="merchant-id">
              Merchant ID: {user?.merchantId || '00751260'}
            </p>
          </div>
          <button className="expand-btn">
            <span>›</span>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
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
          ))}
        </ul>

        {/* Logout */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">
              <img 
                src="/assets/icons/logut-icon.png" 
                alt="Log out" 
                className="nav-icon-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline';
                }}
              />
              <span className="nav-icon-fallback" style={{display: 'none'}}>🚪</span>
            </span>
            <span className="nav-label">Log out</span>
          </button>
        </div>
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
