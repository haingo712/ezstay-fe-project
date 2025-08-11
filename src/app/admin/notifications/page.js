'use client';

import { useState, useEffect } from 'react';

export default function NotificationsManagementPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('system');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'template', 'schedule'
  const [selectedNotification, setSelectedNotification] = useState(null);

  const [notifications, setNotifications] = useState({
    system: [
      {
        id: 1,
        title: 'System Maintenance Alert',
        content: 'The system will undergo scheduled maintenance on Sunday from 2:00 AM to 4:00 AM.',
        type: 'maintenance',
        priority: 'high',
        status: 'active',
        created_at: '2024-01-20T10:30:00Z',
        sent_count: 2847,
        read_count: 2156,
        target_audience: 'all_users'
      },
      {
        id: 2,
        title: 'New Payment Gateway Available',
        content: 'We have added ZaloPay as a new payment option for your convenience.',
        type: 'feature',
        priority: 'medium',
        status: 'draft',
        created_at: '2024-01-19T14:15:00Z',
        sent_count: 0,
        read_count: 0,
        target_audience: 'all_users'
      },
      {
        id: 3,
        title: 'Security Policy Update',
        content: 'We have updated our security policies. Please review the changes in your account settings.',
        type: 'security',
        priority: 'high',
        status: 'sent',
        created_at: '2024-01-18T09:00:00Z',
        sent_count: 2847,
        read_count: 2634,
        target_audience: 'all_users'
      }
    ],
    user: [
      {
        id: 4,
        title: 'Welcome to EZStay!',
        content: 'Thank you for joining EZStay. Here\'s how to get started with finding your perfect accommodation.',
        type: 'welcome',
        priority: 'medium',
        status: 'active',
        created_at: '2024-01-15T10:00:00Z',
        sent_count: 456,
        read_count: 423,
        target_audience: 'new_users'
      },
      {
        id: 5,
        title: 'Booking Confirmation',
        content: 'Your booking for {property_name} has been confirmed. Check-in details will be sent 24 hours before your arrival.',
        type: 'booking',
        priority: 'high',
        status: 'active',
        created_at: '2024-01-10T16:30:00Z',
        sent_count: 1234,
        read_count: 1198,
        target_audience: 'tenants'
      },
      {
        id: 6,
        title: 'Payment Reminder',
        content: 'Your monthly rent payment of {amount} is due on {due_date}. Please ensure timely payment to avoid late fees.',
        type: 'payment',
        priority: 'high',
        status: 'active',
        created_at: '2024-01-05T08:00:00Z',
        sent_count: 892,
        read_count: 845,
        target_audience: 'tenants'
      }
    ],
    owner: [
      {
        id: 7,
        title: 'New Booking Request',
        content: 'You have received a new booking request for {property_name}. Please review and respond within 24 hours.',
        type: 'booking',
        priority: 'high',
        status: 'active',
        created_at: '2024-01-22T11:45:00Z',
        sent_count: 234,
        read_count: 198,
        target_audience: 'owners'
      },
      {
        id: 8,
        title: 'Monthly Revenue Report',
        content: 'Your monthly revenue report for January is now available. Total earnings: {total_earnings}.',
        type: 'financial',
        priority: 'medium',
        status: 'scheduled',
        created_at: '2024-01-20T15:30:00Z',
        sent_count: 0,
        read_count: 0,
        target_audience: 'owners'
      },
      {
        id: 9,
        title: 'Property Listing Optimization Tips',
        content: 'Learn how to optimize your property listings to attract more bookings and increase revenue.',
        type: 'tips',
        priority: 'low',
        status: 'draft',
        created_at: '2024-01-18T13:20:00Z',
        sent_count: 0,
        read_count: 0,
        target_audience: 'owners'
      }
    ]
  });

  const [templates] = useState([
    {
      id: 1,
      name: 'Welcome Message',
      subject: 'Welcome to EZStay!',
      content: 'Welcome to EZStay, {user_name}! We\'re excited to help you find your perfect accommodation.',
      variables: ['user_name'],
      category: 'user_onboarding'
    },
    {
      id: 2,
      name: 'Booking Confirmation',
      subject: 'Booking Confirmed - {property_name}',
      content: 'Your booking for {property_name} from {check_in} to {check_out} has been confirmed.',
      variables: ['property_name', 'check_in', 'check_out'],
      category: 'booking'
    },
    {
      id: 3,
      name: 'Payment Due Reminder',
      subject: 'Payment Due - {amount}',
      content: 'Your payment of {amount} is due on {due_date}. Please make payment to avoid late fees.',
      variables: ['amount', 'due_date'],
      category: 'payment'
    }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement',
    priority: 'medium',
    target_audience: 'all_users',
    schedule_time: '',
    send_immediately: true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateNotification = () => {
    setModalType('create');
    setFormData({
      title: '',
      content: '',
      type: 'announcement',
      priority: 'medium',
      target_audience: 'all_users',
      schedule_time: '',
      send_immediately: true
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newNotification = {
      id: Date.now(),
      ...formData,
      status: formData.send_immediately ? 'sent' : formData.schedule_time ? 'scheduled' : 'draft',
      created_at: new Date().toISOString(),
      sent_count: formData.send_immediately ? Math.floor(Math.random() * 3000) : 0,
      read_count: formData.send_immediately ? Math.floor(Math.random() * 2500) : 0
    };

    const targetCategory = formData.target_audience === 'owners' ? 'owner' : 
                          formData.target_audience === 'tenants' ? 'user' : 'system';

    setNotifications(prev => ({
      ...prev,
      [targetCategory]: [newNotification, ...prev[targetCategory]]
    }));

    setShowModal(false);
  };

  const handleDeleteNotification = (notificationId, category) => {
    if (confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      setNotifications(prev => ({
        ...prev,
        [category]: prev[category].filter(notif => notif.id !== notificationId)
      }));
    }
  };

  const sendNotification = (notificationId, category) => {
    setNotifications(prev => ({
      ...prev,
      [category]: prev[category].map(notif => 
        notif.id === notificationId 
          ? { 
              ...notif, 
              status: 'sent', 
              sent_count: Math.floor(Math.random() * 3000),
              read_count: Math.floor(Math.random() * 2500)
            }
          : notif
      )
    }));
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const currentNotifications = notifications[activeTab] || [];
  const totalNotifications = Object.values(notifications).flat().length;
  const activeNotifications = Object.values(notifications).flat().filter(n => n.status === 'active' || n.status === 'sent').length;
  const totalSent = Object.values(notifications).flat().reduce((sum, n) => sum + n.sent_count, 0);
  const totalRead = Object.values(notifications).flat().reduce((sum, n) => sum + n.read_count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Quản lý hệ thống thông báo toàn platform</p>
        </div>
        <button
          onClick={handleCreateNotification}
          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Notification
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 19.718c.64.64 1.536 1.032 2.524 1.032h8.236a3.5 3.5 0 003.5-3.5v-8.236c0-.988-.392-1.884-1.032-2.524L12.282 1.676a2.5 2.5 0 00-3.536 0L3.932 6.49c-.64.64-1.032 1.536-1.032 2.524v8.236a3.5 3.5 0 003.5 3.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalNotifications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeNotifications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Read Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'system', label: 'System Notifications', count: notifications.system.length },
              { key: 'user', label: 'User Notifications', count: notifications.user.length },
              { key: 'owner', label: 'Owner Notifications', count: notifications.owner.length }
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

        {/* Notifications List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {currentNotifications.map((notification) => (
            <div key={notification.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                      {notification.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                      {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                      {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {notification.content}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <span>Created: {formatDate(notification.created_at)}</span>
                    <span>Target: {notification.target_audience.replace('_', ' ')}</span>
                    <span>Type: {notification.type}</span>
                    {notification.sent_count > 0 && (
                      <>
                        <span>Sent: {notification.sent_count.toLocaleString()}</span>
                        <span>Read: {notification.read_count.toLocaleString()} ({Math.round((notification.read_count / notification.sent_count) * 100)}%)</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {notification.status === 'draft' && (
                    <button
                      onClick={() => sendNotification(notification.id, activeTab)}
                      className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setSelectedNotification(notification);
                      setModalType('view');
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    title="View Details"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleDeleteNotification(notification.id, activeTab)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {currentNotifications.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No notifications found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                No notifications in this category yet.
              </p>
              <button
                onClick={handleCreateNotification}
                className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Create First Notification
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'create' ? 'Create Notification' : 'Notification Details'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {modalType === 'view' && selectedNotification ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedNotification.title}
                    </h4>
                    <div className="flex items-center space-x-3 mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedNotification.status)}`}>
                        {selectedNotification.status.charAt(0).toUpperCase() + selectedNotification.status.slice(1)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedNotification.priority)}`}>
                        {selectedNotification.priority.charAt(0).toUpperCase() + selectedNotification.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Content</h5>
                    <p className="text-gray-600 dark:text-gray-400">{selectedNotification.content}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Type</p>
                      <p className="text-gray-600 dark:text-gray-400">{selectedNotification.type}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Target Audience</p>
                      <p className="text-gray-600 dark:text-gray-400">{selectedNotification.target_audience.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Created</p>
                      <p className="text-gray-600 dark:text-gray-400">{formatDate(selectedNotification.created_at)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Sent Count</p>
                      <p className="text-gray-600 dark:text-gray-400">{selectedNotification.sent_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Read Count</p>
                      <p className="text-gray-600 dark:text-gray-400">{selectedNotification.read_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Read Rate</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedNotification.sent_count > 0 
                          ? Math.round((selectedNotification.read_count / selectedNotification.sent_count) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter notification title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content
                    </label>
                    <textarea
                      required
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows="4"
                      placeholder="Enter notification content"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="announcement">Announcement</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="feature">New Feature</option>
                        <option value="security">Security</option>
                        <option value="booking">Booking</option>
                        <option value="payment">Payment</option>
                        <option value="welcome">Welcome</option>
                        <option value="financial">Financial</option>
                        <option value="tips">Tips</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Audience
                    </label>
                    <select
                      value={formData.target_audience}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all_users">All Users</option>
                      <option value="tenants">Tenants Only</option>
                      <option value="owners">Owners Only</option>
                      <option value="new_users">New Users</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="send_immediately"
                      checked={formData.send_immediately}
                      onChange={(e) => setFormData(prev => ({ ...prev, send_immediately: e.target.checked }))}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="send_immediately" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Send immediately
                    </label>
                  </div>

                  {!formData.send_immediately && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Schedule Time (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.schedule_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, schedule_time: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    >
                      {formData.send_immediately ? 'Send Notification' : 'Save Notification'}
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
