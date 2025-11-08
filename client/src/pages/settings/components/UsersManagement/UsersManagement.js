import React, { useState, useEffect } from 'react';
import AlertDialog from '../../../../universal_components/AlertDialog/AlertDialog';
import PersonalInfoTab from './components/PersonalInfoTab';
import './UsersManagement.css';

const UsersManagement = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [pwdData, setPwdData] = useState({ newPassword: '', confirmPassword: '' });
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'confirm' });

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

  const openPasswordModal = (user) => {
    setTargetUser(user);
    setPwdData({ newPassword: '', confirmPassword: '' });
    setShowPwdModal(true);
  };

  const openUserDetailModal = (user) => {
    setSelectedUser(user);
    setShowUserDetailModal(true);
  };

  const closeUserDetailModal = () => {
    setShowUserDetailModal(false);
    setSelectedUser(null);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdData.newPassword.length < 6) {
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
        setPwdData({ newPassword: '', confirmPassword: '' });
      } else {
        alert(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password');
    }
  };

  const assignRole = async (userId, role, currentRole) => {
    if (!role || role === currentRole) return;
    
    setAlertDialog({
      isOpen: true,
      title: 'Confirm Role Change',
      message: `Are you sure you want to assign the role "${role}" to this user?`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userId}/role`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ role, status: 'approved' })
          });
          const data = await response.json();
          if (data.success) {
            setAlertDialog({
              isOpen: true,
              title: 'Success',
              message: 'Role assigned successfully',
              type: 'alert',
              onConfirm: () => {}
            });
            fetchUsers();
          } else {
            setAlertDialog({
              isOpen: true,
              title: 'Error',
              message: data.error || 'Failed to assign role',
              type: 'alert',
              onConfirm: () => {}
            });
          }
        } catch (error) {
          console.error('Error assigning role:', error);
          setAlertDialog({
            isOpen: true,
            title: 'Error',
            message: 'Failed to assign role',
            type: 'alert',
            onConfirm: () => {}
          });
        }
      }
    });
  };

  const approveUser = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this user? You should also assign a role to them.')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ status: 'approved' })
      });
      const data = await response.json();
      if (data.success) {
        alert('User approved successfully! Please assign them a role.');
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
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

  const changeUserStatus = async (userId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;
    
    const statusText = newStatus === 'pending' ? 'pending' : newStatus === 'approved' ? 'approved' : 'rejected';
    
    setAlertDialog({
      isOpen: true,
      title: 'Confirm Status Change',
      message: `Are you sure you want to change this user's status to ${statusText}?`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ status: newStatus })
          });
          
          const data = await response.json();
          if (data.success) {
            setAlertDialog({
              isOpen: true,
              title: 'Success',
              message: `User status changed to ${statusText}`,
              type: 'alert',
              onConfirm: () => {}
            });
            fetchUsers();
          } else {
            setAlertDialog({
              isOpen: true,
              title: 'Error',
              message: data.error || 'Failed to change user status',
              type: 'alert',
              onConfirm: () => {}
            });
          }
        } catch (error) {
          console.error('Error changing user status:', error);
          setAlertDialog({
            isOpen: true,
            title: 'Error',
            message: 'Failed to change user status',
            type: 'alert',
            onConfirm: () => {}
          });
        }
      }
    });
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
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
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table condensed">
            <thead>
              <tr>
                <th>ID</th>
                <th>Business Name</th>
                <th>Contact Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.business_name || '-'}</td>
                  <td>{u.primary_contact_name || `${u.first_name} ${u.last_name}`}</td>
                  <td>{u.email}</td>
                  <td>
                    <select 
                      className="role-select-dropdown"
                      value={u.role || ''}
                      onChange={(e) => assignRole(u.id, e.target.value, u.role)}
                      disabled={u.id === user?.id}
                    >
                      <option value="">Select Role</option>
                      <option value="merchant">Merchant</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <select 
                      className="action-select-dropdown"
                      value={u.status || 'approved'}
                      data-status={u.status || 'approved'}
                      onChange={(e) => changeUserStatus(u.id, e.target.value, u.status)}
                      disabled={u.id === user?.id && u.role === 'admin'}
                    >
                      <option value="pending">🟡 Pending</option>
                      <option value="approved">🟢 Approved</option>
                      <option value="rejected">🔴 Rejected</option>
                    </select>
                  </td>
                  <td>
                    <button 
                      className="details-btn-icon"
                      onClick={() => openUserDetailModal(u)}
                      title="View Details"
                    >
                      👁️
                    </button>
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

      {/* User Details Modal */}
      {showUserDetailModal && selectedUser && (
        <div className="modal-overlay" onClick={closeUserDetailModal}>
          <div className="modal-content user-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="close-btn" onClick={closeUserDetailModal}>
                ×
              </button>
            </div>
            
            <div className="user-detail-content">
              <PersonalInfoTab selectedUser={selectedUser} />
              
              <div className="detail-actions-section">
                <h3>Actions</h3>
                <div className="detail-actions-grid">
                  {selectedUser.status === 'pending' && (
                    <>
                      <button 
                        className="action-btn approve-action"
                        onClick={() => {
                          approveUser(selectedUser.id);
                          closeUserDetailModal();
                        }}
                      >
                        ✓ Approve User
                      </button>
                      <button 
                        className="action-btn reject-action"
                        onClick={() => {
                          rejectUser(selectedUser.id);
                          closeUserDetailModal();
                        }}
                      >
                        ✗ Reject User
                      </button>
                    </>
                  )}
                  
                  {selectedUser.status === 'pending' && (
                    <div className="role-assignment">
                      <label>Assign Role:</label>
                      <select 
                        className="role-select-modal"
                        onChange={(e) => {
                          if (e.target.value) {
                            assignRole(selectedUser.id, e.target.value);
                            closeUserDetailModal();
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Select Role</option>
                        <option value="merchant">Merchant</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  )}

                  <button 
                    className="action-btn password-action"
                    onClick={() => {
                      closeUserDetailModal();
                      openPasswordModal(selectedUser);
                    }}
                  >
                    🔑 Change Password
                  </button>

                  <button 
                    className="action-btn delete-action"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this user?')) {
                        handleDeleteUser(selectedUser.id);
                        closeUserDetailModal();
                      }
                    }}
                    disabled={selectedUser.id === user?.id}
                  >
                    🗑️ Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Universal Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        onConfirm={alertDialog.onConfirm}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </div>
  );
};

export default UsersManagement;
