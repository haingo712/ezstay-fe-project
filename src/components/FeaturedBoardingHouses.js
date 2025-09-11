'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import boardingHouseService from '../services/boardingHouseService';

export default function FeaturedBoardingHouses() {
  const [boardingHouses, setBoardingHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadBoardingHouses();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Không hiển thị gì cả nếu user chưa đăng nhập
  if (!isAuthenticated) {
    return null;
  }

  const handleViewDetails = (houseId) => {
    router.push(`/boarding-houses/${houseId}`);
  };

  const loadBoardingHouses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API thật từ backend
      const response = await boardingHouseService.getAll();
      setBoardingHouses(response.slice(0, 6)); // Chỉ lấy 6 nhà trọ đầu tiên
    } catch (err) {
      console.error('Error loading boarding houses:', err);
      setError('Unable to load boarding houses');
      setBoardingHouses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Nhà trọ nổi bật
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-300 dark:bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Boarding Houses
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            High-quality boarding houses with excellent amenities
          </p>
        </div>

        {error && (
          <div className="text-center mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boardingHouses.map(house => (
            <div key={house.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow hover:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all flex flex-col h-full">
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
        
        <div className="flex justify-center mt-8">
          <Link 
            href="/boarding-houses" 
            className="inline-block px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold text-base"
          >
            View All Boarding Houses
          </Link>
        </div>
      </div>
    </section>
  );
}
