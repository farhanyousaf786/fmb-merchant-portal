import React, { useState, useEffect } from 'react';
import './UsersManagement.css';

const UsersManagement = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [pwdData, setPwdData] = useState({ newPassword: '', confirmPassword: '' });
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
    role: 'merchant'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPasswordModal = (u) => {
    setTargetUser(u);
    setPwdData({ newPassword: '', confirmPassword: '' });
    setShowPwdModal(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwdData.newPassword || pwdData.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${targetUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ newPassword: pwdData.newPassword })
      });
      const data = await response.json();
      if (data.success) {
        alert('Password updated successfully');
        setShowPwdModal(false);
      } else {
        alert(data.error || 'Failed to update password');
      }
    } catch (err) {
      console.error('Change password error:', err);
      alert('Failed to update password');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        alert('User created successfully!');
        setShowAddModal(false);
        setFormData({ first_name: '', last_name: '', phone: '', email: '', password: '', role: 'merchant' });
        fetchUsers();
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        alert('User deleted successfully!');
        fetchUsers();
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  return (
    <div className="users-management-container">
      <div className="section-header">
        <h2>Users Management</h2>
        <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
          + Add New User
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.first_name}</td>
                  <td>{u.last_name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{display:'flex', gap:'8px'}}>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user?.id}
                      >
                        Delete
                      </button>
                      <button 
                        className="submit-btn"
                        style={{padding:'0.5rem 0.75rem'}}
                        onClick={() => openPasswordModal(u)}
                      >
                        Change Password
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showPwdModal && (
        <div className="modal-overlay" onClick={() => setShowPwdModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button className="close-btn" onClick={() => setShowPwdModal(false)}>×</button>
            </div>
            <form onSubmit={handleChangePassword} className="user-form">
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={pwdData.newPassword}
                  onChange={(e) => setPwdData({...pwdData, newPassword: e.target.value})}
                  placeholder="Enter new password"
                  minLength="6"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={pwdData.confirmPassword}
                  onChange={(e) => setPwdData({...pwdData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                  minLength="6"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowPwdModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddUser} className="user-form">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  placeholder="Enter last name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Enter password (min 6 characters)"
                  required
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="merchant">Merchant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
