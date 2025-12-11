'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';
import { boardingHouseAPI, roomAPI, apiFetch } from '../../utils/api';
import contractService from '../../services/contractService';
import rentalPostService from '../../services/rentalPostService';

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon, gradient, trend, trendValue }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 ${gradient} shadow-lg`}>
    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-sm text-white/70 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`flex items-center mt-3 text-sm ${trend === 'up' ? 'text-green-200' : trend === 'down' ? 'text-red-200' : 'text-white/70'}`}>
          {trend === 'up' && (
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {trend === 'down' && (
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
  </div>
);

// Quick Action Button
const QuickActionButton = ({ icon, title, description, onClick, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50',
    orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 ${colorClasses[color]} group`}
    >
      <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm mr-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-left">
        <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </button>
  );
};

// Boarding House Mini Card
const BoardingHouseMiniCard = ({ house, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {house.name}
        </h4>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
          Active
      </span>
    </div>
    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      </svg>
      <span className="truncate">{house.address}</span>
    </div>
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{house.totalRooms || 0}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Rooms</p>
      </div>
      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
        <p className="text-lg font-bold text-green-600 dark:text-green-400">{house.occupiedRooms || 0}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Occupied</p>
      </div>
      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
        <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{(house.totalRooms || 0) - (house.occupiedRooms || 0)}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Vacant</p>
      </div>
    </div>
  </div>
  );
};

