'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';
import { boardingHouseAPI, roomAPI, amenityAPI, API_GATEWAY_URL } from '../../utils/api';
import authService from '../../services/authService';

// Component con cho Boarding House Card
const BoardingHouseCard = ({ house, onEdit, onDelete, onClick }) => (
  <div
    className="border dark:border-gray-600 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer group"
    onClick={() => onClick()}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {house.name}
          </h3>
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
            Active
          </span>
        </div>

        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm">{house.address}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Units</p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{house.totalRooms || 0}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Rented</p>
            <p className="text-lg font-bold text-green-900 dark:text-green-100">{house.occupiedRooms || 0}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3">
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Vacant</p>
            <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">{(house.totalRooms || 0) - (house.occupiedRooms || 0)}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Income</p>
            <p className="text-sm font-bold text-purple-900 dark:text-purple-100">{(house.monthlyRevenue || 0).toLocaleString()}₫</p>
          </div>
        </div>

        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <span>Created {new Date(house.createdAt).toLocaleDateString()}</span>
          <span className="mx-2">•</span>
          <span>ID: {house.id}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(house);
          }}
          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(house.id);
          }}
          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

// Component for Quick Actions
const QuickAction = ({ icon, title, description, color, onClick }) => {
  const iconMap = {
    plus: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    room: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    bank: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    chart: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    settings: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  };

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200 group"
    >
      <div className={`p-3 rounded-xl mr-4 ${colorClasses[color]} group-hover:scale-110 transition-transform duration-200`}>
        {iconMap[icon]}
      </div>
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </button>
  );
};

// Component for Activity Item
const ActivityItem = ({ type, message, time }) => {
  const typeConfig = {
    inquiry: {
      color: 'bg-blue-500',
      icon: '👋'
    },
    payment: {
      color: 'bg-green-500',
      icon: '💰'
    },
    maintenance: {
      color: 'bg-yellow-500',
      icon: '🔧'
    }
  };

  const config = typeConfig[type] || typeConfig.inquiry;

  return (
    <div className="flex items-start space-x-3">
      <div className={`w-2 h-2 ${config.color} rounded-full mt-2 flex-shrink-0`}></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white">{message}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
};

// Component for Room List
const RoomList = ({ houseId }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        const roomData = await roomAPI.getByHouseId(houseId);
        setRooms(roomData);
      } catch (error) {
        console.error('Error loading rooms:', error);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    if (houseId) {
      loadRooms();
    }
  }, [houseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Units Yet</h4>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Start creating units for this boarding house</p>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
          Create First Unit
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <div key={room.id} className="border dark:border-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white">{room.name}</h4>
            <span className={`px-2 py-1 text-xs rounded-full ${room.isAvailable
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              }`}>
              {room.isAvailable ? 'Vacant' : 'Rented'}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Area: {room.area}m²
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {room.price?.toLocaleString()}₫/month
          </p>
        </div>
      ))}
    </div>
  );
};

