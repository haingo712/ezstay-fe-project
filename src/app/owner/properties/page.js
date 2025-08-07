'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PropertiesPage() {
  const [mounted, setMounted] = useState(false);
  const [properties, setProperties] = useState([
    {
      id: 1,
      houseName: 'Sunrise Residence',
      description: 'Modern apartment complex with excellent amenities in downtown area',
      fullAddress: '123 Main Street, Downtown District, New York, NY 10001',
      totalRooms: 6,
      occupiedRooms: 5,
      vacantRooms: 1,
      monthlyRevenue: 1500,
      averageRating: 4.8,
      totalReviews: 42,
      createdAt: '2023-01-15',
      image: '/api/placeholder/400/300',
      amenities: ['WiFi', 'Parking', 'Gym', 'Laundry', 'Security'],
      status: 'active'
    },
    {
      id: 2,
      houseName: 'Student Haven',
      description: 'Perfect accommodation for students near university campus',
      fullAddress: '456 University Ave, University Area, Boston, MA 02115',
      totalRooms: 4,
      occupiedRooms: 3,
      vacantRooms: 1,
      monthlyRevenue: 720,
      averageRating: 4.6,
      totalReviews: 28,
      createdAt: '2023-03-20',
      image: '/api/placeholder/400/300',
      amenities: ['WiFi', 'Study Room', 'Kitchen Access', 'Bike Storage'],
      status: 'active'
    },
    {
      id: 3,
      houseName: 'Green Valley House',
      description: 'Peaceful residential house with garden in quiet neighborhood',
      fullAddress: '789 Green Valley Rd, Residential Area, Seattle, WA 98101',
      totalRooms: 2,
      occupiedRooms: 0,
      vacantRooms: 2,
      monthlyRevenue: 0,
      averageRating: 4.2,
      totalReviews: 15,
      createdAt: '2023-06-10',
      image: '/api/placeholder/400/300',
      amenities: ['WiFi', 'Garden', 'Kitchen Access', 'Parking'],
      status: 'maintenance'
    }
  ]);

  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyData, setPropertyData] = useState({
    houseName: '',
    description: '',
    fullAddress: '',
    amenities: []
  });

  const [availableAmenities] = useState([
    'WiFi', 'Parking', 'Gym', 'Laundry', 'Security', 'Pool', 'Garden',
    'Kitchen Access', 'Study Room', 'Bike Storage', 'Air Conditioning',
    'Heating', 'Elevator', 'Balcony', 'Terrace'
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getOccupancyRate = (property) => {
    if (property.totalRooms === 0) return 0;
    return Math.round((property.occupiedRooms / property.totalRooms) * 100);
  };

  const handleNewProperty = () => {
    setEditingProperty(null);
    setPropertyData({
      houseName: '',
      description: '',
      fullAddress: '',
      amenities: []
    });
    setShowPropertyModal(true);
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setPropertyData({
      houseName: property.houseName,
      description: property.description,
      fullAddress: property.fullAddress,
      amenities: property.amenities
    });
    setShowPropertyModal(true);
  };

  const handleSubmitProperty = (e) => {
    e.preventDefault();
    
    if (editingProperty) {
      // Update existing property
      setProperties(prev => prev.map(property => 
        property.id === editingProperty.id 
          ? { ...property, ...propertyData }
          : property
      ));
      alert('Property updated successfully!');
    } else {
      // Add new property
      const newProperty = {
        id: properties.length + 1,
        ...propertyData,
        totalRooms: 0,
        occupiedRooms: 0,
        vacantRooms: 0,
        monthlyRevenue: 0,
        averageRating: 0,
        totalReviews: 0,
        createdAt: new Date().toISOString().split('T')[0],
        image: '/api/placeholder/400/300',
        status: 'active'
      };
      setProperties(prev => [newProperty, ...prev]);
      alert('Property created successfully!');
    }

    setShowPropertyModal(false);
    setEditingProperty(null);
    setPropertyData({ houseName: '', description: '', fullAddress: '', amenities: [] });
  };

  const handleDeleteProperty = (propertyId) => {
    if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      setProperties(prev => prev.filter(property => property.id !== propertyId));
      alert('Property deleted successfully!');
    }
  };

  const handleAmenityToggle = (amenity) => {
    setPropertyData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalProperties = properties.length;
  const totalRooms = properties.reduce((sum, property) => sum + property.totalRooms, 0);
  const totalRevenue = properties.reduce((sum, property) => sum + property.monthlyRevenue, 0);
  const averageOccupancy = totalRooms > 0 
    ? Math.round(properties.reduce((sum, property) => sum + property.occupiedRooms, 0) / totalRooms * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Properties Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your rental properties and their details
              </p>
            </div>
            <button
              onClick={handleNewProperty}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Property
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProperties}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRooms}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Occupancy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageOccupancy}%</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Properties List */}
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Property Image */}
              <div className="h-48 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-6xl">🏠</span>
              </div>

              {/* Property Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {property.houseName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      📍 {property.fullAddress}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {property.description}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Property Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{property.totalRooms}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Rooms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{getOccupancyRate(property)}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Occupancy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatPrice(property.monthlyRevenue)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                  </div>
                </div>

                {/* Room Status */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <span className="text-green-600 dark:text-green-400">
                    {property.occupiedRooms} Occupied
                  </span>
                  <span className="text-yellow-600 dark:text-yellow-400">
                    {property.vacantRooms} Vacant
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {property.averageRating}⭐ ({property.totalReviews})
                  </span>
                </div>

                {/* Amenities */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {property.amenities.slice(0, 4).map((amenity, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300">
                        {amenity}
                      </span>
                    ))}
                    {property.amenities.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300">
                        +{property.amenities.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/owner/rooms?property=${property.id}`}
                    className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                  >
                    Manage Rooms
                  </Link>
                  <button
                    onClick={() => handleEditProperty(property)}
                    className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProperty(property.id)}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                  >
                    Delete
                  </button>
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
              No properties yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start by adding your first property to begin managing your rental business.
            </p>
            <button
              onClick={handleNewProperty}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Property
            </button>
          </div>
        </div>
      )}

      {/* Property Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingProperty ? 'Edit Property' : 'Add New Property'}
                </h3>
                <button
                  onClick={() => setShowPropertyModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitProperty} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={propertyData.houseName}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, houseName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter property name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={propertyData.description}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Describe your property..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Address *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={propertyData.fullAddress}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, fullAddress: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter complete address..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableAmenities.map((amenity) => (
                      <label key={amenity} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={propertyData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {amenity}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPropertyModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    {editingProperty ? 'Update Property' : 'Create Property'}
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