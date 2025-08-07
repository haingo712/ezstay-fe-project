'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OwnerDashboard() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    totalProperties: 3,
    totalRooms: 12,
    occupiedRooms: 8,
    vacantRooms: 4,
    monthlyRevenue: 4200,
    pendingRequests: 5,
    activeContracts: 8,
    totalTenants: 15
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'new_request',
      message: 'New rental request for "Modern Studio Apartment"',
      time: '2 hours ago',
      icon: '📝',
      priority: 'high'
    },
    {
      id: 2,
      type: 'payment_received',
      message: 'Payment received from John Doe - $180',
      time: '4 hours ago',
      icon: '💰',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'review_posted',
      message: 'New review posted for "Cozy Room Near University"',
      time: '1 day ago',
      icon: '⭐',
      priority: 'low'
    },
    {
      id: 4,
      type: 'contract_signed',
      message: 'Contract signed for "Spacious Shared House"',
      time: '2 days ago',
      icon: '📋',
      priority: 'medium'
    },
    {
      id: 5,
      type: 'maintenance_request',
      message: 'Maintenance request from tenant in Room 201',
      time: '3 days ago',
      icon: '🔧',
      priority: 'high'
    }
  ]);

  const [upcomingTasks, setUpcomingTasks] = useState([
    {
      id: 1,
      title: 'Review rental applications',
      description: '5 pending applications need review',
      dueDate: 'Today',
      priority: 'high',
      type: 'review'
    },
    {
      id: 2,
      title: 'Generate monthly invoices',
      description: 'Create invoices for 8 tenants',
      dueDate: 'Tomorrow',
      priority: 'high',
      type: 'billing'
    },
    {
      id: 3,
      title: 'Property inspection',
      description: 'Quarterly inspection for Sunrise Residence',
      dueDate: 'Jan 30',
      priority: 'medium',
      type: 'inspection'
    },
    {
      id: 4,
      title: 'Contract renewal',
      description: '2 contracts expiring next month',
      dueDate: 'Feb 1',
      priority: 'medium',
      type: 'contract'
    }
  ]);

  const [topPerformingRooms, setTopPerformingRooms] = useState([
    {
      id: 1,
      name: 'Modern Studio Apartment',
      property: 'Sunrise Residence',
      occupancyRate: 95,
      monthlyRevenue: 250,
      rating: 4.8,
      reviews: 24
    },
    {
      id: 2,
      name: 'Luxury Penthouse Room',
      property: 'Sky Tower',
      occupancyRate: 90,
      monthlyRevenue: 350,
      rating: 4.9,
      reviews: 18
    },
    {
      id: 3,
      name: 'Cozy Room Near University',
      property: 'Student Haven',
      occupancyRate: 88,
      monthlyRevenue: 180,
      rating: 4.6,
      reviews: 32
    }
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'review':
        return '👀';
      case 'billing':
        return '💳';
      case 'inspection':
        return '🔍';
      case 'contract':
        return '📋';
      default:
        return '📌';
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const occupancyRate = Math.round((stats.occupiedRooms / stats.totalRooms) * 100);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Sarah! 👋</h1>
        <p className="text-green-100">Here's what's happening with your properties today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProperties}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRooms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{occupancyRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(stats.monthlyRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.pendingRequests}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeContracts}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Contracts</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalTenants}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Tenants</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.vacantRooms}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Vacant Rooms</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{activity.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                      <span className={`text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                        {activity.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href="/owner/notifications"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                View all activity →
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0">
                    <span className="text-xl">{getTaskIcon(task.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {task.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Due: {task.dueDate}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Rooms */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Rooms</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {topPerformingRooms.map((room, index) => (
              <div key={room.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {room.name}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {room.property}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-gray-900 dark:text-white">{room.occupancyRate}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Occupancy</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900 dark:text-white">{formatPrice(room.monthlyRevenue)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900 dark:text-white">{room.rating}⭐</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{room.reviews} reviews</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/owner/analytics"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View detailed analytics →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/owner/rooms/new"
              className="flex items-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
            >
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Add New Room</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Create room listing</p>
              </div>
            </Link>

            <Link
              href="/owner/requests"
              className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-colors"
            >
              <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29.82-5.877 2.172M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.875a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Review Requests</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stats.pendingRequests} pending</p>
              </div>
            </Link>

            <Link
              href="/owner/bills"
              className="flex items-center p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
            >
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Generate Bills</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Monthly invoices</p>
              </div>
            </Link>

            <Link
              href="/owner/analytics"
              className="flex items-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
            >
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">View Analytics</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Performance data</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}