'use client';

import { useState } from 'react';

export default function NotificationsPage() {
  const [notifications] = useState([
    {
      id: 1,
      type: 'user',
      title: 'New User Registration',
      message: 'User "John Doe" has registered',
      time: '5 minutes ago',
      read: false,
      icon: '👤'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of 5,000,000 VND received',
      time: '1 hour ago',
      read: false,
      icon: '💰'
    },
    {
      id: 3,
      type: 'system',
      title: 'System Update',
      message: 'System maintenance scheduled',
      time: '2 hours ago',
      read: true,
      icon: '⚙️'
    },
    {
      id: 4,
      type: 'review',
      title: 'New Review Posted',
      message: 'A user posted a 5-star review',
      time: '3 hours ago',
      read: true,
      icon: '⭐'
    },
    {
      id: 5,
      type: 'alert',
      title: 'Suspicious Activity',
      message: 'Multiple failed login attempts detected',
      time: '5 hours ago',
      read: false,
      icon: '⚠️'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type) => {
    switch (type) {
      case 'user': return 'blue';
      case 'payment': return 'green';
      case 'system': return 'purple';
      case 'review': return 'orange';
      case 'alert': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🔔 Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Mark All as Read
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium">
            Settings
          </button>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm">User Activity</p>
          <p className="text-3xl font-bold mt-2">
            {notifications.filter(n => n.type === 'user').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm">Payments</p>
          <p className="text-3xl font-bold mt-2">
            {notifications.filter(n => n.type === 'payment').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-purple-100 text-sm">System</p>
          <p className="text-3xl font-bold mt-2">
            {notifications.filter(n => n.type === 'system').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-orange-100 text-sm">Reviews</p>
          <p className="text-3xl font-bold mt-2">
            {notifications.filter(n => n.type === 'review').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-red-100 text-sm">Alerts</p>
          <p className="text-3xl font-bold mt-2">
            {notifications.filter(n => n.type === 'alert').length}
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.map((notification) => {
            const color = getNotificationColor(notification.type);
            return (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex items-start">
                  <div className={`text-4xl mr-4`}>
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <div className="mt-3 flex gap-3">
                      <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                        View Details
                      </button>
                      {!notification.read && (
                        <button className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 font-medium">
                          Mark as Read
                        </button>
                      )}
                      <button className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* No More Notifications */}
      {notifications.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🔕</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Notifications
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You're all caught up! Check back later for new notifications.
          </p>
        </div>
      )}

      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Notification Preferences
        </h2>
        <div className="space-y-4">
          {[
            { label: 'User Registrations', enabled: true },
            { label: 'Payment Notifications', enabled: true },
            { label: 'System Updates', enabled: false },
            { label: 'Review Notifications', enabled: true },
            { label: 'Security Alerts', enabled: true },
            { label: 'Email Notifications', enabled: false }
          ].map((pref, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-900 dark:text-white font-medium">
                {pref.label}
              </span>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pref.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pref.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
