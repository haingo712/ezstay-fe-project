
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UserManagementPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'edit', 'suspend', 'verify'

  const [users, setUsers] = useState([
    {
      id: 101,
      username: 'john_doe',
      email: 'john.doe@example.com',
      fullName: 'John Doe',
      phoneNumber: '+1 (555) 123-4567',
      roleId: 2,
      roleName: 'User',
      isStaff: false,
      isActive: true,
      createdAt: '2023-12-01T10:30:00Z',
      lastLogin: '2024-01-22T08:15:00Z',
      emailVerified: true,
      phoneVerified: true,
      profileComplete: 95,
      totalPosts: 3,
      totalBookings: 5,
      averageRating: 4.8,
      reportCount: 0,
      suspensionCount: 0,
      verificationStatus: {
        identity: true,
        email: true,
        phone: true,
        address: false
      },
      activityScore: 85,
      trustScore: 92,
      lastActivity: '2024-01-22T14:30:00Z'
    },
    {
      id: 102,
      username: 'emily_chen',
      email: 'emily.chen@example.com',
      fullName: 'Emily Chen',
      phoneNumber: '+1 (555) 234-5678',
      roleId: 2,
      roleName: 'User',
      isStaff: false,
      isActive: true,
      createdAt: '2023-09-15T14:20:00Z',
      lastLogin: '2024-01-21T16:45:00Z',
      emailVerified: true,
      phoneVerified: true,
      profileComplete: 88,
      totalPosts: 1,
      totalBookings: 2,
      averageRating: 4.6,
      reportCount: 0,
      suspensionCount: 0,
      verificationStatus: {
        identity: true,
        email: true,
        phone: true,
        address: true
      },
      activityScore: 72,
      trustScore: 88,
      lastActivity: '2024-01-21T18:20:00Z'
    },
    {
      id: 103,
      username: 'michael_rodriguez',
      email: 'michael@example.com',
      fullName: 'Michael Rodriguez',
      phoneNumber: '+1 (555) 345-6789',
      roleId: 3,
      roleName: 'Owner',
      isStaff: false,
      isActive: true,
      createdAt: '2023-11-01T09:15:00Z',
      lastLogin: '2024-01-22T07:30:00Z',
      emailVerified: true,
      phoneVerified: true,
      profileComplete: 100,
      totalPosts: 8,
      totalBookings: 0,
      averageRating: 4.9,
      reportCount: 0,
      suspensionCount: 0,
      verificationStatus: {
        identity: true,
        email: true,
        phone: true,
        address: true,
        business: true
      },
      activityScore: 95,
      trustScore: 96,
      lastActivity: '2024-01-22T12:45:00Z',
      properties: 3,
      totalRooms: 12,
      occupancyRate: 85
    },
    {
      id: 104,
      username: 'suspicious_user',
      email: 'suspicious@example.com',
      fullName: 'Suspicious User',
      phoneNumber: '+1 (555) 999-9999',
      roleId: 2,
      roleName: 'User',
      isStaff: false,
      isActive: false,
      createdAt: '2024-01-20T11:00:00Z',
      lastLogin: '2024-01-20T11:30:00Z',
      emailVerified: false,
      phoneVerified: false,
      profileComplete: 25,
      totalPosts: 5,
      totalBookings: 0,
      averageRating: 2.1,
      reportCount: 8,
      suspensionCount: 2,
      verificationStatus: {
        identity: false,
        email: false,
        phone: false,
        address: false
      },
      activityScore: 15,
      trustScore: 8,
      lastActivity: '2024-01-20T12:00:00Z',
      suspendedAt: '2024-01-21T10:00:00Z',
      suspendedBy: 'Staff Manager',
      suspensionReason: 'Multiple spam posts and user reports'
    },
    {
      id: 105,
      username: 'sarah_wilson',
      email: 'sarah.wilson@example.com',
      fullName: 'Sarah Wilson',
      phoneNumber: '+1 (555) 456-7890',
      roleId: 3,
      roleName: 'Owner',
      isStaff: false,
      isActive: true,
      createdAt: '2023-06-01T12:00:00Z',
      lastLogin: '2024-01-19T15:20:00Z',
      emailVerified: true,
      phoneVerified: true,
      profileComplete: 92,
      totalPosts: 4,
      totalBookings: 0,
      averageRating: 4.4,
      reportCount: 1,
      suspensionCount: 0,
      verificationStatus: {
        identity: true,
        email: true,
        phone: true,
        address: true,
        business: false
      },
      activityScore: 68,
      trustScore: 82,
      lastActivity: '2024-01-19T17:45:00Z',
      properties: 1,
      totalRooms: 3,
      occupancyRate: 67
    },
    {
      id: 106,
      username: 'david_kim',
      email: 'david.kim@example.com',
      fullName: 'David Kim',
      phoneNumber: '+1 (555) 567-8901',
      roleId: 2,
      roleName: 'User',
      isStaff: false,
      isActive: true,
      createdAt: '2024-01-10T16:30:00Z',
      lastLogin: '2024-01-22T09:45:00Z',
      emailVerified: true,
      phoneVerified: false,
      profileComplete: 65,
      totalPosts: 0,
      totalBookings: 1,
      averageRating: 0,
      reportCount: 0,
      suspensionCount: 0,
      verificationStatus: {
        identity: false,
        email: true,
        phone: false,
        address: false
      },
      activityScore: 45,
      trustScore: 65,
      lastActivity: '2024-01-22T11:20:00Z'
    }
  ]);

  const [filterOptions, setFilterOptions] = useState({
    role: 'all',
    status: 'all',
    verification: 'all',
    activity: 'all'
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (isActive, suspendedAt) => {
    if (suspendedAt) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (isActive) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'Owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'User':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Staff':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getActivityStatus = (lastActivity) => {
    const now = new Date();
    const lastActive = new Date(lastActivity);
    const diffHours = Math.floor((now - lastActive) / (1000 * 60 * 60));
    
    if (diffHours < 24) return { status: 'online', color: 'bg-green-500' };
    if (diffHours < 72) return { status: 'recent', color: 'bg-yellow-500' };
    return { status: 'inactive', color: 'bg-gray-500' };
  };

  const filteredUsers = users.filter(user => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!user.username.toLowerCase().includes(searchLower) &&
          !user.email.toLowerCase().includes(searchLower) &&
          !user.fullName.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Tab filter
    if (activeTab === 'active' && (!user.isActive || user.suspendedAt)) return false;
    if (activeTab === 'suspended' && !user.suspendedAt) return false;
    if (activeTab === 'owners' && user.roleName !== 'Owner') return false;
    if (activeTab === 'users' && user.roleName !== 'User') return false;
    if (activeTab === 'flagged' && user.reportCount === 0) return false;

    // Additional filters
    if (filterOptions.role !== 'all' && user.roleName !== filterOptions.role) return false;
    if (filterOptions.status !== 'all') {
      if (filterOptions.status === 'active' && (!user.isActive || user.suspendedAt)) return false;
      if (filterOptions.status === 'suspended' && !user.suspendedAt) return false;
      if (filterOptions.status === 'inactive' && user.isActive) return false;
    }
    if (filterOptions.verification !== 'all') {
      if (filterOptions.verification === 'verified' && (!user.emailVerified || !user.phoneVerified)) return false;
      if (filterOptions.verification === 'unverified' && (user.emailVerified && user.phoneVerified)) return false;
    }

    return true;
  });

  const handleOpenModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
    setShowUserModal(true);
  };

  const handleUserAction = (userId, action, reason = '') => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'suspend':
            return {
              ...user,
              isActive: false,
              suspendedAt: new Date().toISOString(),
              suspendedBy: 'Staff Manager',
              suspensionReason: reason,
              suspensionCount: user.suspensionCount + 1
            };
          case 'unsuspend':
            return {
              ...user,
              isActive: true,
              suspendedAt: null,
              suspendedBy: null,
              suspensionReason: null
            };
          case 'verify':
            return {
              ...user,
              verificationStatus: {
                ...user.verificationStatus,
                identity: true
              },
              trustScore: Math.min(100, user.trustScore + 10)
            };
          case 'deactivate':
            return {
              ...user,
              isActive: false
            };
          case 'activate':
            return {
              ...user,
              isActive: true
            };
          default:
            return user;
        }
      }
      return user;
    });

    setUsers(updatedUsers);
    setShowUserModal(false);
    alert(`User ${action}ed successfully!`);
  };

  const handleBulkAction = (action, selectedUserIds) => {
    // This would handle bulk actions on multiple users
    alert(`Bulk ${action} action would be performed on ${selectedUserIds.length} users`);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive && !u.suspendedAt).length;
  const suspendedUsers = users.filter(u => u.suspendedAt).length;
  const ownersCount = users.filter(u => u.roleName === 'Owner').length;
  const usersCount = users.filter(u => u.roleName === 'User').length;
  const flaggedUsers = users.filter(u => u.reportCount > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage user accounts and permissions
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Users', count: totalUsers },
              { key: 'active', label: 'Active', count: activeUsers },
              { key: 'suspended', label: 'Suspended', count: suspendedUsers },
              { key: 'owners', label: 'Owners', count: ownersCount },
              { key: 'users', label: 'Users', count: usersCount },
              { key: 'flagged', label: 'Flagged', count: flaggedUsers }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Users
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Search by name, email, or username..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={filterOptions.role}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Roles</option>
                <option value="User">Users</option>
                <option value="Owner">Owners</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filterOptions.status}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verification
              </label>
              <select
                value={filterOptions.verification}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, verification: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Scores
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => {
                  const activityStatus = getActivityStatus(user.lastActivity);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center relative">
                              <span className="text-white font-medium text-sm">
                                {user.fullName.split(' ').map(n => n[0]).join('')}
                              </span>
                              <div className={`absolute -bottom-0 -right-0 w-3 h-3 ${activityStatus.color} rounded-full border-2 border-white dark:border-gray-800`}></div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.fullName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              @{user.username}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.roleName)}`}>
                            {user.roleName}
                          </span>
                          <br />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive, user.suspendedAt)}`}>
                            {user.suspendedAt ? 'Suspended' : user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="space-y-1">
                          <div>Last Login: {formatDate(user.lastLogin)}</div>
                          <div>Joined: {formatDate(user.createdAt)}</div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Profile:</span>
                            <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${user.profileComplete}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{user.profileComplete}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="space-y-1">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Trust: </span>
                            <span className={`font-medium ${getScoreColor(user.trustScore)}`}>
                              {user.trustScore}/100
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Activity: </span>
                            <span className={`font-medium ${getScoreColor(user.activityScore)}`}>
                              {user.activityScore}/100
                            </span>
                          </div>
                          {user.averageRating > 0 && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Rating: </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {user.averageRating}⭐
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="space-y-1">
                          <div>Posts: {user.totalPosts}</div>
                          <div>Bookings: {user.totalBookings}</div>
                          {user.reportCount > 0 && (
                            <div className="text-red-600 dark:text-red-400">
                              Reports: {user.reportCount}
                            </div>
                          )}
                          {user.roleName === 'Owner' && user.properties && (
                            <div>Properties: {user.properties}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenModal(user, 'view')}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                          >
                            View
                          </button>
                          {user.suspendedAt ? (
                            <button
                              onClick={() => handleUserAction(user.id, 'unsuspend')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              Unsuspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenModal(user, 'suspend')}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Suspend
                            </button>
                          )}
                          {!user.verificationStatus.identity && (
                            <button
                              onClick={() => handleUserAction(user.id, 'verify')}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No users found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              No users match your current search and filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterOptions({ role: 'all', status: 'all', verification: 'all', activity: 'all' });
                setActiveTab('all');
              }}
              className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' && 'User Details'}
                  {modalType === 'suspend' && 'Suspend User'}
                  {modalType === 'edit' && 'Edit User'}
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {modalType === 'view' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Personal Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Full Name:</span> {selectedUser.fullName}</p>
                        <p><span className="font-medium">Username:</span> @{selectedUser.username}</p>
                        <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                        <p><span className="font-medium">Phone:</span> {selectedUser.phoneNumber}</p>
                        <p><span className="font-medium">Role:</span> {selectedUser.roleName}</p>
                        <p><span className="font-medium">Joined:</span> {formatDate(selectedUser.createdAt)}</p>
                        <p><span className="font-medium">Last Login:</span> {formatDate(selectedUser.lastLogin)}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Verification Status</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(selectedUser.verificationStatus).map(([key, verified]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              verified 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {verified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Activity Stats</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Posts:</span> {selectedUser.totalPosts}</p>
                        <p><span className="font-medium">Bookings:</span> {selectedUser.totalBookings}</p>
                        <p><span className="font-medium">Reports:</span> {selectedUser.reportCount}</p>
                        <p><span className="font-medium">Suspensions:</span> {selectedUser.suspensionCount}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Scores</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Trust Score:</span> 
                          <span className={`ml-1 ${getScoreColor(selectedUser.trustScore)}`}>
                            {selectedUser.trustScore}/100
                          </span>
                        </p>
                        <p>
                          <span className="font-medium">Activity Score:</span> 
                          <span className={`ml-1 ${getScoreColor(selectedUser.activityScore)}`}>
                            {selectedUser.activityScore}/100
                          </span>
                        </p>
                        <p><span className="font-medium">Profile Complete:</span> {selectedUser.profileComplete}%</p>
                        {selectedUser.averageRating > 0 && (
                          <p><span className="font-medium">Average Rating:</span> {selectedUser.averageRating}⭐</p>
                        )}
                      </div>
                    </div>
                    {selectedUser.roleName === 'Owner' && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Owner Stats</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Properties:</span> {selectedUser.properties || 0}</p>
                          <p><span className="font-medium">Total Rooms:</span> {selectedUser.totalRooms || 0}</p>
                          <p><span className="font-medium">Occupancy Rate:</span> {selectedUser.occupancyRate || 0}%</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedUser.suspendedAt && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">Suspension Details</h4>
                      <div className="text-sm text-red-800 dark:text-red-300 space-y-1">
                        <p><span className="font-medium">Suspended At:</span> {formatDate(selectedUser.suspendedAt)}</p>
                        <p><span className="font-medium">Suspended By:</span> {selectedUser.suspendedBy}</p>
                        <p><span className="font-medium">Reason:</span> {selectedUser.suspensionReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {modalType === 'suspend' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const reason = e.target.reason.value;
                  handleUserAction(selectedUser.id, 'suspend', reason);
                }} className="space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      You are about to suspend <strong>{selectedUser.fullName}</strong>. 
                      This will prevent them from accessing their account.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Suspension Reason *
                    </label>
                    <textarea
                      name="reason"
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Explain why this user is being suspended..."
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowUserModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Suspend User
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}