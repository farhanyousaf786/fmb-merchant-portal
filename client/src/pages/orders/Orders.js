import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import Sidebar from '../sidebar/Sidebar';
import FiltersBar from '../dashboard/components/FiltersBar/FiltersBar';
import './Orders.css';

const Orders = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { markAsSeen } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ date: 'All Time', status: 'All Status' });

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

  useEffect(() => {
    if (!orders.length) return;

    let result = [...orders];

    // Filter by Status
    if (filters.status !== 'All Status') {
      result = result.filter(order => 
        order.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Filter by Date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filters.date) {
      case 'Today':
        result = result.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= today;
        });
        break;
      case 'Yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        result = result.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= yesterday && orderDate < today;
        });
        break;
      case 'Last 7 Days':
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        result = result.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= last7Days;
        });
        break;
      case 'Last 30 Days':
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);
        result = result.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= last30Days;
        });
        break;
      case 'All Time':
      default:
        // No date filtering
        break;
    }

    setFilteredOrders(result);
  }, [filters, orders]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

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
            onClick={() => setFilters({ date: 'All Time', status: 'All Status' })}
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
              <th>Bread type</th>
              <th>Quantity</th>
              <th>Amounts</th>
              <th>Payment</th>
              <th>ETA</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const total = Number(order.total_amount || 0).toFixed(2);
              const qty = Number(order.total_quantity || 0);
              const eta = new Date(order.created_at).toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

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
                  <td className="muted">Multiple</td>
                  <td>{qty}</td>
                  <td>${total}</td>
                  <td>
                    <span className={`status-pill ${order.payment_status === 'paid' ? 'status-delivered' : 'status-pending'}`}>
                      {order.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                    </span>
                  </td>
                  <td>{eta}</td>
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
            <FiltersBar
              primaryAction={{
                label: 'New Order',
                onClick: goToCatalog,
              }}
              onFilterChange={handleFilterChange}
            />
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Orders;
