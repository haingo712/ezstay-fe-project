'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  RefreshCw,
  Building2
} from 'lucide-react';

export default function StaffFinancialReportsPage() {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

  useEffect(() => {
    loadFinancialStatistics();
  }, [selectedYear]);

  const loadFinancialStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Fetching system financial statistics for year:', selectedYear);

      const token = localStorage.getItem('authToken') || localStorage.getItem('ezstay_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/UtilityBills/system/statistics?year=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ System financial statistics:', data);
      setStatistics(data);
    } catch (error) {
      console.error('❌ Error loading financial statistics:', error);
      setError('Unable to load financial statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBillTypeLabel = (billType) => {
    const typeMap = {
      'Monthly': 'Monthly',
      'Deposit': 'Deposit',
      'Evicted': 'Evicted',
    };
    return typeMap[billType] || billType || 'Other';
  };

  const getMaxChartValue = (data, field = 'totalRevenue') => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(item => item[field] || 0));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading financial data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">{error}</h3>
            <button
              onClick={loadFinancialStatistics}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              Financial Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View system-wide financial statistics
            </p>
          </div>

          {/* Controls */}
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={loadFinancialStatistics}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total System Revenue */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 opacity-80" />
              <span className="text-blue-100 text-sm font-medium">Total</span>
            </div>
            <h3 className="text-2xl font-bold">{formatCurrency(statistics?.totalSystemRevenue)}</h3>
            <p className="text-blue-100 text-sm mt-1">System Revenue</p>
          </div>

          {/* Platform Commission */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 opacity-80" />
              <span className="flex items-center text-green-100 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                5%
              </span>
            </div>
            <h3 className="text-2xl font-bold">{formatCurrency(statistics?.platformCommission)}</h3>
            <p className="text-green-100 text-sm mt-1">Platform Commission</p>
          </div>

          {/* Pending Revenue */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 opacity-80" />
              <span className="flex items-center text-yellow-100 text-sm font-medium">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                Pending
              </span>
            </div>
            <h3 className="text-2xl font-bold">{formatCurrency(statistics?.totalPendingRevenue)}</h3>
            <p className="text-yellow-100 text-sm mt-1">Outstanding Balance</p>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-8 w-8 opacity-80" />
              <span className="text-purple-100 text-sm font-medium">This Month</span>
            </div>
            <h3 className="text-2xl font-bold">{formatCurrency(statistics?.monthlyRevenue)}</h3>
            <p className="text-purple-100 text-sm mt-1">Current Month</p>
          </div>
        </div>

        {/* Bill & Owner Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <FileText className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics?.totalBills || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Bills</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{statistics?.paidBills || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{statistics?.unpaidBills || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Unpaid</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <XCircle className="h-6 w-6 text-gray-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-600">{statistics?.cancelledBills || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cancelled</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <Users className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics?.totalOwners || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Owners</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <Building2 className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{statistics?.activeOwners || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Owners</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Monthly Revenue (Last 12 Months)
            </h3>
            
            {statistics?.revenueByMonth && statistics.revenueByMonth.length > 0 ? (
              <div className="space-y-3">
                {statistics.revenueByMonth.map((item, index) => {
                  const maxValue = getMaxChartValue(statistics.revenueByMonth, 'totalRevenue');
                  const percentage = maxValue > 0 ? (item.totalRevenue / maxValue) * 100 : 0;

                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          {item.monthName} {item.year}
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatCurrency(item.totalRevenue)}
                        </span>
                      </div>
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{item.billCount} bills</span>
                        <span className="text-green-600">+{formatCurrency(item.platformCommission)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No revenue data available</p>
              </div>
            )}
          </div>

          {/* Top Owners */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              Top Owners by Revenue
            </h3>
            
            {statistics?.topOwners && statistics.topOwners.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {statistics.topOwners.map((owner, index) => {
                  const maxValue = getMaxChartValue(statistics.topOwners, 'totalRevenue');
                  const percentage = maxValue > 0 ? (owner.totalRevenue / maxValue) * 100 : 0;

                  return (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-200 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">{owner.ownerName}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {owner.roomCount} rooms • {owner.paidBills}/{owner.totalBills} bills paid
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {formatCurrency(owner.totalRevenue)}
                        </p>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No owner data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Recent Payments
            </h3>
          </div>
          
          {statistics?.recentPayments && statistics.recentPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {statistics.recentPayments.slice(0, 10).map((payment, index) => (
                    <tr key={payment.billId || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{payment.ownerName}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">{payment.roomName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{payment.houseName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded">
                          {getBillTypeLabel(payment.billType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-green-600">
                          {formatCurrency(payment.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(payment.paidDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent payments found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
