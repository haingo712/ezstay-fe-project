'use client';

import Link from 'next/link';
import { sampleRooms } from '../sampleData/rooms';

export default function FeaturedPosts() {
  // Get first 6 available rooms as featured
  const featuredRooms = sampleRooms.filter(room => room.is_available).slice(0, 6);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  return (
    <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Rooms
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Highly rated rooms in convenient locations
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRooms.map(room => (
            <div key={room.room_id} className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow hover:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all flex flex-col h-full">
              <div className="relative">
                <img 
                  src={room.images[0]?.image_url || '/placeholder-room.jpg'} 
                  alt={room.room_name} 
                  className="w-full h-48 object-cover" 
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Available
                  </span>
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {room.room_name} - {room.house.house_name}
                </h3>
                
                <div className="flex items-center mb-2">
                  {renderStars(Math.floor(room.avg_rating))}
                  <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                    ({room.total_reviews})
                  </span>
                </div>
                
                <div className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  📍 {room.location.full_address.split(',').slice(-2).join(',')}
                </div>
                
                <div className="flex-1"></div>
                
                <div className="mt-auto">
                  <div className="text-blue-600 dark:text-blue-400 font-bold text-xl mb-2">
                    {formatPrice(room.price)}/month
                  </div>
                  
                  <div className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {room.area}m² • {room.max_tenants} people • {room.amenities.length} amenities
                  </div>
                  
                  <Link 
                    href={`/rooms/${room.room_id}`} 
                    className="inline-block w-full text-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <Link 
            href="/search" 
            className="inline-block px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold text-base"
          >
            View All Rooms
          </Link>
        </div>
      </div>
    </section>
  );
}
