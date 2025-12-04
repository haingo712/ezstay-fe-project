'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import userManagementService from '@/services/userManagementService';
import rentalPostService from '@/services/rentalPostService';
import { apiFetch } from '@/utils/api';
import { useTranslation } from '@/hooks/useTranslation';

// Stat Card Component with gradient
const StatCard = ({ title, value, subtitle, icon, gradient, trend, trendValue }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 ${gradient} shadow-lg`}>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-2">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <p className="text-4xl font-bold text-white mt-4">{value}</p>
      <p className="text-sm font-medium text-white/80 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-white/60 mt-1">{subtitle}</p>}
      {trend && (
        <div className={`flex items-center mt-3 text-sm ${trend === 'up' ? 'text-green-200' : trend === 'down' ? 'text-red-200' : 'text-white/70'}`}>
          {trend === 'up' && (
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
  </div>
);

// Quick Action Card
const QuickActionCard = ({ href, icon, title, description, emoji, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 border-purple-200 dark:border-purple-800',
    green: 'bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 border-green-200 dark:border-green-800',
    orange: 'bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 border-orange-200 dark:border-orange-800',
    red: 'bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 border-red-200 dark:border-red-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800',
  };

  return (
    <Link
      href={href}
      className={`relative flex items-center p-6 rounded-2xl border transition-all group ${colorClasses[color]}`}
    >
      <div className="text-4xl mr-4 group-hover:scale-110 transition-transform">{emoji}</div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
};

// User Distribution Chart (Simple donut)
const UserDistributionChart = ({ users, owners, staff }) => {
  const total = users + owners + staff;
  const userPercent = total > 0 ? Math.round((users / total) * 100) : 0;
  const ownerPercent = total > 0 ? Math.round((owners / total) * 100) : 0;
  const staffPercent = total > 0 ? Math.round((staff / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" className="dark:stroke-gray-700" />
            {/* Users segment */}
            <circle
              cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
              strokeDasharray={`${userPercent} ${100 - userPercent}`}
              strokeDashoffset="0"
            />
            {/* Owners segment */}
            <circle
              cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
              strokeDasharray={`${ownerPercent} ${100 - ownerPercent}`}
              strokeDashoffset={`${-userPercent}`}
            />
            {/* Staff segment */}
            <circle
              cx="18" cy="18" r="15.9" fill="none" stroke="#8b5cf6" strokeWidth="3"
              strokeDasharray={`${staffPercent} ${100 - staffPercent}`}
              strokeDashoffset={`${-(userPercent + ownerPercent)}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tổng</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="flex items-center justify-center mb-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Users</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{users}</p>
        </div>
        <div>
          <div className="flex items-center justify-center mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Owners</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{owners}</p>
        </div>
        <div>
          <div className="flex items-center justify-center mb-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Staff</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{staff}</p>
        </div>
      </div>
    </div>
  );
};

// Activity Progress Bar
const ActivityProgressBar = ({ label, value, max, color }) => {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-1000`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Recent User Card
const RecentUserCard = ({ user }) => {
  const roleColors = {
    1: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    2: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    3: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    4: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  };

  const roleNames = {
    1: 'User',
    2: 'Owner',
    3: 'Staff',
    4: 'Admin',
  };

  const role = user.roleId || user.role || 1;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
          {(user.fullName || user.email || 'U')?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {user.fullName || user.email?.split('@')[0] || 'User'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
        </div>
      </div>
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${roleColors[role]}`}>
        {roleNames[role]}
      </span>
    </div>
  );
};

