import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast/ToastContext';
import Sidebar from '../sidebar/Sidebar';
import './TicketDetail.css';

const TicketDetail = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
    const interval = setInterval(fetchTicketDetails, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicketDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tickets/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setTicket(data.ticket);
        setMessages(data.messages);
      } else {
        toast.error('Failed to load ticket');
        navigate('/support-page');
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return null;

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/media/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        return data.url;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    return null;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !selectedImage) {
      toast.error('Please enter a message or select an image');
      return;
    }

    setSending(true);

    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tickets/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: newMessage,
          image_url: imageUrl
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        setSelectedImage(null);
        setImagePreview(null);
        fetchTicketDetails();
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tickets/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Status updated');
        fetchTicketDetails();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar user={user} onLogout={onLogout} />
        <div className="main-content">
          <div className="loading">Loading ticket...</div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="dashboard-layout">
        <Sidebar user={user} onLogout={onLogout} />
        <div className="main-content">
          <div className="error">Ticket not found</div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      'open': 'blue',
      'in_progress': 'yellow',
      'resolved': 'green',
      'closed': 'gray'
    };
    return colors[status] || 'gray';
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="ticket-detail-container">
          {/* Header */}
          <div className="ticket-detail-header">
            <button className="back-btn" onClick={() => navigate('/support-page')}>
              ← Back to Tickets
            </button>
            <div className="ticket-title-section">
              <h1>Ticket #{ticket.id} - {ticket.subject}</h1>
              <div className="ticket-meta-info">
                <span className={`status-badge status-${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <span className="ticket-date">
                  Created {new Date(ticket.created_at).toLocaleDateString()}
                </span>
                {ticket.order_number && (
                  <span className="order-ref">Order #{ticket.order_number}</span>
                )}
              </div>
            </div>
            {(isAdmin || ticket.status !== 'closed') && (
              <div className="status-actions">
                {ticket.status === 'open' && (
                  <button className="status-btn" onClick={() => handleStatusChange('in_progress')}>
                    Start Progress
                  </button>
                )}
                {ticket.status === 'in_progress' && (
                  <button className="status-btn" onClick={() => handleStatusChange('resolved')}>
                    Mark Resolved
                  </button>
                )}
                {ticket.status === 'resolved' && (
                  <>
                    <button className="status-btn" onClick={() => handleStatusChange('closed')}>
                      Close Ticket
                    </button>
                    <button className="status-btn secondary" onClick={() => handleStatusChange('in_progress')}>
                      Reopen
                    </button>
                  </>
                )}
                {ticket.status === 'closed' && isAdmin && (
                  <button className="status-btn" onClick={() => handleStatusChange('open')}>
                    Reopen Ticket
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="messages-container">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message ${msg.role === 'admin' ? 'admin-message' : 'user-message'}`}
              >
                <div className="message-header">
                  <span className="message-author">
                    {msg.role === 'admin' ? '🛡️ Admin' : `${msg.first_name} ${msg.last_name}`}
                  </span>
                  <span className="message-time">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="message-content">
                  <p>{msg.message}</p>
                  {msg.image_url && (
                    <img 
                      src={`${process.env.REACT_APP_API_URL}${msg.image_url}`} 
                      alt="Attachment" 
                      className="message-image"
                    />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {ticket.status !== 'closed' && (
            <form className="message-input-form" onSubmit={handleSendMessage}>
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="input-row">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button 
                  type="button" 
                  className="attach-btn"
                  onClick={() => fileInputRef.current.click()}
                >
                  📎
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="message-input"
                />
                <button type="submit" className="send-btn" disabled={sending}>
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
