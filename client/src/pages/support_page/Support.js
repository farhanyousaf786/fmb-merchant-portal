import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast/ToastContext';
import Sidebar from '../sidebar/Sidebar';
import './Support.css';

const Support = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    order_id: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchTickets();
    fetchOrders();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Ticket created successfully!');
        setShowCreateModal(false);
        setFormData({ subject: '', message: '', order_id: '', priority: 'medium' });
        fetchTickets();
        navigate(`/support-page/${data.ticketId}`);
      } else {
        toast.error('Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Error creating ticket');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'blue',
      'in_progress': 'yellow',
      'resolved': 'green',
      'closed': 'gray'
    };
    return colors[status] || 'gray';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'green',
      'medium': 'yellow',
      'high': 'red'
    };
    return colors[priority] || 'gray';
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="support-container">
          <div className="support-header">
            <h1>{isAdmin ? 'All Support Tickets' : 'Support Tickets'}</h1>
            {!isAdmin && (
              <button className="create-ticket-btn" onClick={() => setShowCreateModal(true)}>
                + New Ticket
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <p>No support tickets yet</p>
              {!isAdmin && (
                <button className="create-ticket-btn" onClick={() => setShowCreateModal(true)}>
                  Create Your First Ticket
                </button>
              )}
            </div>
          ) : (
            <div className="tickets-grid">
              {tickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  className="ticket-card"
                  onClick={() => navigate(`/support-page/${ticket.id}`)}
                >
                  <div className="ticket-header">
                    <h3>#{ticket.id} - {ticket.subject}</h3>
                    <span className={`status-badge status-${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="ticket-meta">
                    <span className={`priority-badge priority-${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    {ticket.order_number && (
                      <span className="order-ref">Order #{ticket.order_number}</span>
                    )}
                    <span className="message-count">{ticket.message_count} messages</span>
                  </div>
                  <div className="ticket-footer">
                    <span className="ticket-date">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Ticket Modal */}
          {showCreateModal && (
            <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Create Support Ticket</h2>
                  <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="ticket-form">
                  <div className="form-group">
                    <label>Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Related Order (Optional)</label>
                    <select name="order_id" value={formData.order_id} onChange={handleChange}>
                      <option value="">No related order</option>
                      {orders.map(order => (
                        <option key={order.id} value={order.id}>
                          Order #{order.id} - ${order.total_amount}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select name="priority" value={formData.priority} onChange={handleChange}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your issue in detail..."
                      rows="6"
                      required
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Create Ticket
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

export default Support;
