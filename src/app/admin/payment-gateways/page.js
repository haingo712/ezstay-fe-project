'use client';

import { useState, useEffect } from 'react';

export default function PaymentGatewaysPage() {
  const [mounted, setMounted] = useState(false);
  const [gateways, setGateways] = useState([
    {
      gateway_id: 1,
      name: 'VietQR',
      is_active: true,
      created_at: '2023-01-15T10:30:00Z',
      transaction_volume: 1250000,
      transaction_count: 2847,
      success_rate: 98.5,
      monthly_fee: 50000,
      transaction_fee: 0.3,
      supported_banks: 15,
      logo: '🏦',
      description: 'Vietnam QR Code Payment System'
    },
    {
      gateway_id: 2,
      name: 'MoMo',
      is_active: true,
      created_at: '2023-02-20T14:15:00Z',
      transaction_volume: 980000,
      transaction_count: 1856,
      success_rate: 97.8,
      monthly_fee: 30000,
      transaction_fee: 0.5,
      supported_banks: 8,
      logo: '💸',
      description: 'Mobile Money Payment'
    },
    {
      gateway_id: 3,
      name: 'ZaloPay',
      is_active: true,
      created_at: '2023-01-10T09:45:00Z',
      transaction_volume: 750000,
      transaction_count: 1432,
      success_rate: 96.9,
      monthly_fee: 25000,
      transaction_fee: 0.4,
      supported_banks: 12,
      logo: '⚡',
      description: 'Zalo Digital Wallet'
    },
    {
      gateway_id: 4,
      name: 'VNPay',
      is_active: false,
      created_at: '2022-12-05T16:20:00Z',
      transaction_volume: 320000,
      transaction_count: 687,
      success_rate: 95.2,
      monthly_fee: 40000,
      transaction_fee: 0.6,
      supported_banks: 20,
      logo: '🎯',
      description: 'Vietnam National Payment Corporation'
    },
    {
      gateway_id: 5,
      name: 'PayPal',
      is_active: true,
      created_at: '2023-03-12T11:00:00Z',
      transaction_volume: 580000,
      transaction_count: 892,
      success_rate: 99.1,
      monthly_fee: 75000,
      transaction_fee: 2.9,
      supported_banks: 0,
      logo: '🌍',
      description: 'International Payment Gateway'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'edit', 'view'
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthly_fee: '',
    transaction_fee: '',
    is_active: true
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddGateway = () => {
    setModalType('add');
    setFormData({
      name: '',
      description: '',
      monthly_fee: '',
      transaction_fee: '',
      is_active: true
    });
    setSelectedGateway(null);
    setShowModal(true);
  };

  const handleEditGateway = (gateway) => {
    setModalType('edit');
    setFormData({
      name: gateway.name,
      description: gateway.description,
      monthly_fee: gateway.monthly_fee,
      transaction_fee: gateway.transaction_fee,
      is_active: gateway.is_active
    });
    setSelectedGateway(gateway);
    setShowModal(true);
  };

  const handleViewGateway = (gateway) => {
    setModalType('view');
    setSelectedGateway(gateway);
    setShowModal(true);
  };

  const handleToggleStatus = (gatewayId) => {
    setGateways(prev => prev.map(gateway => 
      gateway.gateway_id === gatewayId 
        ? { ...gateway, is_active: !gateway.is_active }
        : gateway
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalType === 'add') {
      const newGateway = {
        gateway_id: Date.now(),
        ...formData,
        created_at: new Date().toISOString(),
        transaction_volume: 0,
        transaction_count: 0,
        success_rate: 0,
        supported_banks: 0,
        logo: '🔷'
      };
      setGateways(prev => [...prev, newGateway]);
    } else if (modalType === 'edit') {
      setGateways(prev => prev.map(gateway => 
        gateway.gateway_id === selectedGateway.gateway_id
          ? { ...gateway, ...formData }
          : gateway
      ));
    }
    
    setShowModal(false);
  };

  const handleDeleteGateway = (gatewayId) => {
    if (confirm('Bạn có chắc chắn muốn xóa cổng thanh toán này?')) {
      setGateways(prev => prev.filter(gateway => gateway.gateway_id !== gatewayId));
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const activeGateways = gateways.filter(g => g.is_active);
  const totalVolume = gateways.reduce((sum, g) => sum + g.transaction_volume, 0);
  const totalTransactions = gateways.reduce((sum, g) => sum + g.transaction_count, 0);
  const averageSuccessRate = gateways.reduce((sum, g) => sum + g.success_rate, 0) / gateways.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Gateways Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Quản lý các cổng thanh toán của hệ thống</p>
        </div>
        <button
          onClick={handleAddGateway}
          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Gateway
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Gateways</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeGateways.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalVolume)}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTransactions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageSuccessRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gateways Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Gateways</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Gateway
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Volume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fees
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {gateways.map((gateway) => (
                <tr key={gateway.gateway_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{gateway.logo}</div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {gateway.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {gateway.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      gateway.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {gateway.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(gateway.transaction_volume)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {gateway.transaction_count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 dark:text-white mr-2">{gateway.success_rate}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${gateway.success_rate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div>
                      <div>Monthly: {formatCurrency(gateway.monthly_fee)}</div>
                      <div className="text-gray-500 dark:text-gray-400">Per txn: {gateway.transaction_fee}%</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewGateway(gateway)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditGateway(gateway)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        title="Edit Gateway"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(gateway.gateway_id)}
                        className={`${
                          gateway.is_active 
                            ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                            : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                        }`}
                        title={gateway.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                            gateway.is_active 
                              ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                              : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          } />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteGateway(gateway.gateway_id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Gateway"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'add' ? 'Add Payment Gateway' : 
                   modalType === 'edit' ? 'Edit Payment Gateway' : 'Gateway Details'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {modalType === 'view' ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{selectedGateway.logo}</div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">{selectedGateway.name}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedGateway.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Status</p>
                      <p className={selectedGateway.is_active ? 'text-green-600' : 'text-red-600'}>
                        {selectedGateway.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Created</p>
                      <p className="text-gray-600 dark:text-gray-400">{formatDate(selectedGateway.created_at)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Monthly Fee</p>
                      <p className="text-gray-900 dark:text-white">{formatCurrency(selectedGateway.monthly_fee)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Transaction Fee</p>
                      <p className="text-gray-900 dark:text-white">{selectedGateway.transaction_fee}%</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Success Rate</p>
                      <p className="text-gray-900 dark:text-white">{selectedGateway.success_rate}%</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Supported Banks</p>
                      <p className="text-gray-900 dark:text-white">{selectedGateway.supported_banks}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-medium text-gray-700 dark:text-gray-300">Transaction Volume</p>
                      <p className="text-gray-900 dark:text-white">{formatCurrency(selectedGateway.transaction_volume)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-medium text-gray-700 dark:text-gray-300">Total Transactions</p>
                      <p className="text-gray-900 dark:text-white">{selectedGateway.transaction_count.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gateway Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter gateway name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows="3"
                      placeholder="Enter description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Monthly Fee (VND)
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.monthly_fee}
                        onChange={(e) => setFormData(prev => ({ ...prev, monthly_fee: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Transaction Fee (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.transaction_fee}
                        onChange={(e) => setFormData(prev => ({ ...prev, transaction_fee: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Active Gateway
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    >
                      {modalType === 'add' ? 'Add Gateway' : 'Update Gateway'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
