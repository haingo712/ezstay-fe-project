'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import boardingHouseService from '../../../services/boardingHouseService';
import { useAuth } from '../../../hooks/useAuth';

export default function BoardingHouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [boardingHouse, setBoardingHouse] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=/boarding-houses/${params.id}`);
      return;
    }
    
    if (params.id) {
      loadBoardingHouseDetails();
    }
  }, [params.id, isAuthenticated, router]);

  const loadBoardingHouseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API thật từ backend
      const house = await boardingHouseService.getById(params.id);
      
      if (!house) {
        setError('Boarding house not found');
        return;
      }
      
      setBoardingHouse(house);
      
      // TODO: Call rooms API when available
      // For now, set empty rooms array
      setRooms([]);
      
      // Mock rooms data for display (remove when rooms API is ready)
      const mockRooms = [
        {
          id: `room-1-${house.id}`,
          roomName: 'Phòng 101',
          price: 2500000,
          area: 20,
          maxTenants: 2,
          isAvailable: true,
          images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'],
          amenities: ['WiFi', 'Điều hòa', 'Tủ lạnh'],
          description: 'Phòng thoáng mát, đầy đủ tiện nghi'
        },
        {
          id: `room-2-${house.id}`,
          roomName: 'Phòng 102',
          price: 3000000,
          area: 25,
          maxTenants: 3,
          isAvailable: true,
          images: ['https://images.unsplash.com/photo-1560448075-bb485b067938?w=400&h=300&fit=crop'],
          amenities: ['WiFi', 'Điều hòa', 'Tủ lạnh', 'Ban công'],
          description: 'Phòng rộng rãi có ban công'
        },
        {
          id: `room-3-${house.id}`,
          roomName: 'Phòng 103',
          price: 2800000,
          area: 22,
          maxTenants: 2,
          isAvailable: false,
          images: ['https://images.unsplash.com/photo-1540518614846-7eded47ee3ec?w=400&h=300&fit=crop'],
          amenities: ['WiFi', 'Điều hòa', 'Máy nước nóng'],
          description: 'Phòng yên tĩnh, view đẹp'
        },
        {
          id: `room-4-${house.id}`,
          roomName: 'Phòng 201',
          price: 3200000,
          area: 28,
          maxTenants: 4,
          isAvailable: true,
          images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop'],
          amenities: ['WiFi', 'Điều hòa', 'Tủ lạnh', 'Ban công', 'Bếp nhỏ'],
          description: 'Phòng cao cấp với đầy đủ tiện nghi'
        }
      ];
      
      setRooms(mockRooms);
    } catch (err) {
      console.error('Error loading boarding house details:', err);
      setError('Không thể tải thông tin nhà trọ');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Navbar />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
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
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !boardingHouse) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Navbar />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-8">
                <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                  {error || 'Không tìm thấy nhà trọ'}
                </h1>
                <Link 
                  href="/boarding-houses"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  ← Quay lại danh sách nhà trọ
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const availableRooms = rooms.filter(room => room.isAvailable);
  const occupiedRooms = rooms.filter(room => !room.isAvailable);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Trang chủ</Link>
              <span>/</span>
              <Link href="/boarding-houses" className="hover:text-blue-600 dark:hover:text-blue-400">Nhà trọ</Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white">{boardingHouse.houseName}</span>
            </div>
          </nav>

          {/* Boarding House Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
            <div className="relative">
              <img 
                src={boardingHouse.image || 'https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Nha+Tro'} 
                alt={boardingHouse.houseName} 
                className="w-full h-64 md:h-80 object-cover" 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Nha+Tro';
                }}
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {boardingHouse.totalRooms} phòng
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {availableRooms.length} phòng trống
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {boardingHouse.houseName}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Thông tin chủ nhà
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    👤 {boardingHouse.ownerFullName || 'Đang cập nhật'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    📅 Đăng: {new Date(boardingHouse.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Mô tả
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {boardingHouse.description || 'Nhà trọ chất lượng với đầy đủ tiện nghi'}
                  </p>
                </div>
              </div>
              
              {boardingHouse.commonAmenities && boardingHouse.commonAmenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Tiện ích chung
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {boardingHouse.commonAmenities.map((amenity, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full border border-blue-200 dark:border-blue-800"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rooms Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Danh sách phòng trọ
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {rooms.length} phòng ({availableRooms.length} còn trống)
              </div>
            </div>

            {/* Available Rooms */}
            {availableRooms.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Phòng còn trống ({availableRooms.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableRooms.map(room => (
                    <div key={room.id} className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all">
                      <div className="relative">
                        <img 
                          src={room.images[0] || 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Phong+Trong'} 
                          alt={room.roomName} 
                          className="w-full h-48 object-cover" 
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Phong+Trong';
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Còn trống
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {room.roomName}
                        </h4>
                        
                        <div className="text-blue-600 dark:text-blue-400 font-bold text-xl mb-2">
                          {formatPrice(room.price)}/tháng
                        </div>
                        
                        <div className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          📐 {room.area}m² • 👥 {room.maxTenants} người
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                          {room.description}
                        </p>
                        
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {room.amenities.slice(0, 3).map((amenity, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {room.amenities.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                                  +{room.amenities.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <Link 
                          href={`/rooms/${room.id}`} 
                          className="inline-block w-full text-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Occupied Rooms */}
            {occupiedRooms.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Phòng đã thuê ({occupiedRooms.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {occupiedRooms.map(room => (
                    <div key={room.id} className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden opacity-75">
                      <div className="relative">
                        <img 
                          src={room.images[0] || 'https://via.placeholder.com/400x300/EF4444/FFFFFF?text=Da+Thue'} 
                          alt={room.roomName} 
                          className="w-full h-48 object-cover filter grayscale" 
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300/EF4444/FFFFFF?text=Da+Thue';
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            Đã thuê
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {room.roomName}
                        </h4>
                        
                        <div className="text-gray-500 dark:text-gray-400 font-bold text-xl mb-2">
                          {formatPrice(room.price)}/tháng
                        </div>
                        
                        <div className="text-gray-600 dark:text-gray-400 text-sm">
                          📐 {room.area}m² • 👥 {room.maxTenants} người
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Rooms */}
            {rooms.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Chưa có phòng trọ
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Nhà trọ này chưa có phòng nào được đăng
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
