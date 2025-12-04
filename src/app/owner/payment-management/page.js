'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { paymentAPI } from '@/utils/api';

export default function PaymentManagementPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [error, setError] = useState(null);

    // Filter states
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'completed', 'failed'
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('authToken') ||
                localStorage.getItem('ezstay_token') ||
                localStorage.getItem('token');

            // Gọi API lấy lịch sử thanh toán của owner
            const response = await fetch('https://payment-api-r4zy.onrender.com/api/Payment/history/owner', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('💰 Owner payment history:', data);
                // API trả về { isSuccess, data, message }
                const paymentList = data.data || data || [];
                // Sắp xếp theo ngày mới nhất
                paymentList.sort((a, b) => new Date(b.transactionDate || b.TransactionDate) - new Date(a.transactionDate || a.TransactionDate));
                setPayments(paymentList);
            } else {
                console.error('Failed to load payment history:', response.status);
                setError(t('paymentManagement.errors.loadFailed') || 'Không thể tải lịch sử thanh toán');
                setPayments([]);
            }
        } catch (err) {
            console.error('Error loading payments:', err);
            setError(t('paymentManagement.errors.loadFailed') || 'Không thể tải lịch sử thanh toán');
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter payments
    const filteredPayments = payments.filter(payment => {
        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const transactionId = (payment.transactionId || payment.TransactionId || '').toLowerCase();
            const content = (payment.content || payment.Content || '').toLowerCase();
            const accountNumber = (payment.accountNumber || payment.AccountNumber || '').toLowerCase();

            return transactionId.includes(query) || content.includes(query) || accountNumber.includes(query);
        }

        // Filter by date range
        if (dateRange.from || dateRange.to) {
            const paymentDate = new Date(payment.transactionDate || payment.TransactionDate);
            if (dateRange.from && paymentDate < new Date(dateRange.from)) return false;
            if (dateRange.to) {
                const toDate = new Date(dateRange.to);
                toDate.setHours(23, 59, 59, 999);
                if (paymentDate > toDate) return false;
            }
        }

        // Filter by transfer type (in/out)
        if (filterStatus !== 'all') {
            const transferType = payment.transferType || payment.TransferType;
            if (filterStatus === 'in' && transferType !== 'in') return false;
            if (filterStatus === 'out' && transferType !== 'out') return false;
        }

        return true;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

    // Statistics
    const stats = {
        total: payments.length,
        inCount: payments.filter(p => (p.transferType || p.TransferType) === 'in').length,
        outCount: payments.filter(p => (p.transferType || p.TransferType) === 'out').length,
        totalAmountIn: payments.filter(p => (p.transferType || p.TransferType) === 'in').reduce((sum, p) => sum + (p.transferAmount || p.TransferAmount || 0), 0),
        totalAmountOut: payments.filter(p => (p.transferType || p.TransferType) === 'out').reduce((sum, p) => sum + (p.transferAmount || p.TransferAmount || 0), 0)
    };

    const getTransferTypeBadge = (type) => {
        // Đối với Owner: in = user chuyển tiền vào -> Owner nhận tiền (xanh)
        // out = tiền chuyển ra -> Owner mất tiền (đỏ)
        if (type === 'in') {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                    {t('payment.transferIn') || 'Nhận tiền'}
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                    {t('payment.transferOut') || 'Chuyển tiền'}
                </span>
            );
        }
    };

    const getGatewayLabel = (gateway) => {
        const gateways = {
            'MB': 'MB Bank',
            'MBBank': 'MB Bank',
            'VCB': 'Vietcombank',
            'TCB': 'Techcombank',
            'ACB': 'ACB',
            'TPB': 'TPBank'
        };
        return gateways[gateway] || gateway || 'Ngân hàng';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) {
        return (
            <ProtectedRoute roles={['Owner', 'Admin']}>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">{t('paymentManagement.loading')}</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute roles={['Owner', 'Admin']}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => router.push('/owner')}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        💰 {t('paymentManagement.title') || 'Quản Lý Thanh Toán'}
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        {t('paymentManagement.subtitle') || 'Theo dõi và quản lý các giao dịch thanh toán'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('paymentManagement.stats.total') || 'Tổng giao dịch'}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('payment.transferIn') || 'Nhận tiền'}</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.inCount}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('payment.transferOut') || 'Chuyển tiền'}</p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.outCount}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
                            <div>
                                <p className="text-sm font-medium opacity-90">{t('paymentManagement.stats.totalIncome') || 'Tổng thu nhập'}</p>
                                <p className="text-xl font-bold mt-1">{formatCurrency(stats.totalAmountIn)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-800 dark:text-red-200">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Filter Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    🔍 {t('paymentManagement.filter.search')}
                                </label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('paymentManagement.filter.searchPlaceholder')}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        📅 {t('paymentManagement.filter.fromDate')}
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.from}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        📅 {t('paymentManagement.filter.toDate')}
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.to}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    📊 {t('paymentManagement.filter.status') || 'Loại giao dịch'}
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'all'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {t('paymentManagement.filter.all') || 'Tất cả'}
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('out')}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'out'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {t('payment.transferIn') || 'Nhận tiền'}
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('in')}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'in'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {t('payment.transferOut') || 'Chuyển tiền'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results count */}
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            {t('paymentManagement.filter.showing')} <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredPayments.length}</span> / {payments.length} {t('paymentManagement.filter.transactions')}
                        </div>
                    </div>

                    {/* Payments Table */}
                    {currentPayments.length > 0 ? (
                        <>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {t('paymentManagement.table.transactionId') || 'Mã GD'}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {t('paymentManagement.table.bank') || 'Ngân hàng'}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {t('payment.transactionType') || 'Loại GD'}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {t('payment.content') || 'Nội dung'}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {t('paymentManagement.table.amount') || 'Số tiền'}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {t('paymentManagement.table.createdAt') || 'Ngày GD'}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {t('paymentManagement.table.actions') || 'Thao tác'}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {currentPayments.map((payment) => {
                                                const transferType = payment.transferType || payment.TransferType;
                                                return (
                                                    <tr key={payment.id || payment.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-mono text-gray-900 dark:text-white">
                                                                {payment.transactionId || payment.TransactionId}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm">
                                                                <div className="font-medium text-gray-900 dark:text-white">{getGatewayLabel(payment.gateway || payment.Gateway)}</div>
                                                                <div className="text-gray-500 dark:text-gray-400 font-mono">{payment.accountNumber || payment.AccountNumber}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getTransferTypeBadge(transferType)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px] block">
                                                                {payment.content || payment.Content || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {transferType === 'in' ? (
                                                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                                    +{formatCurrency(payment.transferAmount || payment.TransferAmount)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                                                    -{formatCurrency(payment.transferAmount || payment.TransferAmount)}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                {new Date(payment.transactionDate || payment.TransactionDate).toLocaleString('vi-VN')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <button
                                                                onClick={() => setSelectedPayment(payment)}
                                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                                            >
                                                                {t('paymentManagement.table.viewDetails') || 'Chi tiết'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-4 rounded-xl shadow-sm">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        {t('paymentManagement.pagination.showing')} <span className="font-medium">{indexOfFirstItem + 1}</span> {t('paymentManagement.pagination.to')}{' '}
                                        <span className="font-medium">{Math.min(indexOfLastItem, filteredPayments.length)}</span> {t('paymentManagement.pagination.of')}{' '}
                                        <span className="font-medium">{filteredPayments.length}</span> {t('paymentManagement.pagination.transactions')}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {t('paymentManagement.pagination.prev')}
                                        </button>
                                        {[...Array(totalPages)].map((_, index) => (
                                            <button
                                                key={index + 1}
                                                onClick={() => setCurrentPage(index + 1)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium ${currentPage === index + 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {t('paymentManagement.pagination.next')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {t('paymentManagement.emptyState.title')}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {searchQuery || filterStatus !== 'all' || dateRange.from || dateRange.to
                                        ? t('paymentManagement.emptyState.noResults')
                                        : t('paymentManagement.emptyState.noTransactions')}
                                </p>
                                {(searchQuery || filterStatus !== 'all' || dateRange.from || dateRange.to) && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setFilterStatus('all');
                                            setDateRange({ from: '', to: '' });
                                        }}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors inline-flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        {t('paymentManagement.emptyState.clearFilter')}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Detail Modal */}
                {selectedPayment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {t('paymentManagement.modal.title') || 'Chi tiết giao dịch'}
                                </h3>
                                <button
                                    onClick={() => setSelectedPayment(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Amount */}
                                <div className="text-center pb-4 border-b dark:border-gray-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('payment.amount') || 'Số tiền'}</p>
                                    {(selectedPayment.transferType || selectedPayment.TransferType) === 'in' ? (
                                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                            +{formatCurrency(selectedPayment.transferAmount || selectedPayment.TransferAmount)}
                                        </p>
                                    ) : (
                                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                            -{formatCurrency(selectedPayment.transferAmount || selectedPayment.TransferAmount)}
                                        </p>
                                    )}
                                    <div className="mt-2">
                                        {getTransferTypeBadge(selectedPayment.transferType || selectedPayment.TransferType)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            {t('paymentManagement.modal.transactionId') || 'Mã giao dịch'}
                                        </label>
                                        <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                                            {selectedPayment.transactionId || selectedPayment.TransactionId}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            {t('payment.transactionType') || 'Loại giao dịch'}
                                        </label>
                                        {getTransferTypeBadge(selectedPayment.transferType || selectedPayment.TransferType)}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            {t('paymentManagement.modal.bank') || 'Ngân hàng'}
                                        </label>
                                        <p className="text-lg text-gray-900 dark:text-white">
                                            {getGatewayLabel(selectedPayment.gateway || selectedPayment.Gateway)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            {t('paymentManagement.modal.accountNumber') || 'Số tài khoản'}
                                        </label>
                                        <p className="text-lg font-mono text-gray-900 dark:text-white">
                                            {selectedPayment.accountNumber || selectedPayment.AccountNumber}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            {t('paymentManagement.modal.createdAt') || 'Ngày giao dịch'}
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {new Date(selectedPayment.transactionDate || selectedPayment.TransactionDate).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    {(selectedPayment.billId || selectedPayment.BillId) && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                {t('payment.billId') || 'Mã hóa đơn'}
                                            </label>
                                            <p className="text-lg font-mono text-blue-600 dark:text-blue-400">
                                                {(selectedPayment.billId || selectedPayment.BillId).substring(0, 8).toUpperCase()}
                                            </p>
                                        </div>
                                    )}
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            {t('payment.content') || 'Nội dung chuyển khoản'}
                                        </label>
                                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                            {selectedPayment.content || selectedPayment.Content || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                                <button
                                    onClick={() => setSelectedPayment(null)}
                                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                >
                                    {t('paymentManagement.modal.close') || 'Đóng'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
