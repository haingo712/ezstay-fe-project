'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BillsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [bills, setBills] = useState([
    {
      id: 1,
      type: 'rent',
      description: 'Monthly Rent - January 2024',
      amount: 180,
      dueDate: '2024-01-31',
      status: 'pending',
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      landlordName: 'Mike Chen',
      billDate: '2024-01-01',
      paymentMethod: null,
      transactionId: null,
      late: false
    },
    {
      id: 2,
      type: 'utilities',
      description: 'Electricity Bill - December 2023',
      amount: 45,
      dueDate: '2024-01-15',
      status: 'overdue',
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      landlordName: 'Mike Chen',
      billDate: '2023-12-31',
      paymentMethod: null,
      transactionId: null,
      late: true,
      lateFee: 5
    },
    {
      id: 3,
      type: 'rent',
      description: 'Monthly Rent - December 2023',
      amount: 180,
      dueDate: '2023-12-31',
      status: 'paid',
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      landlordName: 'Mike Chen',
      billDate: '2023-12-01',
      paymentDate: '2023-12-28',
      paymentMethod: 'Credit Card',
      transactionId: 'TXN-2023-12-001',
      late: false
    },
    {
      id: 4,
      type: 'utilities',
      description: 'Water Bill - December 2023',
      amount: 25,
      dueDate: '2024-01-10',
      status: 'paid',
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      landlordName: 'Mike Chen',
      billDate: '2023-12-31',
      paymentDate: '2024-01-08',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN-2024-01-002',
      late: false
    },
    {
      id: 5,
      type: 'rent',
      description: 'Monthly Rent - November 2023',
      amount: 180,
      dueDate: '2023-11-30',
      status: 'paid',
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      landlordName: 'Mike Chen',
      billDate: '2023-11-01',
      paymentDate: '2023-11-25',
      paymentMethod: 'Credit Card',
      transactionId: 'TXN-2023-11-001',
      late: false
    },
    {
      id: 6,
      type: 'deposit',
      description: 'Security Deposit',
      amount: 360,
      dueDate: '2023-12-31',
      status: 'paid',
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      landlordName: 'Mike Chen',
      billDate: '2023-12-01',
      paymentDate: '2023-12-01',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN-2023-12-DEP',
      late: false
    }
  ]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentData, setPaymentData] = useState({
    method: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    bankAccount: '',
    routingNumber: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'rent':
        return '🏠';
      case 'utilities':
        return '⚡';
      case 'deposit':
        return '🔒';
      default:
        return '💳';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'rent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'utilities':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'deposit':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredBills = bills.filter(bill => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return bill.status === 'pending';
    if (activeTab === 'overdue') return bill.status === 'overdue';
    if (activeTab === 'paid') return bill.status === 'paid';
    return true;
  });

  const handlePayment = (e) => {
    e.preventDefault();
    // Here you would typically process the payment through a payment gateway
    const updatedBill = {
      ...selectedBill,
      status: 'paid',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: paymentData.method === 'credit_card' ? 'Credit Card' : 'Bank Transfer',
      transactionId: `TXN-${Date.now()}`
    };

    setBills(prev => prev.map(bill => 
      bill.id === selectedBill.id ? updatedBill : bill
    ));

    setShowPaymentModal(false);
    setSelectedBill(null);
    setPaymentData({
      method: 'credit_card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: '',
      bankAccount: '',
      routingNumber: ''
    });
    alert('Payment processed successfully!');
  };

  const getTotalAmount = (bill) => {
    let total = bill.amount;
    if (bill.lateFee) total += bill.lateFee;
    return total;
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingBills = bills.filter(b => b.status === 'pending' || b.status === 'overdue');
  const totalPending = pendingBills.reduce((sum, bill) => sum + getTotalAmount(bill), 0);
  const totalPaid = bills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bills & Payments</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your rental payments and bills
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pending</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatPrice(totalPending)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Bills', count: bills.length },
              { key: 'pending', label: 'Pending', count: bills.filter(b => b.status === 'pending').length },
              { key: 'overdue', label: 'Overdue', count: bills.filter(b => b.status === 'overdue').length },
              { key: 'paid', label: 'Paid', count: bills.filter(b => b.status === 'paid').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Bills</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {bills.filter(b => b.status === 'pending' || b.status === 'overdue').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount Due</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(totalPending)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(totalPaid)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(bills.filter(b => 
                  new Date(b.billDate).getMonth() === new Date().getMonth() &&
                  new Date(b.billDate).getFullYear() === new Date().getFullYear()
                ).reduce((sum, bill) => sum + bill.amount, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bills List */}
      {filteredBills.length > 0 ? (
        <div className="space-y-4">
          {filteredBills.map((bill) => (
            <div key={bill.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">{getTypeIcon(bill.type)}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {bill.description}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(bill.type)}`}>
                          {bill.type.charAt(0).toUpperCase() + bill.type.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {bill.roomName} - {bill.houseName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Landlord: {bill.landlordName}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Bill Date: {formatDate(bill.billDate)}</span>
                        <span>Due: {formatDate(bill.dueDate)}</span>
                        {bill.paymentDate && (
                          <span>Paid: {formatDate(bill.paymentDate)}</span>
                        )}
                      </div>
                      {bill.transactionId && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Transaction ID: {bill.transactionId}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col lg:items-end space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(bill.amount)}
                        </p>
                        {bill.lateFee && (
                          <p className="text-sm text-red-600 dark:text-red-400">
                            + {formatPrice(bill.lateFee)} late fee
                          </p>
                        )}
                        {bill.paymentMethod && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            via {bill.paymentMethod}
                          </p>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bill.status)}`}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      {(bill.status === 'pending' || bill.status === 'overdue') && (
                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            setShowPaymentModal(true);
                          }}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Pay Now
                        </button>
                      )}
                      <button className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No bills found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'all' 
                ? "You don't have any bills yet."
                : `No ${activeTab} bills found.`
              }
            </p>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Show All Bills
              </button>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pay Bill
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Bill Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {selectedBill.description}
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Amount: {formatPrice(selectedBill.amount)}</p>
                  {selectedBill.lateFee && (
                    <p className="text-red-600 dark:text-red-400">
                      Late Fee: {formatPrice(selectedBill.lateFee)}
                    </p>
                  )}
                  <p>Due Date: {formatDate(selectedBill.dueDate)}</p>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Total: {formatPrice(getTotalAmount(selectedBill))}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentData.method}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                {paymentData.method === 'credit_card' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          required
                          value={paymentData.expiryDate}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          required
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="123"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentData.cardName}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, cardName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="John Doe"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentData.bankAccount}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, bankAccount: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Routing Number
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentData.routingNumber}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, routingNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="021000021"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Pay {formatPrice(getTotalAmount(selectedBill))}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}