// Mock Modal Components (will implement detailed functionality later)
const AddBoardingHouseModal = ({ isOpen, onClose, onSuccess, editHouse }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {editHouse ? 'Edit' : 'Create'} Boarding House
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Form implementation coming soon...
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSuccess();
              onClose();
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const AddRoomModal = ({ isOpen, onClose, onSuccess, boardingHouses, selectedHouseId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create Room
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Form implementation coming soon...
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSuccess();
              onClose();
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OwnerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // State management
  const [ownerId, setOwnerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boardingHouses, setBoardingHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [showAddHouseModal, setShowAddHouseModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    monthlyRevenue: 0,
  });

  const loadDashboardData = useCallback(async () => {
    if (!ownerId) {
      console.log("❌ No ownerId provided, skipping load");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🏠 [Owner Dashboard] Loading boarding houses for owner:", ownerId);
      console.log("🌐 API Gateway URL:", API_GATEWAY_URL);

      // Check if we have token
      const token = authService.getToken();
      console.log("🔑 Token exists:", !!token);
      if (token) {
        console.log("🔍 Token payload:", JSON.parse(atob(token.split('.')[1])));
      }

      // Load boarding houses for current owner
      const houses = await boardingHouseAPI.getByOwnerId(ownerId);
      console.log("✅ [Owner Dashboard] Successfully loaded boarding houses:", houses);
      setBoardingHouses(houses);

      // Calculate real-time statistics from data
      let totalRooms = 0;
      let occupiedRooms = 0;
      let totalRevenue = 0;

      for (const house of houses) {
        try {
          const rooms = await roomAPI.getByHouseId(house.id);
          totalRooms += rooms.length;

          rooms.forEach(room => {
            if (!room.isAvailable) {
              occupiedRooms++;
              totalRevenue += room.price || 0;
            }
          });
        } catch (error) {
          console.error(`Error loading rooms for house ${house.id}:`, error);
        }
      }

      setStats({
        totalProperties: houses.length,
        totalRooms,
        occupiedRooms,
        vacantRooms: totalRooms - occupiedRooms,
        monthlyRevenue: totalRevenue,
      });

    } catch (error) {
      console.error('❌ [Owner Dashboard] Error loading boarding houses:', error);
      setError("Unable to load boarding houses. Please check your connection.");

      // Fallback data if API fails
      setBoardingHouses([]);
      setStats({
        totalProperties: 0,
        totalRooms: 0,
        occupiedRooms: 0,
        vacantRooms: 0,
        monthlyRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    if (user && user.id) {
      console.log("👤 User loaded:", user);
      setOwnerId(user.id);
    } else {
      console.log("❌ No user or user.id found:", user);
    }
  }, [user]);

  useEffect(() => {
    if (ownerId) {
      loadDashboardData();
    }
  }, [ownerId, loadDashboardData]);

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute roles={['Owner']}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400">Loading your boarding houses...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error) {
    return (
      <ProtectedRoute roles={['Owner']}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Something went wrong</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={['Owner']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Modern Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Owner Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your boarding houses and rooms
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAddHouseModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Boarding House</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Boarding Houses Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Boarding Houses</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalProperties}</p>
                </div>
                <div className="p-3 bg-blue-200 dark:bg-blue-700 rounded-xl">
                  <svg className="w-7 h-7 text-blue-700 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Rooms Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 rounded-2xl p-6 border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Total Rooms</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.totalRooms}</p>
                </div>
                <div className="p-3 bg-green-200 dark:bg-green-700 rounded-xl">
                  <svg className="w-7 h-7 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Occupied Rooms Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/50 dark:to-yellow-800/50 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">Occupied</p>
                  <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.occupiedRooms}</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    {stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0}% occupancy
                  </p>
                </div>
                <div className="p-3 bg-yellow-200 dark:bg-yellow-700 rounded-xl">
                  <svg className="w-7 h-7 text-yellow-700 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Monthly Revenue Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {stats.monthlyRevenue.toLocaleString()}₫
                  </p>
                </div>
                <div className="p-3 bg-purple-200 dark:bg-purple-700 rounded-xl">
                  <svg className="w-7 h-7 text-purple-700 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Boarding Houses Section - Takes 3/4 of width */}
            <div className="xl:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700">
                <div className="p-6 border-b dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Boarding House Management
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Manage your boarding houses and create rooms
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                      <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {boardingHouses.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-3xl flex items-center justify-center">
                        <svg className="w-16 h-16 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                        Start Your Boarding House Business
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        You haven't added any boarding houses yet. Create your first boarding house to start managing rooms and tenants.
                      </p>
                      <button
                        onClick={() => setShowAddHouseModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Create First Boarding House
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {boardingHouses.map((house) => (
                        <BoardingHouseCard
                          key={house.id}
                          house={house}
                          onEdit={(house) => {
                            setSelectedHouse(house);
                            setShowAddHouseModal(true);
                          }}
                          onDelete={(houseId) => {
                            // Handle delete
                            console.log("Delete house:", houseId);
                          }}
                          onClick={() => setSelectedHouse(house)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Sidebar - Takes 1/4 of width */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700">
                <div className="p-6 border-b dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Quick Actions
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  <QuickAction
                    icon="plus"
                    title="New Boarding House"
                    description="Create boarding house"
                    color="blue"
                    onClick={() => setShowAddHouseModal(true)}
                  />
                  <QuickAction
                    icon="room"
                    title="Create Room"
                    description="Add room to house"
                    color="green"
                    onClick={() => {
                      if (boardingHouses.length === 0) {
                        alert("Please create a boarding house first");
                        return;
                      }
                      setShowAddRoomModal(true);
                    }}
                  />
                  <QuickAction
                    icon="bank"
                    title="Bank Account"
                    description="Manage payment account"
                    color="purple"
                    onClick={() => router.push('/owner/bank-account')}
                  />
                  <QuickAction
                    icon="chart"
                    title="Reports"
                    description="View analytics"
                    color="yellow"
                    onClick={() => alert("Reports coming soon!")}
                  />
                  <QuickAction
                    icon="settings"
                    title="Account Settings"
                    description="Manage profile"
                    color="gray"
                    onClick={() => router.push('/profile')}
                  />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700">
                <div className="p-6 border-b dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <ActivityItem
                      type="inquiry"
                      message="New tenant inquiry received"
                      time="2 hours ago"
                    />
                    <ActivityItem
                      type="payment"
                      message="Monthly rent payment received"
                      time="1 day ago"
                    />
                    <ActivityItem
                      type="maintenance"
                      message="Room maintenance request submitted"
                      time="2 days ago"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showAddHouseModal && (
          <AddBoardingHouseModal
            isOpen={showAddHouseModal}
            onClose={() => {
              setShowAddHouseModal(false);
              setSelectedHouse(null);
            }}
            onSuccess={loadDashboardData}
            editHouse={selectedHouse}
          />
        )}

        {showAddRoomModal && (
          <AddRoomModal
            isOpen={showAddRoomModal}
            onClose={() => setShowAddRoomModal(false)}
            onSuccess={loadDashboardData}
            boardingHouses={boardingHouses}
            selectedHouseId={selectedHouse?.id}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
