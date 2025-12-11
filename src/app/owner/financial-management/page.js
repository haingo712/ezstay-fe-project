'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Home,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  RefreshCw
} from 'lucide-react';

export default function FinancialManagementPage() {
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
      console.log('📊 Fetching financial statistics for year:', selectedYear);

      const token = localStorage.getItem('authToken') || localStorage.getItem('ezstay_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/UtilityBills/owner/statistics?year=${selectedYear}`,
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
      console.log('✅ Financial statistics:', data);
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

  const getMaxChartValue = (data, field = 'revenue') => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(item => item[field] || 0));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
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
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Financial Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Overview of your income and payment statistics
            </p>
          </div>

          {/* Year Filter */}
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
          {/* Total Revenue */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(statistics?.totalRevenue)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Revenue Collected</p>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <span className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                This Month
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(statistics?.monthlyRevenue)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Current Month Revenue</p>
          </div>

          {/* Pending Revenue */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="flex items-center text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                Pending
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(statistics?.pendingRevenue)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Outstanding Balance</p>
          </div>

          {/* Total Bills */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {statistics?.totalBills || 0}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Bills Created</p>
          </div>
        </div>

        {/* Bill Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Paid Bills</span>
            </div>
            <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
              {statistics?.paidBills || 0}
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Unpaid Bills</span>
            </div>
            <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
              {statistics?.unpaidBills || 0}
            </h3>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Cancelled Bills</span>
            </div>
            <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400">
              {statistics?.cancelledBills || 0}
            </h3>
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
                  const revenueValue = item.revenue ?? item.totalRevenue ?? 0;
                  const maxValue = Math.max(...statistics.revenueByMonth.map(i => i.revenue ?? i.totalRevenue ?? 0), 1);
                  const percentage = maxValue > 0 ? (revenueValue / maxValue) * 100 : 0;

                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          {item.monthName || `Month ${item.month}`} {item.year}
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatCurrency(revenueValue)}
                        </span>
                      </div>
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.billCount} bill(s)
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

          {/* Revenue by Room */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-purple-500" />
              Revenue by Room
            </h3>
            
            {statistics?.revenueByRoom && statistics.revenueByRoom.length > 0 ? (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {statistics.revenueByRoom.map((room, index) => {
                  const maxValue = getMaxChartValue(statistics.revenueByRoom, 'totalRevenue');
                  const percentage = maxValue > 0 ? (room.totalRevenue / maxValue) * 100 : 0;

                  return (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{room.roomName}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{room.houseName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(room.totalRevenue)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {room.paidBillCount} paid / {room.unpaidBillCount} unpaid
                          </p>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                      {room.pendingAmount > 0 && (
                        <div className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                          Pending: {formatCurrency(room.pendingAmount)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Home className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No room revenue data available</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paid Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {statistics.recentPayments.map((payment, index) => (
                    <tr key={payment.billId || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{payment.roomName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{payment.houseName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded">
                          {getBillTypeLabel(payment.billType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-green-600 dark:text-green-400">
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
