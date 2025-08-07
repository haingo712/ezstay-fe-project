'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ContractsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [contracts, setContracts] = useState([
    {
      id: 1,
      contractId: 'CT-2024-001',
      tenantId: 1,
      tenantName: 'John Doe',
      tenantEmail: 'john.doe@example.com',
      tenantPhone: '+1 (555) 123-4567',
      ownerId: 1,
      roomId: 1,
      roomName: 'Modern Studio Apartment',
      houseName: 'Sunrise Residence',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      monthlyRent: 250,
      securityDeposit: 500,
      status: 'active',
      fileUrl: '/contracts/CT-2024-001.pdf',
      createdAt: '2023-12-15T10:00:00Z',
      signedAt: '2023-12-20T14:30:00Z',
      terms: {
        leaseDuration: 12,
        renewalOption: true,
        petPolicy: 'No pets allowed',
        smokingPolicy: 'No smoking',
        maintenanceResponsibility: 'Landlord handles major repairs, tenant handles minor maintenance',
        utilitiesIncluded: ['Water', 'Trash'],
        utilitiesExcluded: ['Electricity', 'Internet'],
        earlyTerminationFee: 500,
        lateFeePolicy: '$25 after 5 days late'
      },
      renewalHistory: []
    },
    {
      id: 2,
      contractId: 'CT-2023-045',
      tenantId: 2,
      tenantName: 'Emily Chen',
      tenantEmail: 'emily.chen@example.com',
      tenantPhone: '+1 (555) 234-5678',
      ownerId: 1,
      roomId: 2,
      roomName: 'Cozy Room Near University',
      houseName: 'Student Haven',
      startDate: '2023-09-15',
      endDate: '2024-06-15',
      monthlyRent: 180,
      securityDeposit: 360,
      status: 'expiring_soon',
      fileUrl: '/contracts/CT-2023-045.pdf',
      createdAt: '2023-09-01T09:00:00Z',
      signedAt: '2023-09-10T11:15:00Z',
      terms: {
        leaseDuration: 9,
        renewalOption: true,
        petPolicy: 'Small pets allowed with deposit',
        smokingPolicy: 'No smoking',
        maintenanceResponsibility: 'Shared responsibility',
        utilitiesIncluded: ['Water', 'Trash', 'Internet'],
        utilitiesExcluded: ['Electricity'],
        earlyTerminationFee: 300,
        lateFeePolicy: '$20 after 3 days late'
      },
      renewalHistory: []
    },
    {
      id: 3,
      contractId: 'CT-2023-067',
      tenantId: 3,
      tenantName: 'Michael Rodriguez',
      tenantEmail: 'michael.r@example.com',
      tenantPhone: '+1 (555) 345-6789',
      ownerId: 1,
      roomId: 4,
      roomName: 'Luxury Penthouse Room',
      houseName: 'Sunrise Residence',
      startDate: '2023-11-15',
      endDate: '2024-11-14',
      monthlyRent: 350,
      securityDeposit: 700,
      status: 'active',
      fileUrl: '/contracts/CT-2023-067.pdf',
      createdAt: '2023-11-01T08:30:00Z',
      signedAt: '2023-11-10T16:45:00Z',
      terms: {
        leaseDuration: 12,
        renewalOption: true,
        petPolicy: 'No pets allowed',
        smokingPolicy: 'No smoking',
        maintenanceResponsibility: 'Landlord handles all maintenance',
        utilitiesIncluded: ['Water', 'Trash', 'Internet', 'Cable'],
        utilitiesExcluded: ['Electricity'],
        earlyTerminationFee: 700,
        lateFeePolicy: '$30 after 5 days late'
      },
      renewalHistory: []
    },
    {
      id: 4,
      contractId: 'CT-2023-023',
      tenantId: 4,
      tenantName: 'Sarah Wilson',
      tenantEmail: 'sarah.wilson@example.com',
      tenantPhone: '+1 (555) 456-7890',
      ownerId: 1,
      roomId: 3,
      roomName: 'Spacious Shared House Room',
      houseName: 'Green Valley House',
      startDate: '2023-06-01',
      endDate: '2023-12-31',
      monthlyRent: 200,
      securityDeposit: 400,
      status: 'expired',
      fileUrl: '/contracts/CT-2023-023.pdf',
      createdAt: '2023-05-15T12:00:00Z',
      signedAt: '2023-05-25T10:30:00Z',
      terms: {
        leaseDuration: 7,
        renewalOption: false,
        petPolicy: 'Pets allowed with approval',
        smokingPolicy: 'Outdoor smoking only',
        maintenanceResponsibility: 'Tenant handles minor repairs',
        utilitiesIncluded: ['Water', 'Trash'],
        utilitiesExcluded: ['Electricity', 'Internet'],
        earlyTerminationFee: 400,
        lateFeePolicy: '$15 after 7 days late'
      },
      renewalHistory: []
    }
  ]);

  const [showContractModal, setShowContractModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'view', 'renew', 'terminate'
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractData, setContractData] = useState({
    tenantId: '',
    roomId: '',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    securityDeposit: '',
    terms: {
      leaseDuration: 12,
      renewalOption: true,
      petPolicy: '',
      smokingPolicy: '',
      maintenanceResponsibility: '',
      utilitiesIncluded: [],
      utilitiesExcluded: [],
      earlyTerminationFee: '',
      lateFeePolicy: ''
    }
  });

  const [tenants] = useState([
    { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
    { id: 2, name: 'Emily Chen', email: 'emily.chen@example.com' },
    { id: 3, name: 'Michael Rodriguez', email: 'michael.r@example.com' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@example.com' }
  ]);

  const [rooms] = useState([
    { id: 1, name: 'Modern Studio Apartment', houseName: 'Sunrise Residence' },
    { id: 2, name: 'Cozy Room Near University', houseName: 'Student Haven' },
    { id: 3, name: 'Spacious Shared House Room', houseName: 'Green Valley House' },
    { id: 4, name: 'Luxury Penthouse Room', houseName: 'Sunrise Residence' }
  ]);

  const [availableUtilities] = useState([
    'Water', 'Electricity', 'Internet', 'Cable', 'Trash', 'Gas', 'Heating', 'Air Conditioning'
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
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'terminated':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return '✅';
      case 'expiring_soon':
        return '⚠️';
      case 'expired':
        return '❌';
      case 'terminated':
        return '🚫';
      default:
        return '📋';
    }
  };

  const getDaysUntilExpiry = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredContracts = contracts.filter(contract => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return contract.status === 'active';
    if (activeTab === 'expiring') return contract.status === 'expiring_soon';
    if (activeTab === 'expired') return contract.status === 'expired' || contract.status === 'terminated';
    return true;
  });

  const handleOpenModal = (type, contract = null) => {
    setModalType(type);
    setSelectedContract(contract);
    
    if (type === 'create') {
      setContractData({
        tenantId: '',
        roomId: '',
        startDate: '',
        endDate: '',
        monthlyRent: '',
        securityDeposit: '',
        terms: {
          leaseDuration: 12,
          renewalOption: true,
          petPolicy: 'No pets allowed',
          smokingPolicy: 'No smoking',
          maintenanceResponsibility: 'Landlord handles major repairs',
          utilitiesIncluded: [],
          utilitiesExcluded: [],
          earlyTerminationFee: '',
          lateFeePolicy: '$25 after 5 days late'
        }
      });
    } else if (type === 'renew' && contract) {
      const newStartDate = contract.endDate;
      const newEndDate = new Date(contract.endDate);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      
      setContractData({
        tenantId: contract.tenantId,
        roomId: contract.roomId,
        startDate: newStartDate,
        endDate: newEndDate.toISOString().split('T')[0],
        monthlyRent: contract.monthlyRent,
        securityDeposit: contract.securityDeposit,
        terms: { ...contract.terms }
      });
    }
    
    setShowContractModal(true);
  };

  const handleSubmitContract = (e) => {
    e.preventDefault();
    
    const selectedTenant = tenants.find(t => t.id === parseInt(contractData.tenantId));
    const selectedRoom = rooms.find(r => r.id === parseInt(contractData.roomId));
    
    if (modalType === 'create') {
      const newContract = {
        id: contracts.length + 1,
        contractId: `CT-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(3, '0')}`,
        ...contractData,
        tenantId: parseInt(contractData.tenantId),
        roomId: parseInt(contractData.roomId),
        tenantName: selectedTenant?.name || 'Unknown Tenant',
        tenantEmail: selectedTenant?.email || '',
        roomName: selectedRoom?.name || 'Unknown Room',
        houseName: selectedRoom?.houseName || 'Unknown House',
        ownerId: 1,
        monthlyRent: parseFloat(contractData.monthlyRent),
        securityDeposit: parseFloat(contractData.securityDeposit),
        status: 'active',
        fileUrl: `/contracts/CT-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(3, '0')}.pdf`,
        createdAt: new Date().toISOString(),
        signedAt: null,
        renewalHistory: []
      };
      
      setContracts(prev => [newContract, ...prev]);
      alert('Contract created successfully!');
    } else if (modalType === 'renew') {
      const renewedContract = {
        ...selectedContract,
        id: contracts.length + 1,
        contractId: `CT-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(3, '0')}`,
        startDate: contractData.startDate,
        endDate: contractData.endDate,
        monthlyRent: parseFloat(contractData.monthlyRent),
        securityDeposit: parseFloat(contractData.securityDeposit),
        terms: contractData.terms,
        status: 'active',
        createdAt: new Date().toISOString(),
        signedAt: null,
        renewalHistory: [...(selectedContract.renewalHistory || []), {
          previousContractId: selectedContract.contractId,
          renewedAt: new Date().toISOString()
        }]
      };
      
      // Mark old contract as expired
      setContracts(prev => prev.map(contract => 
        contract.id === selectedContract.id 
          ? { ...contract, status: 'expired' }
          : contract
      ));
      
      // Add new contract
      setContracts(prev => [renewedContract, ...prev]);
      alert('Contract renewed successfully!');
    }
    
    setShowContractModal(false);
    setSelectedContract(null);
    setModalType('');
  };

  const handleTerminateContract = (contractId) => {
    if (confirm('Are you sure you want to terminate this contract? This action cannot be undone.')) {
      setContracts(prev => prev.map(contract => 
        contract.id === contractId 
          ? { ...contract, status: 'terminated' }
          : contract
      ));
      alert('Contract terminated successfully!');
    }
  };

  const handleUtilityToggle = (utility, type) => {
    setContractData(prev => ({
      ...prev,
      terms: {
        ...prev.terms,
        [type]: prev.terms[type].includes(utility)
          ? prev.terms[type].filter(u => u !== utility)
          : [...prev.terms[type], utility]
      }
    }));
  };

  const generateContractPDF = (contract) => {
    // This would integrate with a PDF generation service
    alert(`Generating PDF for contract ${contract.contractId}...`);
  };

  const sendContractForSigning = (contract) => {
    // This would integrate with an e-signature service
    alert(`Contract ${contract.contractId} sent to ${contract.tenantName} for signing.`);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const expiringContracts = contracts.filter(c => c.status === 'expiring_soon').length;
  const expiredContracts = contracts.filter(c => c.status === 'expired' || c.status === 'terminated').length;
  const totalMonthlyRevenue = contracts.filter(c => c.status === 'active')
    .reduce((sum, contract) => sum + contract.monthlyRent, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contracts Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage rental contracts and lease agreements
              </p>
            </div>
            <button
              onClick={() => handleOpenModal('create')}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Contract
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Contracts', count: totalContracts },
              { key: 'active', label: 'Active', count: activeContracts },
              { key: 'expiring', label: 'Expiring Soon', count: expiringContracts },
              { key: 'expired', label: 'Expired', count: expiredContracts }
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contracts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalContracts}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Contracts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeContracts}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{expiringContracts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(totalMonthlyRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      {filteredContracts.length > 0 ? (
        <div className="space-y-4">
          {filteredContracts.map((contract) => {
            const daysUntilExpiry = getDaysUntilExpiry(contract.endDate);
            return (
              <div key={contract.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                    {/* Contract Icon */}
                    <div className="flex-shrink-0 mb-4 lg:mb-0">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29.82-5.877 2.172M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.875a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Contract Details */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Contract {contract.contractId}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {contract.tenantName} - {contract.tenantEmail}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {contract.roomName} - {contract.houseName}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center space-x-3">
                          {contract.status === 'active' && daysUntilExpiry <= 60 && daysUntilExpiry > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              Expires in {daysUntilExpiry} days
                            </span>
                          )}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                            <span className="mr-1">{getStatusIcon(contract.status)}</span>
                            {contract.status.replace('_', ' ').charAt(0).toUpperCase() + contract.status.replace('_', ' ').slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Contract Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Lease Period
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p><span className="font-medium">Start:</span> {formatDate(contract.startDate)}</p>
                            <p><span className="font-medium">End:</span> {formatDate(contract.endDate)}</p>
                            <p><span className="font-medium">Duration:</span> {contract.terms.leaseDuration} months</p>
                            <p><span className="font-medium">Renewal:</span> {contract.terms.renewalOption ? 'Allowed' : 'Not allowed'}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Financial Terms
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p><span className="font-medium">Monthly Rent:</span> {formatPrice(contract.monthlyRent)}</p>
                            <p><span className="font-medium">Security Deposit:</span> {formatPrice(contract.securityDeposit)}</p>
                            <p><span className="font-medium">Early Termination:</span> {formatPrice(contract.terms.earlyTerminationFee)}</p>
                            <p><span className="font-medium">Late Fee:</span> {contract.terms.lateFeePolicy}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Contract Status
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p><span className="font-medium">Created:</span> {formatDate(contract.createdAt)}</p>
                            {contract.signedAt ? (
                              <p><span className="font-medium">Signed:</span> {formatDate(contract.signedAt)}</p>
                            ) : (
                              <p><span className="font-medium text-yellow-600">Status:</span> Pending signature</p>
                            )}
                            <p><span className="font-medium">Pet Policy:</span> {contract.terms.petPolicy}</p>
                            <p><span className="font-medium">Smoking:</span> {contract.terms.smokingPolicy}</p>
                          </div>
                        </div>
                      </div>

                      {/* Utilities */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Utilities Included
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {contract.terms.utilitiesIncluded.length > 0 ? (
                              contract.terms.utilitiesIncluded.map((utility, index) => (
                                <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                                  {utility}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-400">None</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Utilities Excluded
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {contract.terms.utilitiesExcluded.length > 0 ? (
                              contract.terms.utilitiesExcluded.map((utility, index) => (
                                <span key={index} className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded-full">
                                  {utility}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-400">None</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleOpenModal('view', contract)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>

                        <button
                          onClick={() => generateContractPDF(contract)}
                          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download PDF
                        </button>

                        {!contract.signedAt && (
                          <button
                            onClick={() => sendContractForSigning(contract)}
                            className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Send for Signing
                          </button>
                        )}

                        {(contract.status === 'active' || contract.status === 'expiring_soon') && contract.terms.renewalOption && (
                          <button
                            onClick={() => handleOpenModal('renew', contract)}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Renew Contract
                          </button>
                        )}

                        {contract.status === 'active' && (
                          <button
                            onClick={() => handleTerminateContract(contract.id)}
                            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Terminate
                          </button>
                        )}
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
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No contracts found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'all' 
                ? "You haven't created any contracts yet."
                : `No ${activeTab} contracts found.`
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
                Create Contract
              </button>
              {activeTab !== 'all' && (
                <button
                  onClick={() => setActiveTab('all')}
                  className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Show All Contracts
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contract Modal */}
      {showContractModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'create' && 'Create New Contract'}
                  {modalType === 'renew' && 'Renew Contract'}
                  {modalType === 'view' && 'Contract Details'}
                </h3>
                <button
                  onClick={() => setShowContractModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {modalType === 'view' && selectedContract ? (
                <div className="space-y-6">
                  {/* Contract details view would go here */}
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      Detailed contract view would be implemented here with all contract terms, signatures, and history.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitContract} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tenant *
                      </label>
                      <select
                        required
                        value={contractData.tenantId}
                        onChange={(e) => setContractData(prev => ({ ...prev, tenantId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={modalType === 'renew'}
                      >
                        <option value="">Select Tenant</option>
                        {tenants.map((tenant) => (
                          <option key={tenant.id} value={tenant.id}>
                            {tenant.name} - {tenant.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Room *
                      </label>
                      <select
                        required
                        value={contractData.roomId}
                        onChange={(e) => setContractData(prev => ({ ...prev, roomId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={modalType === 'renew'}
                      >
                        <option value="">Select Room</option>
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name} - {room.houseName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={contractData.startDate}
                        onChange={(e) => setContractData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={contractData.endDate}
                        onChange={(e) => setContractData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Monthly Rent *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={contractData.monthlyRent}
                        onChange={(e) => setContractData(prev => ({ ...prev, monthlyRent: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Security Deposit *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={contractData.securityDeposit}
                        onChange={(e) => setContractData(prev => ({ ...prev, securityDeposit: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Contract Terms */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contract Terms</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Pet Policy
                        </label>
                        <input
                          type="text"
                          value={contractData.terms.petPolicy}
                          onChange={(e) => setContractData(prev => ({ 
                            ...prev, 
                            terms: { ...prev.terms, petPolicy: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., No pets allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Smoking Policy
                        </label>
                        <input
                          type="text"
                          value={contractData.terms.smokingPolicy}
                          onChange={(e) => setContractData(prev => ({ 
                            ...prev, 
                            terms: { ...prev.terms, smokingPolicy: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., No smoking"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Early Termination Fee
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={contractData.terms.earlyTerminationFee}
                          onChange={(e) => setContractData(prev => ({ 
                            ...prev, 
                            terms: { ...prev.terms, earlyTerminationFee: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Late Fee Policy
                        </label>
                        <input
                          type="text"
                          value={contractData.terms.lateFeePolicy}
                          onChange={(e) => setContractData(prev => ({ 
                            ...prev, 
                            terms: { ...prev.terms, lateFeePolicy: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., $25 after 5 days late"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Maintenance Responsibility
                      </label>
                      <textarea
                        rows={3}
                        value={contractData.terms.maintenanceResponsibility}
                        onChange={(e) => setContractData(prev => ({ 
                          ...prev, 
                          terms: { ...prev.terms, maintenanceResponsibility: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Describe maintenance responsibilities..."
                      />
                    </div>

                    {/* Utilities */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                          Utilities Included
                        </label>
                        <div className="space-y-2">
                          {availableUtilities.map((utility) => (
                            <label key={utility} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={contractData.terms.utilitiesIncluded.includes(utility)}
                                onChange={() => handleUtilityToggle(utility, 'utilitiesIncluded')}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                {utility}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                          Utilities Excluded
                        </label>
                        <div className="space-y-2">
                          {availableUtilities.map((utility) => (
                            <label key={utility} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={contractData.terms.utilitiesExcluded.includes(utility)}
                                onChange={() => handleUtilityToggle(utility, 'utilitiesExcluded')}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                {utility}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowContractModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      {modalType === 'create' ? 'Create Contract' : 'Renew Contract'}
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