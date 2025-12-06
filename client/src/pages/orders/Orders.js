import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import Sidebar from '../sidebar/Sidebar';
import './Orders.css';

const Orders = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { markAsSeen } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'yesterday', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'submitted', 'processing', 'shipped', 'delivered', 'cancelled'
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    markAsSeen('orders');
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        console.log('📦 Received orders data:', data.orders);
        if (response.ok && data.success) {
          setOrders(data.orders || []);
          setFilteredOrders(data.orders || []);
        } else {
          setError(data.error || 'Failed to load orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Apply date filtering
  useEffect(() => {
    if (!orders.length) return;

    let filtered = [...orders];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= today;
        });
        break;
      case 'yesterday':
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= yesterday && orderDate < today;
        });
        break;
      case 'custom':
        if (startDate && endDate) {
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= new Date(startDate) && orderDate <= new Date(endDate + ' 23:59:59');
          });
        }
        break;
      default:
        // 'all' - no filtering
        break;
    }

    // Apply status filtering
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, dateFilter, startDate, endDate, statusFilter]);

  const goToCatalog = () => {
    navigate('/catalogs');
  };

  const renderContent = () => {
    if (loading) {
      return <div className="orders-loading">Loading orders...</div>;
    }

    if (error) {
      return <div className="orders-error">{error}</div>;
    }

    if (!orders || orders.length === 0) {
      return (
        <div className="orders-empty-state">
          <div className="empty-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13M9 21C9.6 21 10 20.6 10 20S9.6 19 9 19 8 19.4 8 20 8.4 21 9 21ZM20 21C20.6 21 21 20.6 21 20S20.6 19 20 19 19 19.4 19 20 19.4 21 20 21Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>You haven't placed any orders yet.</h2>
          <button className="start-new-order-btn" onClick={goToCatalog}>
            Start New Order
          </button>
        </div>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <div className="orders-empty-state">
          <h2>No orders match your filters.</h2>
          <button 
            className="secondary-btn" 
            onClick={() => {
              setDateFilter('all');
              setStatusFilter('all');
              setStartDate('');
              setEndDate('');
            }}
          >
            Clear Filters
          </button>
        </div>
      );
    }

    return (
      <div className="orders-table-card">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const qty = Number(order.total_quantity || 0);
              const shopName = order.business_name || 'Shop';
              const contactName = order.contact_first_name && order.contact_last_name 
                ? `${order.contact_first_name} ${order.contact_last_name}`
                : order.contact_first_name || 'Contact';
              const userRole = order.role ? order.role.charAt(0).toUpperCase() + order.role.slice(1) : 'User';

              return (
                <tr 
                  key={order.id}
                  style={order.status === 'submitted' ? { backgroundColor: 'rgba(253, 230, 138, 0.2)' } : {}}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {order.status === 'submitted' && (
                        <span 
                          style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#ef4444',
                            borderRadius: '50%',
                            display: 'inline-block'
                          }} 
                          title="New Order"
                        />
                      )}
                      #{String(order.id).padStart(5, '0')}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: '500', color: '#1f2937' }}>{shopName}</span>
                      <span style={{ fontSize: '11px', color: '#d97706', fontWeight: '500' }}>{userRole}</span>
                    </div>
                  </td>
                  <td className="muted" style={{ position: 'relative' }}>
                    {(() => {
                      const itemNames = order.item_names || '';
                      if (!itemNames) return 'No items';
                      
                      // The server now sends the correct format: "1x Raisin Bread (sliced), 2x Raisin Bread (unsliced)"
                      const displayText = itemNames.length > 40 ? itemNames.substring(0, 40) + '...' : itemNames;
                      const isTruncated = itemNames.length > 40;
                      
                      return (
                        <div>
                          <span 
                            onMouseEnter={() => isTruncated && setHoveredItem(order.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            style={{ 
                              cursor: isTruncated ? 'help' : 'default',
                              display: 'inline-block',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {displayText}
                          </span>
                          
                          {hoveredItem === order.id && isTruncated && (
                            <div 
                              className="custom-tooltip"
                              style={{
                                position: 'absolute',
                                top: '100%',
                                left: '0',
                                right: '0',
                                zIndex: 1000,
                                backgroundColor: '#1f2937',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                lineHeight: '1.4',
                                whiteSpace: 'normal',
                                wordWrap: 'break-word',
                                maxWidth: '300px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                marginTop: '4px',
                                border: '1px solid #374151'
                              }}
                            >
                              {itemNames}
                              <div 
                                style={{
                                  position: 'absolute',
                                  top: '-4px',
                                  left: '20px',
                                  width: '8px',
                                  height: '8px',
                                  backgroundColor: '#1f2937',
                                  transform: 'rotate(45deg)',
                                  borderLeft: '1px solid #374151',
                                  borderTop: '1px solid #374151'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td>
                    <span className={`status-pill ${order.payment_status === 'paid' ? 'status-delivered' : 'status-pending'}`}>
                      {order.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill status-${order.status}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="orders-actions">
                      <button
                        className="outline-pill-btn"
                        onClick={goToCatalog}
                      >
                        Repeat order
                      </button>
                      <button
                        className="blue-pill-btn"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="orders-container">
          <div className="orders-header-row">
            <h1>Orders</h1>
            <div className="date-filter-controls">
              <select 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ 
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  marginRight: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="custom">Custom Range</option>
              </select>
              
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ 
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  marginRight: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="processing">Preparing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              {dateFilter === 'custom' && (
                <div className="custom-date-range" style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  alignItems: 'center', 
                  marginRight: '12px',
                  padding: '4px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ 
                      padding: '6px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px',
                      backgroundColor: 'white',
                      minWidth: '120px'
                    }}
                  />
                  <span style={{ 
                    color: '#6b7280', 
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    to
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ 
                      padding: '6px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px',
                      backgroundColor: 'white',
                      minWidth: '120px'
                    }}
                  />
                </div>
              )}
              
              <button className="start-new-order-btn" onClick={goToCatalog}>
                New Order
              </button>
            </div>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Orders;
