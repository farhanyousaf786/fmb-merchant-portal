import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast/ToastContext';
import Sidebar from '../sidebar/Sidebar';
import CancelConfirmDialog from '../../components/CancelConfirmDialog/CancelConfirmDialog';
import './OrderDetail.css';

const OrderDetail = ({ user, onLogout }) => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Form states for admin
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  const isAdmin = user?.role === 'admin';
  const [timeLeft, setTimeLeft] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Calculate time left for cancellation
  const calculateTimeLeft = useCallback(() => {
    if (!order) return null;
    
    const orderTime = new Date(order.created_at);
    const now = new Date();
    const diffMs = now - orderTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const timeLeftMinutes = Math.max(0, 10 - diffMinutes);
    
    return timeLeftMinutes > 0 ? timeLeftMinutes : null;
  }, [order]);

  // Update timer every second
  useEffect(() => {
    if (!order) return;
    
    const updateTimeLeft = () => {
      setTimeLeft(calculateTimeLeft());
    };
    
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [order, calculateTimeLeft]);

  // Check if order can be cancelled
  const canCancelOrder = () => {
    console.log('🔍 Checking cancellation:', { 
      hasOrder: !!order, 
      isAdmin, 
      status: order?.status, 
      timeLeft,
      userRole: user?.role 
    });
    
    if (!order || isAdmin) return false;
    
    const validStatuses = ['submitted', 'processing'];
    if (!validStatuses.includes(order.status)) {
      console.log('❌ Invalid status:', order.status);
      return false;
    }
    
    if (timeLeft === null) {
      console.log('❌ Time expired');
      return false;
    }
    
    return true;
  };

  const handleCancelOrder = async (reason) => {
    if (!canCancelOrder()) return;
    
    console.log('🚀 Starting cancellation:', { orderId, reason, user: user });
    
    try {
      setCancelling(true);
      const token = localStorage.getItem('authToken');
      
      const requestBody = { reason: reason || 'Customer requested cancellation' };
      console.log('📤 Sending request:', { url: `${process.env.REACT_APP_API_URL}/orders/${orderId}/cancel`, body: requestBody });
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('📥 Response received:', { status: response.status, data });
      
      if (response.ok && data.success) {
        toast.success('Order cancelled successfully');
        setShowCancelDialog(false);
        
        // Force complete page reload to ensure fresh data
        console.log('� Reloading page to get fresh data...');
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      console.log('🔄 Fetching order details for:', orderId);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('📡 API Response status:', response.status);
      const data = await response.json();
      console.log('📦 Full API Response:', data);
      
      if (response.ok && data.success) {
        console.log('📦 Fetched order data:', data.order);
        console.log('🔍 Order status from API:', data.order.status);
        console.log('🔍 Previous order status:', order?.status);
        
        // Force update with new data
        setOrder(data.order);
        setNewStatus(data.order.status);
        setTrackingNumber(data.order.tracking_number || '');
        
        // Log the current state after update
        setTimeout(() => {
          console.log('� State after update - Order status:', order?.status);
        }, 100);
      } else {
        console.error('❌ API Error:', data);
        toast.error('Failed to load order details');
        navigate('/orders');
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate, toast, order?.status]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, fetchOrderDetails]);

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    if (newStatus === 'declined' && !declineReason) {
      toast.error('Please provide a reason for declining');
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          notes,
          decline_reason: declineReason
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Status updated successfully');
        setNotes('');
        setDeclineReason('');
        await fetchOrderDetails(); // Wait for refresh to complete
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTracking = async () => {
    if (!trackingNumber.trim()) {
      alert('Please enter a tracking number');
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tracking_number: trackingNumber,
          notes: notes || 'Tracking number updated'
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert('Tracking number updated successfully');
        setNotes('');
        await fetchOrderDetails(); // Wait for refresh to complete
      } else {
        alert(data.error || 'Failed to update tracking number');
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
      alert('Failed to update tracking number');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="order-detail-container">
          <div className="order-detail-header">
            <button className="back-btn" onClick={() => navigate('/orders')}>
              ← Back to Orders
            </button>
            <h1>Order #{orderId}</h1>
          </div>

          {loading ? (
            <div className="loading-state">Loading order details...</div>
          ) : !order ? (
            <div className="error-state">Order not found</div>
          ) : (
            <div className="order-detail-content-centered">
              
              {/* Admin Controls - Full Width (if admin) */}
              {isAdmin && (
                <section className="detail-card admin-controls-card">
                  <div className="card-header">
                    <h3>Admin Controls</h3>
                    <p className="card-subtitle">Manage order status and tracking information</p>
                  </div>
                  
                  <div className="controls-layout">
                    <div className="control-section">
                      <h4>Update Status</h4>
                      <div className="control-row">
                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                          <option value="submitted">Submitted</option>
                          <option value="processing">Preparing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          className="primary-btn"
                          onClick={handleUpdateStatus}
                          disabled={updating}
                        >
                          {updating ? 'Updating...' : 'Update Status'}
                        </button>
                      </div>
                      
                      {newStatus === 'declined' && (
                        <div className="control-row mt-2">
                          <textarea
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            placeholder="Reason for declining..."
                            rows="2"
                            className="full-width"
                          />
                        </div>
                      )}
                      
                      <div className="control-row mt-2">
                         <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add internal notes..."
                            rows="1"
                            className="full-width"
                          />
                      </div>
                    </div>

                    <div className="divider-vertical"></div>

                    <div className="control-section">
                      <h4>Tracking Information</h4>
                      <div className="control-row">
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="Enter tracking number..."
                        />
                        <button
                          className="secondary-btn"
                          onClick={handleUpdateTracking}
                          disabled={updating}
                        >
                          {updating ? 'Saving...' : 'Save Tracking'}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Top Summary Section - Grid of 2 Cards */}
              <div className="summary-grid">
                {/* Order Info Card */}
                <section className="detail-card">
                  <h3>Order Information</h3>
                  <div className="info-grid-compact">
                    <div className="info-item">
                      <label>Status</label>
                      <span className={`status-badge status-${order.status} large-badge`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Total Amount</label>
                      <span className="amount-text-large">${Number(order.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="info-item">
                      <label>Created Date</label>
                      <span>{new Date(order.created_at).toLocaleString()}</span>
                    </div>
                    {order.tracking_number && (
                      <div className="info-item">
                        <label>Tracking Number</label>
                        <span className="tracking-text-large">{order.tracking_number}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <label>Payment Status</label>
                      <span className={`status-badge ${order.payment_status === 'paid' ? 'status-delivered' : 'status-pending'} large-badge`}>
                        {order.payment_status === 'paid' ? '✓ Paid' : '⚠ Payment Required'}
                      </span>
                    </div>
                    {order.stripe_payment_intent_id && (
                      <div className="info-item">
                        <label>Payment ID</label>
                        <span className="tracking-text-large" style={{ fontSize: '12px' }}>{order.stripe_payment_intent_id}</span>
                      </div>
                    )}
                    {order.invoice_pdf_url && (
                      <div className="info-item">
                        <label>Invoice</label>
                        <button 
                          className="secondary-btn small-btn"
                          onClick={() => {
                            const invoiceUrl = order.invoice_pdf_url.startsWith('http') 
                              ? order.invoice_pdf_url 
                              : `${process.env.REACT_APP_API_URL}${order.invoice_pdf_url}`;
                            window.open(invoiceUrl, '_blank', 'noreferrer');
                          }}
                        >
                          Download Invoice
                        </button>
                      </div>
                    )}
                    
                    {/* Cancel Order Section for Merchants */}
                    {!isAdmin && (
                      <div className="info-item">
                        <label>Actions</label>
                        {canCancelOrder() ? (
                          <div className="cancel-section">
                            <button 
                              className="danger-btn small-btn"
                              onClick={() => setShowCancelDialog(true)}
                              disabled={cancelling}
                            >
                              {cancelling ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                          </div>
                        ) : (
                          <div className="no-cancel-text">
                            {order?.status === 'cancelled' ? 'Order Cancelled' : 
                             order?.status === 'processing' || order?.status === 'shipped' || order?.status === 'delivered' ? 'Order in Progress' :
                             'Cancellation window expired'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {/* Customer Info Card */}
                <section className="detail-card">
                  <h3>Shipping Information</h3>
                  <div className="customer-grid">
                    <div className="customer-item">
                      <span className="label">Contact</span>
                      <span className="value">{order.contact_first_name} {order.contact_last_name}</span>
                      <span className="sub-value">{order.contact_email}</span>
                      <span className="sub-value">{order.contact_phone}</span>
                    </div>
                    <div className="customer-item">
                      <span className="label">Address</span>
                      <span className="value">{order.delivery_address}</span>
                      <span className="sub-value">{order.delivery_city}, {order.delivery_country} {order.delivery_postal}</span>
                    </div>
                  </div>

                  {order.customer_detail && (
                    <>
                      <div style={{ height: '24px' }}></div>
                      <h3>Customer Information</h3>
                      <div className="customer-grid">
                        <div className="customer-item">
                          <span className="label">Account</span>
                          <span className="value">{order.customer_detail.business_name}</span>
                          <span className="sub-value">ID: #{order.customer_detail.id}</span>
                        </div>
                        <div className="customer-item">
                          <span className="label">Contact</span>
                          <span className="value">{order.customer_detail.first_name} {order.customer_detail.last_name}</span>
                          <span className="sub-value">{order.customer_detail.email}</span>
                          <span className="sub-value">{order.customer_detail.phone}</span>
                        </div>
                      </div>
                    </>
                  )}
                </section>
              </div>

              {/* Order Items - Full Width */}
              <section className="detail-card">
                <h3>Order Items</h3>
                <div className="table-responsive">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Type</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="product-cell">
                              <span className="product-name">{item.product_name || `Product #${item.inventory_id}`}</span>
                            </div>
                          </td>
                          <td><span className="type-badge">{item.type}</span></td>
                          <td>{item.quantity}</td>
                          <td>${Number(item.unit_price).toFixed(2)}</td>
                          <td className="text-right font-bold">${Number(item.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="total-row">
                        <td colSpan="4" className="text-right">Subtotal</td>
                        <td className="text-right">${Number(order.subtotal_amount).toFixed(2)}</td>
                      </tr>
                      {Number(order.tax_amount) > 0 && (
                        <tr className="total-row">
                          <td colSpan="4" className="text-right">Tax</td>
                          <td className="text-right">${Number(order.tax_amount).toFixed(2)}</td>
                        </tr>
                      )}
                       <tr className="grand-total-row">
                        <td colSpan="4" className="text-right">Grand Total</td>
                        <td className="text-right">${Number(order.total_amount).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>

              {/* Order Timeline removed - status shown in Order Information card */}
            </div>
          )}
        </div>
      </div>
      
      {/* Cancel Confirmation Dialog */}
      <CancelConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelOrder}
        timeLeft={timeLeft}
        loading={cancelling}
      />
    </div>
  );
};

export default OrderDetail;