// Contract Status Badge
const ContractStatusBadge = ({ status }) => {
  const statusConfig = {
    0: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    1: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    2: { label: 'Expired', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
    3: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  };

  const config = statusConfig[status] || statusConfig[0];
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

// Recent Contract Row
const RecentContractRow = ({ contract }) => {
  // Extract tenant name from identityProfiles array
  const identityProfiles = contract.identityProfiles || contract.IdentityProfiles || [];
  const primaryTenant = identityProfiles[0] || {};
  const tenantName = primaryTenant.fullName || primaryTenant.FullName || 
                     contract.tenantName || contract.TenantName || 'Tenant';
  
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
          {tenantName?.[0]?.toUpperCase() || 'T'}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {tenantName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {contract.roomName || contract.RoomName || 'Room'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900 dark:text-white">
          {(contract.roomPrice || contract.RoomPrice || contract.monthlyRent || contract.MonthlyRent || 0).toLocaleString()}₫
        </p>
        <ContractStatusBadge status={contract.contractStatus || contract.ContractStatus || contract.status || contract.Status || 0} />
      </div>
    </div>
  );
};

// Notification Item
const NotificationItem = ({ notification, onMarkRead }) => {
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    if (diff < 60) return `${diff} phút trước`;
    if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
    return `${Math.floor(diff / 1440)} ngày trước`;
  };

  return (
    <div
      className={`p-4 rounded-xl transition-colors cursor-pointer ${notification.isRead
        ? 'bg-gray-50 dark:bg-gray-700/30'
        : 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
        } hover:bg-gray-100 dark:hover:bg-gray-700`}
      onClick={() => !notification.isRead && onMarkRead(notification.id)}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${notification.isRead ? 'bg-gray-200 dark:bg-gray-600' : 'bg-blue-100 dark:bg-blue-900'}`}>
          <svg className={`w-4 h-4 ${notification.isRead ? 'text-gray-500' : 'text-blue-600 dark:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 3v1m0 16v1m-8-9h1m16 0h1M5.636 5.636l.707.707m12.021 12.021l.707.707M18.364 5.636l-.707.707M6.343 17.657l-.707.707" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>
            {notification.message || notification.content}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatTime(notification.createdAt || notification.createDate)}
          </p>
        </div>
      </div>
    </div>
  );
};

// Occupancy Chart (Simple Bar)
const OccupancyChart = ({ occupied, total }) => {
  const percentage = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Occupancy Rate</span>
        <span className="font-semibold text-gray-900 dark:text-white">{percentage}%</span>
      </div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{occupied} Occupied</span>
        <span>{total - occupied} Vacant</span>
      </div>
    </div>
  );
};

// Revenue Chart Component (List style matching admin dashboard)
const RevenueChart = ({ monthlyData }) => {
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);
  
  // Get month name from label (e.g., "T12" -> "Dec 2025")
  const getMonthName = (label, index) => {
    const now = new Date();
    const monthsBack = monthlyData.length - 1 - index;
    const date = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Calculate growth for each month
  const getGrowth = (index) => {
    if (index === 0) return 0;
    const current = monthlyData[index]?.revenue || 0;
    const previous = monthlyData[index - 1]?.revenue || 0;
    return current - previous;
  };

  // Count bills (mock based on revenue - you can replace with real data)
  const getBillCount = (revenue) => {
    if (revenue === 0) return 0;
    return Math.max(1, Math.floor(revenue / 200000));
  };
  
  return (
    <div className="space-y-3">
      {monthlyData.map((month, index) => {
        const growth = getGrowth(index);
        const percentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
        const billCount = getBillCount(month.revenue);
        
        return (
          <div key={index} className="space-y-2">
            {/* Month Header */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getMonthName(month.label, index)}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-orange-500">
                  {month.revenue > 0 ? `${month.revenue.toLocaleString('vi-VN')}₫` : '0₫'}
                </span>
                {growth !== 0 && (
                  <span className={`text-xs ${growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {growth > 0 ? '+' : ''}{growth.toLocaleString('vi-VN')}₫
                  </span>
                )}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            {/* Stats Row */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{billCount} bills</span>
              <span>{billCount > 0 ? '1' : '0'} owners</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Rental Requests Stats
const RentalRequestsCard = ({ pendingRequests, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all group"
    >
      <div className="flex items-center justify-between text-white">
        <div>
          <p className="text-sm font-medium text-white/80">Rental Requests</p>
          <p className="text-3xl font-bold mt-1">{pendingRequests}</p>
          <p className="text-sm text-white/70 mt-1">pending</p>
        </div>
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default function OwnerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // States
  const [loading, setLoading] = useState(true);
  const [boardingHouses, setBoardingHouses] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    monthlyRevenue: 0,
    activeContracts: 0,
    pendingRentalRequests: 0,
    pendingContracts: 0,
    totalPostViews: 0,
    totalPosts: 0,
    occupancyRate: 0,
  });

  // Revenue data for last 6 months (from real API data)
  const [revenueData, setRevenueData] = useState([]);

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Load boarding houses
      const houses = await boardingHouseAPI.getByOwnerId();
      setBoardingHouses(houses || []);

      // Calculate room stats
      let totalRooms = 0;
      let occupiedRooms = 0;
      let totalRevenue = 0;

      for (const house of (houses || [])) {
        try {
          const rooms = await roomAPI.getByHouseId(house.id);
          const roomsArray = Array.isArray(rooms) ? rooms : [];
          totalRooms += roomsArray.length;

          // Update house with room counts
          house.totalRooms = roomsArray.length;
          house.occupiedRooms = roomsArray.filter(r => !r.isAvailable).length;

          roomsArray.forEach(room => {
            if (!room.isAvailable) {
              occupiedRooms++;
              totalRevenue += room.price || 0;
            }
          });
        } catch (error) {
          console.error(`Error loading rooms for house ${house.id}:`, error);
        }
      }

      // Load contracts
      try {
        const contractsData = await contractService.getByOwnerId();
        setContracts((contractsData || []).slice(0, 5));

        const activeContracts = (contractsData || []).filter(c => (c.status || c.Status) === 1).length;
        const pendingContracts = (contractsData || []).filter(c => (c.status || c.Status) === 0).length;

        setStats(prev => ({
          ...prev,
          activeContracts,
          pendingContracts,
        }));
      } catch (error) {
        console.error('Error loading contracts:', error);
      }

      // Load notifications
      try {
        const notificationData = await apiFetch('/api/Notification/by-role');
        setNotifications((notificationData || []).slice(0, 5));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }

      // Load rental requests
      try {
        const rentalRequests = await contractService.getRentalRequestsByOwner();
        const pendingRequests = (rentalRequests || []).length;
        
        setStats(prev => ({
          ...prev,
          pendingRentalRequests: pendingRequests,
        }));
      } catch (error) {
        console.error('Error loading rental requests:', error);
      }

      // Load owner posts for view count statistics
      try {
        const ownerPosts = await rentalPostService.getOwnerPosts();
        const postsArray = Array.isArray(ownerPosts) ? ownerPosts : [];
        const totalPostViews = postsArray.reduce((sum, post) => sum + (post.viewCount || 0), 0);
        
        setStats(prev => ({
          ...prev,
          totalPostViews,
          totalPosts: postsArray.length,
        }));
        console.log('📊 Post views loaded:', { totalPosts: postsArray.length, totalPostViews });
      } catch (error) {
        console.error('Error loading owner posts:', error);
      }

      // Load occupancy rate from API
      try {
        const occupancyResponse = await boardingHouseAPI.getOwnerOccupancyRate();
        if (occupancyResponse?.isSuccess && occupancyResponse?.data) {
          const occupancyData = occupancyResponse.data;
          setStats(prev => ({
            ...prev,
            occupancyRate: occupancyData.occupancyRate || 0,
            totalRooms: occupancyData.totalRooms || prev.totalRooms,
            occupiedRooms: occupancyData.occupiedRooms || prev.occupiedRooms,
          }));
          console.log('📊 Occupancy rate loaded:', occupancyData);
        }
      } catch (error) {
        console.error('Error loading occupancy rate:', error);
      }

      // Load revenue data from utility bills (last 12 months)
      try {
        const billsResponse = await apiFetch('/api/UtilityBills/owner', { method: 'GET' });
        const bills = billsResponse?.value || billsResponse || [];
        
        // Filter paid bills (status = 1 or 'Paid')
        const paidBills = bills.filter(b => {
          const status = b.status || b.Status;
          return status === 1 || status === 'Paid';
        });

        // Group by month (last 12 months)
        const now = new Date();
        const monthlyRevenue = {};
        const monthLabels = [];
        
        // Generate last 12 months labels
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthLabel = `T${date.getMonth() + 1}`;
          monthLabels.push({ key: monthKey, label: monthLabel });
          monthlyRevenue[monthKey] = 0;
        }

        // Sum revenue by month
        paidBills.forEach(bill => {
          const paidDate = bill.paidAt || bill.PaidAt || bill.updatedAt || bill.UpdatedAt;
          if (paidDate) {
            const date = new Date(paidDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyRevenue[monthKey] !== undefined) {
              const amount = bill.totalAmount || bill.TotalAmount || bill.amount || bill.Amount || 0;
              monthlyRevenue[monthKey] += amount;
            }
          }
        });

        // Convert to chart data
        const chartData = monthLabels.map(({ key, label }) => ({
          label,
          revenue: monthlyRevenue[key] || 0
        }));

        console.log('📊 Revenue chart data:', chartData);
        setRevenueData(chartData);

        // Calculate total monthly revenue (current month)
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        totalRevenue = monthlyRevenue[currentMonthKey] || totalRevenue;
      } catch (error) {
        console.error('Error loading revenue data:', error);
        // Set default empty data for 12 months
        const defaultData = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          defaultData.push({ label: `T${date.getMonth() + 1}`, revenue: 0 });
        }
        setRevenueData(defaultData);
      }

      setStats(prev => ({
        ...prev,
        totalProperties: (houses || []).length,
        totalRooms,
        occupiedRooms,
        vacantRooms: totalRooms - occupiedRooms,
        monthlyRevenue: totalRevenue,
      }));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  // Mark notification as read
  const handleMarkNotificationRead = async (id) => {
    try {
      await apiFetch(`/api/Notification/mark-read/${id}`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute roles={['Owner']}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={['Owner']}>
      <div className="bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold text-white">
                  Welcome, {user?.fullName || user?.email?.split('@')[0] || 'Owner'}! 👋
                </h1>
                <p className="text-blue-100 mt-1">
                  Manage your properties and track your business
                </p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/owner/boarding-houses"
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-all backdrop-blur-sm"
                >
                  Manage Houses
                </Link>
                <Link
                  href="/owner/posts"
                  className="px-5 py-2.5 bg-white text-blue-700 rounded-xl font-medium hover:bg-blue-50 transition-all shadow-lg"
                >
                  + Create Post
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Properties"
              value={stats.totalProperties}
              subtitle={`${stats.totalRooms} rooms`}
              gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
            />
            <StatCard
              title="Occupancy Rate"
              value={`${stats.occupancyRate || (stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0)}%`}
              subtitle={`${stats.occupiedRooms}/${stats.totalRooms} rooms occupied`}
              gradient="bg-gradient-to-br from-green-500 to-emerald-600"
              icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            />
            <StatCard
              title="Post Views"
              value={stats.totalPostViews.toLocaleString()}
              subtitle={`${stats.totalPosts} posts total`}
              gradient="bg-gradient-to-br from-pink-500 to-rose-600"
              icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
            />
            <StatCard
              title="Active Contracts"
              value={stats.activeContracts}
              subtitle={`${stats.pendingContracts} pending`}
              gradient="bg-gradient-to-br from-purple-500 to-purple-600"
              icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            />
            <StatCard
              title="Monthly Revenue"
              value={`${stats.monthlyRevenue.toLocaleString()}₫`}
              subtitle="this month"
              gradient="bg-gradient-to-br from-orange-500 to-red-500"
              icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <StatCard
              title="Rental Requests"
              value={stats.pendingRentalRequests}
              subtitle="pending requests"
              gradient="bg-gradient-to-br from-yellow-500 to-amber-600"
              icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" /></svg>}
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
              {/* Boarding Houses */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Boarding Houses</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Your registered properties</p>
                    </div>
                    <Link
                      href="/owner/boarding-houses"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                    >
                      View All →
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {boardingHouses.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-2xl flex items-center justify-center">
                        <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No boarding houses yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Start by adding your first property
                      </p>
                      <Link
                        href="/owner/boarding-houses"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Boarding House
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {boardingHouses.slice(0, 1).map(house => (
                        <BoardingHouseMiniCard
                          key={house.id}
                          house={house}
                          onClick={() => router.push(`/owner/boarding-houses`)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Contracts */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Contracts</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Latest rental agreements</p>
                    </div>
                    <Link
                      href="/owner/contracts"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                    >
                      View All →
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {contracts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No contracts yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contracts.map(contract => (
                        <RecentContractRow key={contract.id || contract.Id} contract={contract} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-8">
              {/* Occupancy Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Room Occupancy</h2>
                <OccupancyChart occupied={stats.occupiedRooms} total={stats.totalRooms} />
              </div>

              {/* Post Views Card */}
              <div 
                onClick={() => router.push('/owner/posts')}
                className="bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between text-white">
                  <div>
                    <p className="text-sm font-medium text-white/80">Total Post Views</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalPostViews.toLocaleString()}</p>
                    <p className="text-sm text-white/70 mt-1">{stats.totalPosts} posts</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Rental Requests */}
              <RentalRequestsCard 
                pendingRequests={stats.pendingRentalRequests} 
                onClick={() => router.push('/owner/rental-requests')}
              />
            </div>
          </div>

          {/* Revenue Chart Section - Full Width */}
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Monthly Revenue (Last 12 Months)
                </h2>
              </div>
              <RevenueChart monthlyData={revenueData} />
            </div>
          </div>

          {/* Notifications Section */}
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
                  <Link
                    href="/owner/notifications"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No notifications
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkRead={handleMarkNotificationRead}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
