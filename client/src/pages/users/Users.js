import React, { useState, useEffect } from 'react';
import Sidebar from '../sidebar/Sidebar';
import UserDetailDialog from '../settings/components/UsersManagement/UserDetailDialog';
import './Users.css';

function Users({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'merchant',
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/all-users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
        console.log('✅ Users fetched:', data.users);
      } else {
        console.error('❌ Failed to fetch users:', data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (userId, newStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/update-user-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ userId, status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        console.log('✅ User status updated');
        fetchUsers();
      } else {
        alert(data.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  // Filter users based on selected filters
  const filteredUsers = users.filter(u => {
    const statusMatch = statusFilter === 'all' || u.status === statusFilter;
    const roleMatch = roleFilter === 'all' || u.role === roleFilter;
    return statusMatch && roleMatch;
  });

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
        setFormData({ name: '', email: '', password: '', role: 'merchant' });
        fetchUsers();
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const openUserDetailModal = (user) => {
    setSelectedUser(user);
    setShowUserDetailModal(true);
  };

  const closeUserDetailModal = () => {
    setShowUserDetailModal(false);
    setSelectedUser(null);
  };

  const approveUser = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this user?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/update-user-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ userId, status: 'active' })
      });
      const data = await response.json();
      if (data.success) {
        alert('User approved successfully!');
        fetchUsers();
      } else {
        alert(data.error || 'Failed to approve user');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user');
    }
  };

  const rejectUser = async (userId) => {
    const confirmed = window.confirm('Are you sure you want to reject this user?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/update-user-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ userId, status: 'inactive' })
      });
      const data = await response.json();
      if (data.success) {
        alert('User rejected');
        fetchUsers();
      } else {
        alert(data.error || 'Failed to reject user');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user');
    }
  };

  const assignRole = async (userId, role) => {
    if (!role) return;
    
    if (!window.confirm(`Are you sure you want to assign the role "${role}" to this user?`)) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ role, status: 'active' })
      });
      const data = await response.json();
      if (data.success) {
        alert('Role assigned successfully');
        fetchUsers();
      } else {
        alert(data.error || 'Failed to assign role');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      alert('Failed to assign role');
    }
  };

  const openPasswordModal = (user) => {
    console.log('🔐 Opening password modal for user:', user);
    setPasswordUser(user);
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordUser(null);
    setPasswordData({ newPassword: '', confirmPassword: '' });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    console.log('🔐 Frontend: Password change initiated');
    console.log('👤 Target user:', passwordUser);
    console.log('🔑 New password length:', passwordData.newPassword.length);
    
    if (!passwordUser) {
      console.error('❌ No user selected for password change');
      alert('Error: No user selected');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    const token = localStorage.getItem('authToken');
    console.log('🎫 Auth token present:', !!token);
    console.log('🎫 Token preview:', token ? token.substring(0, 20) + '...' : 'NONE');
    
    try {
      const requestBody = { newPassword: passwordData.newPassword };
      console.log('📤 Sending request to:', `${process.env.REACT_APP_API_URL}/users/${passwordUser.id}/password`);
      console.log('📤 Request body:', { ...requestBody, newPassword: '[REDACTED]' });
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${passwordUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📥 Response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Response data:', data);
      
      if (data.success) {
        alert('Password updated successfully');
        closePasswordModal();
      } else {
        alert(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('❌ Frontend error updating password:', error);
      alert('Failed to update password');
    }
  };

  return (
    <div className="users-page">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="users-content">
        <div className="users-header">
          <h1>Users Management</h1>
          <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
            + Add New User
          </button>
        </div>

        {/* Filters */}
        <div className="users-filters">
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Role:</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="merchant">Merchant</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div className="filter-info">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.first_name} {u.last_name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <select 
                          className={`status-select ${u.status}`}
                          value={u.status}
                          onChange={(e) => handleChangeStatus(u.id, e.target.value)}
                          disabled={u.id === user?.id}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="details-btn"
                          onClick={() => openUserDetailModal(u)}
                          title="View Details"
                        >
                          
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-users">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New User</h2>
                <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <form onSubmit={handleAddUser} className="user-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    minLength="6"
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
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

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="modal-overlay" onClick={closePasswordModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Change Password</h2>
                <button className="close-btn" onClick={closePasswordModal}>×</button>
              </div>
              <form onSubmit={handleChangePassword} className="user-form">
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="Enter new password"
                    minLength="6"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                    minLength="6"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={closePasswordModal}>
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
      </div>

      {/* User Details Modal */}
      {showUserDetailModal && selectedUser && (
        <UserDetailDialog
          user={user}
          selectedUser={selectedUser}
          onClose={closeUserDetailModal}
          onApproveUser={approveUser}
          onRejectUser={rejectUser}
          onAssignRole={assignRole}
          onChangePassword={openPasswordModal}
        />
      )}
    </div>
  );
}

export default Users;
