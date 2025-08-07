'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TenantsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [tenants, setTenants] = useState([
    {
      id: 1,
      userId: 101,
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      userPhone: '+1 (555) 123-4567',
      roomId: 1,
      roomName: 'Modern Studio Apartment',
      houseName: 'Sunrise Residence',
      checkinDate: '2023-12-01',
      checkoutDate: null,
      isActive: true,
      monthlyRent: 250,
      securityDeposit: 500,
      emergencyContact: 'Jane Doe - (555) 987-6543',
      occupation: 'Software Engineer',
      notes: 'Excellent tenant, always pays on time. Very clean and respectful.',
      leaseEndDate: '2024-11-30',
      paymentStatus: 'current',
      lastPaymentDate: '2024-01-01',
      totalPaid: 250,
      outstandingBalance: 0,
      contractId: 'CT-2023-001'
    },
    {
      id: 2,
      userId: 102,
      userName: 'Emily Chen',
      userEmail: 'emily.chen@example.com',
      userPhone: '+1 (555) 234-5678',
      roomId: 2,
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      checkinDate: '2023-09-15',
      checkoutDate: null,
      isActive: true,
      monthlyRent: 180,
      securityDeposit: 360,
      emergencyContact: 'David Chen - (555) 345-6789',
      occupation: 'Graduate Student',
      notes: 'Quiet student, good communication. Occasionally late on rent but always pays.',
      leaseEndDate: '2024-06-15',
      paymentStatus: 'late',
      lastPaymentDate: '2023-12-28',
      totalPaid: 720,
      outstandingBalance: 180,
      contractId: 'CT-2023-045'
    },
    {
      id: 3,
      userId: 103,
      userName: 'Michael Rodriguez',
      userEmail: 'michael.r@example.com',
      userPhone: '+1 (555) 345-6789',
      roomId: 4,
      roomName: 'Luxury Penthouse Room',
      houseName: 'Sunrise Residence',
      checkinDate: '2023-11-15',
      checkoutDate: null,
      isActive: true,
      monthlyRent: 350,
      securityDeposit: 700,
      emergencyContact: 'Maria Rodriguez - (555) 456-7890',
      occupation: 'Remote Developer',
      notes: 'Professional tenant, works from home. Very responsible and communicative.',
      leaseEndDate: '2024-11-14',
      paymentStatus: 'current',
      lastPaymentDate: '2024-01-01',
      totalPaid: 700,
      outstandingBalance: 0,
      contractId: 'CT-2023-067'
    },
    {
      id: 4,
      userId: 104,
      userName: 'Sarah Wilson',
      userEmail: 'sarah.wilson@example.com',
      userPhone: '+1 (555) 456-7890',
      roomId: 3,
      roomName: 'Spacious Shared House Room',
      houseName: 'Green Valley House',
      checkinDate: '2023-06-01',
      checkoutDate: '2023-12-31',
      isActive: false,
      monthlyRent: 200,
      securityDeposit: 400,
      emergencyContact: 'Tom Wilson - (555) 567-8901',
      occupation: 'Marketing Manager',
      notes: 'Former tenant who moved out for job relocation. Left the room in excellent condition.',
      leaseEndDate: '2023-12-31',
      paymentStatus: 'completed',
      lastPaymentDate: '2023-12-01',
      totalPaid: 1400,
      outstandingBalance: 0,
      contractId: 'CT-2023-023'
    }
  ]);

  const [showTenantModal, setShowTenantModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [modalType, setModalType] = useState(''); // 'details', 'payment', 'checkout', 'notes'
  const [formData, setFormData] = useState({});

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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'current':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'late':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'current':
        return '✅';
      case 'late':
        return '⚠️';
      case 'completed':
        return '🏁';
      default:
        return '📋';
    }
  };

  const getDaysUntilLeaseEnd = (leaseEndDate) => {
    const today = new Date();
    const endDate = new Date(leaseEndDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredTenants = tenants.filter(tenant => {
    if (activeTab === 'current') return tenant.isActive;
    if (activeTab === 'former') return !tenant.isActive;
    if (activeTab === 'late') return tenant.isActive && tenant.paymentStatus === 'late';
    return true;
  });

  const handleOpenModal = (tenant, type) => {
    setSelectedTenant(tenant);
    setModalType(type);
    
    if (type === 'notes') {
      setFormData({ notes: tenant.notes });
    } else if (type === 'checkout') {
      setFormData({ 
        checkoutDate: new Date().toISOString().split('T')[0],
        finalNotes: '',
        depositReturn: tenant.securityDeposit
      });
    } else if (type === 'payment') {
      setFormData({
        amount: tenant.outstandingBalance || tenant.monthlyRent,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'bank_transfer',
        notes: ''
      });
    }
    
    setShowTenantModal(true);
  };

  const handleSubmitModal = (e) => {
    e.preventDefault();
    
    if (modalType === 'notes') {
      setTenants(prev => prev.map(tenant => 
        tenant.id === selectedTenant.id 
          ? { ...tenant, notes: formData.notes }
          : tenant
      ));
      alert('Notes updated successfully!');
    } else if (modalType === 'checkout') {
      setTenants(prev => prev.map(tenant => 
        tenant.id === selectedTenant.id 
          ? { 
              ...tenant, 
              isActive: false,
              checkoutDate: formData.checkoutDate,
              notes: `${tenant.notes}\n\nCheckout Notes: ${formData.finalNotes}`,
              paymentStatus: 'completed'
            }
          : tenant
      ));
      alert('Tenant checked out successfully!');
    } else if (modalType === 'payment') {
      setTenants(prev => prev.map(tenant => 
        tenant.id === selectedTenant.id 
          ? { 
              ...tenant, 
              lastPaymentDate: formData.paymentDate,
              totalPaid: tenant.totalPaid + parseFloat(formData.amount),
              outstandingBalance: Math.max(0, tenant.outstandingBalance - parseFloat(formData.amount)),
              paymentStatus: tenant.outstandingBalance - parseFloat(formData.amount) <= 0 ? 'current' : 'late'
            }
          : tenant
      ));
      alert('Payment recorded successfully!');
    }
    
    setShowTenantModal(false);
    setSelectedTenant(null);
    setModalType('');
    setFormData({});
  };

  const handleSendNotification = (tenant, type) => {
    // This would integrate with your notification system
    const messages = {
      payment_reminder: `Payment reminder sent to ${tenant.userName}`,
      lease_renewal: `Lease renewal notice sent to ${tenant.userName}`,
      maintenance: `Maintenance notification sent to ${tenant.userName}`,
      general: `General notification sent to ${tenant.userName}`
    };
    
    alert(messages[type] || 'Notification sent successfully!');
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentTenants = tenants.filter(t => t.isActive).length;
  const formerTenants = tenants.filter(t => !t.isActive).length;
  const lateTenants = tenants.filter(t => t.isActive && t.paymentStatus === 'late').length;
  const totalRevenue = tenants.filter(t => t.isActive).reduce((sum, tenant) => sum + tenant.monthlyRent, 0);
  const outstandingAmount = tenants.filter(t => t.isActive).reduce((sum, tenant) => sum + tenant.outstandingBalance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tenants Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your current and former tenants
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding Amount</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatPrice(outstandingAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Tenants', count: tenants.length },
              { key: 'current', label: 'Current', count: currentTenants },
              { key: 'late', label: 'Late Payment', count: lateTenants },
              { key: 'former', label: 'Former', count: formerTenants }
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Tenants</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentTenants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(totalRevenue)}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Late Payments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{lateTenants}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(outstandingAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tenants List */}
      {filteredTenants.length > 0 ? (
        <div className="space-y-4">
          {filteredTenants.map((tenant) => {
            const daysUntilLeaseEnd = getDaysUntilLeaseEnd(tenant.leaseEndDate);
            return (
              <div key={tenant.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                    {/* Tenant Avatar */}
                    <div className="flex-shrink-0 mb-4 lg:mb-0">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {tenant.userName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>

                    {/* Tenant Details */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {tenant.userName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {tenant.userEmail}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {tenant.userPhone}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {tenant.roomName} - {tenant.houseName}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center space-x-3">
                          {tenant.isActive && daysUntilLeaseEnd <= 30 && daysUntilLeaseEnd > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              Lease ends in {daysUntilLeaseEnd} days
                            </span>
                          )}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(tenant.paymentStatus)}`}>
                            <span className="mr-1">{getPaymentStatusIcon(tenant.paymentStatus)}</span>
                            {tenant.paymentStatus.charAt(0).toUpperCase() + tenant.paymentStatus.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Tenant Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Lease Information
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p><span className="font-medium">Check-in:</span> {formatDate(tenant.checkinDate)}</p>
                            {tenant.checkoutDate ? (
                              <p><span className="font-medium">Check-out:</span> {formatDate(tenant.checkoutDate)}</p>
                            ) : (
                              <p><span className="font-medium">Lease ends:</span> {formatDate(tenant.leaseEndDate)}</p>
                            )}
                            <p><span className="font-medium">Monthly Rent:</span> {formatPrice(tenant.monthlyRent)}</p>
                            <p><span className="font-medium">Security Deposit:</span> {formatPrice(tenant.securityDeposit)}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Payment Status
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p><span className="font-medium">Last Payment:</span> {formatDate(tenant.lastPaymentDate)}</p>
                            <p><span className="font-medium">Total Paid:</span> {formatPrice(tenant.totalPaid)}</p>
                            {tenant.outstandingBalance > 0 && (
                              <p><span className="font-medium text-red-600">Outstanding:</span> {formatPrice(tenant.outstandingBalance)}</p>
                            )}
                            <p><span className="font-medium">Contract:</span> {tenant.contractId}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Contact Information
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p><span className="font-medium">Occupation:</span> {tenant.occupation}</p>
                            <p><span className="font-medium">Emergency:</span> {tenant.emergencyContact}</p>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {tenant.notes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Notes
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg line-clamp-2">
                            {tenant.notes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleOpenModal(tenant, 'details')}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>

                        {tenant.isActive && (
                          <>
                            <button
                              onClick={() => handleOpenModal(tenant, 'payment')}
                              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Record Payment
                            </button>

                            <div className="relative">
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleSendNotification(tenant, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="appearance-none bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors pr-8"
                              >
                                <option value="">Send Notification</option>
                                <option value="payment_reminder">Payment Reminder</option>
                                <option value="lease_renewal">Lease Renewal</option>
                                <option value="maintenance">Maintenance Notice</option>
                                <option value="general">General Message</option>
                              </select>
                              <svg className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>

                            <button
                              onClick={() => handleOpenModal(tenant, 'checkout')}
                              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Check Out
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleOpenModal(tenant, 'notes')}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit Notes
                        </button>

                        <Link
                          href={`mailto:${tenant.userEmail}`}
                          className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email
                        </Link>
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
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No tenants found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'all' 
                ? "You don't have any tenants yet."
                : `No ${activeTab} tenants found.`
              }
            </p>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Show All Tenants
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showTenantModal && selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'details' && 'Tenant Details'}
                  {modalType === 'notes' && 'Edit Notes'}
                  {modalType === 'checkout' && 'Check Out Tenant'}
                  {modalType === 'payment' && 'Record Payment'}
                </h3>
                <button
                  onClick={() => setShowTenantModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {modalType === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Personal Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {selectedTenant.userName}</p>
                        <p><span className="font-medium">Email:</span> {selectedTenant.userEmail}</p>
                        <p><span className="font-medium">Phone:</span> {selectedTenant.userPhone}</p>
                        <p><span className="font-medium">Occupation:</span> {selectedTenant.occupation}</p>
                        <p><span className="font-medium">Emergency Contact:</span> {selectedTenant.emergencyContact}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Lease Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Room:</span> {selectedTenant.roomName}</p>
                        <p><span className="font-medium">Property:</span> {selectedTenant.houseName}</p>
                        <p><span className="font-medium">Check-in:</span> {formatDate(selectedTenant.checkinDate)}</p>
                        <p><span className="font-medium">Lease End:</span> {formatDate(selectedTenant.leaseEndDate)}</p>
                        <p><span className="font-medium">Monthly Rent:</span> {formatPrice(selectedTenant.monthlyRent)}</p>
                      </div>
                    </div>
                  </div>
                  {selectedTenant.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Notes</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        {selectedTenant.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(modalType === 'notes' || modalType === 'checkout' || modalType === 'payment') && (
                <form onSubmit={handleSubmitModal} className="space-y-4">
                  {modalType === 'notes' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                      </label>
                      <textarea
                        rows={6}
                        value={formData.notes || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Add notes about this tenant..."
                      />
                    </div>
                  )}

                  {modalType === 'checkout' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Check-out Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.checkoutDate || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, checkoutDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Security Deposit Return
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.depositReturn || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, depositReturn: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Final Notes
                        </label>
                        <textarea
                          rows={4}
                          value={formData.finalNotes || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, finalNotes: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Room condition, damages, etc..."
                        />
                      </div>
                    </>
                  )}

                  {modalType === 'payment' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Amount *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.amount || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Payment Date *
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.paymentDate || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Payment Method
                        </label>
                        <select
                          value={formData.paymentMethod || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="cash">Cash</option>
                          <option value="check">Check</option>
                          <option value="credit_card">Credit Card</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notes
                        </label>
                        <textarea
                          rows={3}
                          value={formData.notes || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Payment notes..."
                        />
                      </div>
                    </>
                  )}

                  {modalType !== 'details' && (
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowTenantModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        {modalType === 'notes' && 'Update Notes'}
                        {modalType === 'checkout' && 'Check Out Tenant'}
                        {modalType === 'payment' && 'Record Payment'}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}