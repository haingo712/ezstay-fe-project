'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import utilityBillService from '@/services/utilityBillService';

// Helper function to get bill amount (handles different API field names)
const getBillAmount = (bill) => {
    return bill.totalAmount || bill.TotalAmount || bill.amount || bill.Amount || 0;
};

// Helper function to get bill status
const getBillStatus = (bill) => {
    return bill.status || bill.Status || 'Unknown';
};

export default function TenantBillsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [bills, setBills] = useState([]);
    const [filteredBills, setFilteredBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
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

            console.log('📄 Bills API response:', response);

            // Handle OData response - could be { value: [...] } or [...]
            const billsData = response.value || response || [];
            setBills(Array.isArray(billsData) ? billsData : []);
            setFilteredBills(Array.isArray(billsData) ? billsData : []);
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
            filtered = filtered.filter(bill => getBillStatus(bill) === statusFilter);
        }

        // Search filter (by note, amount, room name)
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(bill =>
                bill.note?.toLowerCase().includes(term) ||
                getBillAmount(bill).toString().includes(term) ||
                (bill.id || bill.Id || '').toLowerCase().includes(term) ||
                (bill.roomName || bill.RoomName || '').toLowerCase().includes(term)
            );
        }

        setFilteredBills(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    };

    const handleViewDetail = async (bill) => {
        const billId = bill.id || bill.Id;
        try {
            setLoadingDetail(true);
            setShowDetailModal(true);
            setSelectedBill(null);

            // Call API to get full bill details
            const detailBill = await utilityBillService.getBillById(billId);
            console.log('📄 Bill detail:', detailBill);
            setSelectedBill(detailBill);
        } catch (err) {
            console.error('Error loading bill detail:', err);
            // Fallback to bill from list if API fails
            setSelectedBill(bill);
        } finally {
            setLoadingDetail(false);
        }
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

    // Calculate statistics with proper field handling
    const stats = {
        total: bills.length,
        unpaid: bills.filter(b => getBillStatus(b) === 'Unpaid').length,
        paid: bills.filter(b => getBillStatus(b) === 'Paid').length,
        overdue: bills.filter(b => getBillStatus(b) === 'Overdue').length,
        totalAmount: bills.reduce((sum, b) => sum + getBillAmount(b), 0),
        unpaidAmount: bills.filter(b => getBillStatus(b) === 'Unpaid').reduce((sum, b) => sum + getBillAmount(b), 0)
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
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => router.push('/')}
                                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Quay lại trang chủ
                            </button>
                            <button
                                onClick={() => router.push('/payment/history')}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Payment History
                            </button>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">💰 Hóa đơn tiện ích</h1>
                        <p className="mt-2 text-gray-600">Quản lý và thanh toán hóa đơn điện nước</p>
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Mã hóa đơn
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Phòng
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Kỳ thanh toán
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Ngày tạo
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Số tiền
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {currentBills.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-gray-500 font-medium">Không có hóa đơn nào</p>
                                                    <p className="text-gray-400 text-sm mt-1">Hóa đơn sẽ xuất hiện khi chủ nhà tạo cho bạn</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentBills.map((bill) => {
                                            const billId = bill.id || bill.Id || '';
                                            const status = getBillStatus(bill);
                                            const amount = getBillAmount(bill);
                                            const roomName = bill.roomName || bill.RoomName || '-';
                                            const billingPeriod = bill.billingPeriod || bill.BillingPeriod || bill.month || bill.Month || '-';
                                            const createdAt = bill.createdAt || bill.CreatedAt || bill.createdDate || bill.CreatedDate;
                                            const statusInfo = utilityBillService.getStatusLabel(status);

                                            return (
                                                <tr key={billId} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                                            #{billId.toString().substring(0, 8).toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {roomName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {billingPeriod}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {utilityBillService.formatDate(createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <span className="text-sm font-bold text-green-600">
                                                            {utilityBillService.formatCurrency(amount)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                                                            {statusInfo.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleViewDetail(bill)}
                                                                className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                            >
                                                                👁️ Xem
                                                            </button>
                                                            {status === 'Unpaid' && (
                                                                <button
                                                                    onClick={() => handlePayBill(billId)}
                                                                    className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors"
                                                                >
                                                                    💳 Thanh toán
                                                                </button>
                                                            )}
                                                        </div>
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
                    {showDetailModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6">
                                    {/* Modal Header */}
                                    <div className="flex justify-between items-center mb-6 pb-4 border-b">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Chi tiết hóa đơn</h2>
                                            {selectedBill && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    #{(selectedBill.id || selectedBill.Id || '').toString().substring(0, 8).toUpperCase()}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setShowDetailModal(false)}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {loadingDetail ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                            <span className="ml-3 text-gray-600">Đang tải chi tiết...</span>
                                        </div>
                                    ) : selectedBill ? (
                                        <>
                                            {/* Bill Amount Card */}
                                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white mb-6">
                                                <p className="text-blue-100 text-sm mb-1">Tổng số tiền</p>
                                                <p className="text-3xl font-bold">
                                                    {utilityBillService.formatCurrency(getBillAmount(selectedBill))}
                                                </p>
                                                <div className="mt-4 flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBillStatus(selectedBill) === 'Paid'
                                                        ? 'bg-green-400/30 text-green-100'
                                                        : getBillStatus(selectedBill) === 'Unpaid'
                                                            ? 'bg-yellow-400/30 text-yellow-100'
                                                            : 'bg-gray-400/30 text-gray-100'
                                                        }`}>
                                                        {utilityBillService.getStatusLabel(getBillStatus(selectedBill)).label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Bill Details Grid */}
                                            <div className="space-y-4">
                                                {/* Basic Info */}
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mã hóa đơn</p>
                                                        <p className="font-mono font-semibold text-gray-900 text-sm break-all">
                                                            {(selectedBill.id || selectedBill.Id || '-').toString().substring(0, 8)}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mã hợp đồng</p>
                                                        <p className="font-mono font-semibold text-gray-900 text-sm">
                                                            {(selectedBill.contractId || selectedBill.ContractId || '-').toString().substring(0, 8)}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Loại hóa đơn</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {selectedBill.billType || selectedBill.BillType || 'Monthly'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* House & Room */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">🏠 Nhà trọ</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {selectedBill.houseName || selectedBill.HouseName || '-'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">🚪 Phòng</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {selectedBill.roomName || selectedBill.RoomName || '-'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Room Price */}
                                                {(selectedBill.roomPrice || selectedBill.RoomPrice) && (
                                                    <div className="bg-purple-50 rounded-lg p-4">
                                                        <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">💰 Tiền thuê phòng</p>
                                                        <p className="font-bold text-purple-800 text-lg">
                                                            {utilityBillService.formatCurrency(selectedBill.roomPrice || selectedBill.RoomPrice)}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Dates */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">🕐 Ngày tạo</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {utilityBillService.formatDate(selectedBill.createdAt || selectedBill.CreatedAt)}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">🔄 Cập nhật</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {utilityBillService.formatDate(selectedBill.updatedAt || selectedBill.UpdatedAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Details from API - Utility Readings & Services */}
                                                {(selectedBill.details || selectedBill.Details) && (selectedBill.details || selectedBill.Details).length > 0 && (
                                                    <div className="border-t pt-4 mt-4">
                                                        <p className="text-sm font-semibold text-gray-700 mb-3">📋 Chi tiết hóa đơn</p>
                                                        <div className="space-y-3">
                                                            {(selectedBill.details || selectedBill.Details).map((detail, index) => {
                                                                const detailType = detail.type || detail.Type || '';
                                                                const isElectric = detailType.toLowerCase().includes('electric') || detailType.toLowerCase().includes('điện');
                                                                const isWater = detailType.toLowerCase().includes('water') || detailType.toLowerCase().includes('nước');
                                                                const isService = detail.serviceName || detail.ServiceName;

                                                                // Electric or Water utility reading
                                                                if (isElectric || isWater) {
                                                                    const bgColor = isElectric ? 'bg-yellow-50' : 'bg-blue-50';
                                                                    const textColor = isElectric ? 'text-yellow-800' : 'text-blue-800';
                                                                    const labelColor = isElectric ? 'text-yellow-600' : 'text-blue-600';
                                                                    const icon = isElectric ? '⚡' : '💧';
                                                                    const unit = isElectric ? 'kWh' : 'm³';
                                                                    const typeName = isElectric ? 'Điện' : 'Nước';

                                                                    return (
                                                                        <div key={detail.id || index} className={`${bgColor} rounded-lg p-4`}>
                                                                            <p className={`text-sm font-semibold ${textColor} mb-3`}>{icon} Chi tiết {typeName}</p>
                                                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                                                <div>
                                                                                    <p className={`text-xs ${labelColor} mb-1`}>Chỉ số đầu</p>
                                                                                    <p className={`font-bold ${textColor}`}>
                                                                                        {detail.previousIndex || detail.PreviousIndex || 0} {unit}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <p className={`text-xs ${labelColor} mb-1`}>Chỉ số cuối</p>
                                                                                    <p className={`font-bold ${textColor}`}>
                                                                                        {detail.currentIndex || detail.CurrentIndex || 0} {unit}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <p className={`text-xs ${labelColor} mb-1`}>Tiêu thụ</p>
                                                                                    <p className={`font-bold ${textColor}`}>
                                                                                        {detail.consumption || detail.Consumption || 0} {unit}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <p className={`text-xs ${labelColor} mb-1`}>Đơn giá</p>
                                                                                    <p className={`font-bold ${textColor}`}>
                                                                                        {utilityBillService.formatCurrency(detail.unitPrice || detail.UnitPrice || 0)}/{unit}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <p className={`text-xs ${labelColor} mb-1`}>Thành tiền</p>
                                                                                    <p className={`font-bold ${textColor} text-lg`}>
                                                                                        {utilityBillService.formatCurrency(detail.total || detail.Total || 0)}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }

                                                                // Service
                                                                if (isService) {
                                                                    return (
                                                                        <div key={detail.id || index} className="bg-green-50 rounded-lg p-4">
                                                                            <div className="flex justify-between items-center">
                                                                                <div>
                                                                                    <p className="text-xs text-green-600 mb-1">🛎️ Dịch vụ</p>
                                                                                    <p className="font-semibold text-green-800">
                                                                                        {detail.serviceName || detail.ServiceName}
                                                                                    </p>
                                                                                </div>
                                                                                <p className="font-bold text-green-800 text-lg">
                                                                                    {utilityBillService.formatCurrency(detail.total || detail.Total || detail.servicePrice || detail.ServicePrice || 0)}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }

                                                                // Other type
                                                                return (
                                                                    <div key={detail.id || index} className="bg-gray-50 rounded-lg p-4">
                                                                        <div className="flex justify-between items-center">
                                                                            <div>
                                                                                <p className="text-xs text-gray-500 mb-1">📋 {detailType}</p>
                                                                            </div>
                                                                            <p className="font-bold text-gray-800">
                                                                                {utilityBillService.formatCurrency(detail.total || detail.Total || 0)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Note */}
                                                {(selectedBill.note || selectedBill.Note) && (
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">📝 Ghi chú</p>
                                                        <p className="text-gray-900">{selectedBill.note || selectedBill.Note}</p>
                                                    </div>
                                                )}

                                                {/* Reason if cancelled */}
                                                {(selectedBill.reason || selectedBill.Reason) && (
                                                    <div className="bg-red-50 rounded-lg p-4">
                                                        <p className="text-xs text-red-500 uppercase tracking-wide mb-1">❌ Lý do hủy</p>
                                                        <p className="text-red-800">{selectedBill.reason || selectedBill.Reason}</p>
                                                    </div>
                                                )}

                                                {/* Total Summary */}
                                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                                    <p className="text-sm font-semibold text-green-800 mb-3">📊 Tổng kết</p>
                                                    <div className="space-y-2">
                                                        {/* Room Price */}
                                                        {(selectedBill.roomPrice || selectedBill.RoomPrice) && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-600">Tiền phòng:</span>
                                                                <span className="font-medium">{utilityBillService.formatCurrency(selectedBill.roomPrice || selectedBill.RoomPrice)}</span>
                                                            </div>
                                                        )}

                                                        {/* Details from array */}
                                                        {(selectedBill.details || selectedBill.Details || []).map((detail, index) => {
                                                            const detailType = detail.type || detail.Type || '';
                                                            const serviceName = detail.serviceName || detail.ServiceName;
                                                            let label = detailType;

                                                            if (detailType.toLowerCase().includes('electric') || detailType.toLowerCase().includes('điện')) {
                                                                label = 'Tiền điện';
                                                            } else if (detailType.toLowerCase().includes('water') || detailType.toLowerCase().includes('nước')) {
                                                                label = 'Tiền nước';
                                                            } else if (serviceName) {
                                                                label = serviceName;
                                                            }

                                                            return (
                                                                <div key={detail.id || index} className="flex justify-between items-center">
                                                                    <span className="text-gray-600">{label}:</span>
                                                                    <span className="font-medium">{utilityBillService.formatCurrency(detail.total || detail.Total || 0)}</span>
                                                                </div>
                                                            );
                                                        })}

                                                        <div className="border-t border-green-300 pt-2 mt-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-bold text-green-800">TỔNG CỘNG:</span>
                                                                <span className="font-bold text-green-800 text-xl">
                                                                    {utilityBillService.formatCurrency(getBillAmount(selectedBill))}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                                                    <button
                                                        onClick={() => setShowDetailModal(false)}
                                                        className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                                    >
                                                        Đóng
                                                    </button>
                                                    {getBillStatus(selectedBill) === 'Unpaid' && (
                                                        <button
                                                            onClick={() => {
                                                                setShowDetailModal(false);
                                                                handlePayBill(selectedBill.id || selectedBill.Id);
                                                            }}
                                                            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium transition-all shadow-lg shadow-green-500/30"
                                                        >
                                                            💳 Thanh toán ngay
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            Không thể tải chi tiết hóa đơn
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
