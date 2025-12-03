'use client';

import { useState, useEffect } from 'react';
import userManagementService from '@/services/userManagementService';
import AuthService from '@/services/authService';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'react-toastify';

export default function UserManagementPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState([]);
  const [ownerRequests, setOwnerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newAccount, setNewAccount] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    roleId: 1
  });
  const [editAccount, setEditAccount] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    roleId: 1
  });

  useEffect(() => {
    setMounted(true);
    loadUsers();
    loadOwnerRequests();
  }, []);

  const loadOwnerRequests = async () => {
    try {
      const data = await userManagementService.getOwnerRequests();
      setOwnerRequests(data || []);
    } catch (error) {
      console.error('Error loading owner requests:', error);
      setOwnerRequests([]);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userManagementService.getAllAccounts();
      console.log('📊 User data from API:', data); // Debug: xem structure của data

      // Transform API response to match frontend format
      const transformedData = Array.isArray(data) ? data.map(user => ({
        ...user,
        roleId: user.role, // Map role enum to roleId
        isActive: !user.isBanned, // Map isBanned to isActive (inverse)
        createdAt: user.createAt, // Map createAt to createdAt
      })) : [];

      setUsers(transformedData);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await userManagementService.approveOwnerRequest(requestId);
      toast.success(t('staffUsers.toast.approveSuccess') || 'Request approved successfully');
      loadOwnerRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(t('staffUsers.toast.approveFailed') || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedUser) return;
    try {
      await userManagementService.rejectOwnerRequest(selectedUser.id, rejectionReason);
      toast.success(t('staffUsers.toast.rejectSuccess') || 'Request rejected successfully');
      setShowRejectionModal(false);
      setRejectionReason('');
      loadOwnerRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(t('staffUsers.toast.rejectFailed') || 'Failed to reject request');
    }
  };

  const openRejectionModal = (request) => {
    setSelectedUser(request);
    setShowRejectionModal(true);
  };

  const handleEditAccount = (user) => {
    setSelectedUser(user);
    setEditAccount({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      roleId: user.roleId
    });
    setShowEditModal(true);
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await userManagementService.updateAccountStatus(userId, !currentStatus);
      toast.success(t('staffUsers.toast.statusSuccess') || 'Account status updated successfully!');
      await loadUsers();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('staffUsers.toast.statusFailed') || 'Failed to update account status');
    }
  };

  const filteredUsers = users.filter(user => {
    if (user.roleId === 3 || user.roleId === 4) return false;
    if (activeTab === 'users' && user.roleId !== 1) return false;
    if (activeTab === 'owners' && user.roleId !== 2) return false;
    if (activeTab === 'active' && !user.isActive) return false;
    if (activeTab === 'inactive' && user.isActive) return false;
    return true;
  });

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: JSON.stringify({
          FullName: newAccount.fullName,
          Email: newAccount.email,
          Phone: newAccount.phone,
          Password: newAccount.password,
          RoleId: newAccount.roleId
        })
      });

      if (response.ok) {
        toast.success(t('staffUsers.toast.createSuccess') || 'Account created successfully!');
        setShowCreateModal(false);
        setNewAccount({ fullName: '', email: '', phone: '', password: '', roleId: 1 });
        await loadUsers();
      } else {
        const error = await response.json();
        toast.error(error.message || t('staffUsers.toast.createFailed') || 'Failed to create account');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('staffUsers.toast.createFailed') || 'Failed to create account');
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    try {
      console.log('🔍 Updating user ID:', selectedUser.id);
      console.log('🔍 Update data:', editAccount);

      await userManagementService.updateAccount(selectedUser.id, editAccount);
      toast.success(t('staffUsers.toast.updateSuccess') || 'Account updated successfully!');
      setShowEditModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error(`${t('staffUsers.toast.updateFailed') || 'Failed to update account'}: ${error.message || 'Unknown error'}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Date format error:', error);
      return 'N/A';
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            👥 {t('staffUsers.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('staffUsers.subtitle') || 'Manage user and property owner accounts'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('staffUsers.createAccount')}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm">{t('staffUsers.stats.totalUsers') || 'Total Users'}</p>
          <p className="text-3xl font-bold mt-2">{users.filter(u => u.roleId === 1).length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm">{t('staffUsers.stats.totalOwners') || 'Total Owners'}</p>
          <p className="text-3xl font-bold mt-2">{users.filter(u => u.roleId === 2).length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-emerald-100 text-sm">{t('staffUsers.stats.active') || 'Active'}</p>
          <p className="text-3xl font-bold mt-2">{users.filter(u => u.isActive && (u.roleId === 1 || u.roleId === 2)).length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-red-100 text-sm">{t('staffUsers.stats.inactive') || 'Inactive'}</p>
          <p className="text-3xl font-bold mt-2">{users.filter(u => !u.isActive && (u.roleId === 1 || u.roleId === 2)).length}</p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button onClick={() => setActiveTab('all')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'all' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('staffUsers.tabs.all')}</button>
          <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('staffUsers.tabs.users')}</button>
          <button onClick={() => setActiveTab('owners')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'owners' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('staffUsers.tabs.owners')}</button>
          <button onClick={() => setActiveTab('owner-requests')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'owner-requests' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            {t('staffUsers.tabs.ownerRequests')}
            {ownerRequests.length > 0 && (
              <span className="ml-2 inline-block py-0.5 px-2.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{ownerRequests.length}</span>
            )}
          </button>
          <button onClick={() => setActiveTab('active')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'active' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('staffUsers.tabs.active')}</button>
          <button onClick={() => setActiveTab('inactive')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'inactive' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('staffUsers.tabs.inactive')}</button>
        </nav>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {activeTab === 'owner-requests' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('staffUsers.table.accountId') || 'ACCOUNT ID'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('staffUsers.table.reason') || 'REASON'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">SUBMITTED AT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">STATUS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {ownerRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No owner requests found
                    </td>
                  </tr>
                ) : (
                  ownerRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{request.accountId || request.AccountId || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{request.reason || request.Reason || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(request.submittedAt || request.SubmittedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${(request.status || request.Status) === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : (request.status || request.Status) === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {request.status || request.Status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectionModal(request)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('staffUsers.table.fullName') || 'Full Name'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('staffUsers.table.email') || 'Email'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('staffUsers.table.phone') || 'Phone'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('staffUsers.table.role') || 'Role'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('staffUsers.table.status') || 'Status'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('staffUsers.table.createdAt') || 'Created At'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('staffUsers.table.actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {t('staffUsers.emptyState.noUsers') || 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.phone || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.roleId === 2 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {user.roleId === 2 ? (t('staffUsers.roles.owner') || 'Owner') : (t('staffUsers.roles.user') || 'User')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {user.isActive ? (t('staffUsers.status.active') || 'Active') : (t('staffUsers.status.inactive') || 'Inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowViewModal(true);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          {t('staffUsers.actions.view') || 'View'}
                        </button>
                        <button
                          onClick={() => handleEditAccount(user)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                        >
                          {t('staffUsers.actions.edit') || 'Edit'}
                        </button>
                        <button
                          onClick={() => handleStatusToggle(user.id, user.isActive)}
                          className={`px-3 py-1 rounded-md text-white ${
                            user.isActive 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {user.isActive ? (t('staffUsers.actions.deactivate') || 'Deactivate') : (t('staffUsers.actions.activate') || 'Activate')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Create New Account
              </h2>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Type *
                  </label>
                  <select
                    required
                    value={newAccount.roleId}
                    onChange={(e) => setNewAccount({ ...newAccount, roleId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={1}>User (Regular User)</option>
                    <option value={2}>Owner (Property Owner)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAccount.fullName}
                    onChange={(e) => setNewAccount({ ...newAccount, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newAccount.email}
                    onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newAccount.phone}
                    onChange={(e) => setNewAccount({ ...newAccount, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newAccount.password}
                    onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Minimum 6 characters"
                    minLength={6}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Edit Account
              </h2>
              <form onSubmit={handleUpdateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Type (Cannot be changed)
                  </label>
                  <select
                    disabled
                    value={editAccount.roleId}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-60"
                  >
                    <option value={1}>User (Regular User)</option>
                    <option value={2}>Owner (Property Owner)</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Role cannot be modified after creation
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editAccount.fullName}
                    onChange={(e) => setEditAccount({ ...editAccount, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editAccount.email}
                    onChange={(e) => setEditAccount({ ...editAccount, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editAccount.phone}
                    onChange={(e) => setEditAccount({ ...editAccount, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={editAccount.password}
                    onChange={(e) => setEditAccount({ ...editAccount, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Leave empty to keep current password"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave empty to keep current password
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Update Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Account Details
                  </h2>
                  <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${selectedUser.roleId === 1
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                    {selectedUser.roleId === 1 ? 'USER' : 'OWNER'}
                  </span>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedUser.fullName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account ID</label>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedUser.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${selectedUser.isActive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</label>
                  <p className="text-gray-900 dark:text-white mt-1">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditAccount(selectedUser);
                  }}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 rounded-lg font-medium"
                >
                  Edit Account
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleStatusToggle(selectedUser.id, selectedUser.isActive);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${selectedUser.isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                    }`}
                >
                  {selectedUser.isActive ? 'Ban Account' : 'Unban Account'}
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectionModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ❌ Reject Owner Request
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Please provide a reason for rejecting this request
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Rejection Reason Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                handleRejectRequest();
              }}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows="5"
                    placeholder="Enter the reason for rejecting this owner registration request..."
                  ></textarea>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    This reason will be sent to the user.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRejectionModal(false);
                      setRejectionReason('');
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!rejectionReason.trim()}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition shadow-lg"
                  >
                    Reject Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
