'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import boardingHouseService from '../../services/boardingHouseService';

export default function BoardingHousesPage() {
  const [boardingHouses, setBoardingHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHouses, setFilteredHouses] = useState([]);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadBoardingHouses();
  }, []);

  useEffect(() => {
    filterHouses();
  }, [searchTerm, boardingHouses]);

  const loadBoardingHouses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API thật từ backend
      const response = await boardingHouseService.getAll();
      setBoardingHouses(response);
    } catch (err) {
      console.error('Error loading boarding houses:', err);
      setError('Unable to load boarding houses');
      setBoardingHouses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (houseId) => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?returnUrl=/boarding-houses/${houseId}`);
      return;
    }
    router.push(`/boarding-houses/${houseId}`);
  };

  const filterHouses = () => {
    if (!searchTerm) {
      setFilteredHouses(boardingHouses);
    } else {
      const filtered = boardingHouses.filter(house =>
        house.houseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (house.description && house.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredHouses(filtered);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Navbar />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              All Boarding Houses
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Discover quality boarding houses with excellent amenities
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search boarding houses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center mb-8">
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Found {filteredHouses.length} boarding houses
            </p>
          </div>

          {/* Boarding Houses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHouses.map(house => (
              <div key={house.id} className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all flex flex-col h-full">
                <div className="relative">
                  <img 
                    src={'https://picsum.photos/400/300?random=' + house.id} 
                    alt={house.houseName} 
                    className="w-full h-48 object-cover" 
                    onError={(e) => {
                      e.target.src = 'https://picsum.photos/400/300?random=1';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Available
                    </span>
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                    {house.houseName}
                  </h3>
                  
                  <div className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2 flex-1">
                    {house.description || 'Quality boarding house with full amenities'}
                  </div>
                  
                  <div className="mt-auto">
                    <div className="text-gray-500 dark:text-gray-400 text-xs mb-3">
                      📅 Created: {new Date(house.createdAt).toLocaleDateString('en-US')}
                    </div>
                    
                    <button 
                      onClick={() => handleViewDetails(house.id)}
                      className="inline-block w-full text-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredHouses.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No boarding houses found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try changing your search keywords
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
