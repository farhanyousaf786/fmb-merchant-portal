import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast/ToastContext';
import Sidebar from '../sidebar/Sidebar';
import UserDetailDialog from '../settings/components/UsersManagement/UserDetailDialog';
import './Users.css';

function Users({ user, onLogout }) {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
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
        toast.success('User status updated successfully');
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      toast.error('Failed to update user status');
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
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('User created successfully!');
        setShowAddModal(false);
        setFormData({ first_name: '', last_name: '', email: '', password: '', role: 'merchant', status: 'active' });
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
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
        toast.success('User approved successfully!');
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to approve user');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
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
        toast.success('User rejected');
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to reject user');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
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
        toast.success('Role assigned successfully');
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to assign role');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
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
      toast.error('Error: No user selected');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
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
        toast.success('Password updated successfully');
        closePasswordModal();
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('❌ Frontend error updating password:', error);
      toast.error('Failed to update password');
    }
  };

  return (
    <div className="users-page">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="users-content">
        <div className="users-header">
          <h1>Users Management</h1>
          <button className="add-user-btn" onClick={() => {
            setFormData({ first_name: '', last_name: '', email: '', password: '', role: 'merchant', status: 'active' });
            setShowAddPassword(false);
            setShowAddModal(true);
          }}>
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
                  <label>First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
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
                  <div className="password-input-container">
                    <input
                      type={showAddPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      minLength="6"
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                    >
                      {showAddPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
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
                  <div className="password-input-container">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="Enter new password"
                      minLength="6"
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="Confirm new password"
                      minLength="6"
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
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
