'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SupportTicketsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('open');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseData, setResponseData] = useState({
    content: '',
    status: 'in_progress',
    priority: 'medium'
  });

  const [tickets, setTickets] = useState([
    {
      id: 1,
      senderId: 101,
      senderName: 'John Doe',
      senderEmail: 'john.doe@example.com',
      senderRole: 'user',
      subject: 'Unable to access my account after payment',
      content: 'Hi, I made a payment for my booking yesterday but I can\'t access my account anymore. When I try to log in, it says my account is suspended. I have the payment confirmation email. Please help me resolve this issue as soon as possible.',
      status: 'open',
      priority: 'urgent',
      category: 'account_access',
      createdAt: '2024-01-22T09:30:00Z',
      updatedAt: '2024-01-22T09:30:00Z',
      assignedTo: null,
      responses: [],
      attachments: ['payment_confirmation.pdf'],
      tags: ['payment_issue', 'account_suspended'],
      estimatedResolutionTime: '2 hours',
      customerSatisfaction: null
    },
    {
      id: 2,
      senderId: 102,
      senderName: 'Emily Chen',
      senderEmail: 'emily.chen@example.com',
      senderRole: 'user',
      subject: 'Refund request for cancelled booking',
      content: 'I had to cancel my booking due to an emergency. The property owner agreed to the cancellation but I haven\'t received my refund yet. It\'s been 5 business days. Can you please check the status of my refund?',
      status: 'in_progress',
      priority: 'medium',
      category: 'refund',
      createdAt: '2024-01-21T14:15:00Z',
      updatedAt: '2024-01-22T10:45:00Z',
      assignedTo: 'Staff Manager',
      responses: [
        {
          id: 1,
          responderId: 201,
          responderName: 'Staff Manager',
          content: 'Hi Emily, I\'ve checked your booking and can see the cancellation was approved. I\'ve escalated your refund request to our finance team. You should receive the refund within 3-5 business days. I\'ll keep you updated on the progress.',
          createdAt: '2024-01-22T10:45:00Z'
        }
      ],
      attachments: [],
      tags: ['refund', 'cancellation'],
      estimatedResolutionTime: '3-5 business days',
      customerSatisfaction: null
    },
    {
      id: 3,
      senderId: 103,
      senderName: 'Michael Rodriguez',
      senderEmail: 'michael@example.com',
      senderRole: 'owner',
      subject: 'Property verification documents rejected',
      content: 'My property verification documents were rejected but I don\'t understand why. The rejection email didn\'t provide specific details. I\'ve uploaded all the required documents including property deed, tax records, and insurance. Please review and let me know what\'s missing.',
      status: 'open',
      priority: 'high',
      category: 'verification',
      createdAt: '2024-01-21T11:20:00Z',
      updatedAt: '2024-01-21T11:20:00Z',
      assignedTo: null,
      responses: [],
      attachments: ['property_deed.pdf', 'tax_records.pdf', 'insurance_policy.pdf'],
      tags: ['verification', 'documents', 'property_owner'],
      estimatedResolutionTime: '1-2 business days',
      customerSatisfaction: null
    },
    {
      id: 4,
      senderId: 104,
      senderName: 'Sarah Wilson',
      senderEmail: 'sarah.wilson@example.com',
      senderRole: 'user',
      subject: 'Inappropriate behavior from property owner',
      content: 'I want to report inappropriate behavior from the property owner. They have been sending me personal messages that make me uncomfortable and are not related to the rental. I have screenshots as evidence. This needs to be addressed immediately.',
      status: 'open',
      priority: 'urgent',
      category: 'safety_report',
      createdAt: '2024-01-21T16:45:00Z',
      updatedAt: '2024-01-21T16:45:00Z',
      assignedTo: null,
      responses: [],
      attachments: ['screenshots.zip'],
      tags: ['safety', 'inappropriate_behavior', 'urgent'],
      estimatedResolutionTime: 'Immediate',
      customerSatisfaction: null
    },
    {
      id: 5,
      senderId: 105,
      senderName: 'David Kim',
      senderEmail: 'david.kim@example.com',
      senderRole: 'user',
      subject: 'Technical issue with mobile app',
      content: 'The mobile app keeps crashing when I try to upload photos for my room listing. I\'ve tried restarting the app and my phone but the issue persists. I\'m using iPhone 12 with iOS 17.2. This is preventing me from completing my listing.',
      status: 'resolved',
      priority: 'low',
      category: 'technical',
      createdAt: '2024-01-20T13:30:00Z',
      updatedAt: '2024-01-21T09:15:00Z',
      assignedTo: 'Tech Support',
      responses: [
        {
          id: 2,
          responderId: 202,
          responderName: 'Tech Support',
          content: 'Hi David, thank you for reporting this issue. We\'ve identified a bug in the iOS app that affects photo uploads. We\'ve released a fix in version 2.1.3. Please update your app from the App Store and try again. If you continue to experience issues, please let us know.',
          createdAt: '2024-01-21T09:15:00Z'
        }
      ],
      attachments: [],
      tags: ['technical', 'mobile_app', 'ios'],
      estimatedResolutionTime: 'Resolved',
      customerSatisfaction: 5,
      resolvedAt: '2024-01-21T09:15:00Z'
    },
    {
      id: 6,
      senderId: 106,
      senderName: 'Lisa Thompson',
      senderEmail: 'lisa.thompson@example.com',
      senderRole: 'owner',
      subject: 'Question about commission rates',
      content: 'I\'m a new property owner and I have questions about the commission structure. The documentation mentions different rates for different property types but I\'m not sure which category my property falls into. Can someone explain the commission rates and how they\'re calculated?',
      status: 'resolved',
      priority: 'low',
      category: 'billing',
      createdAt: '2024-01-19T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      assignedTo: 'Billing Support',
      responses: [
        {
          id: 3,
          responderId: 203,
          responderName: 'Billing Support',
          content: 'Hi Lisa, welcome to EZStay! Our commission structure is as follows: Standard rooms: 10%, Premium rooms: 12%, Luxury properties: 15%. Based on your property listing, you fall into the Standard category (10%). Commission is calculated on the total booking amount excluding taxes. I\'ve also sent you a detailed breakdown via email.',
          createdAt: '2024-01-20T14:30:00Z'
        }
      ],
      attachments: [],
      tags: ['billing', 'commission', 'new_owner'],
      estimatedResolutionTime: 'Resolved',
      customerSatisfaction: 4,
      resolvedAt: '2024-01-20T14:30:00Z'
    }
  ]);

  const [categories] = useState([
    { value: 'account_access', label: 'Account Access' },
    { value: 'refund', label: 'Refund Request' },
    { value: 'verification', label: 'Verification' },
    { value: 'safety_report', label: 'Safety Report' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing' },
    { value: 'general', label: 'General Inquiry' }
  ]);

  const [filterOptions, setFilterOptions] = useState({
    priority: 'all',
    category: 'all',
    assignee: 'all'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '📋';
      case 'low':
        return '📝';
      default:
        return '📄';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'all') return true;
    if (activeTab === 'open') return ticket.status === 'open';
    if (activeTab === 'in_progress') return ticket.status === 'in_progress';
    if (activeTab === 'resolved') return ticket.status === 'resolved';
    if (activeTab === 'urgent') return ticket.priority === 'urgent';
    if (activeTab === 'my_tickets') return ticket.assignedTo === 'Staff Manager';
    return true;
  }).filter(ticket => {
    if (filterOptions.priority !== 'all' && ticket.priority !== filterOptions.priority) return false;
    if (filterOptions.category !== 'all' && ticket.category !== filterOptions.category) return false;
    if (filterOptions.assignee !== 'all') {
      if (filterOptions.assignee === 'unassigned' && ticket.assignedTo) return false;
      if (filterOptions.assignee === 'assigned' && !ticket.assignedTo) return false;
    }
    return true;
  });

  const handleOpenTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleOpenResponseModal = (ticket) => {
    setSelectedTicket(ticket);
    setResponseData({
      content: '',
      status: ticket.status === 'open' ? 'in_progress' : ticket.status,
      priority: ticket.priority
    });
    setShowResponseModal(true);
  };

  const handleSubmitResponse = (e) => {
    e.preventDefault();
    
    const newResponse = {
      id: selectedTicket.responses.length + 1,
      responderId: 201,
      responderName: 'Staff Manager',
      content: responseData.content,
      createdAt: new Date().toISOString()
    };

    const updatedTicket = {
      ...selectedTicket,
      status: responseData.status,
      priority: responseData.priority,
      assignedTo: 'Staff Manager',
      updatedAt: new Date().toISOString(),
      responses: [...selectedTicket.responses, newResponse],
      ...(responseData.status === 'resolved' && { resolvedAt: new Date().toISOString() })
    };

    setTickets(prev => prev.map(ticket => 
      ticket.id === selectedTicket.id ? updatedTicket : ticket
    ));

    setShowResponseModal(false);
    setSelectedTicket(null);
    setResponseData({ content: '', status: 'in_progress', priority: 'medium' });
    
    alert('Response sent successfully!');
  };

  const handleAssignTicket = (ticketId, assignee) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, assignedTo: assignee, updatedAt: new Date().toISOString() }
        : ticket
    ));
    alert(`Ticket assigned to ${assignee}!`);
  };

  const handleUpdateStatus = (ticketId, status) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            status: status, 
            updatedAt: new Date().toISOString(),
            ...(status === 'resolved' && { resolvedAt: new Date().toISOString() })
          }
        : ticket
    ));
    alert(`Ticket status updated to ${status}!`);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const urgentTickets = tickets.filter(t => t.priority === 'urgent').length;
  const myTickets = tickets.filter(t => t.assignedTo === 'Staff Manager').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage customer support requests and inquiries
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Open Tickets</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {openTickets}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Tickets', count: tickets.length },
              { key: 'open', label: 'Open', count: openTickets },
              { key: 'in_progress', label: 'In Progress', count: inProgressTickets },
              { key: 'resolved', label: 'Resolved', count: resolvedTickets },
              { key: 'urgent', label: 'Urgent', count: urgentTickets },
              { key: 'my_tickets', label: 'My Tickets', count: myTickets }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={filterOptions.priority}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filterOptions.category}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assignment
              </label>
              <select
                value={filterOptions.assignee}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, assignee: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Tickets</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length > 0 ? (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getPriorityIcon(ticket.priority)}</span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        #{ticket.id} - {ticket.subject}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.replace('_', ' ').slice(1)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                      {ticket.content}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Customer Information
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p><span className="font-medium">Name:</span> {ticket.senderName}</p>
                          <p><span className="font-medium">Email:</span> {ticket.senderEmail}</p>
                          <p><span className="font-medium">Role:</span> {ticket.senderRole.charAt(0).toUpperCase() + ticket.senderRole.slice(1)}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Ticket Details
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p><span className="font-medium">Category:</span> {categories.find(c => c.value === ticket.category)?.label || ticket.category}</p>
                          <p><span className="font-medium">Created:</span> {getTimeAgo(ticket.createdAt)}</p>
                          <p><span className="font-medium">Updated:</span> {getTimeAgo(ticket.updatedAt)}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Assignment & Progress
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p><span className="font-medium">Assigned to:</span> {ticket.assignedTo || 'Unassigned'}</p>
                          <p><span className="font-medium">Responses:</span> {ticket.responses.length}</p>
                          <p><span className="font-medium">ETA:</span> {ticket.estimatedResolutionTime}</p>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {ticket.tags && ticket.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {ticket.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                              {tag.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {ticket.attachments && ticket.attachments.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Attachments ({ticket.attachments.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {ticket.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{attachment}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Customer Satisfaction */}
                    {ticket.customerSatisfaction && (
                      <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            Customer Satisfaction:
                          </span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={`text-lg ${star <= ticket.customerSatisfaction ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-green-700 dark:text-green-300">
                            ({ticket.customerSatisfaction}/5)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleOpenTicketModal(ticket)}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </button>

                      <button
                        onClick={() => handleOpenResponseModal(ticket)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Respond
                      </button>

                      {!ticket.assignedTo && (
                        <button
                          onClick={() => handleAssignTicket(ticket.id, 'Staff Manager')}
                          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Assign to Me
                        </button>
                      )}

                      {ticket.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateStatus(ticket.id, 'resolved')}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Mark Resolved
                        </button>
                      )}

                      <Link
                        href={`mailto:${ticket.senderEmail}`}
                        className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email Customer
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No tickets found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'all' 
                ? "No support tickets match your current filters."
                : `No ${activeTab.replace('_', ' ')} tickets found.`
              }
            </p>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Show All Tickets
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ticket #{selectedTicket.id} - {selectedTicket.subject}
                </h3>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Original Message */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {selectedTicket.senderName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedTicket.senderName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(selectedTicket.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status.replace('_', ' ').charAt(0).toUpperCase() + selectedTicket.status.replace('_', ' ').slice(1)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{selectedTicket.content}</p>
                </div>

                {/* Responses */}
                {selectedTicket.responses.map((response) => (
                  <div key={response.id} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {response.responderName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{response.responderName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(response.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{response.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Respond to Ticket #{selectedTicket.id}
                </h3>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white">{selectedTicket.subject}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">from {selectedTicket.senderName}</p>
              </div>

              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Update Status
                    </label>
                    <select
                      value={responseData.status}
                      onChange={(e) => setResponseData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Update Priority
                    </label>
                    <select
                      value={responseData.priority}
                      onChange={(e) => setResponseData(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Response Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={responseData.content}
                    onChange={(e) => setResponseData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Type your response to the customer..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowResponseModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Send Response
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