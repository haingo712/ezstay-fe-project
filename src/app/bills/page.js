'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import utilityBillService from '@/services/utilityBillService';
import { useBillNotifications } from '@/hooks/useSignalR';
import { toast } from 'react-toastify';
import { FileText, Clock, CheckCircle, AlertCircle, Search, CreditCard, Eye, History, ChevronLeft, ChevronRight, X, Home, Zap, Droplets, Wrench, Wifi, WifiOff, Bell } from 'lucide-react';

// Helper function to get bill amount
const getBillAmount = (bill) => {
    return bill.totalAmount || bill.TotalAmount || bill.amount || bill.Amount || 0;
};

// Helper function to get bill status
const getBillStatus = (bill) => {
    return bill.status || bill.Status || 'Unknown';
};

// Helper function to get bill type
const getBillType = (bill) => {
    return bill.billType || bill.BillType || 'Monthly';
};

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
};

// Format date
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
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
    const [userId, setUserId] = useState(null);

    // Filter states
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Get user ID on mount
    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                setUserId(parsed.id || parsed.userId);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }, []);

    // Handle real-time bill notifications
    const handleBillNotification = useCallback((type, data) => {
        console.log(`📢 Bill notification: ${type}`, data);
        
        if (type === 'payment_confirmed') {
            // Payment was confirmed
            toast.success(
                <div>
                    <strong>✅ Thanh toán thành công!</strong>
                    <p>{data.message || `Hóa đơn ${formatCurrency(data.amount)} đã được thanh toán`}</p>
                </div>,
                { autoClose: 5000 }
            );
            // Refresh bills
            loadBills();
        } else if (type === 'bill_created') {
            // New bill created
            toast.info(
                <div>
                    <strong>📄 Hóa đơn mới!</strong>
                    <p>{data.message || `Bạn có hóa đơn mới: ${formatCurrency(data.amount)}`}</p>
                </div>,
                { autoClose: 8000 }
            );
            // Refresh bills
            loadBills();
        } else if (type === 'status_updated') {
            // Update bill status in list
            setBills(prev => prev.map(bill => 
                (bill.id === data.billId || bill.Id === data.billId)
                    ? { ...bill, status: data.status, Status: data.status, paymentDate: data.paymentDate }
                    : bill
            ));
        }
    }, []);

    // Connect to SignalR for real-time updates
    const { isConnected } = useBillNotifications(userId, handleBillNotification);

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

            const billsData = response.value || response || [];
            setBills(Array.isArray(billsData) ? billsData : []);
            setFilteredBills(Array.isArray(billsData) ? billsData : []);
        } catch (err) {
            console.error('Error loading bills:', err);
            setBills([]);
            setFilteredBills([]);
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

        // Search filter
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
        setCurrentPage(1);
    };

    const handleViewDetail = async (bill) => {
        const billId = bill.id || bill.Id;
        try {
            setLoadingDetail(true);
            setShowDetailModal(true);
            setSelectedBill(null);

            const detailBill = await utilityBillService.getBillById(billId);
            console.log('📄 Bill detail:', detailBill);
            setSelectedBill(detailBill);
        } catch (err) {
            console.error('Error loading bill detail:', err);
            setSelectedBill(bill);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handlePayBill = (billId) => {
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
        unpaid: bills.filter(b => getBillStatus(b) === 'Unpaid').length,
        paid: bills.filter(b => getBillStatus(b) === 'Paid').length,
        overdue: bills.filter(b => getBillStatus(b) === 'Overdue').length,
        totalAmount: bills.reduce((sum, b) => sum + getBillAmount(b), 0),
        unpaidAmount: bills.filter(b => getBillStatus(b) === 'Unpaid').reduce((sum, b) => sum + getBillAmount(b), 0)
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Paid':
                return { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Đã thanh toán' };
            case 'Unpaid':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" />, label: 'Chưa thanh toán' };
            case 'Overdue':
                return { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle className="w-4 h-4" />, label: 'Quá hạn' };
            case 'Cancelled':
                return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <X className="w-4 h-4" />, label: 'Đã hủy' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800', icon: null, label: status };
        }
    };

    // Get bill type badge
    const getTypeBadge = (type) => {
        switch (type) {
            case 'Monthly':
                return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Hàng tháng' };
            case 'Deposit':
                return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Tiền cọc' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800', label: type };
        }
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['User']}>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải hóa đơn...</p>
                    </div>
                </div>
                <Footer />
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['User']}>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-blue-600" />
                                    Hóa đơn của tôi
                                    {/* Real-time connection indicator */}
                                    <span 
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                            isConnected 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                        title={isConnected ? 'Đang nhận cập nhật real-time' : 'Đang kết nối...'}
                                    >
                                        {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                                        {isConnected ? 'Live' : 'Offline'}
                                    </span>
                                </h1>
                                <p className="mt-2 text-gray-600">Quản lý và thanh toán các hóa đơn tiền phòng, điện nước</p>
                            </div>
                            <button
                                onClick={() => router.push('/payment/history')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                <History className="w-5 h-5" />
                                Lịch sử thanh toán
                            </button>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Tổng hóa đơn</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-xl">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Chưa thanh toán</p>
                                    <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.unpaid}</p>
                                    <p className="text-xs text-gray-400 mt-1">{formatCurrency(stats.unpaidAmount)}</p>
                                </div>
                                <div className="bg-yellow-100 p-3 rounded-xl">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Đã thanh toán</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.paid}</p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-xl">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Quá hạn</p>
                                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</p>
                                </div>
                                <div className="bg-red-100 p-3 rounded-xl">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trạng thái
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="Unpaid">Chưa thanh toán</option>
                                    <option value="Paid">Đã thanh toán</option>
                                    <option value="Overdue">Quá hạn</option>
                                    <option value="Cancelled">Đã hủy</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tìm kiếm
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Tìm theo mã, phòng, số tiền..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bills List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {currentBills.length === 0 ? (
                            <div className="py-16 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium text-lg">Không có hóa đơn nào</p>
                                <p className="text-gray-400 text-sm mt-1">Hóa đơn sẽ xuất hiện khi chủ nhà tạo cho bạn</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mã HĐ</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Loại</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phòng</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày tạo</th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Số tiền</th>
                                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {currentBills.map((bill) => {
                                                const billId = bill.id || bill.Id || '';
                                                const status = getBillStatus(bill);
                                                const billType = getBillType(bill);
                                                const amount = getBillAmount(bill);
                                                const roomName = bill.roomName || bill.RoomName || '-';
                                                const createdAt = bill.createdAt || bill.CreatedAt;
                                                const statusBadge = getStatusBadge(status);
                                                const typeBadge = getTypeBadge(billType);

                                                return (
                                                    <tr key={billId} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                                                #{billId.toString().substring(0, 8).toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeBadge.bg} ${typeBadge.text}`}>
                                                                {typeBadge.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                            {roomName}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(createdAt)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                            <span className="text-sm font-bold text-gray-900">
                                                                {formatCurrency(amount)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                                                                {statusBadge.icon}
                                                                {statusBadge.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => handleViewDetail(bill)}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Xem chi tiết"
                                                                >
                                                                    <Eye className="w-5 h-5" />
                                                                </button>
                                                                {status === 'Unpaid' && (
                                                                    <button
                                                                        onClick={() => handlePayBill(billId)}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                                                                    >
                                                                        <CreditCard className="w-4 h-4" />
                                                                        Thanh toán
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="md:hidden divide-y divide-gray-100">
                                    {currentBills.map((bill) => {
                                        const billId = bill.id || bill.Id || '';
                                        const status = getBillStatus(bill);
                                        const billType = getBillType(bill);
                                        const amount = getBillAmount(bill);
                                        const roomName = bill.roomName || bill.RoomName || '-';
                                        const createdAt = bill.createdAt || bill.CreatedAt;
                                        const statusBadge = getStatusBadge(status);
                                        const typeBadge = getTypeBadge(billType);

                                        return (
                                            <div key={billId} className="p-4 hover:bg-gray-50">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <span className="text-xs font-mono text-gray-500">#{billId.toString().substring(0, 8).toUpperCase()}</span>
                                                        <p className="text-sm font-medium text-gray-900 mt-0.5">{roomName}</p>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                                                        {statusBadge.icon}
                                                        {statusBadge.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge.bg} ${typeBadge.text}`}>
                                                            {typeBadge.label}
                                                        </span>
                                                        <span className="text-xs text-gray-400 ml-2">{formatDate(createdAt)}</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900">{formatCurrency(amount)}</p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <button
                                                        onClick={() => handleViewDetail(bill)}
                                                        className="flex-1 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                    >
                                                        Xem chi tiết
                                                    </button>
                                                    {status === 'Unpaid' && (
                                                        <button
                                                            onClick={() => handlePayBill(billId)}
                                                            className="flex-1 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                                                        >
                                                            Thanh toán
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredBills.length)} / {filteredBills.length} hóa đơn
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="px-3 py-1 text-sm font-medium text-gray-700">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Chi tiết hóa đơn</h2>
                                    {selectedBill && (
                                        <p className="text-sm text-gray-500 mt-1 font-mono">
                                            #{(selectedBill.id || selectedBill.Id || '').toString().substring(0, 8).toUpperCase()}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {loadingDetail ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                    <span className="ml-3 text-gray-600">Đang tải chi tiết...</span>
                                </div>
                            ) : selectedBill ? (
                                <div className="space-y-6">
                                    {/* Amount Card */}
                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                                        <p className="text-blue-100 text-sm mb-1">Tổng số tiền</p>
                                        <p className="text-3xl font-bold">{formatCurrency(getBillAmount(selectedBill))}</p>
                                        <div className="mt-3">
                                            {(() => {
                                                const status = getBillStatus(selectedBill);
                                                const badge = getStatusBadge(status);
                                                return (
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white`}>
                                                        {badge.icon}
                                                        {badge.label}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Bill Info Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                                <Home className="w-4 h-4" />
                                                <span className="text-xs uppercase tracking-wide">Nhà trọ</span>
                                            </div>
                                            <p className="font-medium text-gray-900">
                                                {selectedBill.houseName || selectedBill.HouseName || '-'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                                <FileText className="w-4 h-4" />
                                                <span className="text-xs uppercase tracking-wide">Phòng</span>
                                            </div>
                                            <p className="font-medium text-gray-900">
                                                {selectedBill.roomName || selectedBill.RoomName || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Room Price */}
                                    {(selectedBill.roomPrice || selectedBill.RoomPrice) > 0 && (
                                        <div className="bg-purple-50 rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-purple-100 p-2 rounded-lg">
                                                    <Home className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <span className="font-medium text-purple-900">Tiền thuê phòng</span>
                                            </div>
                                            <span className="text-lg font-bold text-purple-600">
                                                {formatCurrency(selectedBill.roomPrice || selectedBill.RoomPrice)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Details */}
                                    {(selectedBill.details || selectedBill.Details)?.length > 0 && (
                                        <div className="space-y-3">
                                            <p className="font-semibold text-gray-700">Chi tiết hóa đơn</p>
                                            {(selectedBill.details || selectedBill.Details).map((detail, index) => {
                                                const detailType = (detail.type || detail.Type || '').toLowerCase();
                                                const isElectric = detailType.includes('electric') || detailType.includes('điện');
                                                const isWater = detailType.includes('water') || detailType.includes('nước');
                                                const isService = detail.serviceName || detail.ServiceName;

                                                if (isElectric) {
                                                    return (
                                                        <div key={index} className="bg-yellow-50 rounded-xl p-4">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Zap className="w-5 h-5 text-yellow-600" />
                                                                <span className="font-medium text-yellow-800">Tiền điện</span>
                                                            </div>
                                                            <div className="grid grid-cols-4 gap-2 text-sm">
                                                                <div>
                                                                    <p className="text-yellow-600 text-xs">Đầu kỳ</p>
                                                                    <p className="font-medium text-yellow-900">{detail.previousIndex || detail.PreviousIndex || 0}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-yellow-600 text-xs">Cuối kỳ</p>
                                                                    <p className="font-medium text-yellow-900">{detail.currentIndex || detail.CurrentIndex || 0}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-yellow-600 text-xs">Tiêu thụ</p>
                                                                    <p className="font-medium text-yellow-900">{detail.consumption || detail.Consumption || 0} kWh</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-yellow-600 text-xs">Thành tiền</p>
                                                                    <p className="font-bold text-yellow-900">{formatCurrency(detail.total || detail.Total)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                if (isWater) {
                                                    return (
                                                        <div key={index} className="bg-blue-50 rounded-xl p-4">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Droplets className="w-5 h-5 text-blue-600" />
                                                                <span className="font-medium text-blue-800">Tiền nước</span>
                                                            </div>
                                                            <div className="grid grid-cols-4 gap-2 text-sm">
                                                                <div>
                                                                    <p className="text-blue-600 text-xs">Đầu kỳ</p>
                                                                    <p className="font-medium text-blue-900">{detail.previousIndex || detail.PreviousIndex || 0}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-blue-600 text-xs">Cuối kỳ</p>
                                                                    <p className="font-medium text-blue-900">{detail.currentIndex || detail.CurrentIndex || 0}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-blue-600 text-xs">Tiêu thụ</p>
                                                                    <p className="font-medium text-blue-900">{detail.consumption || detail.Consumption || 0} m³</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-blue-600 text-xs">Thành tiền</p>
                                                                    <p className="font-bold text-blue-900">{formatCurrency(detail.total || detail.Total)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                if (isService) {
                                                    return (
                                                        <div key={index} className="bg-green-50 rounded-xl p-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-green-100 p-2 rounded-lg">
                                                                    <Wrench className="w-5 h-5 text-green-600" />
                                                                </div>
                                                                <span className="font-medium text-green-800">
                                                                    {detail.serviceName || detail.ServiceName}
                                                                </span>
                                                            </div>
                                                            <span className="font-bold text-green-600">
                                                                {formatCurrency(detail.total || detail.Total || detail.servicePrice || detail.ServicePrice)}
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div key={index} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                                                        <span className="font-medium text-gray-800">{detail.type || detail.Type}</span>
                                                        <span className="font-bold text-gray-900">{formatCurrency(detail.total || detail.Total)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Note */}
                                    {(selectedBill.note || selectedBill.Note) && (
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ghi chú</p>
                                            <p className="text-gray-900">{selectedBill.note || selectedBill.Note}</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4 border-t">
                                        <button
                                            onClick={() => setShowDetailModal(false)}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                        >
                                            Đóng
                                        </button>
                                        {getBillStatus(selectedBill) === 'Unpaid' && (
                                            <button
                                                onClick={() => {
                                                    setShowDetailModal(false);
                                                    handlePayBill(selectedBill.id || selectedBill.Id);
                                                }}
                                                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium transition-colors flex items-center justify-center gap-2"
                                            >
                                                <CreditCard className="w-5 h-5" />
                                                Thanh toán ngay
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    Không thể tải chi tiết hóa đơn
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </ProtectedRoute>
    );
}
