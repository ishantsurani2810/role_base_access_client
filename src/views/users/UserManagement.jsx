import React, { useState, useEffect } from 'react';
import * as userService from '../../services/user.service.js';
import { Search, Mail, PlusCircle, RefreshCw, Trash2, Edit2, X, ShieldAlert } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';

export const UserManagement = () => {
  const { user: loggedInAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [roles, setRoles] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMess, setErrorMess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submittingData, setSubmittingData] = useState(false);

  // Invite user form fields
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  // Checkbox matrix for Products module overrides
  const [customOverrideActive, setCustomOverrideActive] = useState(false);
  const [overrideRead, setOverrideRead] = useState(false);
  const [overrideCreate, setOverrideCreate] = useState(false);
  const [overrideUpdate, setOverrideUpdate] = useState(false);
  const [overrideDelete, setOverrideDelete] = useState(false);

  // Edit user form fields
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingRoleId, setEditingRoleId] = useState('');
  const [editingStatus, setEditingStatus] = useState('');
  const [editingOverridesActive, setEditingOverridesActive] = useState(false);
  const [editOverrideRead, setEditOverrideRead] = useState(false);
  const [editOverrideCreate, setEditOverrideCreate] = useState(false);
  const [editOverrideUpdate, setEditOverrideUpdate] = useState(false);
  const [editOverrideDelete, setEditOverrideDelete] = useState(false);

  const fetchUsersAndInvitations = async () => {
    setLoading(true);
    setErrorMess('');
    try {
      const usersData = await userService.getUsers({
        search: searchQuery,
        status: statusFilter
      });
      setUsers(usersData.data.users);

      const rolesList = await userService.getRoles();
      setRoles(rolesList);

      const pendingInvites = await userService.getPendingInvitations();
      setInvitations(pendingInvites);
    } catch (err) {
      setErrorMess(err.response?.data?.message || 'Failed to fetch directory details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndInvitations();
  }, [searchQuery, statusFilter]);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail || !inviteRoleId) {
      setErrorMess('Please fill in required fields.');
      return;
    }

    setSubmittingData(true);
    setErrorMess('');

    // Pre-calculate permissions overrides
    let permissions = undefined;
    if (customOverrideActive) {
      const actions = [];
      if (overrideRead) actions.push('read');
      if (overrideCreate) actions.push('create');
      if (overrideUpdate) actions.push('update');
      if (overrideDelete) actions.push('delete');
      permissions = [{ module: 'Products', actions }];
    }

    try {
      await userService.inviteUser({
        name: inviteName,
        email: inviteEmail,
        roleId: inviteRoleId,
        permissions
      });
      setIsInviteModalOpen(false);
      
      // Clean form fields
      setInviteName('');
      setInviteEmail('');
      setInviteRoleId('');
      setCustomOverrideActive(false);
      setOverrideRead(false);
      setOverrideCreate(false);
      setOverrideUpdate(false);
      setOverrideDelete(false);
      
      fetchUsersAndInvitations();
    } catch (err) {
      setErrorMess(err.response?.data?.message || 'Failed to trigger user invitation.');
    } finally {
      setSubmittingData(false);
    }
  };

  const handleEditClick = (targetUser) => {
    setEditingUserId(targetUser._id);
    setEditingName(targetUser.name);
    setEditingRoleId(targetUser.roleId?._id || '');
    setEditingStatus(targetUser.status);

    const productOverride = targetUser.permissions?.find(p => p.module === 'Products');
    if (productOverride) {
      setEditingOverridesActive(true);
      setEditOverrideRead(productOverride.actions.includes('read'));
      setEditOverrideCreate(productOverride.actions.includes('create'));
      setEditOverrideUpdate(productOverride.actions.includes('update'));
      setEditOverrideDelete(productOverride.actions.includes('delete'));
    } else {
      setEditingOverridesActive(false);
      setEditOverrideRead(false);
      setEditOverrideCreate(false);
      setEditOverrideUpdate(false);
      setEditOverrideDelete(false);
    }
    setErrorMess('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmittingData(true);
    setErrorMess('');

    let permissions = [];
    if (editingOverridesActive) {
      const actions = [];
      if (editOverrideRead) actions.push('read');
      if (editOverrideCreate) actions.push('create');
      if (editOverrideUpdate) actions.push('update');
      if (editOverrideDelete) actions.push('delete');
      permissions = [{ module: 'Products', actions }];
    }

    try {
      await userService.updateUser(editingUserId, {
        name: editingName,
        roleId: editingRoleId,
        status: editingStatus,
        permissions
      });
      setIsEditModalOpen(false);
      fetchUsersAndInvitations();
    } catch (err) {
      setErrorMess(err.response?.data?.message || 'Failed to update user profile overrides.');
    } finally {
      setSubmittingData(false);
    }
  };

  const handleDeleteUser = async (id, name, email) => {
    if (email === 'admin@example.com') {
      alert('The primary System Admin user cannot be deleted.');
      return;
    }

    if (!window.confirm(`Are you sure you want to completely delete user: ${name}?`)) {
      return;
    }

    try {
      await userService.deleteUser(id);
      fetchUsersAndInvitations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleResendInvite = async (invitationId, name) => {
    try {
      await userService.resendInvitation(invitationId);
      alert(`Invitation link resent successfully for ${name}. Review target details.`);
      fetchUsersAndInvitations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resend invitation.');
    }
  };

  const handleCancelInvite = async (invitationId, email) => {
    if (!window.confirm(`Are you sure you want to cancel the invitation for: ${email}?`)) {
      return;
    }

    try {
      await userService.cancelInvitation(invitationId);
      fetchUsersAndInvitations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel invitation.');
    }
  };

  return (
    <div>
      <div className="card-title-bar">
        <h2>Manage Users &amp; Invites</h2>
        
        <button className="btn btn-primary btn-sm" onClick={() => { setIsInviteModalOpen(true); setErrorMess(''); }}>
          <PlusCircle size={16} />
          <span>Invite User</span>
        </button>
      </div>

      {errorMess && !isInviteModalOpen && !isEditModalOpen && (
        <div className="alert alert-danger">
          <span>{errorMess}</span>
        </div>
      )}

      {/* Advanced search row */}
      <div className="search-bar-row">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="form-control"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="form-control users-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Disabled">Disabled</option>
          </select>

          <button className="btn btn-secondary btn-sm" onClick={fetchUsersAndInvitations}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {/* Active Users Table Card */}
          <div className="card users-table-card">
            <h3 className="users-card-header-label">
              Active Users List
            </h3>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email Address</th>
                    <th>Template Role</th>
                    <th>Status</th>
                    <th>Role Customizations</th>
                    <th className="products-actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((u) => {
                      const prodOverride = u.permissions?.find(p => p.module === 'Products');
                      const hasOverrides = !!prodOverride;

                      return (
                        <tr key={u._id}>
                          <td className="users-table-name-cell">{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className="badge badge-indigo">{u.roleId?.name || 'Employee'}</span>
                          </td>
                          <td>
                            <span className={`badge ${u.status === 'Active' ? 'badge-success' : u.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                              {u.status}
                            </span>
                          </td>
                          <td>
                            {hasOverrides ? (
                              <div className="dashboard-badge-list">
                                {prodOverride.actions.map(act => (
                                  <span key={act} className="badge badge-warning" style={{ fontSize: '9px', padding: '2px 6px' }}>
                                    {act}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="users-table-standard-cell">None (Standard)</span>
                            )}
                          </td>
                          <td className="products-actions-cell">
                            <div className="users-table-action-btns">
                              <button
                                className="btn btn-secondary btn-sm users-table-btn-sm"
                                onClick={() => handleEditClick(u)}
                              >
                                <Edit2 size={13} />
                              </button>
                              
                              <button
                                className="btn btn-danger btn-sm users-table-btn-sm"
                                disabled={u.email === 'admin@example.com'}
                                onClick={() => handleDeleteUser(u._id, u.name, u.email)}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--gray-500)' }}>
                        No profiles matched.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Invitations Table Card */}
          <div className="card users-invitations-card">
            <h3 className="users-card-header-label">
              Pending Invitations
            </h3>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Invited Name</th>
                    <th>Email Address</th>
                    <th>Designated Role</th>
                    <th>Temporary Link Expiry</th>
                    <th>Status</th>
                    <th className="products-actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.length > 0 ? (
                    invitations.map((inv) => {
                      const isExpired = new Date() > new Date(inv.expiresAt);
                      const displayStatus = isExpired && inv.status === 'Pending' ? 'Expired' : inv.status;

                      return (
                        <tr key={inv._id}>
                          <td className="users-invited-name">{inv.name}</td>
                          <td>{inv.email}</td>
                          <td>
                            <span className="badge badge-indigo">{inv.roleId?.name || 'Employee'}</span>
                          </td>
                          <td className="users-invite-expiry-date">
                            {new Date(inv.expiresAt).toLocaleString()}
                          </td>
                          <td>
                            <span className={`badge ${displayStatus === 'Accepted' ? 'badge-success' : displayStatus === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                              {displayStatus}
                            </span>
                          </td>
                          <td className="products-actions-cell">
                            <div className="users-table-action-btns">
                              {inv.status === 'Pending' && (
                                <>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    title="Resend Invitation Email Link"
                                    onClick={() => handleResendInvite(inv._id, inv.name)}
                                  >
                                    <RefreshCw size={13} />
                                    <span>Resend</span>
                                  </button>
                                  
                                  <button
                                    className="btn btn-danger btn-sm"
                                    title="Cancel Verification Link"
                                    onClick={() => handleCancelInvite(inv._id, inv.email)}
                                  >
                                    <X size={13} />
                                    <span>Cancel</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--gray-500)' }}>
                        No pending invitations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Invite User Modal */}
      {isInviteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content users-invite-modal-content">
            <div className="modal-header">
              <h3>Invite a New User</h3>
              <button className="modal-close" onClick={() => setIsInviteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleInviteSubmit}>
              <div className="modal-body">
                {errorMess && (
                  <div className="alert alert-danger">
                    <span>{errorMess}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Full User Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="E.g., John Doe"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Receives invitation)</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="E.g., external.staff@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Default Template Role</label>
                  <select
                    className="form-control"
                    value={inviteRoleId}
                    onChange={(e) => setInviteRoleId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Access Template --</option>
                    {roles.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.name} - {r.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Overrides Selection matrices checkboxes */}
                <div className="users-override-trigger-row">
                  <div className="flex align-center" style={{ marginBottom: '12px' }}>
                    <input
                      type="checkbox"
                      id="optOverrides"
                      className="users-override-checkbox"
                      checked={customOverrideActive}
                      onChange={(e) => setCustomOverrideActive(e.target.checked)}
                    />
                    <label htmlFor="optOverrides" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                      Customize permissions for this specific user
                    </label>
                  </div>

                  {customOverrideActive && (
                    <div className="users-override-box-bg">
                      <p className="users-override-intro-text">
                        Select which actions this user can perform on products:
                      </p>

                      <div className="permissions-grid">
                        <div className={`permission-toggle-box ${overrideRead ? 'active' : ''}`} onClick={() => setOverrideRead(!overrideRead)}>
                          <span>View Products</span>
                        </div>
                        <div className={`permission-toggle-box ${overrideCreate ? 'active' : ''}`} onClick={() => setOverrideCreate(!overrideCreate)}>
                          <span>Add Products</span>
                        </div>
                        <div className={`permission-toggle-box ${overrideUpdate ? 'active' : ''}`} onClick={() => setOverrideUpdate(!overrideUpdate)}>
                          <span>Edit Products</span>
                        </div>
                        <div className={`permission-toggle-box ${overrideDelete ? 'active' : ''}`} onClick={() => setOverrideDelete(!overrideDelete)}>
                          <span>Delete Products</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsInviteModalOpen(false)} disabled={submittingData}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingData}>
                  {submittingData ? 'Sending Email...' : 'Send Invitation Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Details & Overrides Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content users-invite-modal-content">
            <div className="modal-header">
              <h3>Edit User Access &amp; Permissions</h3>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {errorMess && (
                  <div className="alert alert-danger">
                    <span>{errorMess}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Role Type</label>
                  <select
                    className="form-control"
                    value={editingRoleId}
                    onChange={(e) => setEditingRoleId(e.target.value)}
                    required
                  >
                    {roles.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Profile Status</label>
                  <select
                    className="form-control"
                    value={editingStatus}
                    onChange={(e) => setEditingStatus(e.target.value)}
                    disabled={editingUserId === loggedInAdmin?._id} // Admin cannot disable self
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>

                {/* Overrides Selection matrices checkboxes */}
                <div className="users-override-trigger-row">
                  <div className="flex align-center" style={{ marginBottom: '12px' }}>
                    <input
                      type="checkbox"
                      id="editOverrides"
                      className="users-override-checkbox"
                      checked={editingOverridesActive}
                      onChange={(e) => setEditingOverridesActive(e.target.checked)}
                    />
                    <label htmlFor="editOverrides" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                      Customize permissions for this specific user
                    </label>
                  </div>

                  {editingOverridesActive && (
                    <div className="users-override-box-bg">
                      <p className="users-override-intro-text">
                        Select which actions this user can perform on products:
                      </p>

                      <div className="permissions-grid">
                        <div className={`permission-toggle-box ${editOverrideRead ? 'active' : ''}`} onClick={() => setEditOverrideRead(!editOverrideRead)}>
                          <span>View Products</span>
                        </div>
                        <div className={`permission-toggle-box ${editOverrideCreate ? 'active' : ''}`} onClick={() => setEditOverrideCreate(!editOverrideCreate)}>
                          <span>Add Products</span>
                        </div>
                        <div className={`permission-toggle-box ${editOverrideUpdate ? 'active' : ''}`} onClick={() => setEditOverrideUpdate(!editOverrideUpdate)}>
                          <span>Edit Products</span>
                        </div>
                        <div className={`permission-toggle-box ${editOverrideDelete ? 'active' : ''}`} onClick={() => setEditOverrideDelete(!editOverrideDelete)}>
                          <span>Delete Products</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)} disabled={submittingData}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingData}>
                  {submittingData ? 'Updating Profile...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
