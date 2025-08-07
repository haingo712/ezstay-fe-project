'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'rental_approved',
      title: 'Rental Request Approved',
      content: 'Your rental request for "Cozy Room Near University" has been approved by Mike Chen. Please contact the landlord to arrange the lease signing.',
      isRead: false,
      createdAt: '2024-01-22T10:30:00Z',
      senderId: 2,
      senderName: 'Mike Chen',
      senderAvatar: '/api/placeholder/40/40',
      actionUrl: '/dashboard/requests',
      priority: 'high'
    },
    {
      id: 2,
      type: 'payment_reminder',
      title: 'Payment Due Reminder',
      content: 'Your monthly rent payment of $180 is due in 3 days (January 31, 2024). Please make sure to pay on time to avoid late fees.',
      isRead: false,
      createdAt: '2024-01-21T09:00:00Z',
      senderId: null,
      senderName: 'EZStay System',
      senderAvatar: null,
      actionUrl: '/dashboard/bills',
      priority: 'high'
    },
    {
      id: 3,
      type: 'review_response',
      title: 'Landlord Responded to Your Review',
      content: 'Sarah Johnson has responded to your review for "Modern Studio Apartment". Check out their response and continue the conversation.',
      isRead: true,
      createdAt: '2024-01-20T14:15:00Z',
      senderId: 3,
      senderName: 'Sarah Johnson',
      senderAvatar: '/api/placeholder/40/40',
      actionUrl: '/dashboard/reviews',
      priority: 'medium'
    },
    {
      id: 4,
      type: 'new_message',
      title: 'New Message from Landlord',
      content: 'You have received a new message from Emma Wilson regarding your inquiry about "Spacious Shared House".',
      isRead: true,
      createdAt: '2024-01-19T16:45:00Z',
      senderId: 4,
      senderName: 'Emma Wilson',
      senderAvatar: '/api/placeholder/40/40',
      actionUrl: '/dashboard/messages',
      priority: 'medium'
    },
    {
      id: 5,
      type: 'bill_generated',
      title: 'New Bill Generated',
      content: 'A new electricity bill of $45 has been generated for your room at "Student Haven". The bill is due on January 15, 2024.',
      isRead: true,
      createdAt: '2024-01-18T11:20:00Z',
      senderId: 2,
      senderName: 'Mike Chen',
      senderAvatar: '/api/placeholder/40/40',
      actionUrl: '/dashboard/bills',
      priority: 'medium'
    },
    {
      id: 6,
      type: 'rental_rejected',
      title: 'Rental Request Update',
      content: 'Unfortunately, your rental request for "Luxury Penthouse Room" has been declined. The landlord has provided feedback in your requests section.',
      isRead: true,
      createdAt: '2024-01-17T13:30:00Z',
      senderId: 5,
      senderName: 'David Park',
      senderAvatar: '/api/placeholder/40/40',
      actionUrl: '/dashboard/requests',
      priority: 'low'
    },
    {
      id: 7,
      type: 'system_update',
      title: 'New Feature: AI Room Recommendations',
      content: 'We\'ve launched AI-powered room recommendations based on your preferences! Check out your personalized suggestions in the dashboard.',
      isRead: true,
      createdAt: '2024-01-16T08:00:00Z',
      senderId: null,
      senderName: 'EZStay Team',
      senderAvatar: null,
      actionUrl: '/dashboard',
      priority: 'low'
    },
    {
      id: 8,
      type: 'favorite_available',
      title: 'Favorite Room Now Available',
      content: 'Good news! "Artistic Loft Space" that you favorited is now available for rent. Don\'t miss out on this opportunity!',
      isRead: true,
      createdAt: '2024-01-15T12:00:00Z',
      senderId: null,
      senderName: 'EZStay System',
      senderAvatar: null,
      actionUrl: '/dashboard/favorites',
      priority: 'medium'
    }
  ]);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    rentalUpdates: true,
    paymentReminders: true,
    systemUpdates: true,
    marketingEmails: false
  });

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'rental_approved':
        return '✅';
      case 'rental_rejected':
        return '❌';
      case 'payment_reminder':
        return '💳';
      case 'bill_generated':
        return '📄';
      case 'review_response':
        return '💬';
      case 'new_message':
        return '📨';
      case 'system_update':
        return '🔔';
      case 'favorite_available':
        return '❤️';
      default:
        return '📢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-gray-300 dark:border-gray-600';
      default:
        return 'border-gray-300 dark:border-gray-600';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    if (activeTab === 'read') return notification.isRead;
    return true;
  });

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Stay updated with your rental activities
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark All Read
                </button>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'read', label: 'Read', count: notifications.length - unreadCount }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notification Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Delivery Methods</h3>
                {[
                  { key: 'emailNotifications', label: 'Email Notifications' },
                  { key: 'pushNotifications', label: 'Push Notifications' },
                  { key: 'smsNotifications', label: 'SMS Notifications' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{setting.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[setting.key]}
                        onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notification Types</h3>
                {[
                  { key: 'rentalUpdates', label: 'Rental Updates' },
                  { key: 'paymentReminders', label: 'Payment Reminders' },
                  { key: 'systemUpdates', label: 'System Updates' },
                  { key: 'marketingEmails', label: 'Marketing Emails' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{setting.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[setting.key]}
                        onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 ${getPriorityColor(notification.priority)} ${
                !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
              }`}
            >
              <div className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Avatar or Icon */}
                  <div className="flex-shrink-0">
                    {notification.senderAvatar ? (
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {notification.senderName.charAt(0)}
                        </span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.content}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {notification.senderName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Mark as read"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete notification"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Action Button */}
                    {notification.actionUrl && (
                      <div className="mt-3">
                        <Link
                          href={notification.actionUrl}
                          onClick={() => markAsRead(notification.id)}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded-full transition-colors dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                        >
                          View Details
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'all' 
                ? "You don't have any notifications yet."
                : `No ${activeTab} notifications found.`
              }
            </p>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Show All Notifications
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}