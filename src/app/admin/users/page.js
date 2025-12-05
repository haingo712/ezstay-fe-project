'use client';

import { useState, useEffect } from 'react';
import userManagementService from '@/services/userManagementService';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'react-toastify';

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setMounted(true);
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userManagementService.getAllAccounts();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await userManagementService.updateAccountStatus(userId, !currentStatus);
      await loadUsers();
    } catch (error) {
      toast.error(t('adminUsers.toast.updateStatusFailed') || 'Failed to update status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userManagementService.deleteAccount(userId);
      toast.success(t('adminUsers.toast.deleteSuccess') || 'User deleted successfully');
      await loadUsers();
    } catch (error) {
      toast.error(t('adminUsers.toast.deleteFailed') || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    if (activeTab === 'users' && user.roleId !== 1) return false;
    if (activeTab === 'owners' && user.roleId !== 2) return false;
    if (activeTab === 'staff' && user.roleId !== 3) return false;
    if (activeTab === 'active' && !user.isActive) return false;
    if (activeTab === 'inactive' && user.isActive) return false;
    return true;
  });

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('adminUsers.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('adminUsers.subtitle') || 'Admin: Full control over all user accounts'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('adminUsers.stats.totalUsers') || 'Total Users'}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.filter(u => u.roleId === 1).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('adminUsers.stats.owners') || 'Owners'}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.filter(u => u.roleId === 2).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('adminUsers.stats.staff') || 'Staff'}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.filter(u => u.roleId === 3).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('adminUsers.stats.active') || 'Active'}</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {users.filter(u => u.isActive).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('adminUsers.stats.inactive') || 'Inactive'}</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {users.filter(u => !u.isActive).length}
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        {['all', 'users', 'owners', 'staff', 'active', 'inactive'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-red-600 text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            {t('common.loading') || 'Loading users...'}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            {t('adminUsers.noUsersFound') || 'No users found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {t('adminUsers.table.user') || 'User'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {t('adminUsers.table.email') || 'Email'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {t('adminUsers.table.phone') || 'Phone'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {t('adminUsers.table.role') || 'Role'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {t('adminUsers.table.status') || 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {t('adminUsers.table.actions') || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-bold">
                          {(user.fullName || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.fullName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        userManagementService.getRoleBadgeColor(user.roleId)
                      }`}>
                        {userManagementService.getRoleName(user.roleId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleStatusToggle(user.id, user.isActive)}
                        className={`${
                          user.isActive
                            ? 'text-orange-600 hover:text-orange-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      {user.roleId !== 4 && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('adminUsers.modal.userDetails') || 'User Details'}
                </h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('profile.fullName') || 'Full Name'}
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedUser.fullName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('auth.email') || 'Email'}
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('profile.phone') || 'Phone'}
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedUser.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('adminUsers.table.role') || 'Role'}
                    </label>
                    <p className="mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        userManagementService.getRoleBadgeColor(selectedUser.roleId)
                      }`}>
                        {userManagementService.getRoleName(selectedUser.roleId)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => {
                      handleStatusToggle(selectedUser.id, selectedUser.isActive);
                      setSelectedUser(null);
                    }}
                    className={`px-4 py-2 rounded-lg text-white ${
                      selectedUser.isActive
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {selectedUser.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  {selectedUser.roleId !== 4 && (
                    <button
                      onClick={() => {
                        handleDeleteUser(selectedUser.id);
                        setSelectedUser(null);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete User
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
