'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch, reviewAPI, supportAPI } from '@/utils/api';
import { useTranslation } from '@/hooks/useTranslation';
import userManagementService from '@/services/userManagementService';
import { rentalPostService } from '@/services/rentalPostService';

// Stat Card Component
const StatCard = ({ title, value, icon, gradient, subtitle, badge }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 ${gradient} shadow-lg`}>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-2">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
        {badge && (
          <span className="px-3 py-1 text-xs font-semibold bg-white/30 text-white rounded-full backdrop-blur-sm">
            {badge}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white mt-4">{value}</p>
      <p className="text-sm font-medium text-white/80 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-white/60 mt-1">{subtitle}</p>}
    </div>
    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
  </div>
);

// Mini Stat Card
const MiniStatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
        </div>
      </div>
    </div>
  );
};

// Notification Item
const NotificationItem = ({ notification, onMarkRead }) => {
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    if (diff < 60) return `${diff} phút trước`;
    if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
    return `${Math.floor(diff / 1440)} ngày trước`;
  };

  return (
    <div
      className={`p-4 rounded-xl transition-all cursor-pointer ${notification.isRead
        ? 'bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700'
        : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-l-4 border-purple-500 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30'
        }`}
      onClick={() => !notification.isRead && onMarkRead(notification.id)}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${notification.isRead ? 'bg-gray-200 dark:bg-gray-600' : 'bg-purple-100 dark:bg-purple-900'}`}>
          <svg className={`w-4 h-4 ${notification.isRead ? 'text-gray-500' : 'text-purple-600 dark:text-purple-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>
            {notification.title || notification.message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatTime(notification.createdAt)}
          </p>
        </div>
        {!notification.isRead && (
          <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2"></span>
        )}
      </div>
    </div>
  );
};

// Pending Post Card
const PendingPostCard = ({ post, onReview }) => (
  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
          {post.title || post.Title || 'Bài đăng'}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Đăng bởi: {post.authorName || post.AuthorName || 'Chủ trọ'}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {new Date(post.createdAt || post.CreatedAt).toLocaleDateString('vi-VN')}
        </p>
      </div>
      <button
        onClick={() => onReview(post)}
        className="ml-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Duyệt
      </button>
    </div>
  </div>
);

// Report Card
const ReportCard = ({ report }) => {
  const severityColors = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
      <div className="flex items-center space-x-4">
        <div className={`w-3 h-3 rounded-full ${report.severity === 'high' ? 'bg-red-500' : report.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{report.type}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{report.description}</p>
        </div>
      </div>
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${severityColors[report.severity]}`}>
        {report.count} báo cáo
      </span>
    </div>
  );
};

// Quick Action Card
const QuickActionCard = ({ href, icon, title, description, color, badge }) => {
  const colorClasses = {
    purple: 'bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 border-purple-200 dark:border-purple-800',
    red: 'bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 border-red-200 dark:border-red-800',
    blue: 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 border-green-200 dark:border-green-800',
    orange: 'bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 border-orange-200 dark:border-orange-800',
  };

  const iconColorClasses = {
    purple: 'text-purple-600 dark:text-purple-400',
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400',
  };

  return (
    <Link
      href={href}
      className={`relative flex items-center p-5 rounded-2xl border transition-all ${colorClasses[color]} group`}
    >
      <div className={`p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm mr-4 group-hover:scale-110 transition-transform ${iconColorClasses[color]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      {badge && (
        <span className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

export default function StaffDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [stats, setStats] = useState({
    pendingPosts: 0,
    totalUsers: 0,
    totalOwners: 0,
    totalPosts: 0,
    approvedToday: 0,
    rejectedToday: 0,
    pendingReports: 0,
    pendingSupportTickets: 0,
  });

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Load users stats
      try {
        const accounts = await userManagementService.getAllAccounts();
        if (Array.isArray(accounts)) {
          const users = accounts.filter(a => a.roleId === 1 || a.role === 1);
          const owners = accounts.filter(a => a.roleId === 2 || a.role === 2);

          setStats(prev => ({
            ...prev,
            totalUsers: users.length,
            totalOwners: owners.length,
          }));
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }

      // Load posts
      try {
        const posts = await rentalPostService.getAllPosts();
        const postsArray = Array.isArray(posts) ? posts : [];
        const pending = postsArray.filter(p => !(p.isApproved || p.IsApproved));
        setPendingPosts(pending.slice(0, 5));

        setStats(prev => ({
          ...prev,
          totalPosts: postsArray.length,
          pendingPosts: pending.length,
        }));
      } catch (error) {
        console.error('Error loading posts:', error);
      }

      // Load notifications
      try {
        const notificationData = await apiFetch('/api/Notification/by-role');
        setNotifications((notificationData || []).slice(0, 6));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }

      // Load review reports
      try {
        const reportsData = await reviewAPI.getAllReviewReports({ $orderby: 'createdAt desc' });
        const reportsArray = Array.isArray(reportsData) ? reportsData : (reportsData?.value || []);

        // Filter pending reports (status = 0)
        const pendingReports = reportsArray.filter(r => (r.status || r.Status) === 0);

        // Group reports by reason/type for display
        const reportGroups = {};
        pendingReports.forEach(report => {
          const reason = report.reason || report.Reason || 'Khác';
          if (!reportGroups[reason]) {
            reportGroups[reason] = { count: 0, reports: [] };
          }
          reportGroups[reason].count++;
          reportGroups[reason].reports.push(report);
        });

        // Convert to array format for display
        const formattedReports = Object.entries(reportGroups).map(([type, data]) => ({
          type: type,
          description: `${data.count} báo cáo chờ xử lý`,
          count: data.count,
          severity: data.count > 5 ? 'high' : data.count > 2 ? 'medium' : 'low'
        })).slice(0, 3);

        setReports(formattedReports);
        setStats(prev => ({
          ...prev,
          pendingReports: pendingReports.length,
        }));
      } catch (error) {
        console.error('Error loading review reports:', error);
        // Fallback empty reports
        setReports([]);
      }

      // Load support tickets
      try {
        const supportData = await supportAPI.getAll();
        const supportArray = Array.isArray(supportData) ? supportData : (supportData?.value || []);

        // Filter pending support tickets (status = 0 or 'Pending')
        const pendingTickets = supportArray.filter(t =>
          (t.status || t.Status) === 0 ||
          (t.status || t.Status) === 'Pending'
        );

        setSupportTickets(pendingTickets.slice(0, 5));
        setStats(prev => ({
          ...prev,
          pendingSupportTickets: pendingTickets.length,
        }));
      } catch (error) {
        console.error('Error loading support tickets:', error);
        setSupportTickets([]);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Mark notification as read
  const handleMarkNotificationRead = async (id) => {
    try {
      await apiFetch(`/api/Notification/mark-read/${id}`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle post review
  const handleReviewPost = (post) => {
    window.location.href = `/staff/posts/${post.id || post.Id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 dark:border-purple-800 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-700 dark:from-purple-800 dark:via-purple-900 dark:to-pink-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-white">
                Staff Dashboard 👋
              </h1>
              <p className="text-purple-100 mt-1">
                Quản lý và duyệt nội dung hệ thống EZStay
              </p>
            </div>
            {/* <div className="flex space-x-3">
              <Link
                href="/staff/posts"
                className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-all backdrop-blur-sm"
              >
                Quản lý bài đăng
              </Link>
              <Link
                href="/staff/reports"
                className="px-5 py-2.5 bg-white text-purple-700 rounded-xl font-medium hover:bg-purple-50 transition-all shadow-lg"
              >
                Xem báo cáo
              </Link>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Bài đăng chờ duyệt"
            value={stats.pendingPosts}
            badge={stats.pendingPosts > 0 ? 'Cần xử lý' : null}
            gradient="bg-gradient-to-br from-yellow-500 to-orange-500"
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            title="Tổng người dùng"
            value={stats.totalUsers}
            subtitle={`${stats.totalOwners} chủ trọ`}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <StatCard
            title="Tổng bài đăng"
            value={stats.totalPosts}
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>}
          />
          <StatCard
            title="Báo cáo chờ xử lý"
            value={stats.pendingReports}
            badge={stats.pendingReports > 5 ? 'Khẩn cấp' : null}
            gradient="bg-gradient-to-br from-red-500 to-pink-600"
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Thao tác nhanh</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <QuickActionCard
                  href="/staff/posts"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  title="Duyệt bài đăng"
                  description={`${stats.pendingPosts} bài chờ duyệt`}
                  color="purple"
                  badge={stats.pendingPosts > 0 ? stats.pendingPosts : null}
                /> */}
                {/* <QuickActionCard
                  href="/staff/reports"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                  title="Xem báo cáo vi phạm"
                  description={`${stats.pendingReports} báo cáo chờ xử lý`}
                  color="red"
                  badge={stats.pendingReports > 0 ? stats.pendingReports : null}
                /> */}
                <QuickActionCard
                  href="/staff/users"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>}
                  title="Quản lý người dùng"
                  description={`${stats.totalUsers + stats.totalOwners} người dùng`}
                  color="blue"
                />
                <QuickActionCard
                  href="/staff/amenity-management"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
                  title="Quản lý tiện ích"
                  description="Cập nhật danh sách tiện ích"
                  color="green"
                />
                <QuickActionCard
                  href="/staff/support"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                  title="Hỗ trợ khách hàng"
                  description={`${stats.pendingSupportTickets} yêu cầu chờ xử lý`}
                  color="orange"
                  badge={stats.pendingSupportTickets > 0 ? stats.pendingSupportTickets : null}
                />
              </div>
            </div>

            {/* Pending Posts */}
            {/* <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bài đăng chờ duyệt</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cần kiểm tra và phê duyệt</p>
                  </div>
                  <Link
                    href="/staff/posts"
                    className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium"
                  >
                    Xem tất cả →
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {pendingPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Không có bài đăng nào chờ duyệt</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingPosts.map(post => (
                      <PendingPostCard
                        key={post.id || post.Id}
                        post={post}
                        onReview={handleReviewPost}
                      />
                    ))}
                  </div> */}
            {/* )}
              </div>
            </div> */}

            {/* Reports Overview */}
            {/* <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Báo cáo vi phạm</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Các vấn đề cần xử lý</p>
                  </div>
                  <Link
                    href="/staff/reports"
                    className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium"
                  >
                    Xem tất cả →
                  </Link>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {reports.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Không có báo cáo vi phạm nào chờ xử lý</p>
                  </div>
                ) : (
                  reports.map((report, index) => (
                    <ReportCard key={index} report={report} />
                  ))
                )}
              </div>
            </div>
          </div> */}


            {/* <div className="space-y-8">
        
              <div className="grid grid-cols-2 gap-4">
                <MiniStatCard
                  title="Duyệt hôm nay"
                  value={stats.approvedToday}
                  color="green"
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                />
                <MiniStatCard
                  title="Từ chối hôm nay"
                  value={stats.rejectedToday}
                  color="red"
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                />
              </div> */}



            {/* Notifications */}
            {/* <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Thông báo</h2>
                  <Link
                    href="/staff/notifications"
                    className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium"
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
                    {notifications.slice(0, 4).map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkRead={handleMarkNotificationRead}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
