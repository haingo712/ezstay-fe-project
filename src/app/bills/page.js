'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import utilityBillService from '@/services/utilityBillService';

// ============ MOCK DATA FOR DEMO - DELETE AFTER SCREENSHOT ============
const MOCK_BILLS = [
    {
        id: 'bill-001',
        roomId: 'room-001',
        roomName: 'Phòng A101 - Studio Premium',
        houseName: 'Nhà trọ Sunshine Residence',
        amount: 1250000,
        status: 'Unpaid',
        note: 'Hóa đơn điện nước tháng 11/2025',
        createdAt: '2025-11-25T10:00:00Z',
        dueDate: '2025-12-05T23:59:59Z',
        electricityUsage: 120,
        electricityRate: 3500,
        electricityAmount: 420000,
        waterUsage: 15,
        waterRate: 15000,
        waterAmount: 225000,
        internetAmount: 100000,
        otherAmount: 0,
        period: 'Tháng 11/2025'
    },
    {
        id: 'bill-002',
        roomId: 'room-001',
        roomName: 'Phòng A101 - Studio Premium',
        houseName: 'Nhà trọ Sunshine Residence',
        amount: 980000,
        status: 'Paid',
        note: 'Hóa đơn điện nước tháng 10/2025',
        createdAt: '2025-10-25T10:00:00Z',
        dueDate: '2025-11-05T23:59:59Z',
        paidAt: '2025-10-28T14:30:00Z',
        electricityUsage: 95,
        electricityRate: 3500,
        electricityAmount: 332500,
        waterUsage: 12,
        waterRate: 15000,
        waterAmount: 180000,
        internetAmount: 100000,
        otherAmount: 0,
        period: 'Tháng 10/2025'
    },
    {
        id: 'bill-003',
        roomId: 'room-001',
        roomName: 'Phòng A101 - Studio Premium',
        houseName: 'Nhà trọ Sunshine Residence',
        amount: 1100000,
        status: 'Paid',
        note: 'Hóa đơn điện nước tháng 9/2025',
        createdAt: '2025-09-25T10:00:00Z',
        dueDate: '2025-10-05T23:59:59Z',
        paidAt: '2025-09-30T09:15:00Z',
        electricityUsage: 110,
        electricityRate: 3500,
        electricityAmount: 385000,
        waterUsage: 14,
        waterRate: 15000,
        waterAmount: 210000,
        internetAmount: 100000,
        otherAmount: 0,
        period: 'Tháng 9/2025'
    },
    {
        id: 'bill-004',
        roomId: 'room-001',
        roomName: 'Phòng A101 - Studio Premium',
        houseName: 'Nhà trọ Sunshine Residence',
        amount: 1500000,
        status: 'Overdue',
        note: 'Hóa đơn điện nước tháng 8/2025 - QUÁ HẠN',
        createdAt: '2025-08-25T10:00:00Z',
        dueDate: '2025-09-05T23:59:59Z',
        electricityUsage: 150,
        electricityRate: 3500,
        electricityAmount: 525000,
        waterUsage: 18,
        waterRate: 15000,
        waterAmount: 270000,
        internetAmount: 100000,
        otherAmount: 100000,
        period: 'Tháng 8/2025'
    },
    {
        id: 'bill-005',
        roomId: 'room-001',
        roomName: 'Phòng A101 - Studio Premium',
        houseName: 'Nhà trọ Sunshine Residence',
        amount: 850000,
        status: 'Paid',
        note: 'Hóa đơn điện nước tháng 7/2025',
        createdAt: '2025-07-25T10:00:00Z',
        dueDate: '2025-08-05T23:59:59Z',
        paidAt: '2025-07-30T16:45:00Z',
        electricityUsage: 80,
        electricityRate: 3500,
        electricityAmount: 280000,
        waterUsage: 10,
        waterRate: 15000,
        waterAmount: 150000,
        internetAmount: 100000,
        otherAmount: 0,
        period: 'Tháng 7/2025'
    }
];
// ============ END MOCK DATA ============

