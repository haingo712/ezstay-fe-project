'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HistoryPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [rentalHistory, setRentalHistory] = useState([
    {
      id: 1,
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      location: 'University Area, Boston',
      landlordName: 'Mike Chen',
      landlordPhone: '+1 (555) 987-6543',
      price: 180,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      contractId: 'CT-2024-001',
      totalPaid: 1800,
      remainingMonths: 10,
      image: '/api/placeholder/300/200',
      amenities: ['WiFi', 'Kitchen Access', 'Study Room'],
      address: '123 University Ave, Boston, MA 02115'
    },
    {
      id: 2,
      roomName: 'Modern Studio Apartment',
      houseName: 'Downtown Loft',
      location: 'Downtown District, New York',
      landlordName: 'Sarah Johnson',
      landlordPhone: '+1 (555) 123-4567',
      price: 280,
      startDate: '2023-06-01',
      endDate: '2023-12-31',
      status: 'completed',
      contractId: 'CT-2023-045',
      totalPaid: 1960,
      remainingMonths: 0,
      image: '/api/placeholder/300/200',
      amenities: ['WiFi', 'Parking', 'Gym', 'Laundry'],
      address: '456 Main St, New York, NY 10001',
      rating: 5,
      review: 'Excellent place with great amenities. The landlord was very responsive and helpful.'
    },
    {
      id: 3,
      roomName: 'Shared House Room',
      houseName: 'Green Valley House',
      location: 'Residential Area, Seattle',
      landlordName: 'Emma Wilson',
      landlordPhone: '+1 (555) 456-7890',
      price: 200,
      startDate: '2022-09-01',
      endDate: '2023-05-31',
      status: 'completed',
      contractId: 'CT-2022-123',
      totalPaid: 1800,
      remainingMonths: 0,
      image: '/api/placeholder/300/200',
      amenities: ['WiFi', 'Garden', 'Kitchen Access'],
      address: '789 Green Valley Rd, Seattle, WA 98101',
      rating: 4,
      review: 'Nice quiet neighborhood, good for families. House was well-maintained.'
    },
    {
      id: 4,
      roomName: 'Budget Room',
      houseName: 'Economy Stay',
      location: 'Suburbs, Chicago',
      landlordName: 'Tom Rodriguez',
      landlordPhone: '+1 (555) 789-0123',
      price: 150,
      startDate: '2022-01-01',
      endDate: '2022-08-31',
      status: 'terminated',
      contractId: 'CT-2022-067',
      totalPaid: 1200,
      remainingMonths: 0,
      image: '/api/placeholder/300/200',
      amenities: ['WiFi', 'Shared Kitchen'],
      address: '321 Suburb Lane, Chicago, IL 60601',
      terminationReason: 'Early termination due to job relocation'
    }
  ]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    review: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return '🏠';
      case 'completed':
        return '✅';
      case 'terminated':
        return '❌';
      default:
        return '📋';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const filteredHistory = rentalHistory.filter(rental => {
    if (activeTab === 'current') return rental.status === 'active';
    if (activeTab === 'completed') return rental.status === 'completed';
    if (activeTab === 'terminated') return rental.status === 'terminated';
    return true;
  });

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    // Update the rental with review data
    setRentalHistory(prev => prev.map(rental => 
      rental.id === selectedRental.id 
        ? { ...rental, rating: reviewData.rating, review: reviewData.review }
        : rental
    ));
    setShowReviewModal(false);
    setSelectedRental(null);
    setReviewData({ rating: 5, review: '' });
    alert('Review submitted successfully!');
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rental History</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track your current and past rentals
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/search"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find New Room
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Rentals', count: rentalHistory.length },
              { key: 'current', label: 'Current', count: rentalHistory.filter(r => r.status === 'active').length },
              { key: 'completed', label: 'Completed', count: rentalHistory.filter(r => r.status === 'completed').length },
              { key: 'terminated', label: 'Terminated', count: rentalHistory.filter(r => r.status === 'terminated').length }
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
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rentals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{rentalHistory.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(rentalHistory.reduce((sum, rental) => sum + rental.totalPaid, 0))}
              </p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Rentals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rentalHistory.filter(r => r.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rentalHistory.filter(r => r.rating).length > 0 
                  ? (rentalHistory.filter(r => r.rating).reduce((sum, r) => sum + r.rating, 0) / rentalHistory.filter(r => r.rating).length).toFixed(1)
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rental History List */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-6">
          {filteredHistory.map((rental) => (
            <div key={rental.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  {/* Room Image */}
                  <div className="w-full lg:w-48 h-32 lg:h-36 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center mb-4 lg:mb-0 flex-shrink-0">
                    <span className="text-4xl">🏠</span>
                  </div>

                  {/* Rental Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {rental.roomName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {rental.houseName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          📍 {rental.location}
                        </p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                          {formatPrice(rental.price)}/month
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(rental.status)}`}>
                          <span className="mr-1">{getStatusIcon(rental.status)}</span>
                          {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Rental Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Rental Period
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p><span className="font-medium">Start:</span> {formatDate(rental.startDate)}</p>
                          <p><span className="font-medium">End:</span> {formatDate(rental.endDate)}</p>
                          <p><span className="font-medium">Contract:</span> {rental.contractId}</p>
                          {rental.status === 'active' && (
                            <p><span className="font-medium">Remaining:</span> {rental.remainingMonths} months</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Landlord Info
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p><span className="font-medium">Name:</span> {rental.landlordName}</p>
                          <p><span className="font-medium">Phone:</span> {rental.landlordPhone}</p>
                          <p><span className="font-medium">Total Paid:</span> {formatPrice(rental.totalPaid)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Amenities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {rental.amenities.map((amenity, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Review Section */}
                    {rental.rating && rental.review && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Your Review
                        </h4>
                        <div className="flex items-center mb-2">
                          {renderStars(rental.rating)}
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                            ({rental.rating}/5)
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {rental.review}
                        </p>
                      </div>
                    )}

                    {/* Termination Reason */}
                    {rental.terminationReason && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Termination Reason
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {rental.terminationReason}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        href={`/rooms/${rental.id}`}
                        className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Room
                      </Link>

                      {rental.status === 'active' && (
                        <Link
                          href={`/dashboard/bills?rental=${rental.id}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          View Bills
                        </Link>
                      )}

                      {rental.status === 'completed' && !rental.rating && (
                        <button
                          onClick={() => {
                            setSelectedRental(rental);
                            setShowReviewModal(true);
                          }}
                          className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          Write Review
                        </button>
                      )}

                      <Link
                        href={`/dashboard/contracts/${rental.contractId}`}
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29.82-5.877 2.172M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.875a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                        </svg>
                        View Contract
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
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No rental history found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'all' 
                ? "You haven't rented any rooms yet."
                : `No ${activeTab} rentals found.`
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
                  Show All History
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedRental && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Write Review
                </h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {selectedRental.roomName}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedRental.houseName}
                </p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                        className={`text-2xl ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewData.review}
                    onChange={(e) => setReviewData(prev => ({ ...prev, review: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Share your experience with this rental..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Submit Review
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