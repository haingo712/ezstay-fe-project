'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PaymentHistoryPage() {
    const router = useRouter();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken') ||
                localStorage.getItem('ezstay_token') ||
                localStorage.getItem('token');

            const response = await fetch('https://payment-api-r4zy.onrender.com/api/Payment/my-payments', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📜 Payment history:', data);
                setPayments(data.data || data || []);
            } else {
                setError('Failed to load payment history');
            }
        } catch (err) {
            console.error('Error fetching payments:', err);
            setError('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusConfig = (status) => {
        const configs = {
            'Success': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✓', label: 'Success' },
            'Pending': { bg: 'bg-amber-100', text: 'text-amber-700', icon: '⏳', label: 'Pending' },
            'Failed': { bg: 'bg-red-100', text: 'text-red-700', icon: '✗', label: 'Failed' },
            'Rejected': { bg: 'bg-red-100', text: 'text-red-700', icon: '✗', label: 'Rejected' }
        };
        return configs[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: '?', label: status };
    };

    const getPaymentMethodLabel = (method) => {
        const methods = {
            'Online': { label: 'Bank Transfer', icon: '🏦' },
            'Offline': { label: 'Cash', icon: '💵' }
        };
        return methods[method] || { label: method, icon: '💳' };
    };

    const openPaymentDetail = (payment) => {
        setSelectedPayment(payment);
        setShowModal(true);
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['User']}>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                        <p className="mt-4 text-gray-600 font-medium">Loading payment history...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['User']}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.push('/bills')}
                            className="flex items-center text-gray-600 hover:text-blue-600 mb-4 transition-colors group"
                        >
                            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Bills
                        </button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                                <p className="text-gray-600 mt-1">View all your payment transactions</p>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm px-6 py-3 border border-gray-100">
                                <p className="text-sm text-gray-500">Total Payments</p>
                                <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Payment List */}
                    {payments.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payment History</h3>
                            <p className="text-gray-600">You haven't made any payments yet.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {payments.map((payment) => {
                                            const statusConfig = getStatusConfig(payment.status || payment.Status);
                                            const methodConfig = getPaymentMethodLabel(payment.paymentMethod || payment.PaymentMethod);
                                            return (
                                                <tr key={payment.id || payment.Id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {formatDate(payment.completedDate || payment.CompletedDate || payment.createdDate || payment.CreatedDate)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-mono text-gray-600">
                                                            {payment.transactionId || payment.TransactionId || (payment.id || payment.Id)?.substring(0, 8).toUpperCase()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span>{methodConfig.icon}</span>
                                                            <span className="text-sm text-gray-700">{methodConfig.label}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {formatCurrency(payment.amount || payment.Amount)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                            <span>{statusConfig.icon}</span>
                                                            {statusConfig.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => openPaymentDetail(payment)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                                                        >
                                                            View Detail
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Summary Cards */}
                    {payments.length > 0 && (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="font-medium">Successful</span>
                                </div>
                                <p className="text-3xl font-bold">
                                    {payments.filter(p => (p.status || p.Status) === 'Success').length}
                                </p>
                                <p className="text-emerald-100 text-sm mt-1">
                                    {formatCurrency(payments.filter(p => (p.status || p.Status) === 'Success').reduce((sum, p) => sum + (p.amount || p.Amount || 0), 0))}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium">Pending</span>
                                </div>
                                <p className="text-3xl font-bold">
                                    {payments.filter(p => (p.status || p.Status) === 'Pending').length}
                                </p>
                                <p className="text-amber-100 text-sm mt-1">
                                    {formatCurrency(payments.filter(p => (p.status || p.Status) === 'Pending').reduce((sum, p) => sum + (p.amount || p.Amount || 0), 0))}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium">Total Paid</span>
                                </div>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(payments.filter(p => (p.status || p.Status) === 'Success').reduce((sum, p) => sum + (p.amount || p.Amount || 0), 0))}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Detail Modal */}
                {showModal && selectedPayment && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">Payment Detail</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-white/80 hover:text-white"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="text-center pb-4 border-b">
                                    <p className="text-sm text-gray-500 mb-1">Amount</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {formatCurrency(selectedPayment.amount || selectedPayment.Amount)}
                                    </p>
                                    <span className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusConfig(selectedPayment.status || selectedPayment.Status).bg} ${getStatusConfig(selectedPayment.status || selectedPayment.Status).text}`}>
                                        {getStatusConfig(selectedPayment.status || selectedPayment.Status).label}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Payment ID</span>
                                        <span className="font-mono text-sm text-gray-900">{(selectedPayment.id || selectedPayment.Id)?.substring(0, 8).toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Transaction ID</span>
                                        <span className="font-mono text-sm text-gray-900">{selectedPayment.transactionId || selectedPayment.TransactionId || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Payment Method</span>
                                        <span className="text-gray-900">{getPaymentMethodLabel(selectedPayment.paymentMethod || selectedPayment.PaymentMethod).label}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Bank</span>
                                        <span className="text-gray-900">{selectedPayment.bankBrandName || selectedPayment.BankBrandName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Created Date</span>
                                        <span className="text-gray-900">{formatDate(selectedPayment.createdDate || selectedPayment.CreatedDate)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Completed Date</span>
                                        <span className="text-gray-900">{formatDate(selectedPayment.completedDate || selectedPayment.CompletedDate)}</span>
                                    </div>
                                    {(selectedPayment.transactionContent || selectedPayment.TransactionContent) && (
                                        <div className="py-2">
                                            <span className="text-gray-500 block mb-1">Transaction Content</span>
                                            <span className="text-gray-900 text-sm bg-gray-50 p-2 rounded block">{selectedPayment.transactionContent || selectedPayment.TransactionContent}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 border-t">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
