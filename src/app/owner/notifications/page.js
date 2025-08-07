'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OwnerNotificationsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'new_booking',
      title: 'New Booking Request',
      content: 'John Doe has submitted a rental request for "Modern Studio Apartment" at Sunrise Residence. The request includes a 12-month lease starting February 1st.',
      isRead: false,
      createdAt: '2024-01-22T10:30:00Z',
      senderId: 101,
      senderName: 'John Doe',
      senderAvatar: '/api/placeholder/40/40',
      actionUrl: '/owner/requests',
      priority: 'high',
      metadata: {
        roomName: 'Modern Studio Apartment',
        propertyName: 'Sunrise Residence',
        requestId: 1
      }
    },
    {
      id: 2,
      type: 'payment_received',
      title: 'Payment Received',
      content: 'Monthly rent payment of $250 has been received from Emily Chen for "Cozy Room Near University". Payment was processed successfully via bank transfer.',
      isRead: false,
      createdAt: '2024-01-21T14:15:00Z',
      senderId: 102,
      senderName: 'Emily Chen',
      senderAvatar: '/api/placeholder/40/40',
      actionUrl: '/owner/bills',
      priority: 'medium',
      metadata: {
        amount: 250,
        paymentMethod: 'Bank Transfer',
        roomName: 'Cozy Room Near University'
      }
    },
    {
      id: 3,
      type: 'maintenance_request',
      title: 'Maintenance Request',
      content: 'Michael Rodriguez has reported a heating issue in "Luxury Penthouse Room". The tenant mentioned that the heating system is not working properly and needs immediate attention.',
      isRead: true,
      createdAt: '2024-01-20T16:45:00Z',
      senderId: 103,
      senderName: 'Michael Rodriguez',
      senderAvatar: '/api/placeholder/40/40',
      actionUrl: '/owner/tenants',
      priority: 'high',
      metadata: {
        issueType: 'Heating',
        roomName: 'Luxury Penthouse Room',
        urgency: 'High'
      }
    },
    {
      id: 4,
      type: 'review_posted',
      title: 'New Review Posted',
      content: 'Sarah Wilson has posted a 4-star review for "Spacious Shared House Room". The review mentions positive aspects about the location and cleanliness.',
      isRead: true,
      createdAt: '2024-01-19T11:20:00Z',
      senderId: 104,
      senderName: 'Sarah Wilson',
      senderAvatar: '/api/placeholder/40/40',
      actionUrl: '/owner/reviews',
      priority: 'low',
      metadata: {
        rating: 4,
        roomName: 'Spacious Shared House Room',
        reviewId: 4
      }
    },
    {
      id: 5,
      type: 'contract_expiring',
      title: 'Contract Expiring Soon',
      content: 'The rental contract for Emily Chen at "Cozy Room Near University" will expire in 30 days (June 15, 2024). Consider reaching out for renewal discussion.',
      isRead: false,
      createdAt: '2024-01-18T09:00:00Z',
      senderId: null,
      senderName: 'EZStay System',
      senderAvatar: null,
      actionUrl: '/owner/contracts',
      priority: 'medium',
      metadata: {
        contractId: 'CT-2023-045',
        expiryDate: '2024-06-15',
        tenantName: 'Emily Chen'
      }
    },
    {
      id: 6,
      type: 'payment_overdue',
      title: 'Payment Overdue',
      content: 'Rent payment from David Kim for "Modern Studio Apartment" is now 5 days overdue. The payment of $250 was due on January 15th.',
      isRead: true,
      createdAt: '2024-01-17T12:30:00Z',
      senderId: 105,
      senderName: 'David Kim',
      senderAvatar: '/api/placeholder/40/40',
      actionUrl: '/owner/bills',
      priority: 'high',
      metadata: {
        amount: 250,
        daysOverdue: 5,
        roomName: 'Modern Studio Apartment'
      }
    },
    {
      id: 7,
      type: 'inquiry_received',
      title: 'New Property Inquiry',
      content: 'Lisa Thompson has sent an inquiry about "Luxury Penthouse Room" at Sunrise Residence. She is interested in viewing the property next week.',
      isRead: true,
      createdAt: '2024-01-16T15:45:00Z',
      senderId: 106,
      senderName: 'Lisa Thompson',
      senderAvatar: '/api/placeholder/40/40',
      actionUrl: '/owner/posts',
      priority: 'medium',
      metadata: {
        roomName: 'Luxury Penthouse Room',
        propertyName: 'Sunrise Residence',
        inquiryType: 'Viewing Request'
      }
    },
    {
      id: 8,
      type: 'system_update',
      title: 'New Feature: Analytics Dashboard',
      content: 'We\'ve launched a new analytics dashboard to help you track your property performance, revenue trends, and tenant insights. Check it out in the Analytics section.',
      isRead: true,
      createdAt: '2024-01-15T08:00:00Z',
      senderId: null,
      senderName: 'EZStay Team',
      senderAvatar: null,
      actionUrl: '/owner/analytics',
      priority: 'low',
      metadata: {
        featureName: 'Analytics Dashboard',
        version: '2.1.0'
      }
    }
  ]);

  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeData, setComposeData] = useState({
    recipients: [],
    title: '',
    content: '',
    priority: 'medium'
  });

  const [tenants] = useState([
    { id: 101, name: 'John Doe', email: 'john.doe@example.com' },
    { id: 102, name: 'Emily Chen', email: 'emily.chen@example.com' },
    { id: 103, name: 'Michael Rodriguez', email: 'michael.r@example.com' },
    { id: 104, name: 'Sarah Wilson', email: 'sarah.wilson@example.com' },
    { id: 105, name: 'David Kim', email: 'david.kim@example.com' },
    { id: 106, name: 'Lisa Thompson', email: 'lisa.thompson@example.com' }
  ]);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    bookingAlerts: true,
    paymentAlerts: true,
    maintenanceAlerts: true,
    reviewAlerts: true,
    contractAlerts: true,
    systemUpdates: true
  });

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_booking':
        return '📝';
      case 'payment_received':
        return '💰';
      case 'payment_overdue':
        return '⚠️';
      case 'maintenance_request':
        return '🔧';
      case 'review_posted':
        return '⭐';
      case 'contract_expiring':
        return '📋';
      case 'inquiry_received':
        return '💬';
      case 'system_update':
        return '🔔';
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
    if (activeTab === 'high') return notification.priority === 'high';
    if (activeTab === 'bookings') return notification.type === 'new_booking';
    if (activeTab === 'payments') return notification.type === 'payment_received' || notification.type === 'payment_overdue';
    return true;
  });

  const handleSendNotification = (e) => {
    e.preventDefault();
    
    const newNotification = {
      id: notifications.length + 1,
      type: 'custom',
      title: composeData.title,
      content: composeData.content,
      isRead: false,
      createdAt: new Date().toISOString(),
      senderId: null,
      senderName: 'You',
      senderAvatar: null,
      actionUrl: null,
      priority: composeData.priority,
      metadata: {
        recipients: composeData.recipients,
        customMessage: true
      }
    };

    // In a real app, this would send notifications to selected tenants
    alert(`Notification sent to ${composeData.recipients.length} tenant(s)!`);
    
    setShowComposeModal(false);
    setComposeData({
      recipients: [],
      title: '',
      content: '',
      priority: 'medium'
    });
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleRecipientToggle = (tenantId) => {
    setComposeData(prev => ({
      ...prev,
      recipients: prev.recipients.includes(tenantId)
        ? prev.recipients.filter(id => id !== tenantId)
        : [...prev.recipients, tenantId]
    }));
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Stay updated with your property management activities
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
                onClick={() => setShowComposeModal(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Send Notification
              </button>
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
              { key: 'high', label: 'High Priority', count: highPriorityCount },
              { key: 'bookings', label: 'Bookings', count: notifications.filter(n => n.type === 'new_booking').length },
              { key: 'payments', label: 'Payments', count: notifications.filter(n => n.type === 'payment_received' || n.type === 'payment_overdue').length }
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
                  { key: 'bookingAlerts', label: 'Booking Requests' },
                  { key: 'paymentAlerts', label: 'Payment Updates' },
                  { key: 'maintenanceAlerts', label: 'Maintenance Requests' },
                  { key: 'reviewAlerts', label: 'New Reviews' },
                  { key: 'contractAlerts', label: 'Contract Expiry' },
                  { key: 'systemUpdates', label: 'System Updates' }
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
                          <span className={`text-xs font-medium ${
                            notification.priority === 'high' ? 'text-red-600' :
                            notification.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {notification.priority.toUpperCase()}
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

                    {/* Metadata */}
                    {notification.metadata && (
                      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {notification.metadata.roomName && (
                            <span className="inline-block mr-3">Room: {notification.metadata.roomName}</span>
                          )}
                          {notification.metadata.amount && (
                            <span className="inline-block mr-3">Amount: ${notification.metadata.amount}</span>
                          )}
                          {notification.metadata.daysOverdue && (
                            <span className="inline-block mr-3 text-red-600">Overdue: {notification.metadata.daysOverdue} days</span>
                          )}
                        </div>
                      </div>
                    )}

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

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Send Notification
                </h3>
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSendNotification} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipients *
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <div className="space-y-2">
                      {tenants.map((tenant) => (
                        <label key={tenant.id} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={composeData.recipients.includes(tenant.id)}
                            onChange={() => handleRecipientToggle(tenant.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {tenant.name} ({tenant.email})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Select tenants to receive this notification
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={composeData.priority}
                    onChange={(e) => setComposeData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={composeData.title}
                    onChange={(e) => setComposeData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter notification title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={composeData.content}
                    onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your message..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowComposeModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={composeData.recipients.length === 0}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                  >
                    Send Notification
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}