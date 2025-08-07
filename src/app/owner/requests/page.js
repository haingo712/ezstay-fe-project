'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OwnerRequestsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState([
    {
      id: 1,
      userId: 101,
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      userPhone: '+1 (555) 123-4567',
      roomId: 1,
      roomName: 'Modern Studio Apartment',
      houseName: 'Sunrise Residence',
      requestDate: '2024-01-22T10:30:00Z',
      status: 'pending',
      userNote: 'Hi! I am very interested in this room. I am a clean and responsible tenant with stable income from my software engineering job. I would love to schedule a viewing at your convenience. I can provide employment verification and references from previous landlords.',
      ownerNote: null,
      approvedAt: null,
      rejectedAt: null,
      moveInDate: '2024-02-01',
      leaseDuration: 12,
      monthlyIncome: 5000,
      occupation: 'Software Engineer',
      references: ['Previous landlord: Mike Johnson - (555) 987-6543', 'Employer: Tech Corp - HR Department']
    },
    {
      id: 2,
      userId: 102,
      userName: 'Emily Chen',
      userEmail: 'emily.chen@example.com',
      userPhone: '+1 (555) 234-5678',
      roomId: 2,
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      requestDate: '2024-01-21T14:15:00Z',
      status: 'pending',
      userNote: 'I am a graduate student at the nearby university looking for a quiet place to study. I have excellent references from previous landlords and can provide proof of financial support from my family.',
      ownerNote: null,
      approvedAt: null,
      rejectedAt: null,
      moveInDate: '2024-02-15',
      leaseDuration: 6,
      monthlyIncome: 2500,
      occupation: 'Graduate Student',
      references: ['Previous landlord: Sarah Wilson - (555) 456-7890', 'University: Academic Advisor']
    },
    {
      id: 3,
      userId: 103,
      userName: 'Michael Rodriguez',
      userEmail: 'michael.r@example.com',
      userPhone: '+1 (555) 345-6789',
      roomId: 3,
      roomName: 'Spacious Shared House Room',
      houseName: 'Green Valley House',
      requestDate: '2024-01-20T09:45:00Z',
      status: 'approved',
      userNote: 'I work from home and need a quiet environment. I am looking for a long-term rental and can provide employment verification.',
      ownerNote: 'Great application! Your background looks excellent and the references checked out. Please contact me to arrange the lease signing and move-in date. Welcome to Green Valley House!',
      approvedAt: '2024-01-21T11:30:00Z',
      rejectedAt: null,
      moveInDate: '2024-02-01',
      leaseDuration: 12,
      monthlyIncome: 4200,
      occupation: 'Remote Developer',
      references: ['Previous landlord: David Park - (555) 678-9012', 'Employer: Remote Tech Inc']
    },
    {
      id: 4,
      userId: 104,
      userName: 'Lisa Thompson',
      userEmail: 'lisa.thompson@example.com',
      userPhone: '+1 (555) 456-7890',
      roomId: 4,
      roomName: 'Luxury Penthouse Room',
      houseName: 'Sunrise Residence',
      requestDate: '2024-01-19T16:20:00Z',
      status: 'rejected',
      userNote: 'I am a finance professional working in the downtown area. Looking for a premium location with city views.',
      ownerNote: 'Thank you for your interest. Unfortunately, we have decided to go with another applicant who applied earlier and met all our requirements. We wish you the best in finding suitable accommodation.',
      approvedAt: null,
      rejectedAt: '2024-01-20T10:15:00Z',
      moveInDate: '2024-01-25',
      leaseDuration: 6,
      monthlyIncome: 6000,
      occupation: 'Finance Manager',
      references: ['Previous landlord: Emma Wilson - (555) 789-0123']
    },
    {
      id: 5,
      userId: 105,
      userName: 'David Kim',
      userEmail: 'david.kim@example.com',
      userPhone: '+1 (555) 567-8901',
      roomId: 1,
      roomName: 'Modern Studio Apartment',
      houseName: 'Sunrise Residence',
      requestDate: '2024-01-18T13:10:00Z',
      status: 'pending',
      userNote: 'I am a medical resident looking for a comfortable place close to the hospital. I have a stable income and excellent credit score.',
      ownerNote: null,
      approvedAt: null,
      rejectedAt: null,
      moveInDate: '2024-02-10',
      leaseDuration: 18,
      monthlyIncome: 4500,
      occupation: 'Medical Resident',
      references: ['Hospital HR Department', 'Previous landlord: Tom Rodriguez - (555) 890-1234']
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseData, setResponseData] = useState({
    action: '',
    note: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '📋';
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });

  const handleResponseAction = (request, action) => {
    setSelectedRequest(request);
    setResponseData({
      action: action,
      note: ''
    });
    setShowResponseModal(true);
  };

  const handleSubmitResponse = (e) => {
    e.preventDefault();
    
    const updatedRequest = {
      ...selectedRequest,
      status: responseData.action,
      ownerNote: responseData.note,
      [responseData.action === 'approved' ? 'approvedAt' : 'rejectedAt']: new Date().toISOString()
    };

    setRequests(prev => prev.map(request => 
      request.id === selectedRequest.id ? updatedRequest : request
    ));

    setShowResponseModal(false);
    setSelectedRequest(null);
    setResponseData({ action: '', note: '' });
    
    alert(`Request ${responseData.action} successfully!`);
  };

  const getPriorityScore = (request) => {
    let score = 0;
    
    // Income to rent ratio
    const roomPrice = 250; // This should come from room data
    const incomeRatio = request.monthlyIncome / roomPrice;
    if (incomeRatio >= 3) score += 30;
    else if (incomeRatio >= 2.5) score += 20;
    else if (incomeRatio >= 2) score += 10;
    
    // Lease duration
    if (request.leaseDuration >= 12) score += 25;
    else if (request.leaseDuration >= 6) score += 15;
    else score += 5;
    
    // References
    score += Math.min(request.references.length * 10, 20);
    
    // Application completeness
    if (request.userNote.length > 100) score += 15;
    if (request.occupation) score += 10;
    
    return Math.min(score, 100);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rental Requests</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Review and manage rental applications from potential tenants
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {pendingCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Requests', count: requests.length },
              { key: 'pending', label: 'Pending', count: pendingCount },
              { key: 'approved', label: 'Approved', count: approvedCount },
              { key: 'rejected', label: 'Rejected', count: rejectedCount }
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29.82-5.877 2.172M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.875a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const priorityScore = getPriorityScore(request);
            return (
              <div key={request.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                    {/* Applicant Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {request.userName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {request.userEmail}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {request.userPhone}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Applied: {formatDate(request.requestDate)}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Priority Score
                            </div>
                            <div className={`text-lg font-bold ${
                              priorityScore >= 80 ? 'text-green-600' :
                              priorityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {priorityScore}/100
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                            <span className="mr-1">{getStatusIcon(request.status)}</span>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Room Info */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Requested Room
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p><span className="font-medium">Room:</span> {request.roomName}</p>
                          <p><span className="font-medium">Property:</span> {request.houseName}</p>
                          <p><span className="font-medium">Desired Move-in:</span> {new Date(request.moveInDate).toLocaleDateString()}</p>
                          <p><span className="font-medium">Lease Duration:</span> {request.leaseDuration} months</p>
                        </div>
                      </div>

                      {/* Applicant Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Financial Information
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p><span className="font-medium">Occupation:</span> {request.occupation}</p>
                            <p><span className="font-medium">Monthly Income:</span> {formatPrice(request.monthlyIncome)}</p>
                            <p><span className="font-medium">Income Ratio:</span> {(request.monthlyIncome / 250).toFixed(1)}x rent</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            References
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {request.references.map((reference, index) => (
                              <p key={index}>• {reference}</p>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Applicant Message */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Applicant Message
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          {request.userNote}
                        </p>
                      </div>

                      {/* Owner Response */}
                      {request.ownerNote && (
                        <div className={`border-l-4 pl-4 ${
                          request.status === 'approved' 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        } p-3 rounded-r-lg`}>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Your Response
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {request.ownerNote}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Responded: {formatDate(request.approvedAt || request.rejectedAt)}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      {request.status === 'pending' && (
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => handleResponseAction(request, 'approved')}
                            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                          <button
                            onClick={() => handleResponseAction(request, 'rejected')}
                            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>
                          <Link
                            href={`mailto:${request.userEmail}`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Contact
                          </Link>
                        </div>
                      )}

                      {request.status === 'approved' && (
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <Link
                            href={`/owner/contracts/new?request=${request.id}`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29.82-5.877 2.172M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.875a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                            </svg>
                            Create Contract
                          </Link>
                          <Link
                            href={`mailto:${request.userEmail}`}
                            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Contact Tenant
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No requests found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'all' 
                ? "You don't have any rental requests yet."
                : `No ${activeTab} requests found.`
              }
            </p>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Show All Requests
              </button>
            )}
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {responseData.action === 'approved' ? 'Approve' : 'Reject'} Request
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

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {selectedRequest.userName}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedRequest.roomName} - {selectedRequest.houseName}
                </p>
              </div>

              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Response Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={responseData.note}
                    onChange={(e) => setResponseData(prev => ({ ...prev, note: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={
                      responseData.action === 'approved' 
                        ? "Welcome the new tenant and provide next steps..."
                        : "Politely explain the reason for rejection..."
                    }
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
                    className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors text-white ${
                      responseData.action === 'approved'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {responseData.action === 'approved' ? 'Approve Request' : 'Reject Request'}
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