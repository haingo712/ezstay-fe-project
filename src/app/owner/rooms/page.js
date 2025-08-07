'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RoomsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [rooms, setRooms] = useState([
    {
      id: 1,
      roomName: 'Modern Studio Apartment',
      houseId: 1,
      houseName: 'Sunrise Residence',
      houseLocationId: 1,
      area: 35,
      price: 250,
      maxTenants: 2,
      rentalCondition: 'No smoking, no pets. Security deposit required.',
      isAvailable: true,
      createdAt: '2023-01-20',
      currentTenant: null,
      amenities: ['WiFi', 'Parking', 'Laundry', 'Gym'],
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      views: 156,
      inquiries: 23,
      rating: 4.8,
      reviews: 24
    },
    {
      id: 2,
      roomName: 'Cozy Room Near University',
      houseId: 2,
      houseName: 'Student Haven',
      houseLocationId: 2,
      area: 20,
      price: 180,
      maxTenants: 1,
      rentalCondition: 'Students preferred. Quiet hours after 10 PM.',
      isAvailable: false,
      createdAt: '2023-02-15',
      currentTenant: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        moveInDate: '2023-12-01'
      },
      amenities: ['WiFi', 'Kitchen Access', 'Study Room'],
      images: ['/api/placeholder/400/300'],
      views: 89,
      inquiries: 12,
      rating: 4.6,
      reviews: 18
    },
    {
      id: 3,
      roomName: 'Spacious Shared House Room',
      houseId: 3,
      houseName: 'Green Valley House',
      houseLocationId: 3,
      area: 45,
      price: 200,
      maxTenants: 3,
      rentalCondition: 'Shared common areas. Cleaning schedule required.',
      isAvailable: true,
      createdAt: '2023-03-10',
      currentTenant: null,
      amenities: ['WiFi', 'Garden', 'Kitchen Access', 'Parking'],
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      views: 67,
      inquiries: 8,
      rating: 4.7,
      reviews: 31
    },
    {
      id: 4,
      roomName: 'Luxury Penthouse Room',
      houseId: 1,
      houseName: 'Sunrise Residence',
      houseLocationId: 1,
      area: 50,
      price: 350,
      maxTenants: 2,
      rentalCondition: 'Premium location with city views. Professional tenants preferred.',
      isAvailable: false,
      createdAt: '2023-04-05',
      currentTenant: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1 (555) 987-6543',
        moveInDate: '2023-11-15'
      },
      amenities: ['WiFi', 'Parking', 'Gym', 'Pool', 'Concierge'],
      images: ['/api/placeholder/400/300'],
      views: 234,
      inquiries: 45,
      rating: 4.9,
      reviews: 42
    }
  ]);

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomData, setRoomData] = useState({
    roomName: '',
    houseId: '',
    area: '',
    price: '',
    maxTenants: 1,
    rentalCondition: '',
    amenities: []
  });

  const [properties] = useState([
    { id: 1, name: 'Sunrise Residence' },
    { id: 2, name: 'Student Haven' },
    { id: 3, name: 'Green Valley House' }
  ]);

  const [availableAmenities] = useState([
    'WiFi', 'Parking', 'Gym', 'Laundry', 'Security', 'Pool', 'Garden',
    'Kitchen Access', 'Study Room', 'Bike Storage', 'Air Conditioning',
    'Heating', 'Elevator', 'Balcony', 'Terrace', 'Concierge'
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

  const filteredRooms = rooms.filter(room => {
    if (activeTab === 'all') return true;
    if (activeTab === 'available') return room.isAvailable;
    if (activeTab === 'occupied') return !room.isAvailable;
    return true;
  });

  const handleNewRoom = () => {
    setEditingRoom(null);
    setRoomData({
      roomName: '',
      houseId: '',
      area: '',
      price: '',
      maxTenants: 1,
      rentalCondition: '',
      amenities: []
    });
    setShowRoomModal(true);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomData({
      roomName: room.roomName,
      houseId: room.houseId,
      area: room.area,
      price: room.price,
      maxTenants: room.maxTenants,
      rentalCondition: room.rentalCondition,
      amenities: room.amenities
    });
    setShowRoomModal(true);
  };

  const handleSubmitRoom = (e) => {
    e.preventDefault();
    
    const selectedProperty = properties.find(p => p.id === parseInt(roomData.houseId));
    
    if (editingRoom) {
      // Update existing room
      setRooms(prev => prev.map(room => 
        room.id === editingRoom.id 
          ? { 
              ...room, 
              ...roomData,
              houseName: selectedProperty?.name || room.houseName,
              area: parseFloat(roomData.area),
              price: parseFloat(roomData.price),
              houseId: parseInt(roomData.houseId)
            }
          : room
      ));
      alert('Room updated successfully!');
    } else {
      // Add new room
      const newRoom = {
        id: rooms.length + 1,
        ...roomData,
        houseName: selectedProperty?.name || 'Unknown Property',
        houseLocationId: parseInt(roomData.houseId),
        area: parseFloat(roomData.area),
        price: parseFloat(roomData.price),
        houseId: parseInt(roomData.houseId),
        isAvailable: true,
        createdAt: new Date().toISOString().split('T')[0],
        currentTenant: null,
        images: ['/api/placeholder/400/300'],
        views: 0,
        inquiries: 0,
        rating: 0,
        reviews: 0
      };
      setRooms(prev => [newRoom, ...prev]);
      alert('Room created successfully!');
    }

    setShowRoomModal(false);
    setEditingRoom(null);
    setRoomData({
      roomName: '',
      houseId: '',
      area: '',
      price: '',
      maxTenants: 1,
      rentalCondition: '',
      amenities: []
    });
  };

  const handleDeleteRoom = (roomId) => {
    if (confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      setRooms(prev => prev.filter(room => room.id !== roomId));
      alert('Room deleted successfully!');
    }
  };

  const handleToggleAvailability = (roomId) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, isAvailable: !room.isAvailable, currentTenant: room.isAvailable ? null : room.currentTenant }
        : room
    ));
  };

  const handleAmenityToggle = (amenity) => {
    setRoomData(prev => ({
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

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.isAvailable).length;
  const occupiedRooms = rooms.filter(r => !r.isAvailable).length;
  const totalRevenue = rooms.filter(r => !r.isAvailable).reduce((sum, room) => sum + room.price, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rooms Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your rental rooms and their availability
              </p>
            </div>
            <button
              onClick={handleNewRoom}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Room
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Rooms', count: totalRooms },
              { key: 'available', label: 'Available', count: availableRooms },
              { key: 'occupied', label: 'Occupied', count: occupiedRooms }
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
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{availableRooms}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Occupied</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{occupiedRooms}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms List */}
      {filteredRooms.length > 0 ? (
        <div className="space-y-4">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  {/* Room Image */}
                  <div className="w-full lg:w-48 h-32 lg:h-36 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center mb-4 lg:mb-0 flex-shrink-0">
                    <span className="text-4xl">🏠</span>
                  </div>

                  {/* Room Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {room.roomName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {room.houseName}
                        </p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                          {formatPrice(room.price)}/month
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          room.isAvailable 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {room.isAvailable ? 'Available' : 'Occupied'}
                        </span>
                      </div>
                    </div>

                    {/* Room Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Room Details
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p><span className="font-medium">Area:</span> {room.area}m²</p>
                          <p><span className="font-medium">Max Tenants:</span> {room.maxTenants}</p>
                          <p><span className="font-medium">Views:</span> {room.views}</p>
                          <p><span className="font-medium">Inquiries:</span> {room.inquiries}</p>
                          {room.rating > 0 && (
                            <p><span className="font-medium">Rating:</span> {room.rating}⭐ ({room.reviews})</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          {room.isAvailable ? 'Rental Conditions' : 'Current Tenant'}
                        </h4>
                        {room.isAvailable ? (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                            {room.rentalCondition}
                          </p>
                        ) : room.currentTenant ? (
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p><span className="font-medium">Name:</span> {room.currentTenant.name}</p>
                            <p><span className="font-medium">Email:</span> {room.currentTenant.email}</p>
                            <p><span className="font-medium">Phone:</span> {room.currentTenant.phone}</p>
                            <p><span className="font-medium">Move-in:</span> {new Date(room.currentTenant.moveInDate).toLocaleDateString()}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No tenant information</p>
                        )}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Amenities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((amenity, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleEditRoom(room)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>

                      <button
                        onClick={() => handleToggleAvailability(room.id)}
                        className={`inline-flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${
                          room.isAvailable
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {room.isAvailable ? 'Mark Occupied' : 'Mark Available'}
                      </button>

                      <Link
                        href={`/owner/posts?room=${room.id}`}
                        className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Manage Posts
                      </Link>

                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
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
              No rooms found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'all' 
                ? "You haven't added any rooms yet."
                : `No ${activeTab} rooms found.`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleNewRoom}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Room
              </button>
              {activeTab !== 'all' && (
                <button
                  onClick={() => setActiveTab('all')}
                  className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Show All Rooms
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </h3>
                <button
                  onClick={() => setShowRoomModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitRoom} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Room Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={roomData.roomName}
                      onChange={(e) => setRoomData(prev => ({ ...prev, roomName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter room name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Property *
                    </label>
                    <select
                      required
                      value={roomData.houseId}
                      onChange={(e) => setRoomData(prev => ({ ...prev, houseId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Property</option>
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Area (m²) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.1"
                      value={roomData.area}
                      onChange={(e) => setRoomData(prev => ({ ...prev, area: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter area"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price (USD/month) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={roomData.price}
                      onChange={(e) => setRoomData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter monthly price"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maximum Tenants *
                    </label>
                    <select
                      value={roomData.maxTenants}
                      onChange={(e) => setRoomData(prev => ({ ...prev, maxTenants: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rental Conditions
                  </label>
                  <textarea
                    rows={4}
                    value={roomData.rentalCondition}
                    onChange={(e) => setRoomData(prev => ({ ...prev, rentalCondition: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter rental conditions and requirements..."
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
                          checked={roomData.amenities.includes(amenity)}
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
                    onClick={() => setShowRoomModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    {editingRoom ? 'Update Room' : 'Create Room'}
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