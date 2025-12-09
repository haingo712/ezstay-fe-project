'use client';

import { useState, useEffect } from 'react';
import financialStatisticsService from '@/services/financialStatisticsService';
import { Banknote, FileText, TrendingUp, AlertCircle, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { toast } from 'react-toastify';

export default function EnhancedFinancialReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [ownerRankings, setOwnerRankings] = useState([]);
  const [recentContracts, setRecentContracts] = useState([]);

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [overviewData, monthlyData, rankingsData, contractsData] = await Promise.all([
        financialStatisticsService.getOverview(selectedPeriod),
        financialStatisticsService.getMonthlyRevenue(12),
        financialStatisticsService.getOwnerRankings(10),
        financialStatisticsService.getRecentContracts(10)
      ]);

      setOverview(overviewData);
      setMonthlyRevenue(monthlyData);
      setOwnerRankings(rankingsData);
      setRecentContracts(contractsData);
    } catch (error) {
      console.error('Error loading financial data:', error);
      toast.error('Failed to load financial data');
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

  const getStatusBadge = (status) => {
    const config = {
      'Active': { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-700 dark:text-green-300' },
      'Expired': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' },
      'Pending': { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-700 dark:text-yellow-300' },
      'Cancelled': { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-700 dark:text-red-300' },
    };
    const style = config[status] || config['Pending'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No financial data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            💰 Financial Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive revenue and financial analytics
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Banknote className="w-8 h-8 opacity-80" />
            {overview.revenueGrowthRate !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${overview.revenueGrowthRate > 0 ? 'text-green-100' : 'text-red-100'}`}>
                {overview.revenueGrowthRate > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(overview.revenueGrowthRate).toFixed(1)}%
              </div>
            )}
          </div>
          <p className="text-green-100 text-sm">Platform Revenue</p>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(overview.totalPlatformRevenue)}
          </p>
          <p className="text-green-100 text-xs mt-1">{overview.commissionRate * 100}% commission from contracts</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 opacity-80" />
            {overview.contractGrowthRate !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${overview.contractGrowthRate > 0 ? 'text-blue-100' : 'text-red-100'}`}>
                {overview.contractGrowthRate > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(overview.contractGrowthRate).toFixed(1)}%
              </div>
            )}
          </div>
          <p className="text-blue-100 text-sm">Active Contracts</p>
          <p className="text-2xl font-bold mt-2">{overview.activeContracts.toLocaleString()}</p>
          <p className="text-blue-100 text-xs mt-1">Out of {overview.totalContracts} total</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-purple-100 text-sm">Avg Contract Value</p>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(overview.averageContractValue)}
          </p>
          <p className="text-purple-100 text-xs mt-1">Per contract commission</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-yellow-100 text-sm">Unpaid Bills</p>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(overview.unpaidBillsAmount)}
          </p>
          <p className="text-yellow-100 text-xs mt-1">{overview.unpaidBillsCount} bills pending</p>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Monthly Platform Commission (Last 12 Months)
        </h2>
        <div className="space-y-3">
          {monthlyRevenue.map((data) => {
            const maxRevenue = Math.max(...monthlyRevenue.map(d => d.platformCommission), 1);
            const percentage = (data.platformCommission / maxRevenue) * 100;
            
            return (
              <div key={`${data.year}-${data.month}`} className="group">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">{data.monthName}</span>
                  <div className="flex items-center gap-3">
                    <span>{formatCurrency(data.platformCommission)}</span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      {data.contractsCount} contracts
                    </span>
                    <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      Bills: {formatCurrency(data.utilityBillsCollected)}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-10 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-full flex items-center justify-end pr-3 text-white text-sm font-medium transition-all duration-500 group-hover:from-green-600 group-hover:to-emerald-700"
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  >
                    {data.platformCommission > 0 && (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatCurrency(data.platformCommission)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Commission</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(monthlyRevenue.reduce((sum, d) => sum + d.platformCommission, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Contracts</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {monthlyRevenue.reduce((sum, d) => sum + d.contractsCount, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Bills Collected</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(monthlyRevenue.reduce((sum, d) => sum + d.utilityBillsCollected, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Owners */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            🏆 Top Revenue Owners
          </h2>
          <div className="space-y-3">
            {ownerRankings.map((owner) => (
              <div
                key={owner.ownerId}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    owner.rank === 1 ? 'bg-yellow-500' :
                    owner.rank === 2 ? 'bg-gray-400' :
                    owner.rank === 3 ? 'bg-orange-500' : 'bg-indigo-500'
                  }`}>
                    {owner.rank}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{owner.ownerName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {owner.activeContracts} active / {owner.totalContracts} total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(owner.platformCommission)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Commission
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Contracts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            📋 Recent Contracts
          </h2>
          <div className="space-y-3">
            {recentContracts.map((contract) => (
              <div
                key={contract.contractId}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {contract.roomName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {contract.houseName}
                    </p>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                  <span>{contract.tenantName} → {contract.ownerName}</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(contract.platformCommission)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(contract.startDate).toLocaleDateString('vi-VN')} 
                  {contract.endDate && ` - ${new Date(contract.endDate).toLocaleDateString('vi-VN')}`}
                  {contract.durationMonths > 0 && ` (${contract.durationMonths} months)`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bills Overview</h3>
            <span className="text-2xl">💳</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Bills</span>
              <span className="font-bold text-gray-900 dark:text-white">{overview.totalBillsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Paid</span>
              <span className="font-bold text-green-600">{overview.paidBillsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Unpaid</span>
              <span className="font-bold text-red-600">{overview.unpaidBillsCount}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Collection Rate</span>
                <span className="font-bold text-indigo-600">
                  {((overview.paidBillsCount / overview.totalBillsCount) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contract Status</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
              <span className="font-bold text-green-600">{overview.activeContracts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
              <span className="font-bold text-yellow-600">{overview.pendingContracts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Expired</span>
              <span className="font-bold text-gray-600">{overview.expiredContracts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cancelled</span>
              <span className="font-bold text-red-600">{overview.cancelledContracts}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Averages</h3>
            <span className="text-2xl">📈</span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Contract</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(overview.averageContractValue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Bill</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(overview.averageBillAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(overview.monthlyPlatformRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
