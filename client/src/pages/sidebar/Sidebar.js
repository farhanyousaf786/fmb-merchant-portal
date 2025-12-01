import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import './Sidebar.css';

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications } = useNotifications();

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
      id: 'inventory',
      label: 'Inventory',
      icon: '/assets/icons/catalog-icon.png',
      path: '/inventory',
      adminOnly: true
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
      id: 'users',
      label: 'Users Management',
      icon: '/assets/icons/support-icon.png',
      path: '/users',
      adminOnly: true
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
      {/* Header - Unified UI for all users */}
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar">
            <span className="avatar-text">
              {isAdmin 
                ? (user?.first_name?.charAt(0).toUpperCase() || 'A')
                : (user?.business_name?.charAt(0).toUpperCase() || merchantInfo.businessName[0].toUpperCase())
              }
            </span>
          </div>
          <div className="user-details">
            <h3 className="user-name">
              {isAdmin 
                ? `${user?.first_name || 'Admin'} ${user?.last_name || 'User'}`
                : (user?.business_name || merchantInfo.businessName)
              }
            </h3>
            <p className="user-id">
              {isAdmin 
                ? `${user?.role || 'Administrator'}`
                : `ID: ${user?.id || merchantInfo.merchantId} • ${user?.role || 'Merchant'}`
              }
            </p>
          </div>
          <button className="expand-btn" aria-label="Expand">
            <span>›</span>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            // Skip admin-only items if user is not admin
            if (item.adminOnly && !isAdmin) {
              return null;
            }

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
                  <span className="nav-label">
                    {item.label}
                    {item.id === 'orders' && notifications.orders > 0 && (
                      <span className="nav-badge">{notifications.orders}</span>
                    )}
                    {item.id === 'reviews' && notifications.reviews > 0 && (
                      <span className="nav-badge">{notifications.reviews}</span>
                    )}
                    {item.id === 'support' && notifications.support > 0 && (
                      <span className="nav-badge">{notifications.support}</span>
                    )}
                  </span>
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
