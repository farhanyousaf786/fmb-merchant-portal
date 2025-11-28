import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import FiltersBar from '../dashboard/components/FiltersBar/FiltersBar';
import './Orders.css';

const Orders = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setOrders(data.orders || []);
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

    return (
      <div className="orders-table-card">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Bread type</th>
              <th>Quantity</th>
              <th>Amounts</th>
              <th>ETA</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const total = Number(order.total_amount || 0).toFixed(2);
              const qty = Number(order.total_quantity || 0);
              const eta = new Date(order.created_at).toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              return (
                <tr key={order.id}>
                  <td>#{String(order.id).padStart(5, '0')}</td>
                  <td className="muted">Multiple</td>
                  <td>{qty}</td>
                  <td>${total}</td>
                  <td>{eta}</td>
                  <td>
                    <span className={`status-pill status-${order.status}`}>
                      {order.status === 'submitted' ? 'Paid' : 'Pending'}
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
            />
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Orders;
