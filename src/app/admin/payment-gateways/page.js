'use client';

import { useState } from 'react';

export default function PaymentGatewaysPage() {
  const [gateways] = useState([
    {
      id: 1,
      name: 'VNPay',
      status: 'active',
      icon: '💳',
      description: 'Vietnamese payment gateway',
      transactions: 1250,
      revenue: 125000000
    },
    {
      id: 2,
      name: 'MoMo',
      status: 'active',
      icon: '📱',
      description: 'Mobile wallet payment',
      transactions: 890,
      revenue: 89000000
    },
    {
      id: 3,
      name: 'ZaloPay',
      status: 'inactive',
      icon: '💸',
      description: 'Zalo integrated payment',
      transactions: 0,
      revenue: 0
    },
    {
      id: 4,
      name: 'PayPal',
      status: 'active',
      icon: '🌐',
      description: 'International payment gateway',
      transactions: 156,
      revenue: 15600000
    }
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          💳 Payment Gateways
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage payment gateway configurations
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm">Active Gateways</p>
          <p className="text-3xl font-bold mt-2">
            {gateways.filter(g => g.status === 'active').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm">Total Transactions</p>
          <p className="text-3xl font-bold mt-2">
            {gateways.reduce((sum, g) => sum + g.transactions, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-purple-100 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold mt-2">
            {formatCurrency(gateways.reduce((sum, g) => sum + g.revenue, 0))}
          </p>
        </div>
      </div>

      {/* Gateway List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gateways.map((gateway) => (
          <div key={gateway.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="text-4xl mr-4">{gateway.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {gateway.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {gateway.description}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                gateway.status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {gateway.status === 'active' ? '● Active' : '○ Inactive'}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {gateway.transactions.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(gateway.revenue)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Configure
              </button>
              <button className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                gateway.status === 'active'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
              }`}>
                {gateway.status === 'active' ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Gateway */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center">
          <div className="text-5xl mb-4">➕</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Add New Payment Gateway
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect a new payment provider to accept payments
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Add Gateway
          </button>
        </div>
      </div>
    </div>
  );
}
