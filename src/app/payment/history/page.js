'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    CreditCard,
    Calendar,
    ArrowLeft,
    Search,
    Filter,
    Eye,
    CheckCircle,
    Clock,
    XCircle,
    Banknote,
    Building2,
    Receipt,
    TrendingUp,
    X
} from 'lucide-react';

export default function PaymentHistoryPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken') ||
                localStorage.getItem('ezstay_token') ||
                localStorage.getItem('token');

            // Gọi API lịch sử thanh toán mới
            const response = await fetch('https://payment-api-r4zy.onrender.com/api/Payment/history/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📜 Payment history:', data);
                // API trả về { isSuccess, data, message }
                const paymentList = data.data || data || [];
                // Sắp xếp theo ngày mới nhất
                paymentList.sort((a, b) => new Date(b.transactionDate || b.TransactionDate) - new Date(a.transactionDate || a.TransactionDate));
                setPayments(paymentList);
            } else {
                console.error('Failed to load payment history:', response.status);
                setError('loadError');
            }
        } catch (err) {
            console.error('Error fetching payments:', err);
            setError('loadError');
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

    const getGatewayLabel = (gateway) => {
        const gateways = {
            'MB': { label: 'MB Bank', color: 'text-blue-600' },
            'VCB': { label: 'Vietcombank', color: 'text-green-600' },
            'TCB': { label: 'Techcombank', color: 'text-red-600' },
            'ACB': { label: 'ACB', color: 'text-blue-700' },
            'TPB': { label: 'TPBank', color: 'text-purple-600' },
            'SePay': { label: 'SePay', color: 'text-indigo-600' }
        };
        return gateways[gateway] || { label: gateway || 'Ngân hàng', color: 'text-gray-600' };
    };

    // Filter payments based on search and status
    const filteredPayments = payments.filter(payment => {
        const matchSearch = !searchTerm ||
            (payment.transactionId || payment.TransactionId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (payment.content || payment.Content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (payment.accountNumber || payment.AccountNumber || '').includes(searchTerm);

        return matchSearch;
    });

    const openPaymentDetail = (payment) => {
        setSelectedPayment(payment);
        setShowModal(true);
    };

    // Calculate stats
    const totalAmount = payments.reduce((sum, p) => sum + (p.transferAmount || p.TransferAmount || 0), 0);
    const totalPayments = payments.length;

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['User']}>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <Navbar />
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('payment.loading')}</p>
                        </div>
                    </div>
                    <Footer />
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['User']}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.push('/bills')}
                            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            {t('payment.backToBills')}
                        </button>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <Receipt className="h-8 w-8 text-blue-600" />
                                    {t('payment.history')}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {t('payment.historySubtitle')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('payment.totalTransactions')}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPayments}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('payment.totalPaid')}</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalAmount)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('payment.success')}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPayments}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('payment.searchPlaceholder')}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
                            {t(`payment.${error}`)}
                        </div>
                    )}

                    {/* Payment List */}
                    {filteredPayments.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Receipt className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('payment.noHistory')}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{t('payment.noHistoryDesc')}</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('payment.transactionDate')}</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('payment.transactionId')}</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('payment.bank')}</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('payment.transactionType')}</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('payment.content')}</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('payment.amount')}</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('payment.detail')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {filteredPayments.map((payment) => {
                                            const gatewayInfo = getGatewayLabel(payment.gateway || payment.Gateway);
                                            return (
                                                <tr key={payment.id || payment.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {formatDate(payment.transactionDate || payment.TransactionDate)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                                                            {(payment.transactionId || payment.TransactionId || '').substring(0, 12)}...
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4 text-gray-400" />
                                                            <span className={`text-sm font-medium ${gatewayInfo.color}`}>
                                                                {gatewayInfo.label}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {(payment.transferType || payment.TransferType) === 'in' ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                                                <ArrowLeft className="h-3 w-3" />
                                                                {t('payment.transferOut') || 'Chuyển tiền'}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                                <TrendingUp className="h-3 w-3" />
                                                                {t('payment.transferIn') || 'Nhận tiền'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px] block">
                                                            {payment.content || payment.Content || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {(payment.transferType || payment.TransferType) === 'in' ? (
                                                            <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                                                -{formatCurrency(payment.transferAmount || payment.TransferAmount)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                                                +{formatCurrency(payment.transferAmount || payment.TransferAmount)}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => openPaymentDetail(payment)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            {t('payment.detail')}
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
                </div>

                <Footer />

                {/* Payment Detail Modal */}
                {showModal && selectedPayment && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Receipt className="h-6 w-6" />
                                    {t('payment.transactionDetail')}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-white/80 hover:text-white p-1"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-4">
                                {/* Amount */}
                                <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('payment.amount') || 'Số tiền'}</p>
                                    {(selectedPayment.transferType || selectedPayment.TransferType) === 'in' ? (
                                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                            -{formatCurrency(selectedPayment.transferAmount || selectedPayment.TransferAmount)}
                                        </p>
                                    ) : (
                                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                            +{formatCurrency(selectedPayment.transferAmount || selectedPayment.TransferAmount)}
                                        </p>
                                    )}
                                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                        <CheckCircle className="h-4 w-4" />
                                        {t('payment.success')}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="space-y-3">
                                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-gray-500 dark:text-gray-400">{t('payment.transactionId')}</span>
                                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                                            {selectedPayment.transactionId || selectedPayment.TransactionId}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-gray-500 dark:text-gray-400">{t('payment.bank')}</span>
                                        <span className="text-gray-900 dark:text-white">
                                            {getGatewayLabel(selectedPayment.gateway || selectedPayment.Gateway).label}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-gray-500 dark:text-gray-400">{t('payment.accountNumber')}</span>
                                        <span className="font-mono text-gray-900 dark:text-white">
                                            {selectedPayment.accountNumber || selectedPayment.AccountNumber}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-gray-500 dark:text-gray-400">{t('payment.transactionType') || 'Loại giao dịch'}</span>
                                        {(selectedPayment.transferType || selectedPayment.TransferType) === 'in' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                                <ArrowLeft className="h-3 w-3" />
                                                {t('payment.transferOut') || 'Chuyển tiền'}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                <TrendingUp className="h-3 w-3" />
                                                {t('payment.transferIn') || 'Nhận tiền'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-gray-500 dark:text-gray-400">{t('payment.transactionDate')}</span>
                                        <span className="text-gray-900 dark:text-white">
                                            {formatDate(selectedPayment.transactionDate || selectedPayment.TransactionDate)}
                                        </span>
                                    </div>
                                    {(selectedPayment.content || selectedPayment.Content) && (
                                        <div className="py-2">
                                            <span className="text-gray-500 dark:text-gray-400 block mb-2">{t('payment.content')}</span>
                                            <p className="text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                {selectedPayment.content || selectedPayment.Content}
                                            </p>
                                        </div>
                                    )}
                                    {(selectedPayment.billId || selectedPayment.BillId) && (
                                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">{t('payment.billId')}</span>
                                            <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                                                {(selectedPayment.billId || selectedPayment.BillId)?.substring(0, 8).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                >
                                    {t('payment.close')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
