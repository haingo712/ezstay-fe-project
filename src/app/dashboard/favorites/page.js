'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FavoritesPage() {
  const [mounted, setMounted] = useState(false);
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      roomName: 'Modern Studio Apartment',
      houseName: 'Sunrise Residence',
      location: 'Downtown District, New York',
      price: 250,
      area: 35,
      maxTenants: 2,
      rating: 4.8,
      totalReviews: 24,
      image: '/api/placeholder/400/300',
      isAvailable: true,
      addedDate: '2024-01-15',
      amenities: ['WiFi', 'Parking', 'Laundry', 'Gym'],
      description: 'Beautiful modern studio with great city views and all amenities included.'
    },
    {
      id: 2,
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      location: 'University Area, Boston',
      price: 180,
      area: 20,
      maxTenants: 1,
      rating: 4.6,
      totalReviews: 18,
      image: '/api/placeholder/400/300',
      isAvailable: true,
      addedDate: '2024-01-10',
      amenities: ['WiFi', 'Kitchen Access', 'Study Room'],
      description: 'Perfect for students, walking distance to campus with study-friendly environment.'
    },
    {
      id: 3,
      roomName: 'Spacious Shared House',
      houseName: 'Green Valley House',
      location: 'Residential Area, Seattle',
      price: 200,
      area: 45,
      maxTenants: 3,
      rating: 4.7,
      totalReviews: 31,
      image: '/api/placeholder/400/300',
      isAvailable: false,
      addedDate: '2024-01-05',
      amenities: ['WiFi', 'Parking', 'Garden', 'Kitchen Access'],
      description: 'Large shared house with beautiful garden and friendly housemates.'
    },
    {
      id: 4,
      roomName: 'Luxury Penthouse Room',
      houseName: 'Sky Tower',
      location: 'Financial District, San Francisco',
      price: 350,
      area: 50,
      maxTenants: 2,
      rating: 4.9,
      totalReviews: 42,
      image: '/api/placeholder/400/300',
      isAvailable: true,
      addedDate: '2024-01-01',
      amenities: ['WiFi', 'Parking', 'Gym', 'Pool', 'Concierge'],
      description: 'Luxury living with panoramic city views and premium amenities.'
    },
    {
      id: 5,
      roomName: 'Artistic Loft Space',
      houseName: 'Creative Hub',
      location: 'Arts District, Los Angeles',
      price: 280,
      area: 40,
      maxTenants: 2,
      rating: 4.5,
      totalReviews: 15,
      image: '/api/placeholder/400/300',
      isAvailable: true,
      addedDate: '2023-12-28',
      amenities: ['WiFi', 'Art Studio', 'High Ceilings', 'Natural Light'],
      description: 'Inspiring loft space perfect for creative professionals and artists.'
    }
  ]);

  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  const removeFavorite = (roomId) => {
    setFavorites(prev => prev.filter(room => room.id !== roomId));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const getSortedAndFilteredFavorites = () => {
    let filtered = favorites;

    // Apply filter
    if (filterBy === 'available') {
      filtered = filtered.filter(room => room.isAvailable);
    } else if (filterBy === 'unavailable') {
      filtered = filtered.filter(room => !room.isAvailable);
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.addedDate) - new Date(a.addedDate);
        case 'oldest':
          return new Date(a.addedDate) - new Date(b.addedDate);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return sorted;
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const sortedFavorites = getSortedAndFilteredFavorites();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Favorites</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {favorites.length} room{favorites.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Rooms</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites List */}
      {sortedFavorites.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedFavorites.map((room) => (
            <div key={room.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex">
                {/* Image */}
                <div className="w-48 h-48 flex-shrink-0 relative">
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-4xl">🏠</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      room.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {room.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFavorite(room.id)}
                    className="absolute top-2 left-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="Remove from favorites"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {room.roomName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {room.houseName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      📍 {room.location}
                    </p>
                    
                    <div className="flex items-center mb-3">
                      {renderStars(room.rating)}
                      <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                        ({room.totalReviews})
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {room.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {room.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300">
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300">
                          +{room.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {formatPrice(room.price)}/month
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {room.area}m² • {room.maxTenants} people
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Added {new Date(room.addedDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/rooms/${room.id}`}
                        className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                      >
                        View Details
                      </Link>
                      {room.isAvailable && (
                        <Link
                          href={`/dashboard/requests?room=${room.id}`}
                          className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                        >
                          Request Rental
                        </Link>
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
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No favorites found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {filterBy === 'all' 
                ? "You haven't saved any rooms yet. Start exploring to find your perfect place!"
                : `No ${filterBy} rooms in your favorites.`
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
              {filterBy !== 'all' && (
                <button
                  onClick={() => setFilterBy('all')}
                  className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Show All Favorites
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {favorites.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Favorites Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {favorites.filter(room => room.isAvailable).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Available Rooms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatPrice(favorites.reduce((sum, room) => sum + room.price, 0) / favorites.length)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {(favorites.reduce((sum, room) => sum + room.rating, 0) / favorites.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}