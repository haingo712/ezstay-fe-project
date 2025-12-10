"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import api from "@/utils/api";
import { useBillNotifications } from "@/hooks/useSignalR";
import { FileText, Clock, CheckCircle, AlertCircle, Search, Eye, Plus, X, Home, Zap, Droplets, Wrench, ChevronLeft, ChevronRight, Ban, RefreshCw, Calendar, Wifi, WifiOff } from "lucide-react";
import notification from '@/utils/notification';

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
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function OwnerBillsPage() {
    const router = useRouter();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [userId, setUserId] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal states
    const [selectedBill, setSelectedBill] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Contracts for creating bills
    const [contracts, setContracts] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loadingContracts, setLoadingContracts] = useState(false);
    const [creatingBill, setCreatingBill] = useState(false);

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

        if (type === 'payment_received') {
            // Show toast notification
            toast.success(
                <div>
                    <strong>💰 Thanh toán mới!</strong>
                    <p>{data.message || `Phòng ${data.roomName} đã thanh toán ${formatCurrency(data.amount)}`}</p>
                </div>,
                { autoClose: 5000 }
            );
            // Refresh bills list
            fetchBills();
        } else if (type === 'status_updated') {
            // Update specific bill in list
            setBills(prev => prev.map(bill =>
                (bill.id === data.billId || bill.Id === data.billId)
                    ? { ...bill, status: data.status, Status: data.status, paymentDate: data.paymentDate }
                    : bill
            ));
        }
    }, []);

    // Connect to SignalR for real-time updates
    const { isConnected } = useBillNotifications(userId, handleBillNotification);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            setLoading(true);
            console.log('📄 Fetching owner bills...');

            const response = await api.get('/api/UtilityBills/owner');
            console.log('✅ Bills fetched:', response);

            const billsData = response.value || response || [];
            setBills(Array.isArray(billsData) ? billsData : []);
        } catch (error) {
            console.error('❌ Error fetching bills:', error);
            const errorMessage = error.data?.message || error.message || 'Failed to load bills';
            toast.error(errorMessage);
            setBills([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchContracts = async () => {
        try {
            setLoadingContracts(true);
            // Fetch active contracts
            const response = await api.get('/api/Contracts/owner?$filter=ContractStatus eq \'Active\'');
            console.log('📋 Active contracts:', response);
            const contractsData = response.value || response || [];
            setContracts(Array.isArray(contractsData) ? contractsData : []);
        } catch (error) {
            console.error('❌ Error fetching contracts:', error);
            toast.error('Failed to load contracts');
            setContracts([]);
        } finally {
            setLoadingContracts(false);
        }
    };

    const handleCreateMonthlyBill = async (contractId) => {
        try {
            setCreatingBill(true);
            console.log('📄 Creating monthly bill for contract:', contractId);

            await api.post(`/api/UtilityBills/monthly/${contractId}`, {});
            toast.success('Hóa đơn hàng tháng đã được tạo thành công!');
            setShowCreateModal(false);
            await fetchBills();
        } catch (error) {
            console.error('❌ Error creating monthly bill:', error);
            const errorMessage = error.data?.message || error.message || 'Failed to create bill';
            toast.error(errorMessage);
        } finally {
            setCreatingBill(false);
        }
    };

    const handleViewDetail = async (bill) => {
        const billId = bill.id || bill.Id;
        try {
            setLoadingDetail(true);
            setShowDetailModal(true);
            setSelectedBill(null);

            const detailBill = await api.get(`/api/UtilityBills/${billId}`);
            console.log('📄 Bill detail:', detailBill);
            setSelectedBill(detailBill);
        } catch (err) {
            console.error('Error loading bill detail:', err);
            setSelectedBill(bill);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleMarkAsPaid = async (billId) => {
        const confirmed = await notification.confirm('Xác nhận đánh dấu hóa đơn này đã thanh toán?', 'Xác nhận thanh toán');
        if (!confirmed) return;

        try {
            await api.put(`/api/UtilityBills/${billId}/pay`, {});
            toast.success('Đã đánh dấu thanh toán thành công!');
            fetchBills();
            if (showDetailModal) {
                const updatedBill = await api.get(`/api/UtilityBills/${billId}`);
                setSelectedBill(updatedBill);
            }
        } catch (error) {
            console.error('Error marking bill as paid:', error);
            const errorMessage = error.data?.message || error.message || 'Failed to mark as paid';
            toast.error(errorMessage);
        }
    };

    const handleCancelBill = async (billId) => {
        const reason = prompt('Nhập lý do hủy hóa đơn (không bắt buộc):');
        if (reason === null) return;

        try {
            await api.put(`/api/UtilityBills/${billId}/cancel`, reason || '');
            toast.success('Đã hủy hóa đơn thành công!');
            fetchBills();
            setShowDetailModal(false);
        } catch (error) {
            console.error('Error cancelling bill:', error);
            const errorMessage = error.data?.message || error.message || 'Failed to cancel bill';
            toast.error(errorMessage);
        }
    };

    const handleDeleteBill = async (billId) => {
        const confirmed = await notification.confirm('Bạn có chắc chắn muốn xóa hóa đơn này? Thao tác này không thể hoàn tác.', 'Xác nhận xóa');
        if (!confirmed) return;

        try {
            await api.delete(`/api/UtilityBills/${billId}`);
            toast.success('Đã xóa hóa đơn thành công!');
            fetchBills();
            setShowDetailModal(false);
        } catch (error) {
            console.error('Error deleting bill:', error);
            const errorMessage = error.data?.message || error.message || 'Failed to delete bill';
            toast.error(errorMessage);
        }
    };

    // Get bill helpers
    const getBillStatus = (bill) => bill.status || bill.Status || 'Unknown';
    const getBillType = (bill) => bill.billType || bill.BillType || 'Monthly';
    const getBillAmount = (bill) => bill.totalAmount || bill.TotalAmount || 0;

    // Filter bills
    const filteredBills = bills.filter(bill => {
        const status = getBillStatus(bill);
        const matchesStatus = filter === 'all' || status === filter;

        const matchesSearch = !searchTerm.trim() ||
            (bill.roomName || bill.RoomName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (bill.id || bill.Id || '').toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    // Pagination
    const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentBills = filteredBills.slice(startIndex, startIndex + itemsPerPage);

    // Calculate summary
    const summary = {
        total: bills.length,
        unpaid: bills.filter(b => getBillStatus(b) === 'Unpaid').length,
        paid: bills.filter(b => getBillStatus(b) === 'Paid').length,
        cancelled: bills.filter(b => getBillStatus(b) === 'Cancelled').length,
        totalAmount: bills.reduce((sum, b) => sum + getBillAmount(b), 0),
        unpaidAmount: bills
            .filter(b => getBillStatus(b) === 'Unpaid')
            .reduce((sum, b) => sum + getBillAmount(b), 0)
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Paid':
                return { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Paid' };
            case 'Unpaid':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" />, label: 'Unpaid' };
            case 'Cancelled':
                return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <Ban className="w-4 h-4" />, label: 'Cancelled' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800', icon: null, label: status };
        }
    };

    // Get bill type badge
    const getTypeBadge = (type) => {
        switch (type) {
            case 'Monthly':
                return { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Calendar className="w-3 h-3" />, label: 'Monthly' };
            case 'Deposit':
                return { bg: 'bg-purple-100', text: 'text-purple-800', icon: <Home className="w-3 h-3" />, label: 'Deposit' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800', icon: null, label: type };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <FileText className="w-7 h-7 text-blue-600" />
                            Bill Management
                            {/* Real-time connection indicator */}
                            {/* <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isConnected
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}
                                title={isConnected ? 'Đang nhận cập nhật real-time' : 'Đang kết nối...'}
                            >
                                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                                {isConnected ? 'Live' : 'Offline'}
                            </span> */}
                        </h1>
                        {/* <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Quản lý hóa đơn tiền phòng, điện nước cho các phòng trọ
                        </p> */}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bills</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{summary.total}</p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-yellow-200 dark:border-yellow-700 p-5 bg-yellow-50 dark:bg-yellow-900/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Unpaid</p>
                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">{summary.unpaid}</p>
                            <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">{formatCurrency(summary.unpaidAmount)}</p>
                        </div>
                        <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-xl">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-green-200 dark:border-green-700 p-5 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Paid</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{summary.paid}</p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cancelled</p>
                            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 mt-1">{summary.cancelled}</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
                            <Ban className="w-6 h-6 text-gray-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
                    {[
                        { value: 'all', label: 'All', count: bills.length },
                        { value: 'Unpaid', label: 'Unpaid', count: summary.unpaid },
                        { value: 'Paid', label: 'Paid', count: summary.paid },
                        { value: 'Cancelled', label: 'Cancelled', count: summary.cancelled }
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => {
                                setFilter(tab.value);
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === tab.value
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}

                    <div className="flex-1" />

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Tìm kiếm..."
                            className="pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 w-48"
                        />
                    </div>

                    <button
                        onClick={fetchBills}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Làm mới"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {currentBills.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-10 h-10 text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Không có hóa đơn nào</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Bắt đầu bằng cách tạo hóa đơn mới cho phòng trọ của bạn
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Bill ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Room</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Period</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Created</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                {currentBills.map((bill) => {
                                    const billId = bill.id || bill.Id;
                                    const status = getBillStatus(bill);
                                    const billType = getBillType(bill);
                                    const totalAmount = getBillAmount(bill);
                                    const roomName = bill.roomName || bill.RoomName || '-';
                                    const createdAt = bill.createdAt || bill.CreatedAt;
                                    const billingPeriod = bill.billingPeriod || bill.BillingPeriod || bill.note?.match(/\d+\/\d+/)?.[0] || '-';
                                    const statusBadge = getStatusBadge(status);
                                    const typeBadge = getTypeBadge(billType);

                                    return (
                                        <tr key={billId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-mono text-gray-900 dark:text-white">
                                                    #{billId?.slice(0, 8).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeBadge.bg} ${typeBadge.text}`}>
                                                    {typeBadge.icon}
                                                    {typeBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                                                {roomName}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {billingPeriod}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">
                                                {formatCurrency(totalAmount)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                                                    {statusBadge.icon}
                                                    {statusBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(createdAt)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => handleViewDetail(bill)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {status === 'Unpaid' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleCancelBill(billId)}
                                                                className="p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                                                title="Cancel bill"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredBills.length)} / {filteredBills.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Bill Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b dark:border-gray-700">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tạo hóa đơn mới</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Chọn hợp đồng để tạo hóa đơn hàng tháng</p>
                                </div>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {loadingContracts ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                </div>
                            ) : contracts.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400">Không có hợp đồng nào đang hoạt động</p>
                                    <p className="text-sm text-gray-400 mt-1">Cần có hợp đồng active để tạo hóa đơn</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {contracts.map((contract) => {
                                        const contractId = contract.id || contract.Id;
                                        const roomName = contract.roomName || contract.RoomName || '-';
                                        const houseName = contract.houseName || contract.HouseName || '-';
                                        const roomPrice = contract.roomPrice || contract.RoomPrice || 0;

                                        return (
                                            <div
                                                key={contractId}
                                                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                                                        <Home className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{roomName}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{houseName}</p>
                                                        <p className="text-xs text-gray-400 font-mono mt-1">#{contractId?.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(roomPrice)}/tháng</p>
                                                    <button
                                                        onClick={() => handleCreateMonthlyBill(contractId)}
                                                        disabled={creatingBill}
                                                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        {creatingBill ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                Đang tạo...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Plus className="w-4 h-4" />
                                                                Tạo hóa đơn
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="mt-6 pt-4 border-t dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    💡 <strong>Lưu ý:</strong> Để tạo hóa đơn, bạn cần nhập chỉ số điện nước cho hợp đồng trong tháng hiện tại.
                                    Vào trang <span className="text-blue-600">Hợp đồng → Quản lý điện nước</span> để thêm chỉ số.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b dark:border-gray-700">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chi tiết hóa đơn</h2>
                                    {selectedBill && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
                                            #{(selectedBill.id || selectedBill.Id || '').toString().substring(0, 8).toUpperCase()}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {loadingDetail ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                </div>
                            ) : selectedBill ? (
                                <div className="space-y-6">
                                    {/* Amount Card */}
                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                                        <p className="text-blue-100 text-sm mb-1">Tổng số tiền</p>
                                        <p className="text-3xl font-bold">{formatCurrency(getBillAmount(selectedBill))}</p>
                                        <div className="mt-3 flex items-center gap-2">
                                            {(() => {
                                                const status = getBillStatus(selectedBill);
                                                const badge = getStatusBadge(status);
                                                return (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/20">
                                                        {badge.icon}
                                                        {badge.label}
                                                    </span>
                                                );
                                            })()}
                                            {(() => {
                                                const type = getBillType(selectedBill);
                                                const badge = getTypeBadge(type);
                                                return (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20">
                                                        {badge.icon}
                                                        {badge.label}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                                <Home className="w-4 h-4" />
                                                <span className="text-xs uppercase tracking-wide">Nhà trọ</span>
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {selectedBill.houseName || selectedBill.HouseName || '-'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                                <FileText className="w-4 h-4" />
                                                <span className="text-xs uppercase tracking-wide">Phòng</span>
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {selectedBill.roomName || selectedBill.RoomName || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Room Price */}
                                    {(selectedBill.roomPrice || selectedBill.RoomPrice) > 0 && (
                                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-lg">
                                                    <Home className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <span className="font-medium text-purple-900 dark:text-purple-200">Tiền thuê phòng</span>
                                            </div>
                                            <span className="text-lg font-bold text-purple-600 dark:text-purple-300">
                                                {formatCurrency(selectedBill.roomPrice || selectedBill.RoomPrice)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Details */}
                                    {(selectedBill.details || selectedBill.Details)?.length > 0 && (
                                        <div className="space-y-3">
                                            <p className="font-semibold text-gray-700 dark:text-gray-300">Chi tiết</p>
                                            {(selectedBill.details || selectedBill.Details).map((detail, index) => {
                                                const detailType = (detail.type || detail.Type || '').toLowerCase();
                                                const isElectric = detailType.includes('electric');
                                                const isWater = detailType.includes('water');
                                                const isService = detail.serviceName || detail.ServiceName;

                                                if (isElectric) {
                                                    return (
                                                        <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Zap className="w-5 h-5 text-yellow-600" />
                                                                <span className="font-medium text-yellow-800 dark:text-yellow-200">Tiền điện</span>
                                                            </div>
                                                            <div className="grid grid-cols-4 gap-2 text-sm">
                                                                <div>
                                                                    <p className="text-yellow-600 dark:text-yellow-400 text-xs">Đầu kỳ</p>
                                                                    <p className="font-medium text-yellow-900 dark:text-yellow-100">{detail.previousIndex || 0}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-yellow-600 dark:text-yellow-400 text-xs">Cuối kỳ</p>
                                                                    <p className="font-medium text-yellow-900 dark:text-yellow-100">{detail.currentIndex || 0}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-yellow-600 dark:text-yellow-400 text-xs">Tiêu thụ</p>
                                                                    <p className="font-medium text-yellow-900 dark:text-yellow-100">{detail.consumption || 0} kWh</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-yellow-600 dark:text-yellow-400 text-xs">Thành tiền</p>
                                                                    <p className="font-bold text-yellow-900 dark:text-yellow-100">{formatCurrency(detail.total)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                if (isWater) {
                                                    return (
                                                        <div key={index} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Droplets className="w-5 h-5 text-blue-600" />
                                                                <span className="font-medium text-blue-800 dark:text-blue-200">Tiền nước</span>
                                                            </div>
                                                            <div className="grid grid-cols-4 gap-2 text-sm">
                                                                <div>
                                                                    <p className="text-blue-600 dark:text-blue-400 text-xs">Đầu kỳ</p>
                                                                    <p className="font-medium text-blue-900 dark:text-blue-100">{detail.previousIndex || 0}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-blue-600 dark:text-blue-400 text-xs">Cuối kỳ</p>
                                                                    <p className="font-medium text-blue-900 dark:text-blue-100">{detail.currentIndex || 0}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-blue-600 dark:text-blue-400 text-xs">Tiêu thụ</p>
                                                                    <p className="font-medium text-blue-900 dark:text-blue-100">{detail.consumption || 0} m³</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-blue-600 dark:text-blue-400 text-xs">Thành tiền</p>
                                                                    <p className="font-bold text-blue-900 dark:text-blue-100">{formatCurrency(detail.total)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                if (isService) {
                                                    return (
                                                        <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-lg">
                                                                    <Wrench className="w-5 h-5 text-green-600" />
                                                                </div>
                                                                <span className="font-medium text-green-800 dark:text-green-200">
                                                                    {detail.serviceName || detail.ServiceName}
                                                                </span>
                                                            </div>
                                                            <span className="font-bold text-green-600 dark:text-green-300">
                                                                {formatCurrency(detail.total || detail.servicePrice)}
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                return null;
                                            })}
                                        </div>
                                    )}

                                    {/* Note */}
                                    {(selectedBill.note || selectedBill.Note) && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Ghi chú</p>
                                            <p className="text-gray-900 dark:text-white">{selectedBill.note || selectedBill.Note}</p>
                                        </div>
                                    )}

                                    {/* Cancellation reason */}
                                    {(selectedBill.reason || selectedBill.Reason) && (
                                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                                            <p className="text-xs text-red-500 uppercase tracking-wide mb-1">Lý do hủy</p>
                                            <p className="text-red-800 dark:text-red-200">{selectedBill.reason || selectedBill.Reason}</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                                        <button
                                            onClick={() => setShowDetailModal(false)}
                                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                                        >
                                            Close
                                        </button>
                                        {getBillStatus(selectedBill) === 'Unpaid' && (
                                            <>
                                                <button
                                                    onClick={() => handleCancelBill(selectedBill.id || selectedBill.Id)}
                                                    className="px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <X className="w-5 h-5" />
                                                    Cancel
                                                </button>
                                            </>
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
        </div>
    );
}
