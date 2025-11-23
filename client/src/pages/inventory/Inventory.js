import React, { useState, useEffect } from 'react';
import Sidebar from '../sidebar/Sidebar';
import './Inventory.css';

const Inventory = ({ user, onLogout }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    note: ''
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

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
        setItems(data.items || []);
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
    setFormData({ name: '', price: '', image: '', description: '', note: '' });
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
      note: item.note || ''
    });
    setSelectedImageFile(null);
    setImagePreview(item.image || '');
    setShowModal(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
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
        setShowModal(false);
        setEditingItem(null);
        setSelectedImageFile(null);
        setImagePreview('');
        await fetchItems();
      } else {
        alert(data.error || 'Failed to save item');
      }
    } catch (err) {
      console.error('Error saving item:', err);
      alert('Error saving item');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;
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
        await fetchItems();
      } else {
        alert(data.error || 'Failed to delete item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Error deleting item');
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
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Image</th>
                  <th>Description</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-row">No items in inventory</td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>${parseFloat(item.price).toFixed(2)}</td>
                      <td>
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="thumb" />
                        ) : (
                          <span className="no-image">No image</span>
                        )}
                      </td>
                      <td className="truncate">{item.description}</td>
                      <td className="truncate">{item.note}</td>
                      <td>
                        <button className="secondary-btn" onClick={() => openEditModal(item)}>Edit</button>
                        <button className="danger-btn" onClick={() => handleDelete(item.id)}>Delete</button>
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
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
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
                        src={imagePreview || formData.image}
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
