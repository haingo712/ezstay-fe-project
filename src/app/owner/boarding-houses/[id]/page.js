"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import boardingHouseService from "@/services/boardingHouseService";
import roomService from "@/services/roomService";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function OwnerBoardingHouseDetail() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const houseId = params.id;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [houseData, setHouseData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    totalContracts: 0,
    activeContracts: 0
  });

  useEffect(() => {
    setMounted(true);
    if (houseId) {
      fetchData();
    }
  }, [houseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch house details
      const houseResponse = await boardingHouseService.getById(houseId);
      setHouseData(houseResponse);

      // Fetch rooms for this house
      const roomsResponse = await roomService.getByBoardingHouseId(houseId);
      setRooms(roomsResponse || []);

      // Calculate stats
      const totalRooms = roomsResponse?.length || 0;
      const occupiedRooms = roomsResponse?.filter(room => room.status === 'Occupied').length || 0;
      const availableRooms = roomsResponse?.filter(room => room.status === 'Available').length || 0;

      setStats({
        totalRooms,
        occupiedRooms,
        availableRooms,
        totalContracts: 0, // This would come from contract service
        activeContracts: 0
      });

    } catch (error) {
      console.error("Error fetching house data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return <div>{t('common.loading')}</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!houseData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('ownerBoardingHouseDetail.notFound.title')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {t('ownerBoardingHouseDetail.notFound.description')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ← {t('common.back')}
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {houseData.houseName}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                houseData.status === 'Active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {houseData.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <strong>📍 {t('ownerBoardingHouseDetail.info.address')}:</strong> {houseData.address}
              </div>
              <div>
                <strong>📞 {t('ownerBoardingHouseDetail.info.phone')}:</strong> {houseData.phoneNumber || 'N/A'}
              </div>
              <div>
                <strong>📧 {t('ownerBoardingHouseDetail.info.email')}:</strong> {houseData.email || 'N/A'}
              </div>
              <div>
                <strong>🏢 {t('ownerBoardingHouseDetail.info.type')}:</strong> {houseData.houseType || 'N/A'}
              </div>
            </div>
            {houseData.description && (
              <p className="mt-4 text-gray-700 dark:text-gray-300">
                {houseData.description}
              </p>
            )}
          </div>
          <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-wrap gap-3">
            <Link
              href={`/owner/boarding-houses/${houseId}/contracts`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              📋 {t('ownerBoardingHouseDetail.actions.manageContracts')}
            </Link>
            <button
              onClick={() => {/* Add edit functionality */}}
              className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
            >
               {t('ownerBoardingHouseDetail.actions.editHouse')}
            </button>
            <button
              onClick={fetchData}
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              🔄 {t('ownerBoardingHouseDetail.actions.refresh')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <div className="text-blue-600 dark:text-blue-400 text-2xl">🏠</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('ownerBoardingHouseDetail.stats.totalRooms')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalRooms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <div className="text-green-600 dark:text-green-400 text-2xl">✅</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('ownerBoardingHouseDetail.stats.available')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.availableRooms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <div className="text-red-600 dark:text-red-400 text-2xl">🚫</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('ownerBoardingHouseDetail.stats.occupied')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.occupiedRooms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <div className="text-purple-600 dark:text-purple-400 text-2xl">📋</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('ownerBoardingHouseDetail.stats.contracts')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalContracts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <div className="text-yellow-600 dark:text-yellow-400 text-2xl">⭐</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('ownerBoardingHouseDetail.stats.occupancyRate')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('ownerBoardingHouseDetail.rooms.title')} ({rooms.length})
            </h2>
            <button
              onClick={() => {/* Add create room functionality */}}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              + {t('ownerBoardingHouseDetail.rooms.addRoom')}
            </button>
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('ownerBoardingHouseDetail.rooms.empty.title')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('ownerBoardingHouseDetail.rooms.empty.description')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {rooms.map((room) => (
              <div key={room.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {room.roomName || `Room ${room.id?.slice(0, 8)}`}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        room.status === 'Available' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : room.status === 'Occupied'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {room.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <strong>💰 {t('ownerBoardingHouseDetail.rooms.price')}:</strong> ${room.pricePerMonth}/{t('common.month')}
                      </div>
                      <div>
                        <strong>📐 {t('ownerBoardingHouseDetail.rooms.area')}:</strong> {room.area}m²
                      </div>
                      <div>
                        <strong>👥 {t('ownerBoardingHouseDetail.rooms.capacity')}:</strong> {room.capacity} {t('ownerBoardingHouseDetail.rooms.people')}
                      </div>
                      <div>
                        <strong>🌟 {t('ownerBoardingHouseDetail.rooms.rating')}:</strong> {room.averageRating || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {/* Add view room functionality */}}
                      className="px-3 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm font-medium"
                    >
                      {t('common.view')}
                    </button>
                    <button
                      onClick={() => {/* Add edit room functionality */}}
                      className="px-3 py-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200 text-sm font-medium"
                    >
                      {t('common.edit')}
                    </button>
                    {room.status === 'Available' && (
                      <button
                        onClick={() => {/* Add create contract functionality */}}
                        className="px-3 py-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 text-sm font-medium"
                      >
                        {t('ownerBoardingHouseDetail.rooms.createContract')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('ownerBoardingHouseDetail.quickActions.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href={`/owner/boarding-houses/${houseId}/contracts`}
            className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <div className="text-blue-600 dark:text-blue-400 text-2xl mr-3">📋</div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{t('ownerBoardingHouseDetail.quickActions.manageContracts')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('ownerBoardingHouseDetail.quickActions.manageContractsDesc')}</p>
            </div>
          </Link>

          <button
            onClick={() => {/* Add room management functionality */}}
            className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
          >
            <div className="text-green-600 dark:text-green-400 text-2xl mr-3">🏠</div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{t('ownerBoardingHouseDetail.quickActions.roomManagement')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('ownerBoardingHouseDetail.quickActions.roomManagementDesc')}</p>
            </div>
          </button>

          <button
            onClick={() => {/* Add tenant management functionality */}}
            className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
          >
            <div className="text-purple-600 dark:text-purple-400 text-2xl mr-3">👥</div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{t('ownerBoardingHouseDetail.quickActions.tenantManagement')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('ownerBoardingHouseDetail.quickActions.tenantManagementDesc')}</p>
            </div>
          </button>

          <button
            onClick={() => {/* Add reports functionality */}}
            className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
          >
            <div className="text-yellow-600 dark:text-yellow-400 text-2xl mr-3">📊</div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{t('ownerBoardingHouseDetail.quickActions.reports')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('ownerBoardingHouseDetail.quickActions.reportsDesc')}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}