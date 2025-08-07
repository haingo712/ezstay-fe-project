'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RequestsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [requests, setRequests] = useState([
    {
      id: 1,
      roomName: 'Modern Studio Apartment',
      houseName: 'Sunrise Residence',
      location: 'Downtown District, New York',
      price: 250,
      landlordName: 'Sarah Johnson',
      landlordPhone: '+1 (555) 123-4567',
      status: 'pending',
      requestDate: '2024-01-20',
      responseDate: null,
      userNote: 'Hi! I am very interested in this room. I am a clean and responsible tenant with stable income. I would love to schedule a viewing at your convenience.',
      ownerNote: null,
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      location: 'University Area, Boston',
      price: 180,
      landlordName: 'Mike Chen',
      landlordPhone: '+1 (555) 987-6543',
      status: 'approved',
      requestDate: '2024-01-18',
      responseDate: '2024-01-19',
      userNote: 'I am a graduate student looking for a quiet place to study. I have excellent references from previous landlords.',
      ownerNote: 'Great! Your application looks good. Please contact me to arrange the lease signing and move-in date.',
      image: '/api/placeholder/300/200'
    },
    {
      id: 3,
      roomName: 'Spacious Shared House',
      houseName: 'Green Valley House',
      location: 'Residential Area, Seattle',
      price: 200,
      landlordName: 'Emma Wilson',
      landlordPhone: '+1 (555) 456-7890',
      status: 'rejected',
      requestDate: '2024-01-15',
      responseDate: '2024-01-16',
      userNote: 'I am looking for a long-term rental. I work from home and need a quiet environment.',
      ownerNote: 'Thank you for your interest. Unfortunately, we have decided to go with another applicant who applied earlier.',
      image: '/api/placeholder/300/200'
    },
    {
      id: 4,
      roomName: 'Luxury Penthouse Room',
      houseName: 'Sky Tower',
      location: 'Financial District, San Francisco',
      price: 350,
      landlordName: 'David Park',
      landlordPhone: '+1 (555) 321-0987',
      status: 'pending',
      requestDate: '2024-01-22',
      responseDate: null,
      userNote: 'I am a finance professional working in the area. I can provide employment verification and references. Looking for immediate move-in.',
      ownerNote: null,
      image: '/api/placeholder/300/200'
    }
  ]);

  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    roomId: '',
    userNote: '',
    moveInDate: '',
    leaseDuration: '12'
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

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });

  const handleNewRequest = (e) => {
    e.preventDefault();
    // Here you would typically send the request to your backend
    const request = {
      id: requests.length + 1,
      ...newRequest,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
      responseDate: null,
      ownerNote: null
    };
    setRequests(prev => [request, ...prev]);
    setNewRequest({ roomId: '', userNote: '', moveInDate: '', leaseDuration: '12' });
    setShowNewRequestModal(false);
    alert('Rental request sent successfully!');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rental Requests</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your room rental applications
              </p>
            </div>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Request
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Requests', count: requests.length },
              { key: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
              { key: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length },
              { key: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length }
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

      {/* Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  {/* Room Image */}
                  <div className="w-full lg:w-48 h-32 lg:h-36 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center mb-4 lg:mb-0 flex-shrink-0">
                    <span className="text-4xl">🏠</span>
                  </div>

                  {/* Request Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {request.roomName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {request.houseName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          📍 {request.location}
                        </p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                          {formatPrice(request.price)}/month
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                          <span className="mr-1">{getStatusIcon(request.status)}</span>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Request Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Request Details
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p><span className="font-medium">Submitted:</span> {new Date(request.requestDate).toLocaleDateString()}</p>
                          {request.responseDate && (
                            <p><span className="font-medium">Responded:</span> {new Date(request.responseDate).toLocaleDateString()}</p>
                          )}
                          <p><span className="font-medium">Landlord:</span> {request.landlordName}</p>
                          <p><span className="font-medium">Contact:</span> {request.landlordPhone}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Your Message
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                          {request.userNote}
                        </p>
                      </div>
                    </div>

                    {/* Owner Response */}
                    {request.ownerNote && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Landlord Response
                        </h4>
                        <div className={`p-3 rounded-lg ${
                          request.status === 'approved' 
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                        }`}>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {request.ownerNote}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        href={`/rooms/${request.id}`}
                        className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Room
                      </Link>
                      
                      {request.status === 'approved' && (
                        <Link
                          href={`/dashboard/contracts?request=${request.id}`}
                          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29.82-5.877 2.172M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.875a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                          </svg>
                          View Contract
                        </Link>
                      )}

                      {request.status === 'pending' && (
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this request?')) {
                              setRequests(prev => prev.filter(r => r.id !== request.id));
                            }
                          }}
                          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel Request
                        </button>
                      )}
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
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No requests found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'all' 
                ? "You haven't submitted any rental requests yet."
                : `No ${activeTab} requests found.`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/search"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Rooms
              </Link>
              {activeTab !== 'all' && (
                <button
                  onClick={() => setActiveTab('all')}
                  className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Show All Requests
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  New Rental Request
                </h3>
                <button
                  onClick={() => setShowNewRequestModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleNewRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room ID
                  </label>
                  <input
                    type="text"
                    required
                    value={newRequest.roomId}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, roomId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter room ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Move-in Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newRequest.moveInDate}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, moveInDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lease Duration (months)
                  </label>
                  <select
                    value={newRequest.leaseDuration}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, leaseDuration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message to Landlord
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newRequest.userNote}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, userNote: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Introduce yourself and explain why you're interested in this room..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewRequestModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Send Request
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