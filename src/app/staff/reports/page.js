'use client';

import { useState, useEffect } from 'react';

export default function StaffReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeReport, setActiveReport] = useState('overview');

  const [reportsData] = useState({
    overview: {
      totalUsers: 2847,
      newUsersThisMonth: 234,
      totalPosts: 1456,
      postsApproved: 1289,
      postsRejected: 167,
      supportTickets: 89,
      ticketsResolved: 76,
      averageResponseTime: '2.3h',
      userSatisfaction: 4.6,
      systemUptime: '99.8%'
    },
    contentModeration: {
      totalReviewed: 456,
      approved: 389,
      rejected: 67,
      flagged: 23,
      spamDetected: 45,
      inappropriateContent: 22,
      averageReviewTime: '15min',
      aiAccuracy: 87.5,
      moderatorEfficiency: 92.3
    },
    userActivity: {
      activeUsers: 1847,
      newRegistrations: 234,
      userRetention: 78.5,
      averageSessionTime: '24min',
      bounceRate: 23.4,
      topUserActions: [
        { action: 'View Posts', count: 12456 },
        { action: 'Create Post', count: 3456 },
        { action: 'Send Inquiry', count: 2345 },
        { action: 'Save Favorite', count: 1876 },
        { action: 'Leave Review', count: 987 }
      ]
    },
    supportMetrics: {
      totalTickets: 89,
      openTickets: 13,
      resolvedTickets: 76,
      averageResolutionTime: '4.2h',
      firstResponseTime: '1.8h',
      customerSatisfaction: 4.6,
      ticketsByCategory: [
        { category: 'Account Issues', count: 23, percentage: 25.8 },
        { category: 'Payment Problems', count: 18, percentage: 20.2 },
        { category: 'Technical Issues', count: 15, percentage: 16.9 },
        { category: 'Property Verification', count: 12, percentage: 13.5 },
        { category: 'General Inquiries', count: 21, percentage: 23.6 }
      ]
    },
    systemHealth: {
      serverUptime: 99.8,
      apiResponseTime: 145,
      databasePerformance: 98.5,
      errorRate: 0.02,
      activeConnections: 1247,
      memoryUsage: 67.3,
      cpuUsage: 23.8,
      diskUsage: 45.2
    },
    trends: {
      userGrowth: [
        { month: 'Jan', users: 2100, growth: 5.2 },
        { month: 'Feb', users: 2234, growth: 6.4 },
        { month: 'Mar', users: 2387, growth: 6.8 },
        { month: 'Apr', users: 2456, growth: 2.9 },
        { month: 'May', users: 2634, growth: 7.2 },
        { month: 'Jun', users: 2847, growth: 8.1 }
      ],
      contentTrends: [
        { month: 'Jan', posts: 189, approved: 167, rejected: 22 },
        { month: 'Feb', posts: 234, approved: 201, rejected: 33 },
        { month: 'Mar', posts: 267, approved: 234, rejected: 33 },
        { month: 'Apr', posts: 198, approved: 178, rejected: 20 },
        { month: 'May', posts: 289, approved: 256, rejected: 33 },
        { month: 'Jun', posts: 279, approved: 253, rejected: 26 }
      ]
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num) => {
    return `${num.toFixed(1)}%`;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600 dark:text-green-400';
    if (growth < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getHealthColor = (value, threshold = 90) => {
    if (value >= threshold) return 'text-green-600 dark:text-green-400';
    if (value >= threshold * 0.8) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const { overview, contentModeration, userActivity, supportMetrics, systemHealth, trends } = reportsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                System performance and operational insights
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Report Navigation */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'content', label: 'Content Moderation' },
              { key: 'users', label: 'User Activity' },
              { key: 'support', label: 'Support Metrics' },
              { key: 'system', label: 'System Health' },
              { key: 'trends', label: 'Trends' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveReport(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeReport === tab.key
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Report */}
      {activeReport === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(overview.totalUsers)}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+{overview.newUsersThisMonth} this month</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(overview.totalPosts)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatPercentage((overview.postsApproved / overview.totalPosts) * 100)} approved</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Support Tickets</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.supportTickets}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">{overview.ticketsResolved} resolved</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.averageResponseTime}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Target: &lt;4h</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">User Satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.userSatisfaction}/5</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Excellent</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">System Uptime</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{overview.systemUptime}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Active Users</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(1847)}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">API Health</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">Healthy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Moderation Report */}
      {activeReport === 'content' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{contentModeration.totalReviewed}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Reviewed</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{contentModeration.approved}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{contentModeration.rejected}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{contentModeration.flagged}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Flagged</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Moderation Efficiency</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Review Time</span>
                  <span className="font-medium text-gray-900 dark:text-white">{contentModeration.averageReviewTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">AI Accuracy</span>
                  <span className={`font-medium ${getHealthColor(contentModeration.aiAccuracy)}`}>
                    {formatPercentage(contentModeration.aiAccuracy)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Moderator Efficiency</span>
                  <span className={`font-medium ${getHealthColor(contentModeration.moderatorEfficiency)}`}>
                    {formatPercentage(contentModeration.moderatorEfficiency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Content Issues</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Spam Detected</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{contentModeration.spamDetected}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Inappropriate Content</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{contentModeration.inappropriateContent}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Violations</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {contentModeration.spamDetected + contentModeration.inappropriateContent}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Activity Report */}
      {activeReport === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(userActivity.activeUsers)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{userActivity.newRegistrations}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">New Registrations</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{formatPercentage(userActivity.userRetention)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">User Retention</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{userActivity.averageSessionTime}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Session Time</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top User Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {userActivity.topUserActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{action.action}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${(action.count / userActivity.topUserActions[0].count) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white w-16 text-right">
                        {formatNumber(action.count)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Metrics Report */}
      {activeReport === 'support' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{supportMetrics.totalTickets}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{supportMetrics.openTickets}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Open Tickets</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{supportMetrics.resolvedTickets}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{supportMetrics.customerSatisfaction}/5</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Response Times</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Resolution Time</span>
                  <span className="font-medium text-gray-900 dark:text-white">{supportMetrics.averageResolutionTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">First Response Time</span>
                  <span className="font-medium text-gray-900 dark:text-white">{supportMetrics.firstResponseTime}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tickets by Category</h3>
              </div>
              <div className="p-6 space-y-3">
                {supportMetrics.ticketsByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{category.category}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                        {category.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Health Report */}
      {activeReport === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className={`text-3xl font-bold ${getHealthColor(systemHealth.serverUptime)}`}>
                  {formatPercentage(systemHealth.serverUptime)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Server Uptime</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{systemHealth.apiResponseTime}ms</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">API Response Time</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className={`text-3xl font-bold ${getHealthColor(systemHealth.databasePerformance)}`}>
                  {formatPercentage(systemHealth.databasePerformance)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">DB Performance</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatPercentage(systemHealth.errorRate)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resource Usage</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${systemHealth.memoryUsage > 80 ? 'bg-red-500' : systemHealth.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${systemHealth.memoryUsage}%` }}
                      ></div>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatPercentage(systemHealth.memoryUsage)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${systemHealth.cpuUsage > 80 ? 'bg-red-500' : systemHealth.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${systemHealth.cpuUsage}%` }}
                      ></div>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatPercentage(systemHealth.cpuUsage)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Disk Usage</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${systemHealth.diskUsage > 80 ? 'bg-red-500' : systemHealth.diskUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${systemHealth.diskUsage}%` }}
                      ></div>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatPercentage(systemHealth.diskUsage)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connection Stats</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(systemHealth.activeConnections)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Connections</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trends Report */}
      {activeReport === 'trends' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Growth Trend</h3>
              </div>
              <div className="p-6">
                <div className="h-64 flex items-end justify-between space-x-2">
                  {trends.userGrowth.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t-lg transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${(data.users / 3000) * 100}%` }}
                        title={`${data.month}: ${formatNumber(data.users)} users`}
                      ></div>
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">{data.month}</div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white">{formatNumber(data.users)}</div>
                      <div className={`text-xs ${getGrowthColor(data.growth)}`}>
                        {data.growth > 0 ? '+' : ''}{formatPercentage(data.growth)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Content Moderation Trend</h3>
              </div>
              <div className="p-6">
                <div className="h-64 flex items-end justify-between space-x-2">
                  {trends.contentTrends.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                      <div className="w-full flex flex-col space-y-1">
                        <div 
                          className="w-full bg-green-500 rounded-t-lg"
                          style={{ height: `${(data.approved / 300) * 100}px` }}
                          title={`${data.month}: ${data.approved} approved`}
                        ></div>
                        <div 
                          className="w-full bg-red-500"
                          style={{ height: `${(data.rejected / 300) * 100}px` }}
                          title={`${data.month}: ${data.rejected} rejected`}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{data.month}</div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white">{data.posts}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Approved</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Rejected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}