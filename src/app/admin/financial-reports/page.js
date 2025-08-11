'use client';

import { useState, useEffect } from 'react';

export default function FinancialReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState('2024');

  const [financialData] = useState({
    summary: {
      totalRevenue: 2847500000, // VND
      totalCommission: 284750000, // 10% commission
      totalPayout: 2562750000,
      totalRefunds: 45600000,
      netProfit: 239150000,
      growthRate: 12.5,
      transactionCount: 8456,
      averageTransactionValue: 336810
    },
    monthlyData: [
      { month: 'Jan', revenue: 185000000, commission: 18500000, transactions: 567 },
      { month: 'Feb', revenue: 210000000, commission: 21000000, transactions: 645 },
      { month: 'Mar', revenue: 234000000, commission: 23400000, transactions: 712 },
      { month: 'Apr', revenue: 198000000, commission: 19800000, transactions: 601 },
      { month: 'May', revenue: 267000000, commission: 26700000, transactions: 798 },
      { month: 'Jun', revenue: 289000000, commission: 28900000, transactions: 845 },
      { month: 'Jul', revenue: 312000000, commission: 31200000, transactions: 923 },
      { month: 'Aug', revenue: 298000000, commission: 29800000, transactions: 889 },
      { month: 'Sep', revenue: 275000000, commission: 27500000, transactions: 834 },
      { month: 'Oct', revenue: 324000000, commission: 32400000, transactions: 967 },
      { month: 'Nov', revenue: 356000000, commission: 35600000, transactions: 1045 },
      { month: 'Dec', revenue: 399500000, commission: 39950000, transactions: 1130 }
    ],
    paymentGateways: [
      { name: 'VietQR', volume: 1125000000, commission: 112500000, share: 39.5 },
      { name: 'MoMo', volume: 852750000, commission: 85275000, share: 29.9 },
      { name: 'ZaloPay', volume: 569000000, commission: 56900000, share: 20.0 },
      { name: 'PayPal', volume: 227600000, commission: 22760000, share: 8.0 },
      { name: 'VNPay', volume: 73150000, commission: 7315000, share: 2.6 }
    ],
    topProperties: [
      { name: 'Luxury Downtown Suites', revenue: 156000000, commission: 15600000, bookings: 245 },
      { name: 'Student Housing Complex', revenue: 134000000, commission: 13400000, bookings: 189 },
      { name: 'Business District Apartments', revenue: 128000000, commission: 12800000, bookings: 167 },
      { name: 'Riverside View Residences', revenue: 119000000, commission: 11900000, bookings: 143 },
      { name: 'Modern City Center', revenue: 98000000, commission: 9800000, bookings: 123 }
    ],
    expenses: [
      { category: 'Server & Infrastructure', amount: 45000000, percentage: 18.8 },
      { category: 'Payment Processing', amount: 38500000, percentage: 16.1 },
      { category: 'Staff Salaries', amount: 65000000, percentage: 27.2 },
      { category: 'Marketing & Advertising', amount: 28000000, percentage: 11.7 },
      { category: 'Customer Support', amount: 15000000, percentage: 6.3 },
      { category: 'Legal & Compliance', amount: 12000000, percentage: 5.0 },
      { category: 'Office & Utilities', amount: 18000000, percentage: 7.5 },
      { category: 'Others', amount: 17650000, percentage: 7.4 }
    ]
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const exportReport = (format) => {
    // In a real application, this would generate and download the report
    alert(`Exporting ${format.toUpperCase()} report for ${selectedPeriod} of ${selectedYear}`);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const { summary, monthlyData, paymentGateways, topProperties, expenses } = financialData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Báo cáo tài chính toàn hệ thống</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
            <option value="year">Yearly</option>
          </select>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportReport('pdf')}
              className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
            <button
              onClick={() => exportReport('excel')}
              className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.totalRevenue)}</p>
              <p className="text-xs text-green-600 dark:text-green-400">+{summary.growthRate}% from last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Commission Earned</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.totalCommission)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">10% platform commission</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(summary.transactionCount)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg: {formatCurrency(summary.averageTransactionValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Profit</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.netProfit)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">After expenses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Revenue Trend</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={month.month} className="flex items-center">
                  <div className="w-12 text-sm text-gray-600 dark:text-gray-400">{month.month}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" 
                        style={{ width: `${(month.revenue / Math.max(...monthlyData.map(m => m.revenue))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-32 text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(month.revenue)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{month.transactions} txns</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Gateway Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Gateway Distribution</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {paymentGateways.map((gateway, index) => (
                <div key={gateway.name} className="flex items-center">
                  <div className="w-20 text-sm text-gray-600 dark:text-gray-400">{gateway.name}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-yellow-500' :
                          index === 3 ? 'bg-purple-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${gateway.share}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-32 text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{gateway.share}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(gateway.volume)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Properties */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Properties</h2>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Commission
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {topProperties.map((property, index) => (
                  <tr key={property.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {property.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {property.bookings} bookings
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                      {formatCurrency(property.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(property.commission)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Expense Breakdown</h2>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {expenses.map((expense, index) => (
                  <tr key={expense.category}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          index === 0 ? 'bg-red-500' :
                          index === 1 ? 'bg-blue-500' :
                          index === 2 ? 'bg-green-500' :
                          index === 3 ? 'bg-yellow-500' :
                          index === 4 ? 'bg-purple-500' :
                          index === 5 ? 'bg-pink-500' :
                          index === 6 ? 'bg-indigo-500' : 'bg-gray-500'
                        }`}></div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {expense.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 dark:text-gray-400">
                      {expense.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed Financial Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Financial Metrics</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Revenue Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Revenue:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(summary.totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Platform Commission:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(summary.totalCommission)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Owner Payout:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(summary.totalPayout)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Refunds:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(summary.totalRefunds)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Transaction Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Transactions:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatNumber(summary.transactionCount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Average Value:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(summary.averageTransactionValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Growth Rate:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">+{summary.growthRate}%</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Profitability</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Gross Profit:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(summary.totalCommission)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Operating Expenses:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(summary.totalCommission - summary.netProfit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Net Profit:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(summary.netProfit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Profit Margin:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{((summary.netProfit / summary.totalCommission) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
