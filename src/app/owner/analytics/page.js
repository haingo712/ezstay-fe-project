'use client';

import { useState, useEffect } from 'react';

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedProperty, setSelectedProperty] = useState('all');

  const [analyticsData] = useState({
    overview: {
      totalRevenue: 4200,
      totalBookings: 15,
      occupancyRate: 85,
      averageRating: 4.6,
      totalViews: 1250,
      conversionRate: 12.5
    },
    revenueData: [
      { month: 'Jan', revenue: 3800, bookings: 12 },
      { month: 'Feb', revenue: 4200, bookings: 14 },
      { month: 'Mar', revenue: 4500, bookings: 16 },
      { month: 'Apr', revenue: 4100, bookings: 13 },
      { month: 'May', revenue: 4800, bookings: 18 },
      { month: 'Jun', revenue: 5200, bookings: 20 }
    ],
    propertyPerformance: [
      {
        id: 1,
        name: 'Sunrise Residence',
        revenue: 1800,
        occupancyRate: 90,
        averageRating: 4.8,
        totalRooms: 6,
        occupiedRooms: 5,
        views: 450,
        inquiries: 85,
        bookings: 8
      },
      {
        id: 2,
        name: 'Student Haven',
        revenue: 1440,
        occupancyRate: 80,
        averageRating: 4.5,
        totalRooms: 4,
        occupiedRooms: 3,
        views: 320,
        inquiries: 62,
        bookings: 5
      },
      {
        id: 3,
        name: 'Green Valley House',
        revenue: 960,
        occupancyRate: 75,
        averageRating: 4.4,
        totalRooms: 2,
        occupiedRooms: 1,
        views: 180,
        inquiries: 28,
        bookings: 2
      }
    ],
    roomPerformance: [
      {
        id: 1,
        name: 'Modern Studio Apartment',
        property: 'Sunrise Residence',
        revenue: 500,
        occupancyRate: 95,
        averageRating: 4.8,
        views: 156,
        inquiries: 23,
        bookings: 3,
        averageStayDuration: 8.5
      },
      {
        id: 2,
        name: 'Luxury Penthouse Room',
        property: 'Sunrise Residence',
        revenue: 700,
        occupancyRate: 90,
        averageRating: 4.9,
        views: 234,
        inquiries: 45,
        bookings: 4,
        averageStayDuration: 10.2
      },
      {
        id: 3,
        name: 'Cozy Room Near University',
        property: 'Student Haven',
        revenue: 360,
        occupancyRate: 88,
        averageRating: 4.6,
        views: 89,
        inquiries: 12,
        bookings: 2,
        averageStayDuration: 6.8
      }
    ],
    demographics: {
      ageGroups: [
        { range: '18-25', percentage: 35, count: 42 },
        { range: '26-35', percentage: 40, count: 48 },
        { range: '36-45', percentage: 20, count: 24 },
        { range: '46+', percentage: 5, count: 6 }
      ],
      occupations: [
        { type: 'Students', percentage: 45, count: 54 },
        { type: 'Professionals', percentage: 35, count: 42 },
        { type: 'Remote Workers', percentage: 15, count: 18 },
        { type: 'Others', percentage: 5, count: 6 }
      ],
      stayDuration: [
        { duration: '1-3 months', percentage: 25, count: 30 },
        { duration: '3-6 months', percentage: 35, count: 42 },
        { duration: '6-12 months', percentage: 30, count: 36 },
        { duration: '12+ months', percentage: 10, count: 12 }
      ]
    },
    marketingInsights: {
      topSources: [
        { source: 'Direct Search', visitors: 450, conversions: 68, rate: 15.1 },
        { source: 'Social Media', visitors: 320, conversions: 35, rate: 10.9 },
        { source: 'Referrals', visitors: 280, conversions: 42, rate: 15.0 },
        { source: 'Google Ads', visitors: 200, conversions: 18, rate: 9.0 }
      ],
      seasonalTrends: [
        { month: 'Jan', demand: 70 },
        { month: 'Feb', demand: 75 },
        { month: 'Mar', demand: 85 },
        { month: 'Apr', demand: 90 },
        { month: 'May', demand: 95 },
        { month: 'Jun', demand: 100 }
      ]
    },
    financialBreakdown: {
      income: {
        rent: 3800,
        utilities: 320,
        deposits: 180,
        lateFees: 45
      },
      expenses: {
        maintenance: 280,
        utilities: 150,
        marketing: 120,
        insurance: 200,
        taxes: 180
      }
    }
  });

  const [properties] = useState([
    { id: 'all', name: 'All Properties' },
    { id: 1, name: 'Sunrise Residence' },
    { id: 2, name: 'Student Haven' },
    { id: 3, name: 'Green Valley House' }
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

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getPerformanceColor = (value, threshold = 80) => {
    if (value >= threshold) return 'text-green-600 dark:text-green-400';
    if (value >= threshold * 0.7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGrowthIndicator = (current, previous) => {
    const growth = ((current - previous) / previous) * 100;
    const isPositive = growth > 0;
    return {
      value: Math.abs(growth).toFixed(1),
      isPositive,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      icon: isPositive ? '↗️' : '↘️'
    };
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { overview, revenueData, propertyPerformance, roomPerformance, demographics, marketingInsights, financialBreakdown } = analyticsData;
  const totalIncome = Object.values(financialBreakdown.income).reduce((sum, value) => sum + value, 0);
  const totalExpenses = Object.values(financialBreakdown.expenses).reduce((sum, value) => sum + value, 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track your property performance and business insights
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(overview.totalRevenue)}</p>
              <div className="flex items-center mt-1">
                <span className="text-green-600 text-sm">↗️ 12.5%</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPercentage(overview.occupancyRate)}</p>
              <div className="flex items-center mt-1">
                <span className="text-green-600 text-sm">↗️ 5.2%</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.averageRating}⭐</p>
              <div className="flex items-center mt-1">
                <span className="text-green-600 text-sm">↗️ 0.3</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.totalViews.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <span className="text-green-600 text-sm">↗️ 18.7%</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPercentage(overview.conversionRate)}</p>
              <div className="flex items-center mt-1">
                <span className="text-red-600 text-sm">↘️ 2.1%</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Profit</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(netProfit)}</p>
              <div className="flex items-center mt-1">
                <span className="text-green-600 text-sm">↗️ 8.9%</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h2>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-end justify-between space-x-2">
            {revenueData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t-lg transition-all duration-300 hover:bg-blue-600"
                  style={{ height: `${(data.revenue / 5500) * 100}%` }}
                  title={`${data.month}: ${formatPrice(data.revenue)}`}
                ></div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">{data.month}</div>
                <div className="text-xs font-medium text-gray-900 dark:text-white">{formatPrice(data.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Property Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Property Performance</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Property</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Occupancy</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Rating</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Views</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {propertyPerformance.map((property) => (
                  <tr key={property.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{property.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {property.occupiedRooms}/{property.totalRooms} rooms occupied
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {formatPrice(property.revenue)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${getPerformanceColor(property.occupancyRate)}`}>
                        {formatPercentage(property.occupancyRate)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {property.averageRating}⭐
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {property.views.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${getPerformanceColor((property.bookings / property.inquiries) * 100, 15)}`}>
                        {formatPercentage((property.bookings / property.inquiries) * 100)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demographics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tenant Demographics</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Age Groups</h3>
              <div className="space-y-2">
                {demographics.ageGroups.map((group, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{group.range}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${group.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                        {group.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Occupations</h3>
              <div className="space-y-2">
                {demographics.occupations.map((occupation, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{occupation.type}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${occupation.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                        {occupation.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Breakdown</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Income Sources</h3>
              <div className="space-y-2">
                {Object.entries(financialBreakdown.income).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {formatPrice(value)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Total Income</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {formatPrice(totalIncome)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Expenses</h3>
              <div className="space-y-2">
                {Object.entries(financialBreakdown.expenses).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      {formatPrice(value)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Total Expenses</span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                      {formatPrice(totalExpenses)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Net Profit</span>
                <span className={`text-lg font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatPrice(netProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marketing Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Marketing Insights</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Top Traffic Sources</h3>
              <div className="space-y-3">
                {marketingInsights.topSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{source.source}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {source.visitors} visitors • {source.conversions} conversions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getPerformanceColor(source.rate, 12)}`}>
                        {formatPercentage(source.rate)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">conversion</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Seasonal Demand</h3>
              <div className="h-48 flex items-end justify-between space-x-1">
                {marketingInsights.seasonalTrends.map((trend, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-purple-500 rounded-t-lg transition-all duration-300 hover:bg-purple-600"
                      style={{ height: `${trend.demand}%` }}
                      title={`${trend.month}: ${trend.demand}% demand`}
                    ></div>
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">{trend.month}</div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">{trend.demand}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Reports</h2>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF Report
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              Schedule Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}