// System Status Item
const SystemStatusItem = ({ label, status, detail }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <div className="flex items-center space-x-3">
      <div className={`w-3 h-3 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    </div>
    <span className={`text-sm font-medium ${status === 'online' ? 'text-green-600 dark:text-green-400' : status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
      {detail}
    </span>
  </div>
);

export default function AdminPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalStaff: 0,
    totalPosts: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    pendingPosts: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Load dashboard data
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);

      // Load user stats
      try {
        const accounts = await userManagementService.getAllAccounts();
        if (Array.isArray(accounts)) {
          const users = accounts.filter(a => (a.roleId || a.role) === 1);
          const owners = accounts.filter(a => (a.roleId || a.role) === 2);
          const staff = accounts.filter(a => (a.roleId || a.role) === 3);
          const activeUsers = accounts.filter(a => a.isActive && ((a.roleId || a.role) === 1 || (a.roleId || a.role) === 2));
          const inactiveUsers = accounts.filter(a => !a.isActive && ((a.roleId || a.role) === 1 || (a.roleId || a.role) === 2));

          // Get recent users (last 5)
          const sorted = [...accounts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setRecentUsers(sorted.slice(0, 5));

          setStats(prev => ({
            ...prev,
            totalUsers: users.length,
            totalOwners: owners.length,
            totalStaff: staff.length,
            activeUsers: activeUsers.length,
            inactiveUsers: inactiveUsers.length,
          }));
        }
      } catch (error) {
        console.error('Error loading user stats:', error);
      }

      // Load posts stats
      try {
        const posts = await rentalPostService.getAllPosts();
        const postsArray = Array.isArray(posts) ? posts : [];
        const pendingPosts = postsArray.filter(p => !(p.isApproved || p.IsApproved));

        setStats(prev => ({
          ...prev,
          totalPosts: postsArray.length,
          pendingPosts: pendingPosts.length,
        }));
      } catch (error) {
        console.error('Error loading posts:', error);
      }

      // Load notifications
      try {
        const notificationData = await apiFetch('/api/Notification/by-role');
        setNotifications((notificationData || []).slice(0, 5));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }

    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-800 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 rounded-3xl p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Admin Dashboard 🎛️
            </h1>
            <p className="text-indigo-100 mt-2">
              Quản lý toàn bộ hệ thống EZStay
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link
              href="/admin/users"
              className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-all backdrop-blur-sm"
            >
              Quản lý Users
            </Link>
            <Link
              href="/admin/financial-reports"
              className="px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-medium hover:bg-indigo-50 transition-all shadow-lg"
            >
              Báo cáo tài chính
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng người dùng"
          value={stats.totalUsers}
          subtitle="Người thuê trọ"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />
        <StatCard
          title="Chủ trọ"
          value={stats.totalOwners}
          subtitle="Đã đăng ký"
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
        <StatCard
          title="Nhân viên"
          value={stats.totalStaff}
          subtitle="Đang hoạt động"
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard
          title="Bài đăng"
          value={stats.totalPosts}
          subtitle={`${stats.pendingPosts} chờ duyệt`}
          gradient="bg-gradient-to-br from-orange-500 to-red-500"
          icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý hệ thống</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickActionCard
                href="/admin/users"
                emoji="👥"
                title="Quản lý người dùng"
                description="Xem và quản lý tài khoản"
                color="blue"
              />
              <QuickActionCard
                href="/admin/staff-management"
                emoji="👔"
                title="Quản lý nhân viên"
                description="Thêm, sửa nhân viên"
                color="purple"
              />
              
              <QuickActionCard
                href="/admin/financial-reports"
                emoji="💰"
                title="Báo cáo tài chính"
                description="Doanh thu và chi phí"
                color="orange"
              />
              <QuickActionCard
                href="/admin/payment-gateways"
                emoji="🏦"
                title="Cổng thanh toán"
                description="Quản lý ngân hàng"
                color="indigo"
              />
              <QuickActionCard
                href="/admin/notifications"
                emoji="🔔"
                title="Thông báo hệ thống"
                description="Gửi thông báo"
                color="red"
              />
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Người dùng mới</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Đăng ký gần đây</p>
                </div>
                <Link
                  href="/admin/users"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
                >
                  Xem tất cả →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Chưa có người dùng nào
                </div>
              ) : (
                <div className="space-y-3">
                  {recentUsers.map((user, index) => (
                    <RecentUserCard key={user.id || index} user={user} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Hoạt động hệ thống</h2>
            <div className="space-y-5">
              <ActivityProgressBar
                label="Tài khoản hoạt động"
                value={stats.activeUsers}
                max={stats.activeUsers + stats.inactiveUsers}
                color="green"
              />
              <ActivityProgressBar
                label="Bài đăng đã duyệt"
                value={stats.totalPosts - stats.pendingPosts}
                max={stats.totalPosts}
                color="blue"
              />
              <ActivityProgressBar
                label="Chủ trọ đã xác minh"
                value={stats.totalOwners}
                max={stats.totalUsers + stats.totalOwners}
                color="purple"
              />
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          {/* User Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Phân bố người dùng</h2>
            <UserDistributionChart
              users={stats.totalUsers}
              owners={stats.totalOwners}
              staff={stats.totalStaff}
            />
          </div>

          {/* Account Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Trạng thái tài khoản</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Đang hoạt động</span>
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeUsers}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Bị khóa</span>
                </div>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.inactiveUsers}</span>
              </div>
            </div>
          </div>

          

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Thông báo</h2>
                <Link
                  href="/admin/notifications"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
                >
                  Xem tất cả
                </Link>
              </div>
            </div>
            <div className="p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  Không có thông báo mới
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 3).map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg ${notification.isRead ? 'bg-gray-50 dark:bg-gray-700/30' : 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500'}`}
                    >
                      <p className="text-sm text-gray-900 dark:text-white">{notification.title || notification.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
