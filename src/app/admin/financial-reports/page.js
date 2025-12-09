'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/utils/api';

export default function FinancialReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [owners, setOwners] = useState([]);
  
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    transactions: 0,
    averageTransaction: 0,
    activeContracts: 0,
    completedPayments: 0,
    pendingPayments: 0
  });

  // Load financial data from APIs
  const loadFinancialData = useCallback(async () => {
    try {
      setLoading(true);

      // Load all contracts from all owners
      const contractsData = await apiFetch('/api/Contract/all/owner');
      const contractsArray = Array.isArray(contractsData) ? contractsData : [];
      setContracts(contractsArray);

      // Calculate financial metrics from contracts
      const activeContracts = contractsArray.filter(c => c.status === 'Active' || c.status === 1);
      const totalRevenue = contractsArray.reduce((sum, contract) => {
        return sum + (contract.totalAmount || contract.rentAmount || 0);
      }, 0);

      // System takes 5% commission
      const systemCommission = totalRevenue * 0.05;
      const ownerRevenue = totalRevenue * 0.95;

      setFinancialData({
        totalRevenue: systemCommission, // Admin only sees platform commission
        totalExpenses: 0, // No expense data yet
        netProfit: systemCommission,
        transactions: contractsArray.length,
        averageTransaction: contractsArray.length > 0 ? systemCommission / contractsArray.length : 0,
        activeContracts: activeContracts.length,
        completedPayments: contractsArray.filter(c => c.status === 'Completed' || c.status === 3).length,
        pendingPayments: contractsArray.filter(c => c.status === 'Pending' || c.status === 0).length
      });

    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Calculate revenue by owner
  const revenueByOwner = contracts.reduce((acc, contract) => {
    const ownerId = contract.ownerId || contract.boardingHouseOwnerId;
    if (!ownerId) return acc;
    
    const existing = acc.find(item => item.ownerId === ownerId);
    const revenue = (contract.totalAmount || contract.rentAmount || 0) * 0.05; // 5% commission
    
    if (existing) {
      existing.revenue += revenue;
      existing.contracts += 1;
    } else {
      acc.push({
        ownerId,
        ownerName: contract.ownerName || `Owner ${ownerId.substring(0, 8)}`,
        revenue,
        contracts: 1
      });
    }
    return acc;
  }, []).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Calculate monthly revenue (last 6 months)
  const monthlyData = (() => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthContracts = contracts.filter(c => {
        const createdDate = new Date(c.createdAt || c.startDate);
        return createdDate.getMonth() === date.getMonth() && 
               createdDate.getFullYear() === date.getFullYear();
      });
      
      const revenue = monthContracts.reduce((sum, c) => sum + ((c.totalAmount || c.rentAmount || 0) * 0.05), 0);
      
      months.push({
        month: monthName,
        revenue,
        expenses: 0,
        contracts: monthContracts.length
      });
    }
    
    return months;
  })();

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            💰 Financial Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Revenue, expenses, and financial analytics
          </p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Platform Commission</p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(financialData.totalRevenue)}
              </p>
              <p className="text-green-100 text-xs mt-1">5% from contracts</p>
            </div>
            <svg className="w-8 h-8 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Contracts</p>
              <p className="text-2xl font-bold mt-2">
                {financialData.transactions.toLocaleString()}
              </p>
              <p className="text-blue-100 text-xs mt-1">All time</p>
            </div>
            <svg className="w-8 h-8 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Contracts</p>
              <p className="text-2xl font-bold mt-2">
                {financialData.activeContracts.toLocaleString()}
              </p>
              <p className="text-purple-100 text-xs mt-1">Currently active</p>
            </div>
            <svg className="w-8 h-8 text-purple-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Avg Commission</p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(financialData.averageTransaction)}
              </p>
              <p className="text-orange-100 text-xs mt-1">Per contract</p>
            </div>
            <svg className="w-8 h-8 text-orange-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Completed</p>
              <p className="text-2xl font-bold mt-2">
                {financialData.completedPayments.toLocaleString()}
              </p>
              <p className="text-emerald-100 text-xs mt-1">Finished contracts</p>
            </div>
            <svg className="w-8 h-8 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-2xl font-bold mt-2">
                {financialData.pendingPayments.toLocaleString()}
              </p>
              <p className="text-yellow-100 text-xs mt-1">Awaiting payment</p>
            </div>
            <svg className="w-8 h-8 text-yellow-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Monthly Commission Revenue (Last 6 Months)
        </h2>
        <div className="space-y-4">
          {monthlyData.map((data) => {
            const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);
            return (
              <div key={data.month}>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">{data.month}</span>
                  <span className="flex items-center gap-3">
                    <span>Commission: {formatCurrency(data.revenue)}</span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      {data.contracts} contracts
                    </span>
                  </span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-full flex items-center justify-end pr-3 text-white text-sm font-medium transition-all duration-500"
                    style={{ width: `${data.revenue > 0 ? Math.max((data.revenue / maxRevenue) * 100, 5) : 0}%` }}
                  >
                    {data.revenue > 0 && formatCurrency(data.revenue)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total (6 months):</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(monthlyData.reduce((sum, d) => sum + d.revenue, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Top Owners and Recent Contracts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Revenue Owners */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Top Revenue Owners
          </h2>
          <div className="space-y-3">
            {revenueByOwner.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No owner data available
              </div>
            ) : (
              revenueByOwner.map((owner, index) => (
                <div key={owner.ownerId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-indigo-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {owner.ownerName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {owner.contracts} contracts
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(owner.revenue)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Commission
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Contracts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Recent Contracts
          </h2>
          <div className="space-y-3">
            {contracts.slice(0, 8).map((contract) => (
              <div key={contract.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {contract.tenantName || 'Tenant'} → {contract.ownerName || 'Owner'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(contract.createdAt || contract.startDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">
                    {formatCurrency((contract.totalAmount || contract.rentAmount || 0) * 0.05)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    contract.status === 'Active' || contract.status === 1 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                    contract.status === 'Completed' || contract.status === 3 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                  }`}>
                    {contract.status === 1 || contract.status === 'Active' ? 'Active' :
                     contract.status === 3 || contract.status === 'Completed' ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
            {contracts.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No contracts yet
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Financial Health
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
                <p className="text-2xl font-bold text-green-600">
                  {((financialData.netProfit / financialData.totalRevenue) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-3xl">📈</div>
            </div>

            <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
                <p className="text-2xl font-bold text-blue-600">+15.3%</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>

            <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expense Ratio</p>
                <p className="text-2xl font-bold text-purple-600">
                  {((financialData.totalExpenses / financialData.totalRevenue) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-3xl">💸</div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Export Reports
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Download financial reports in various formats
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
            📊 Export Excel
          </button>
          <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
            📄 Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
