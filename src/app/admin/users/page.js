'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminUserManagementPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(''); // 'view', 'edit', 'ban', 'promote'

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
      totalSpent: 1250,
      lifetimeValue: 2500,
      riskScore: 15,
      trustScore: 92,
      lastActivity: '2024-01-22T14:30:00Z',
      ipAddress: '192.168.1.100',
      location: 'New York, USA',
      deviceInfo: 'Chrome 120.0 on Windows 10'
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
      totalSpent: 680,
      lifetimeValue: 1200,
      riskScore: 8,
      trustScore: 88,
      lastActivity: '2024-01-21T18:20:00Z',
      ipAddress: '192.168.1.101',
      location: 'Toronto, Canada',
      deviceInfo: 'Safari 17.0 on macOS 14'
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
      totalSpent: 0,
      lifetimeValue: 15000,
      riskScore: 5,
      trustScore: 96,
      lastActivity: '2024-01-22T12:45:00Z',
      ipAddress: '192.168.1.102',
      location: 'Los Angeles, USA',
      deviceInfo: 'Chrome 120.0 on macOS 14',
      properties: 3,
      totalRooms: 12,
      occupancyRate: 85,
      monthlyRevenue: 4200
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
      totalSpent: 0,
      lifetimeValue: 0,
      riskScore: 95,
      trustScore: 8,
      lastActivity: '2024-01-20T12:00:00Z',
      ipAddress: '192.168.1.200',
      location: 'Unknown',
      deviceInfo: 'Chrome 119.0 on Windows 10',
      suspendedAt: '2024-01-21T10:00:00Z',
      suspendedBy: 'System Admin',
      suspensionReason: 'Multiple spam posts and user reports',
      bannedUntil: '2024-02-21T10:00:00Z'
    },
    {
      id: 201,
      username: 'staff_manager',
      email: 'staff@ezstay.com',
      fullName: 'Staff Manager',
      phoneNumber: '+1 (555) 111-2222',
      roleId: 4,
      roleName: 'Staff',
      isStaff: true,
      isActive: true,
      createdAt: '2023-01-15T08:00:00Z',
      lastLogin: '2024-01-22T09:00:00Z',
      emailVerified: true,
      phoneVerified: true,
      profileComplete: 100,
      totalPosts: 0,
      totalBookings: 0,
      averageRating: 0,
      reportCount: 0,
      suspensionCount: 0,
      totalSpent: 0,
      lifetimeValue: 0,
      riskScore: 0,
      trustScore: 100,
      lastActivity: '2024-01-22T15:30:00Z',
      ipAddress: '10.0.0.50',
      location: 'Office - New York',
      deviceInfo: 'Chrome 120.0 on Windows 11',
      permissions: ['content_moderation', 'user_support', 'post_review'],
      ticketsResolved: 156,
      postsReviewed: 234
    }
  ]);

  const [filterOptions, setFilterOptions] = useState({
    role: 'all',
    status: 'all',
    verification: 'all',
    riskLevel: 'all',
    registrationDate: 'all'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [sortOrder, setSortOrder] = useState('desc');

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
      case 'Admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRiskColor = (riskScore) => {
    if (riskScore >= 80) return 'text-red-600 dark:text-red-400';
    if (riskScore >= 50) return 'text-yellow-600 dark:text-yellow-400';
    if (riskScore >= 20) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getTrustColor = (trustScore) => {
    if (trustScore >= 80) return 'text-green-600 dark:text-green-400';
    if (trustScore >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getActivityStatus = (lastActivity) => {
    const now = new Date();
    const lastActive = new Date(lastActivity);
    const diffHours = Math.floor((now - lastActive) / (1000 * 60 * 60));
    
    if (diffHours < 1) return { status: 'online', color: 'bg-green-500', text: 'Online' };
    if (diffHours < 24) return { status: 'recent', color: 'bg-yellow-500', text: 'Recent' };
    if (diffHours < 168) return { status: 'week', color: 'bg-orange-500', text: 'This week' };
    return { status: 'inactive', color: 'bg-gray-500', text: 'Inactive' };
  };

  const filteredUsers = users.filter(user => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!user.username.toLowerCase().includes(searchLower) &&
          !user.email.toLowerCase().includes(searchLower) &&
          !user.fullName.toLowerCase().includes(searchLower) &&
          !user.ipAddress.includes(searchTerm)) {
        return false;
      }
    }

    // Tab filter
    if (activeTab === 'active' && (!user.isActive || user.suspendedAt)) return false;
    if (activeTab === 'suspended' && !user.suspendedAt) return false;
    if (activeTab === 'owners' && user.roleName !== 'Owner') return false;
    if (activeTab === 'staff' && user.roleName !== 'Staff') return false;
    if (activeTab === 'high_risk' && user.riskScore < 50) return false;
    if (activeTab === 'new_users') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (new Date(user.createdAt) < weekAgo) return false;
    }

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
    if (filterOptions.riskLevel !== 'all') {
      if (filterOptions.riskLevel === 'high' && user.riskScore < 50) return false;
      if (filterOptions.riskLevel === 'medium' && (user.riskScore < 20 || user.riskScore >= 50)) return false;
      if (filterOptions.riskLevel === 'low' && user.riskScore >= 20) return false;
    }

    return true;
  }).sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'lastActivity' || sortBy === 'createdAt' || sortBy === 'lastLogin') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleOpenModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
    setShowUserModal(true);
  };

  const handleUserAction = (userId, action, data = {}) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'suspend':
            return {
              ...user,
              isActive: false,
              suspendedAt: new Date().toISOString(),
              suspendedBy: 'System Admin',
              suspensionReason: data.reason,
              bannedUntil: data.duration ? new Date(Date.now() + data.duration * 24 * 60 * 60 * 1000).toISOString() : null,
              suspensionCount: user.suspensionCount + 1
            };
          case 'unsuspend':
            return {
              ...user,
              isActive: true,
              suspendedAt: null,
              suspendedBy: null,
              suspensionReason: null,
              bannedUntil: null
            };
          case 'promote':
            return {
              ...user,
              roleId: data.roleId,
              roleName: data.roleName,
              isStaff: data.roleName === 'Staff' || data.roleName === 'Admin',
              permissions: data.permissions || []
            };
          case 'verify':
            return {
              ...user,
              emailVerified: true,
              phoneVerified: true,
              trustScore: Math.min(100, user.trustScore + 10)
            };
          case 'ban_permanent':
            return {
              ...user,
              isActive: false,
              suspendedAt: new Date().toISOString(),
              suspendedBy: 'System Admin',
              suspensionReason: data.reason,
              bannedUntil: 'permanent'
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

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) return;
    
    if (confirm(`Are you sure you want to ${action} ${selectedUsers.length} selected users?`)) {
      selectedUsers.forEach(userId => {
        handleUserAction(userId, action);
      });
      setSelectedUsers([]);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive && !u.suspendedAt).length;
  const suspendedUsers = users.filter(u => u.suspendedAt).length;
  const ownersCount = users.filter(u => u.roleName === 'Owner').length;
  const staffCount = users.filter(u => u.roleName === 'Staff').length;
  const highRiskUsers = users.filter(u => u.riskScore >= 50).length;
  const newUsers = users.filter(u => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(u.createdAt) > weekAgo;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive user administration and monitoring
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              {selectedUsers.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('suspend')}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors"
                  >
                    Suspend ({selectedUsers.length})
                  </button>
                  <button
                    onClick={() => handleBulkAction('verify')}
                    className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 transition-colors"
                  >
                    Verify ({selectedUsers.length})
                  </button>
                </div>
              )}
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
              { key: 'staff', label: 'Staff', count: staffCount },
              { key: 'high_risk', label: 'High Risk', count: highRiskUsers },
              { key: 'new_users', label: 'New Users', count: newUsers }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-red-500 text-red-600 dark:text-red-400'
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
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Users
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Search by name, email, username, or IP..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={filterOptions.role}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Roles</option>
                <option value="User">Users</option>
                <option value="Owner">Owners</option>
                <option value="Staff">Staff</option>
                <option value="Admin">Admins</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filterOptions.status}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Risk Level
              </label>
              <select
                value={filterOptions.riskLevel}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, riskLevel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk (&lt;20)</option>
                <option value="medium">Medium Risk (20-49)</option>
                <option value="high">High Risk (50+)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="lastActivity">Last Activity</option>
                <option value="createdAt">Registration Date</option>
                <option value="lastLogin">Last Login</option>
                <option value="riskScore">Risk Score</option>
                <option value="trustScore">Trust Score</option>
                <option value="lifetimeValue">Lifetime Value</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={handleSelectAll}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredUsers.length} of {totalUsers} users
              </span>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </button>
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
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </th>
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
                    Risk & Trust
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Value & Stats
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
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center relative">
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
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {user.ipAddress} • {user.location}
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
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {activityStatus.text}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="space-y-1">
                          <div>Joined: {formatDate(user.createdAt)}</div>
                          <div>Last Login: {formatDate(user.lastLogin)}</div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Verified:</span>
                            <span className={`text-xs ${user.emailVerified && user.phoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                              {user.emailVerified && user.phoneVerified ? '✓' : '✗'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="space-y-1">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Risk: </span>
                            <span className={`font-medium ${getRiskColor(user.riskScore)}`}>
                              {user.riskScore}/100
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Trust: </span>
                            <span className={`font-medium ${getTrustColor(user.trustScore)}`}>
                              {user.trustScore}/100
                            </span>
                          </div>
                          {user.reportCount > 0 && (
                            <div className="text-red-600 dark:text-red-400 text-xs">
                              {user.reportCount} reports
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="space-y-1">
                          <div>LTV: {formatCurrency(user.lifetimeValue)}</div>
                          <div>Spent: {formatCurrency(user.totalSpent)}</div>
                          <div>Posts: {user.totalPosts}</div>
                          <div>Bookings: {user.totalBookings}</div>
                          {user.roleName === 'Owner' && user.properties && (
                            <div className="text-purple-600 dark:text-purple-400">
                              {user.properties} properties
                            </div>
                          )}
                          {user.roleName === 'Staff' && user.ticketsResolved && (
                            <div className="text-orange-600 dark:text-orange-400">
                              {user.ticketsResolved} tickets
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenModal(user, 'view')}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            >
                              Suspend
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal(user, 'promote')}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Promote
                          </button>
                          {user.riskScore > 80 && (
                            <button
                              onClick={() => handleOpenModal(user, 'ban')}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Ban
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
                setFilterOptions({ role: 'all', status: 'all', verification: 'all', riskLevel: 'all', registrationDate: 'all' });
                setActiveTab('all');
              }}
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
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
                  {modalType === 'promote' && 'Promote User'}
                  {modalType === 'ban' && 'Ban User'}
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
                        <p><span className="font-medium">Last Activity:</span> {formatDate(selectedUser.lastActivity)}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Technical Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">IP Address:</span> {selectedUser.ipAddress}</p>
                        <p><span className="font-medium">Location:</span> {selectedUser.location}</p>
                        <p><span className="font-medium">Device:</span> {selectedUser.deviceInfo}</p>
                        <p><span className="font-medium">Email Verified:</span> {selectedUser.emailVerified ? '✓ Yes' : '✗ No'}</p>
                        <p><span className="font-medium">Phone Verified:</span> {selectedUser.phoneVerified ? '✓ Yes' : '✗ No'}</p>
                        <p><span className="font-medium">Profile Complete:</span> {selectedUser.profileComplete}%</p>
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
                        {selectedUser.averageRating > 0 && (
                          <p><span className="font-medium">Rating:</span> {selectedUser.averageRating}⭐</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Financial</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Total Spent:</span> {formatCurrency(selectedUser.totalSpent)}</p>
                        <p><span className="font-medium">Lifetime Value:</span> {formatCurrency(selectedUser.lifetimeValue)}</p>
                        {selectedUser.roleName === 'Owner' && selectedUser.monthlyRevenue && (
                          <p><span className="font-medium">Monthly Revenue:</span> {formatCurrency(selectedUser.monthlyRevenue)}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Risk Assessment</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Risk Score:</span> 
                          <span className={`ml-1 ${getRiskColor(selectedUser.riskScore)}`}>
                            {selectedUser.riskScore}/100
                          </span>
                        </p>
                        <p>
                          <span className="font-medium">Trust Score:</span> 
                          <span className={`ml-1 ${getTrustColor(selectedUser.trustScore)}`}>
                            {selectedUser.trustScore}/100
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedUser.suspendedAt && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">Suspension Details</h4>
                      <div className="text-sm text-red-800 dark:text-red-300 space-y-1">
                        <p><span className="font-medium">Suspended At:</span> {formatDate(selectedUser.suspendedAt)}</p>
                        <p><span className="font-medium">Suspended By:</span> {selectedUser.suspendedBy}</p>
                        <p><span className="font-medium">Reason:</span> {selectedUser.suspensionReason}</p>
                        {selectedUser.bannedUntil && selectedUser.bannedUntil !== 'permanent' && (
                          <p><span className="font-medium">Banned Until:</span> {formatDate(selectedUser.bannedUntil)}</p>
                        )}
                        {selectedUser.bannedUntil === 'permanent' && (
                          <p><span className="font-medium">Ban Type:</span> Permanent</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {modalType === 'suspend' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  handleUserAction(selectedUser.id, 'suspend', {
                    reason: formData.get('reason'),
                    duration: formData.get('duration') ? parseInt(formData.get('duration')) : null
                  });
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Explain why this user is being suspended..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Suspension Duration (days)
                    </label>
                    <select
                      name="duration"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Indefinite</option>
                      <option value="1">1 Day</option>
                      <option value="3">3 Days</option>
                      <option value="7">1 Week</option>
                      <option value="30">1 Month</option>
                      <option value="90">3 Months</option>
                    </select>
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

              {modalType === 'promote' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const newRole = formData.get('role');
                  const permissions = formData.getAll('permissions');
                  
                  handleUserAction(selectedUser.id, 'promote', {
                    roleId: newRole === 'Staff' ? 4 : newRole === 'Admin' ? 5 : 3,
                    roleName: newRole,
                    permissions: permissions
                  });
                }} className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      You are about to change the role of <strong>{selectedUser.fullName}</strong> 
                      from <strong>{selectedUser.roleName}</strong> to a new role.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Role *
                    </label>
                    <select
                      name="role"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Role</option>
                      <option value="User">User</option>
                      <option value="Owner">Owner</option>
                      <option value="Staff">Staff</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Permissions (for Staff/Admin roles)
                    </label>
                    <div className="space-y-2">
                      {['content_moderation', 'user_support', 'post_review', 'user_management', 'system_admin'].map((permission) => (
                        <label key={permission} className="flex items-center">
                          <input
                            type="checkbox"
                            name="permissions"
                            value={permission}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {permission.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
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
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Promote User
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