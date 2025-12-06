import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast/ToastContext';
import Sidebar from '../sidebar/Sidebar';
import './Inventory.css';

const Inventory = ({ user, onLogout }) => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    note: '',
    inventory_count: 0
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Helper to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise, prepend the API URL
    return `${process.env.REACT_APP_API_URL}${imagePath}`;
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        // Filter items based on user role
        const allItems = data.items || [];
        if (user?.role === 'admin') {
          // Admin sees all items (active + inactive)
          setItems(allItems);
        } else {
          // Merchants only see active items
          setItems(allItems.filter(item => item.status === 'active'));
        }
      } else {
        console.error('Failed to load inventory:', data.error);
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ name: '', price: '', image: '', description: '', note: '', inventory_count: 0 });
    setSelectedImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      price: item.price || '',
      image: item.image || '',
      description: item.description || '',
      note: item.note || '',
      inventory_count: item.inventory_count || 0
    });
    setSelectedImageFile(null);
    setImagePreview(item.image || '');
    setShowModal(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSelectedImageFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const isEdit = !!editingItem;
      const url = isEdit
        ? `${process.env.REACT_APP_API_URL}/inventory/${editingItem.id}`
        : `${process.env.REACT_APP_API_URL}/inventory/add`;
      const method = isEdit ? 'PUT' : 'POST';

      let imageUrl = formData.image;

      // If a new image file was selected, upload it first
      if (selectedImageFile) {
        const uploadForm = new FormData();
        uploadForm.append('avatar', selectedImageFile);

        const uploadRes = await fetch(`${process.env.REACT_APP_API_URL}/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadForm
        });

        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.success && uploadData.url) {
          imageUrl = uploadData.url;
        } else {
          alert(uploadData.error || 'Failed to upload image');
          return;
        }
      }

      const payload = {
        ...formData,
        image: imageUrl
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isEdit ? 'Item updated successfully' : 'Item added successfully');
        setShowModal(false);
        setEditingItem(null);
        setSelectedImageFile(null);
        setImagePreview('');
        await fetchItems();
      } else {
        toast.error(data.error || 'Failed to save item');
      }
    } catch (err) {
      console.error('Error saving item:', err);
      toast.error('Error saving item');
    }
  };

  const handleToggleStatus = async (itemId) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory/toggle-status/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Item status updated');
        await fetchItems();
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Error updating status');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this item permanently? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Item deleted successfully');
        await fetchItems();
      } else {
        toast.error(data.error || 'Failed to delete item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error('Error deleting item');
    }
  };

  return (
    <div className="inventory-page">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="inventory-content">
        <div className="inventory-header">
          <h1>Inventory Management</h1>
          <button className="primary-btn" onClick={openAddModal}>+ Add Item</button>
        </div>

        {loading ? (
          <div className="loading">Loading inventory...</div>
        ) : (
          <div className="inventory-table-card">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Inventory Count</th>
                  <th>Image</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-row">No items in inventory</td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item.id} style={item.status === 'inactive' ? { opacity: 0.6, backgroundColor: '#f9fafb' } : {}}>
                      <td>{item.name}</td>
                      <td>${parseFloat(item.price).toFixed(2)}</td>
                      <td>
                        <span style={{ 
                          fontWeight: 'bold',
                          color: item.inventory_count > 0 ? '#059669' : '#dc2626',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: item.inventory_count > 0 ? '#ecfdf5' : '#fef2f2'
                        }}>
                          {item.inventory_count || 0}
                        </span>
                      </td>
                      <td>
                        {item.image ? (
                          <img src={getImageUrl(item.image)} alt={item.name} className="thumb" />
                        ) : (
                          <span className="no-image">No image</span>
                        )}
                      </td>
                      <td className="truncate">{item.description}</td>
                      <td>
                        <button className="secondary-btn" onClick={() => openEditModal(item)}>Edit</button>
                        {user?.role === 'admin' && (
                          <select
                            value={item.status}
                            onChange={(e) => {
                              if (e.target.value !== item.status) {
                                handleToggleStatus(item.id);
                              }
                            }}
                            style={{
                              marginLeft: '8px',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              backgroundColor: item.status === 'active' ? '#d1fae5' : '#fee2e2',
                              color: item.status === 'active' ? '#065f46' : '#991b1b',
                              fontWeight: '500',
                              fontSize: '13px',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="active" style={{ backgroundColor: '#fff', color: '#065f46' }}>✓ Active</option>
                            <option value="inactive" style={{ backgroundColor: '#fff', color: '#991b1b' }}>🔒 Inactive</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingItem ? 'Edit Item' : 'Add Item'}</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSave} className="modal-form">
                <div className="form-row">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Inventory Count</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.inventory_count}
                    onChange={e => setFormData({ ...formData, inventory_count: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Item Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                  />
                  {(imagePreview || formData.image) && (
                    <div className="image-preview-wrapper">
                      <img
                        src={imagePreview || getImageUrl(formData.image)}
                        alt="Item preview"
                        className="thumb preview-thumb"
                      />
                    </div>
                  )}
                </div>
                <div className="form-row">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                  />
                </div>
                <div className="form-row">
                  <label>Note</label>
                  <textarea
                    value={formData.note}
                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                    rows="2"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="primary-btn">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
