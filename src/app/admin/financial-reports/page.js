'use client';

import { useState } from 'react';

export default function FinancialReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const financialData = {
    totalRevenue: 250000000,
    totalExpenses: 75000000,
    netProfit: 175000000,
    transactions: 2345,
    averageTransaction: 106609
  };

  const monthlyData = [
    { month: 'Jan', revenue: 18000000, expenses: 6000000 },
    { month: 'Feb', revenue: 22000000, expenses: 7000000 },
    { month: 'Mar', revenue: 25000000, expenses: 8000000 },
    { month: 'Apr', revenue: 28000000, expenses: 7500000 },
    { month: 'May', revenue: 30000000, expenses: 9000000 },
    { month: 'Jun', revenue: 27000000, expenses: 8000000 },
  ];

  const revenueByCategory = [
    { category: 'Room Rentals', amount: 150000000, percentage: 60 },
    { category: 'Service Fees', amount: 50000000, percentage: 20 },
    { category: 'Commission', amount: 37500000, percentage: 15 },
    { category: 'Other', amount: 12500000, percentage: 5 }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(financialData.totalRevenue)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-red-100 text-sm">Total Expenses</p>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(financialData.totalExpenses)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm">Net Profit</p>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(financialData.netProfit)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-purple-100 text-sm">Transactions</p>
          <p className="text-2xl font-bold mt-2">
            {financialData.transactions.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-orange-100 text-sm">Avg Transaction</p>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(financialData.averageTransaction)}
          </p>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Monthly Revenue vs Expenses
        </h2>
        <div className="space-y-4">
          {monthlyData.map((data) => (
            <div key={data.month}>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className="font-medium">{data.month}</span>
                <span>Revenue: {formatCurrency(data.revenue)} | Expenses: {formatCurrency(data.expenses)}</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-full flex items-center justify-end pr-2 text-white text-xs font-medium"
                    style={{ width: `${(data.revenue / 30000000) * 100}%` }}
                  >
                    {((data.revenue / 30000000) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-full flex items-center justify-end pr-2 text-white text-xs font-medium"
                    style={{ width: `${(data.expenses / 9000000) * 100}%` }}
                  >
                    {((data.expenses / 9000000) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Revenue by Category
          </h2>
          <div className="space-y-4">
            {revenueByCategory.map((item, index) => (
              <div key={item.category}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {item.category}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatCurrency(item.amount)} ({item.percentage}%)
                  </span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full ${index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                      }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
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
