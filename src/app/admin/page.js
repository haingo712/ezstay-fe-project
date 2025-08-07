'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);

  const [dashboardData] = useState({
    systemStats: {
      totalUsers: 2847,
      totalStaff: 15,
      totalOwners: 456,
      totalPosts: 1456,
      totalRevenue: 125000,
      systemUptime: 99.9,
      activeConnections: 1247,
      serverLoad: 23.5
    },
    recentActivity: [
      {
        id: 1,
        type: 'security_alert',
        title: 'Multiple Failed Login Attempts',
        description: 'User "suspicious_user@example.com" attempted 5 failed logins',
        time: '2 minutes ago',
        severity: 'high',
        action_required: true
      },
      {
        id: 2,
        type: 'staff_action',
        title: 'Staff Member Added',
        description: 'New staff member "Sarah Kim" added to content moderation team',
        time: '15 minutes ago',
        severity: 'normal',
        action_required: false
      },
      {
        id: 3,
        type: 'system_update',
        title: 'Database Backup Completed',
        description: 'Scheduled database backup completed successfully',
        time: '1 hour ago',
        severity: 'normal',
        action_required: false
      },
      {
        id: 4,
        type: 'financial',
        title: 'Payment Gateway Issue',
        description: 'Temporary payment processing delay detected',
        time: '2 hours ago',
        severity: 'medium',
        action_required: true
      },
      {
        id: 5,
        type: 'user_report',
        title: 'Mass User Registration',
        description: '50+ new user registrations in the last hour',
        time: '3 hours ago',
        severity: 'medium',
        action_required: false
      }
    ],
    systemHealth: {
      database: { status: 'healthy', response_time: '12ms', connections: 45 },
      api: { status: 'healthy', response_time: '145ms', requests_per_min: 2340 },
      storage: { status: 'warning', usage: '78%', available: '2.1TB' },
      memory: { status: 'healthy', usage: '67%', available: '16GB' },
      cpu: { status: 'healthy', usage: '23%', cores: 8 }
    },
    criticalAlerts: [
      {
        id: 1,
        type: 'security',
        message: 'Unusual login patterns detected from IP 192.168.1.100',
        severity: 'critical',
        time: '5 minutes ago',
        resolved: false
      },
      {
        id: 2,
        type: 'performance',
        message: 'Storage usage approaching 80% threshold',
        severity: 'warning',
        time: '1 hour ago',
        resolved: false
      },
      {
        id: 3,
        type: 'financial',
        message: 'Payment processing delays detected',
        severity: 'medium',
        time: '2 hours ago',
        resolved: false
      }
    ],
    staffPerformance: [
      {
        id: 1,
        name: 'Staff Manager',
        role: 'Content Moderator',
        tickets_resolved: 23,
        posts_reviewed: 156,
        response_time: '2.3h',
        satisfaction: 4.8,
        status: 'online'
      },
      {
        id: 2,
        name: 'Sarah Kim',
        role: 'User Support',
        tickets_resolved: 18,
        posts_reviewed: 89,
        response_time: '1.8h',
        satisfaction: 4.9,
        status: 'online'
      },
      {
        id: 3,
        name: 'Mike Johnson',
        role: 'Technical Support',
        tickets_resolved: 15,
        posts_reviewed: 67,
        response_time: '3.1h',
        satisfaction: 4.6,
        status: 'away'
      }
    ],
    financialSummary: {
      monthly_revenue: 125000,
      commission_earned: 12500,
      pending_payouts: 8500,
      refunds_processed: 2300,
      growth_rate: 8.5,
      top_earning_properties: [
        { name: 'Luxury Downtown Suites', revenue: 15000 },
        { name: 'Student Housing Complex', revenue: 12000 },
        { name: 'Business District Apartments', revenue: 10500 }
      ]
    },
    userMetrics: {
      new_registrations_today: 45,
      active_users_now: 1247,
      user_retention_rate: 78.5,
      average_session_time: '24min',
      top_user_countries: [
        { country: 'United States', users: 1245, percentage: 43.7 },
        { country: 'Canada', users: 567, percentage: 19.9 },
        { country: 'United Kingdom', users: 234, percentage: 8.2 },
        { country: 'Australia', users: 189, percentage: 6.6 },
        { country: 'Germany', users: 156, percentage: 5.5 }
      ]
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'security_alert':
        return '🚨';
      case 'staff_action':
        return '👥';
      case 'system_update':
        return '⚙️';
      case 'financial':
        return '💰';
      case 'user_report':
        return '📊';
      default:
        return '📋';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'normal':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const { systemStats, recentActivity, systemHealth, criticalAlerts, staffPerformance, financialSummary, userMetrics } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg shadow-sm">
        <div className="p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, System Administrator! 👑</h1>
          <p className="text-red-100">
            Complete system overview and administrative controls at your fingertips.
          </p>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.filter(alert => !alert.resolved).length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Critical Alerts</h3>
          </div>
          <div className="space-y-2">
            {criticalAlerts.filter(alert => !alert.resolved).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.message}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{alert.time}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(systemStats.totalUsers)}</p>
              <p className="text-sm text-green-600 dark:text-green-400">+{userMetrics.new_registrations_today} today</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(systemStats.totalRevenue)}</p>
              <p className="text-sm text-green-600 dark:text-green-400">+{financialSummary.growth_rate}% growth</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(systemStats.totalPosts)}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Active listings</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Uptime</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemStats.systemUptime}%</p>
              <p className="text-sm text-green-600 dark:text-green-400">Excellent</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Health</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {Object.entries(systemHealth).map(([key, health]) => (
              <div key={key} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className={`w-3 h-3 ${getStatusIndicator(health.status)} rounded-full mr-2`}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{key}</span>
                </div>
                <p className={`text-lg font-bold ${getHealthColor(health.status)}`}>
                  {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {health.response_time && <div>Response: {health.response_time}</div>}
                  {health.usage && <div>Usage: {health.usage}</div>}
                  {health.connections && <div>Connections: {health.connections}</div>}
                  {health.requests_per_min && <div>RPM: {formatNumber(health.requests_per_min)}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent System Activity</h2>
              <Link
                href="/admin/security"
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </span>
                        {activity.action_required && (
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(activity.severity)}`}>
                        {activity.severity}
                      </span>
                      {activity.action_required && (
                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                          Action Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Staff Performance</h2>
              <Link
                href="/admin/staff"
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Manage Staff
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {staffPerformance.map((staff) => (
                <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-700 ${
                        staff.status === 'online' ? 'bg-green-500' : 
                        staff.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{staff.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{staff.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {staff.tickets_resolved} tickets
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {staff.satisfaction}⭐ | {staff.response_time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Summary</h2>
              <Link
                href="/admin/finance"
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                View Details
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(financialSummary.monthly_revenue)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(financialSummary.commission_earned)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Commission Earned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {formatCurrency(financialSummary.pending_payouts)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payouts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(financialSummary.refunds_processed)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Refunds Processed</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Top Earning Properties</h3>
              <div className="space-y-2">
                {financialSummary.top_earning_properties.map((property, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{property.name}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(property.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Metrics</h2>
              <Link
                href="/admin/users"
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Manage Users
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatNumber(userMetrics.active_users_now)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Now</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {userMetrics.user_retention_rate}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Retention Rate</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Top User Countries</h3>
              <div className="space-y-2">
                {userMetrics.top_user_countries.slice(0, 3).map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{country.country}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${country.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                        {formatNumber(country.users)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
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
              href="/admin/users"
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Manage Users</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{formatNumber(systemStats.totalUsers)} total</p>
              </div>
            </Link>

            <Link
              href="/admin/staff"
              className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            >
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Staff Management</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{systemStats.totalStaff} active staff</p>
              </div>
            </Link>

            <Link
              href="/admin/finance"
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg transition-colors"
            >
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Financial Reports</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{formatCurrency(systemStats.totalRevenue)} revenue</p>
              </div>
            </Link>

            <Link
              href="/admin/security"
              className="flex items-center p-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg mr-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Security & Logs</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{criticalAlerts.filter(a => !a.resolved).length} alerts</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}