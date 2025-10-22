'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StaffDashboard() {
  const [mounted, setMounted] = useState(false);

  const [dashboardData] = useState({
    stats: {
      pendingPosts: 12,
      activeUsers: 1847,
      supportTickets: 8,
      flaggedContent: 5,
      totalPosts: 2456,
      approvedToday: 23,
      rejectedToday: 4,
      responseTime: '2.3h'
    },
    recentActivity: [
      {
        id: 1,
        type: 'post_approved',
        title: 'Post Approved',
        description: 'Approved "Modern Studio Apartment" by John Doe',
        time: '5 minutes ago',
        user: 'John Doe',
        action: 'approved',
        priority: 'normal'
      },
      {
        id: 2,
        type: 'user_reported',
        title: 'User Reported',
        description: 'User "suspicious_user123" reported for spam content',
        time: '12 minutes ago',
        user: 'suspicious_user123',
        action: 'reported',
        priority: 'high'
      },
      {
        id: 3,
        type: 'support_ticket',
        title: 'Support Ticket',
        description: 'New ticket: "Payment issue with booking"',
        time: '25 minutes ago',
        user: 'Emily Chen',
        action: 'created',
        priority: 'medium'
      },
      {
        id: 4,
        type: 'post_rejected',
        title: 'Post Rejected',
        description: 'Rejected "Cheap Room" - inappropriate content',
        time: '1 hour ago',
        user: 'BadActor',
        action: 'rejected',
        priority: 'normal'
      },
      {
        id: 5,
        type: 'user_verified',
        title: 'User Verified',
        description: 'Verified property owner "Michael Rodriguez"',
        time: '2 hours ago',
        user: 'Michael Rodriguez',
        action: 'verified',
        priority: 'normal'
      }
    ],
    pendingTasks: [
      {
        id: 1,
        title: 'Review flagged post',
        description: 'Post contains potentially inappropriate images',
        priority: 'high',
        dueDate: '2024-01-23',
        category: 'content_moderation',
        assignee: 'You'
      },
      {
        id: 2,
        title: 'Respond to urgent support ticket',
        description: 'User unable to access account after payment',
        priority: 'urgent',
        dueDate: '2024-01-22',
        category: 'support',
        assignee: 'You'
      },
      {
        id: 3,
        title: 'Verify property documents',
        description: 'New property owner submitted verification documents',
        priority: 'medium',
        dueDate: '2024-01-24',
        category: 'verification',
        assignee: 'Sarah Kim'
      },
      {
        id: 4,
        title: 'Update content guidelines',
        description: 'Review and update posting guidelines based on recent issues',
        priority: 'low',
        dueDate: '2024-01-26',
        category: 'policy',
        assignee: 'Team'
      }
    ],
    systemHealth: {
      serverStatus: 'healthy',
      databaseStatus: 'healthy',
      apiResponseTime: '145ms',
      uptime: '99.9%',
      activeConnections: 1247,
      errorRate: '0.02%'
    },
    topIssues: [
      {
        issue: 'Spam Posts',
        count: 15,
        trend: 'up',
        severity: 'medium'
      },
      {
        issue: 'Payment Disputes',
        count: 8,
        trend: 'down',
        severity: 'high'
      },
      {
        issue: 'Fake Listings',
        count: 6,
        trend: 'stable',
        severity: 'high'
      },
      {
        issue: 'User Complaints',
        count: 12,
        trend: 'up',
        severity: 'low'
      }
    ]
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'post_approved':
        return '✅';
      case 'post_rejected':
        return '❌';
      case 'user_reported':
        return '🚨';
      case 'support_ticket':
        return '🎫';
      case 'user_verified':
        return '✔️';
      default:
        return '📋';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '📊';
    }
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const { stats, recentActivity, pendingTasks, systemHealth, topIssues } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-sm">
        <div className="p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, Staff Manager! 👋</h1>
          <p className="text-purple-100">
            Here's what's happening with content moderation and user support today.
          </p>
          <div className="mt-4">
            <a
              href="/staff/reports"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Review Reports
            </a>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Support Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.supportTickets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Flagged Content</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.flaggedContent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approvedToday}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Approved Today</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejectedToday}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Rejected Today</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalPosts.toLocaleString()}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.responseTime}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
              <Link
                href="/staff/logs"
                className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-sm">{getActivityIcon(activity.type)}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(activity.time)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        User: {activity.user}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${activity.action === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          activity.action === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            activity.action === 'reported' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                        {activity.action}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Tasks</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {pendingTasks.length} tasks
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {task.description}
                      </p>
                      <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        <span>Assignee: {task.assignee}</span>
                        <span className="capitalize">{task.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Health</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Server</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Healthy</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Database</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Healthy</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{systemHealth.apiResponseTime}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">API Response</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{systemHealth.uptime}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{systemHealth.activeConnections}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Active Connections</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{systemHealth.errorRate}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Error Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Issues */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Issues</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${issue.severity === 'high' ? 'bg-red-500' :
                        issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {issue.issue}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {issue.count}
                    </span>
                    <span className="text-sm">{getTrendIcon(issue.trend)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/staff/moderation"
              className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            >
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Review Posts</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{stats.pendingPosts} pending</p>
              </div>
            </Link>

            <Link
              href="/staff/support"
              className="flex items-center p-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg mr-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Support Tickets</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{stats.supportTickets} open</p>
              </div>
            </Link>

            <Link
              href="/staff/users"
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Manage Users</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{stats.activeUsers.toLocaleString()} active</p>
              </div>
            </Link>

            <Link
              href="/staff/reports"
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg transition-colors"
            >
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">View Reports</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Analytics & insights</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}