export default function TenantBillsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [bills, setBills] = useState([]);
    const [filteredBills, setFilteredBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [error, setError] = useState(null);

    // Filter states
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Load bills
    useEffect(() => {
        loadBills();
    }, []);

    // Apply filters
    useEffect(() => {
        applyFilters();
    }, [bills, statusFilter, searchTerm]);

    const loadBills = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await utilityBillService.getTenantBills({
                $orderby: 'CreatedAt desc'
            });

            // Handle OData response - could be { value: [...] } or [...]
            const billsData = response.value || response || [];
            
            // ============ USE MOCK DATA IF NO REAL DATA ============
            const dataToUse = billsData && billsData.length > 0 ? billsData : MOCK_BILLS;
            setBills(dataToUse);
            setFilteredBills(dataToUse);
            // ============ END MOCK DATA USAGE ============
        } catch (err) {
            console.error('Error loading bills:', err);
            // ============ USE MOCK DATA ON ERROR ============
            setBills(MOCK_BILLS);
            setFilteredBills(MOCK_BILLS);
            // ============ END MOCK DATA ON ERROR ============
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...bills];

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(bill => bill.status === statusFilter);
        }

        // Search filter (by note, amount)
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(bill =>
                bill.note?.toLowerCase().includes(term) ||
                bill.amount.toString().includes(term) ||
                bill.id.toLowerCase().includes(term)
            );
        }

        setFilteredBills(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    };

    const handleViewDetail = (bill) => {
        setSelectedBill(bill);
        setShowDetailModal(true);
    };

    const handlePayBill = (billId) => {
        // Navigate to payment page
        router.push(`/payment/bill/${billId}`);
    };

    // Pagination
    const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBills = filteredBills.slice(startIndex, endIndex);

    // Calculate statistics
    const stats = {
        total: bills.length,
        unpaid: bills.filter(b => b.status === 'Unpaid').length,
        paid: bills.filter(b => b.status === 'Paid').length,
        overdue: bills.filter(b => b.status === 'Overdue').length,
        totalAmount: bills.reduce((sum, b) => sum + b.amount, 0),
        unpaidAmount: bills.filter(b => b.status === 'Unpaid').reduce((sum, b) => sum + b.amount, 0)
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['User']}>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">{t('bills.loading')}</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['User']}>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            {t('bills.backToHome')}
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">💰 {t('bills.title')}</h1>
                        <p className="mt-2 text-gray-600">{t('bills.subtitle')}</p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{t('bills.totalBills')}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{t('bills.unpaid')}</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.unpaid}</p>
                                </div>
                                <div className="bg-yellow-100 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {utilityBillService.formatCurrency(stats.unpaidAmount)}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{t('bills.paid')}</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{t('bills.overdue')}</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                                </div>
                                <div className="bg-red-100 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('bills.status')}
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">{t('bills.all')}</option>
                                    <option value="Unpaid">{t('bills.unpaid')}</option>
                                    <option value="Paid">{t('bills.paid')}</option>
                                    <option value="Overdue">{t('bills.overdue')}</option>
                                    <option value="Cancelled">{t('bills.cancelled')}</option>
                                </select>
                            </div>

                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('bills.search')}
                                </label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('bills.searchPlaceholder')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-8">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Bills Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('bills.billId')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('bills.createdDate')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('bills.amount')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('bills.status')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('bills.paymentMethod')}
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('bills.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentBills.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p className="mt-2">{t('bills.noBills')}</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentBills.map((bill) => {
                                            const statusInfo = utilityBillService.getStatusLabel(bill.status);
                                            return (
                                                <tr key={bill.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {bill.id.substring(0, 8).toUpperCase()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {utilityBillService.formatDate(bill.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                        {utilityBillService.formatCurrency(bill.amount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                                                            {statusInfo.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {bill.paymentMethod || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleViewDetail(bill)}
                                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                                        >
                                                            {t('bills.view')}
                                                        </button>
                                                        <button
                                                            onClick={() => handlePayBill(bill.id)}
                                                            className={`${bill.status === 'Unpaid'
                                                                ? 'text-green-600 hover:text-green-900'
                                                                : 'text-gray-400 cursor-not-allowed'
                                                                }`}
                                                            disabled={bill.status === 'Unpaid'}
                                                        >
                                                            💳 {t('bills.pay')}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        {t('bills.previous')}
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        {t('bills.next')}
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            {t('bills.showing')} <span className="font-medium">{startIndex + 1}</span> {t('bills.to')}{' '}
                                            <span className="font-medium">{Math.min(endIndex, filteredBills.length)}</span> {t('bills.of')}{' '}
                                            <span className="font-medium">{filteredBills.length}</span> {t('bills.results')}
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                ‹
                                            </button>
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                ›
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detail Modal */}
                    {showDetailModal && selectedBill && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">{t('bills.billDetails')}</h2>
                                        <button
                                            onClick={() => setShowDetailModal(false)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">{t('bills.billId')}</p>
                                                <p className="font-medium">{selectedBill.id.substring(0, 8).toUpperCase()}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">{t('bills.status')}</p>
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${utilityBillService.getStatusLabel(selectedBill.status).bgColor} ${utilityBillService.getStatusLabel(selectedBill.status).textColor}`}>
                                                    {utilityBillService.getStatusLabel(selectedBill.status).label}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">{t('bills.createdDate')}</p>
                                                <p className="font-medium">{utilityBillService.formatDate(selectedBill.createdAt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">{t('bills.paymentDate')}</p>
                                                <p className="font-medium">{utilityBillService.formatDate(selectedBill.paymentDate)}</p>
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <p className="text-sm text-gray-600">{t('bills.amount')}</p>
                                            <p className="text-2xl font-bold text-blue-600">{utilityBillService.formatCurrency(selectedBill.amount)}</p>
                                        </div>

                                        {selectedBill.paymentMethod && (
                                            <div>
                                                <p className="text-sm text-gray-600">{t('bills.paymentMethod')}</p>
                                                <p className="font-medium">{selectedBill.paymentMethod}</p>
                                            </div>
                                        )}

                                        {selectedBill.note && (
                                            <div>
                                                <p className="text-sm text-gray-600">{t('bills.note')}</p>
                                                <p className="font-medium">{selectedBill.note}</p>
                                            </div>
                                        )}

                                        <div className="border-t pt-4 mt-6">
                                            <div className="flex justify-end space-x-4">
                                                <button
                                                    onClick={() => setShowDetailModal(false)}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                                >
                                                    {t('bills.close')}
                                                </button>
                                                {selectedBill.status === 'Unpaid' && (
                                                    <button
                                                        onClick={() => {
                                                            setShowDetailModal(false);
                                                            handlePayBill(selectedBill.id);
                                                        }}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                    >
                                                        {t('bills.pay')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
