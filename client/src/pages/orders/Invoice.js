import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast/ToastContext';
import Sidebar from '../sidebar/Sidebar';
import './Invoice.css';

const Invoice = ({ user, onLogout }) => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const invoiceRef = useRef();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOrder(data.order);
      } else {
        toast.error('Failed to load order');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const element = invoiceRef.current;
      const opt = {
        margin: 10,
        filename: `invoice-${orderId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      };

      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;
      html2pdf().set(opt).from(element).save();
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download invoice');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar user={user} onLogout={onLogout} />
        <div className="main-content">
          <div className="loading-state">Loading invoice...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="dashboard-layout">
        <Sidebar user={user} onLogout={onLogout} />
        <div className="main-content">
          <div className="error-state">Order not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="invoice-container">
          <div className="invoice-header">
            <button className="back-btn" onClick={() => navigate(`/orders/${orderId}`)}>
              ← Back to Order
            </button>
            <div className="invoice-actions">
              <button className="primary-btn" onClick={downloadPDF}>
                📥 Download as PDF
              </button>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="invoice-content" ref={invoiceRef}>
            {/* Header */}
            <div className="invoice-header-section">
              <div className="company-info">
                <h1 className="company-name">FMB Merchant Portal</h1>
                <p className="company-detail">Invoice Management System</p>
              </div>
              <div className="invoice-meta">
                <div className="meta-item">
                  <span className="label">Invoice #</span>
                  <span className="value">{String(order.id).padStart(5, '0')}</span>
                </div>
                <div className="meta-item">
                  <span className="label">Date</span>
                  <span className="value">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <span className="label">Status</span>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="invoice-info-section">
              <div className="info-block">
                <h3>Bill To</h3>
                <p className="name">{order.contact_first_name} {order.contact_last_name}</p>
                <p className="email">{order.contact_email}</p>
                <p className="phone">{order.contact_phone}</p>
              </div>

              <div className="info-block">
                <h3>Ship To</h3>
                <p className="address">{order.delivery_address}</p>
                <p className="city-country">{order.delivery_city}, {order.delivery_country} {order.delivery_postal}</p>
              </div>

              <div className="info-block">
                <h3>Payment Method</h3>
                <p className="payment-method">
                  {order.payment_type === 'cash_on_delivery' ? '💵 Cash on Delivery' : '💳 Card Payment'}
                </p>
                <p className={`payment-status ${order.payment_status}`}>
                  {order.payment_status === 'paid' ? '✓ Paid' : '⚠ Pending'}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="invoice-items-section">
              <h3>Order Items</h3>
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th className="col-item">Item Description</th>
                    <th className="col-type">Type</th>
                    <th className="col-qty">Quantity</th>
                    <th className="col-price">Unit Price</th>
                    <th className="col-total">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="col-item">
                        <span className="item-name">{item.product_name || `Product #${item.inventory_id}`}</span>
                      </td>
                      <td className="col-type">
                        <span className="type-badge">{item.type}</span>
                      </td>
                      <td className="col-qty">{item.quantity}</td>
                      <td className="col-price">${Number(item.unit_price).toFixed(2)}</td>
                      <td className="col-total">${Number(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="invoice-summary-section">
              <div className="summary-row">
                <span className="label">Subtotal</span>
                <span className="value">${Number(order.subtotal_amount).toFixed(2)}</span>
              </div>
              {Number(order.tax_amount) > 0 && (
                <div className="summary-row">
                  <span className="label">Tax</span>
                  <span className="value">${Number(order.tax_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row grand-total">
                <span className="label">Grand Total</span>
                <span className="value">${Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="invoice-footer">
              <p>Thank you for your business!</p>
              <p className="footer-note">This is an automatically generated invoice.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
