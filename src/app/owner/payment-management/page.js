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

            // TODO: Replace with actual API call
            // const response = await paymentAPI.getOwnerPayments({
            //     $orderby: 'createdAt desc'
            // });

            // Mock data for development
            const mockPayments = [
                {
                    id: '1',
                    tenantName: 'Nguyễn Văn A',
                    roomName: 'Phòng 101',
                    amount: 3500000,
                    status: 'completed',
                    paymentMethod: 'bank_transfer',
                    bankName: 'Vietcombank',
                    accountNumber: '1234567890',
                    description: 'Tiền phòng tháng 10/2025',
                    transactionId: 'TXN123456',
                    createdAt: '2025-10-01T10:30:00',
                    completedAt: '2025-10-01T10:35:00'
                },
                {
                    id: '2',
                    tenantName: 'Trần Thị B',
                    roomName: 'Phòng 202',
                    amount: 4200000,
                    status: 'pending',
                    paymentMethod: 'bank_transfer',
                    bankName: 'ACB',
                    accountNumber: '0987654321',
                    description: 'Tiền phòng tháng 10/2025',
                    transactionId: 'TXN123457',
                    createdAt: '2025-10-15T14:20:00',
                    completedAt: null
                },
                {
                    id: '3',
                    tenantName: 'Lê Văn C',
                    roomName: 'Phòng 303',
                    amount: 2800000,
                    status: 'failed',
                    paymentMethod: 'bank_transfer',
                    bankName: 'Techcombank',
                    accountNumber: '1122334455',
                    description: 'Tiền phòng tháng 10/2025',
                    transactionId: 'TXN123458',
                    createdAt: '2025-10-20T09:15:00',
                    completedAt: null
                }
            ];

            setPayments(mockPayments);
        } catch (err) {
            console.error('Error loading payments:', err);
            setError(t('paymentManagement.errors.loadFailed'));
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter payments
    const filteredPayments = payments.filter(payment => {
        // Filter by status
        if (filterStatus !== 'all' && payment.status !== filterStatus) return false;

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                payment.tenantName?.toLowerCase().includes(query) ||
                payment.roomName?.toLowerCase().includes(query) ||
                payment.transactionId?.toLowerCase().includes(query) ||
                payment.description?.toLowerCase().includes(query)
            );
        }

        // Filter by date range
        if (dateRange.from || dateRange.to) {
            const paymentDate = new Date(payment.createdAt);
            if (dateRange.from && paymentDate < new Date(dateRange.from)) return false;
            if (dateRange.to && paymentDate > new Date(dateRange.to)) return false;
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
        completed: payments.filter(p => p.status === 'completed').length,
        pending: payments.filter(p => p.status === 'pending').length,
        failed: payments.filter(p => p.status === 'failed').length,
        totalAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', label: t('paymentManagement.status.completed') },
            pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', label: t('paymentManagement.status.pending') },
            failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', label: t('paymentManagement.status.failed') }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
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
                                        💰 {t('paymentManagement.title')}
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        {t('paymentManagement.subtitle')}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/owner/bank-account')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                {t('paymentManagement.bankAccountBtn')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('paymentManagement.stats.total')}</p>
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
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('paymentManagement.stats.completed')}</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.completed}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('paymentManagement.stats.pending')}</p>
                                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.pending}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('paymentManagement.stats.failed')}</p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.failed}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
                            <div>
                                <p className="text-sm font-medium opacity-90">{t('paymentManagement.stats.totalIncome')}</p>
                                <p className="text-xl font-bold mt-1">{formatCurrency(stats.totalAmount)}</p>
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

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    📊 {t('paymentManagement.filter.status')}
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'all'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {t('paymentManagement.filter.all')}
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('completed')}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'completed'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {t('paymentManagement.filter.completed')}
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('pending')}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'pending'
                                                ? 'bg-yellow-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {t('paymentManagement.filter.pending')}
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('failed')}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'failed'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {t('paymentManagement.filter.failed')}
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
                                                    {t('paymentManagement.table.transactionId')}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {t('paymentManagement.table.tenant')}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {t('paymentManagement.table.room')}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {t('paymentManagement.table.amount')}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {t('paymentManagement.table.bank')}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {t('paymentManagement.table.status')}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {t('paymentManagement.table.createdAt')}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {t('paymentManagement.table.actions')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {currentPayments.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                                                            {payment.transactionId}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-900 dark:text-white">
                                                            {payment.tenantName}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-900 dark:text-white">
                                                            {payment.roomName}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {formatCurrency(payment.amount)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm">
                                                            <div className="font-medium text-gray-900 dark:text-white">{payment.bankName}</div>
                                                            <div className="text-gray-500 dark:text-gray-400 font-mono">{payment.accountNumber}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(payment.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            {new Date(payment.createdAt).toLocaleString('vi-VN')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => setSelectedPayment(payment)}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                                        >
                                                            {t('paymentManagement.table.viewDetails')}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
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
                                    {t('paymentManagement.modal.title')}
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
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            {t('paymentManagement.modal.transactionId')}
                                        </label>
                                        <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                                            {selectedPayment.transactionId}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            {t('paymentManagement.modal.status')}
                                        </label>
                                        {getStatusBadge(selectedPayment.status)}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            {t('paymentManagement.modal.tenant')}
                                        </label>
                                        <p className="text-lg text-gray-900 dark:text-white">
                                            {selectedPayment.tenantName}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            {t('paymentManagement.modal.room')}
                                        </label>
                                        <p className="text-lg text-gray-900 dark:text-white">
                                            {selectedPayment.roomName}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            {t('paymentManagement.modal.bank')}
                                        </label>
                                        <p className="text-lg text-gray-900 dark:text-white">
                                            {selectedPayment.bankName}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            {t('paymentManagement.modal.accountNumber')}
                                        </label>
                                        <p className="text-lg font-mono text-gray-900 dark:text-white">
                                            {selectedPayment.accountNumber}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            {t('paymentManagement.modal.amount')}
                                        </label>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {formatCurrency(selectedPayment.amount)}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            {t('paymentManagement.modal.description')}
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedPayment.description}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            {t('paymentManagement.modal.createdAt')}
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {new Date(selectedPayment.createdAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    {selectedPayment.completedAt && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                {t('paymentManagement.modal.completedAt')}
                                            </label>
                                            <p className="text-gray-900 dark:text-white">
                                                {new Date(selectedPayment.completedAt).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                                <button
                                    onClick={() => setSelectedPayment(null)}
                                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                >
                                    {t('paymentManagement.modal.close')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
