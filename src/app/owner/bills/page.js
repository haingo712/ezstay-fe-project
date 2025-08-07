'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OwnerBillsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [bills, setBills] = useState([
    {
      id: 1,
      type: 'rent',
      tenantId: 1,
      tenantName: 'John Doe',
      roomName: 'Modern Studio Apartment',
      houseName: 'Sunrise Residence',
      description: 'Monthly Rent - January 2024',
      amount: 250,
      dueDate: '2024-01-31',
      billDate: '2024-01-01',
      status: 'paid',
      paymentDate: '2024-01-28',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN-2024-001',
      createdAt: '2024-01-01T09:00:00Z',
      paidAt: '2024-01-28T14:30:00Z'
    },
    {
      id: 2,
      type: 'utilities',
      tenantId: 2,
      tenantName: 'Emily Chen',
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      description: 'Electricity Bill - December 2023',
      amount: 45,
      dueDate: '2024-01-15',
      billDate: '2023-12-31',
      status: 'overdue',
      paymentDate: null,
      paymentMethod: null,
      transactionId: null,
      createdAt: '2023-12-31T10:00:00Z',
      paidAt: null,
      lateFee: 5,
      utilityReadings: {
        previousReading: 1250,
        currentReading: 1320,
        usage: 70,
        ratePerUnit: 0.64
      }
    },
    {
      id: 3,
      type: 'rent',
      tenantId: 3,
      tenantName: 'Michael Rodriguez',
      roomName: 'Luxury Penthouse Room',
      houseName: 'Sunrise Residence',
      description: 'Monthly Rent - January 2024',
      amount: 350,
      dueDate: '2024-01-31',
      billDate: '2024-01-01',
      status: 'pending',
      paymentDate: null,
      paymentMethod: null,
      transactionId: null,
      createdAt: '2024-01-01T09:00:00Z',
      paidAt: null
    },
    {
      id: 4,
      type: 'utilities',
      tenantId: 1,
      tenantName: 'John Doe',
      roomName: 'Modern Studio Apartment',
      houseName: 'Sunrise Residence',
      description: 'Water Bill - December 2023',
      amount: 25,
      dueDate: '2024-01-10',
      billDate: '2023-12-31',
      status: 'paid',
      paymentDate: '2024-01-08',
      paymentMethod: 'Credit Card',
      transactionId: 'TXN-2024-002',
      createdAt: '2023-12-31T11:00:00Z',
      paidAt: '2024-01-08T16:45:00Z',
      utilityReadings: {
        previousReading: 890,
        currentReading: 920,
        usage: 30,
        ratePerUnit: 0.83
      }
    },
    {
      id: 5,
      type: 'deposit',
      tenantId: 2,
      tenantName: 'Emily Chen',
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      description: 'Security Deposit',
      amount: 360,
      dueDate: '2023-09-15',
      billDate: '2023-09-01',
      status: 'paid',
      paymentDate: '2023-09-15',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN-2023-045',
      createdAt: '2023-09-01T10:00:00Z',
      paidAt: '2023-09-15T12:00:00Z'
    }
  ]);

  const [showBillModal, setShowBillModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'edit', 'view'
  const [selectedBill, setSelectedBill] = useState(null);
  const [billData, setBillData] = useState({
    type: 'rent',
    tenantId: '',
    description: '',
    amount: '',
    dueDate: '',
    utilityReadings: {
      previousReading: '',
      currentReading: '',
      ratePerUnit: ''
    }
  });

  const [tenants] = useState([
    { id: 1, name: 'John Doe', roomName: 'Modern Studio Apartment' },
    { id: 2, name: 'Emily Chen', roomName: 'Cozy Room Near University' },
    { id: 3, name: 'Michael Rodriguez', roomName: 'Luxury Penthouse Room' }
  ]);

  const [utilityRates] = useState([
    { type: 'electricity', minUsage: 0, maxUsage: 100, pricePerUnit: 0.64 },
    { type: 'electricity', minUsage: 101, maxUsage: 200, pricePerUnit: 0.72 },
    { type: 'water', minUsage: 0, maxUsage: 50, pricePerUnit: 0.83 },
    { type: 'water', minUsage: 51, maxUsage: 100, pricePerUnit: 0.95 }
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

  const getDaysOverdue = (dueDate, status) => {
    if (status !== 'overdue') return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredBills = bills.filter(bill => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return bill.status === 'pending';
    if (activeTab === 'overdue') return bill.status === 'overdue';
    if (activeTab === 'paid') return bill.status === 'paid';
    return true;
  });

  const handleOpenModal = (type, bill = null) => {
    setModalType(type);
    setSelectedBill(bill);
    
    if (type === 'create') {
      setBillData({
        type: 'rent',
        tenantId: '',
        description: '',
        amount: '',
        dueDate: '',
        utilityReadings: {
          previousReading: '',
          currentReading: '',
          ratePerUnit: ''
        }
      });
    } else if (type === 'edit' && bill) {
      setBillData({
        type: bill.type,
        tenantId: bill.tenantId,
        description: bill.description,
        amount: bill.amount,
        dueDate: bill.dueDate,
        utilityReadings: bill.utilityReadings || {
          previousReading: '',
          currentReading: '',
          ratePerUnit: ''
        }
      });
    }
    
    setShowBillModal(true);
  };

  const handleSubmitBill = (e) => {
    e.preventDefault();
    
    const selectedTenant = tenants.find(t => t.id === parseInt(billData.tenantId));
    
    if (modalType === 'create') {
      const newBill = {
        id: bills.length + 1,
        ...billData,
        tenantId: parseInt(billData.tenantId),
        tenantName: selectedTenant?.name || 'Unknown Tenant',
        roomName: selectedTenant?.roomName || 'Unknown Room',
        houseName: 'Property Name', // This should come from tenant data
        amount: parseFloat(billData.amount),
        billDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        paymentDate: null,
        paymentMethod: null,
        transactionId: null,
        createdAt: new Date().toISOString(),
        paidAt: null
      };
      
      setBills(prev => [newBill, ...prev]);
      alert('Bill created successfully!');
    } else if (modalType === 'edit') {
      setBills(prev => prev.map(bill => 
        bill.id === selectedBill.id 
          ? { 
              ...bill, 
              ...billData,
              tenantId: parseInt(billData.tenantId),
              amount: parseFloat(billData.amount)
            }
          : bill
      ));
      alert('Bill updated successfully!');
    }
    
    setShowBillModal(false);
    setSelectedBill(null);
    setModalType('');
    setBillData({
      type: 'rent',
      tenantId: '',
      description: '',
      amount: '',
      dueDate: '',
      utilityReadings: {
        previousReading: '',
        currentReading: '',
        ratePerUnit: ''
      }
    });
  };

  const handleMarkAsPaid = (billId) => {
    setBills(prev => prev.map(bill => 
      bill.id === billId 
        ? { 
            ...bill, 
            status: 'paid',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'Manual Entry',
            paidAt: new Date().toISOString()
          }
        : bill
    ));
    alert('Bill marked as paid!');
  };

  const handleDeleteBill = (billId) => {
    if (confirm('Are you sure you want to delete this bill?')) {
      setBills(prev => prev.filter(bill => bill.id !== billId));
      alert('Bill deleted successfully!');
    }
  };

  const handleSendReminder = (bill) => {
    // This would integrate with your notification system
    alert(`Payment reminder sent to ${bill.tenantName}`);
  };

  const calculateUtilityAmount = () => {
    const { previousReading, currentReading, ratePerUnit } = billData.utilityReadings;
    if (previousReading && currentReading && ratePerUnit) {
      const usage = parseFloat(currentReading) - parseFloat(previousReading);
      const amount = usage * parseFloat(ratePerUnit);
      setBillData(prev => ({ ...prev, amount: amount.toFixed(2) }));
    }
  };

  const generateMonthlyBills = () => {
    const currentTenants = tenants; // This should come from your tenants data
    const newBills = currentTenants.map(tenant => ({
      id: bills.length + tenant.id,
      type: 'rent',
      tenantId: tenant.id,
      tenantName: tenant.name,
      roomName: tenant.roomName,
      houseName: 'Property Name',
      description: `Monthly Rent - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      amount: 250, // This should come from tenant's rent amount
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0],
      billDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      paymentDate: null,
      paymentMethod: null,
      transactionId: null,
      createdAt: new Date().toISOString(),
      paidAt: null
    }));
    
    setBills(prev => [...newBills, ...prev]);
    alert(`Generated ${newBills.length} monthly rent bills!`);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalBills = bills.length;
  const pendingBills = bills.filter(b => b.status === 'pending').length;
  const overdueBills = bills.filter(b => b.status === 'overdue').length;
  const paidBills = bills.filter(b => b.status === 'paid').length;
  const totalOutstanding = bills.filter(b => b.status === 'pending' || b.status === 'overdue')
    .reduce((sum, bill) => sum + bill.amount + (bill.lateFee || 0), 0);
  const totalCollected = bills.filter(b => b.status === 'paid')
    .reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bills & Invoices</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create and manage tenant bills and invoices
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={generateMonthlyBills}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Generate Monthly Bills
              </button>
              <button
                onClick={() => handleOpenModal('create')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Bill
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Bills', count: totalBills },
              { key: 'pending', label: 'Pending', count: pendingBills },
              { key: 'overdue', label: 'Overdue', count: overdueBills },
              { key: 'paid', label: 'Paid', count: paidBills }
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
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29.82-5.877 2.172M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.875a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalBills}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(totalOutstanding)}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Collected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(totalCollected)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overdueBills}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bills List */}
      {filteredBills.length > 0 ? (
        <div className="space-y-4">
          {filteredBills.map((bill) => {
            const daysOverdue = getDaysOverdue(bill.dueDate, bill.status);
            const totalAmount = bill.amount + (bill.lateFee || 0);
            
            return (
              <div key={bill.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                    {/* Bill Icon */}
                    <div className="flex-shrink-0 mb-4 lg:mb-0">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">{getTypeIcon(bill.type)}</span>
                      </div>
                    </div>

                    {/* Bill Details */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {bill.description}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {bill.tenantName} - {bill.roomName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {bill.houseName}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(bill.type)}`}>
                            {bill.type.charAt(0).toUpperCase() + bill.type.slice(1)}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bill.status)}`}>
                            {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Bill Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Amount Details
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p><span className="font-medium">Base Amount:</span> {formatPrice(bill.amount)}</p>
                            {bill.lateFee && (
                              <p><span className="font-medium text-red-600">Late Fee:</span> {formatPrice(bill.lateFee)}</p>
                            )}
                            <p><span className="font-medium">Total:</span> {formatPrice(totalAmount)}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Dates
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p><span className="font-medium">Bill Date:</span> {formatDate(bill.billDate)}</p>
                            <p><span className="font-medium">Due Date:</span> {formatDate(bill.dueDate)}</p>
                            {bill.paymentDate && (
                              <p><span className="font-medium">Paid Date:</span> {formatDate(bill.paymentDate)}</p>
                            )}
                            {daysOverdue > 0 && (
                              <p><span className="font-medium text-red-600">Overdue:</span> {daysOverdue} days</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Payment Info
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {bill.paymentMethod && (
                              <p><span className="font-medium">Method:</span> {bill.paymentMethod}</p>
                            )}
                            {bill.transactionId && (
                              <p><span className="font-medium">Transaction:</span> {bill.transactionId}</p>
                            )}
                            {!bill.paymentMethod && (
                              <p className="text-gray-500">Not paid yet</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Utility Readings */}
                      {bill.utilityReadings && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Utility Readings
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Previous</p>
                              <p className="font-medium text-gray-900 dark:text-white">{bill.utilityReadings.previousReading}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Current</p>
                              <p className="font-medium text-gray-900 dark:text-white">{bill.utilityReadings.currentReading}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Usage</p>
                              <p className="font-medium text-gray-900 dark:text-white">{bill.utilityReadings.usage} units</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Rate</p>
                              <p className="font-medium text-gray-900 dark:text-white">${bill.utilityReadings.ratePerUnit}/unit</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleOpenModal('view', bill)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>

                        {(bill.status === 'pending' || bill.status === 'overdue') && (
                          <>
                            <button
                              onClick={() => handleMarkAsPaid(bill.id)}
                              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Mark as Paid
                            </button>

                            <button
                              onClick={() => handleSendReminder(bill)}
                              className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 19.718c.64.64 1.536 1.032 2.524 1.032h8.236a3.5 3.5 0 003.5-3.5v-8.236c0-.988-.392-1.884-1.032-2.524L12.282 1.676a2.5 2.5 0 00-3.536 0L3.932 6.49c-.64.64-1.032 1.536-1.032 2.524v8.236a3.5 3.5 0 003.5 3.5z" />
                              </svg>
                              Send Reminder
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleOpenModal('edit', bill)}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit
                        </button>

                        <button className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download PDF
                        </button>

                        <button
                          onClick={() => handleDeleteBill(bill.id)}
                          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
                ? "You haven't created any bills yet."
                : `No ${activeTab} bills found.`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => handleOpenModal('create')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Bill
              </button>
              {activeTab !== 'all' && (
                <button
                  onClick={() => setActiveTab('all')}
                  className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Show All Bills
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bill Modal */}
      {showBillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'create' && 'Create New Bill'}
                  {modalType === 'edit' && 'Edit Bill'}
                  {modalType === 'view' && 'Bill Details'}
                </h3>
                <button
                  onClick={() => setShowBillModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {modalType === 'view' && selectedBill ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Bill Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><span className="font-medium">Type:</span> {selectedBill.type}</p>
                        <p><span className="font-medium">Tenant:</span> {selectedBill.tenantName}</p>
                        <p><span className="font-medium">Room:</span> {selectedBill.roomName}</p>
                        <p><span className="font-medium">Description:</span> {selectedBill.description}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Amount:</span> {formatPrice(selectedBill.amount)}</p>
                        <p><span className="font-medium">Due Date:</span> {formatDate(selectedBill.dueDate)}</p>
                        <p><span className="font-medium">Status:</span> {selectedBill.status}</p>
                        {selectedBill.paymentDate && (
                          <p><span className="font-medium">Paid:</span> {formatDate(selectedBill.paymentDate)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitBill} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bill Type *
                      </label>
                      <select
                        required
                        value={billData.type}
                        onChange={(e) => setBillData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="rent">Monthly Rent</option>
                        <option value="utilities">Utilities</option>
                        <option value="deposit">Security Deposit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tenant *
                      </label>
                      <select
                        required
                        value={billData.tenantId}
                        onChange={(e) => setBillData(prev => ({ ...prev, tenantId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select Tenant</option>
                        {tenants.map((tenant) => (
                          <option key={tenant.id} value={tenant.id}>
                            {tenant.name} - {tenant.roomName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <input
                      type="text"
                      required
                      value={billData.description}
                      onChange={(e) => setBillData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter bill description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={billData.amount}
                        onChange={(e) => setBillData(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={billData.dueDate}
                        onChange={(e) => setBillData(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {billData.type === 'utilities' && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                        Utility Readings (Optional)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Previous Reading
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={billData.utilityReadings.previousReading}
                            onChange={(e) => setBillData(prev => ({ 
                              ...prev, 
                              utilityReadings: { ...prev.utilityReadings, previousReading: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Reading
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={billData.utilityReadings.currentReading}
                            onChange={(e) => setBillData(prev => ({ 
                              ...prev, 
                              utilityReadings: { ...prev.utilityReadings, currentReading: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Rate per Unit
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              step="0.01"
                              value={billData.utilityReadings.ratePerUnit}
                              onChange={(e) => setBillData(prev => ({ 
                                ...prev, 
                                utilityReadings: { ...prev.utilityReadings, ratePerUnit: e.target.value }
                              }))}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={calculateUtilityAmount}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors"
                            >
                              Calc
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowBillModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      {modalType === 'create' ? 'Create Bill' : 'Update Bill'}
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