"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "@/utils/api";

export default function OwnerBillsPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'Unpaid', 'Paid', 'Cancelled'

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            setLoading(true);
            console.log('📄 Fetching owner bills...');

            const response = await api.get('/api/UtilityBills/owner');
            console.log('✅ Bills fetched:', response);

            // Handle both array and OData response format
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

    const handleMarkAsPaid = async (billId) => {
        if (!confirm('Mark this bill as paid?')) return;

        try {
            await api.put(`/api/UtilityBills/${billId}/pay`, {});
            toast.success('Bill marked as paid!');
            fetchBills();
        } catch (error) {
            console.error('Error marking bill as paid:', error);
            const errorMessage = error.data?.message || error.message || 'Failed to mark as paid';
            toast.error(errorMessage);
        }
    };

    const handleCancelBill = async (billId) => {
        const reason = prompt('Enter cancellation reason (optional):');
        if (reason === null) return; // User cancelled

        try {
            await api.put(`/api/UtilityBills/${billId}/cancel`, reason || '');
            toast.success('Bill cancelled!');
            fetchBills();
        } catch (error) {
            console.error('Error cancelling bill:', error);
            const errorMessage = error.data?.message || error.message || 'Failed to cancel bill';
            toast.error(errorMessage);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

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

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Unpaid': { bg: 'bg-red-100', text: 'text-red-800', label: 'Unpaid' },
            'Paid': { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
            'Cancelled': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' },
            'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' }
        };
        const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const getBillTypeBadge = (type) => {
        const typeConfig = {
            'Monthly': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '📅', label: 'Monthly' },
            'Deposit': { bg: 'bg-purple-100', text: 'text-purple-800', icon: '💰', label: 'Deposit' },
            'Utility': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⚡', label: 'Utility' }
        };
        const config = typeConfig[type] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📄', label: type };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.icon} {config.label}
            </span>
        );
    };

    const filteredBills = bills.filter(bill => {
        if (filter === 'all') return true;
        return bill.status === filter || bill.Status === filter;
    });

    // Calculate summary
    const summary = {
        total: bills.length,
        unpaid: bills.filter(b => b.status === 'Unpaid' || b.Status === 'Unpaid').length,
        paid: bills.filter(b => b.status === 'Paid' || b.Status === 'Paid').length,
        totalAmount: bills.reduce((sum, b) => sum + (b.totalAmount || b.TotalAmount || 0), 0),
        unpaidAmount: bills
            .filter(b => b.status === 'Unpaid' || b.Status === 'Unpaid')
            .reduce((sum, b) => sum + (b.totalAmount || b.TotalAmount || 0), 0)
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>📄</span> Bills Management
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Manage utility bills for your properties
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center">
                        <span className="text-3xl mr-3">📊</span>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Bills</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm border border-red-200 dark:border-red-700 p-4">
                    <div className="flex items-center">
                        <span className="text-3xl mr-3">⏳</span>
                        <div>
                            <p className="text-sm text-red-600 dark:text-red-400">Unpaid</p>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{summary.unpaid}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm border border-green-200 dark:border-green-700 p-4">
                    <div className="flex items-center">
                        <span className="text-3xl mr-3">✅</span>
                        <div>
                            <p className="text-sm text-green-600 dark:text-green-400">Paid</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{summary.paid}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-sm border border-yellow-200 dark:border-yellow-700 p-4">
                    <div className="flex items-center">
                        <span className="text-3xl mr-3">💰</span>
                        <div>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">Unpaid Amount</p>
                            <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{formatCurrency(summary.unpaidAmount)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    {['all', 'Unpaid', 'Paid', 'Cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${filter === status
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            {status === 'all' ? 'All Bills' : status}
                            {status === 'all' && ` (${bills.length})`}
                            {status === 'Unpaid' && ` (${summary.unpaid})`}
                            {status === 'Paid' && ` (${summary.paid})`}
                        </button>
                    ))}
                </div>

                {/* Bills Table */}
                <div className="overflow-x-auto">
                    {filteredBills.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-3">📄</div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No bills found</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Bills will appear here when you generate them from the Utilities page
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Bill ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Room</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Period</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Created</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                {filteredBills.map((bill) => {
                                    const billId = bill.id || bill.Id;
                                    const status = bill.status || bill.Status;
                                    const billType = bill.billType || bill.BillType || bill.type || bill.Type;
                                    const roomName = bill.roomName || bill.RoomName || '-';
                                    const totalAmount = bill.totalAmount || bill.TotalAmount || 0;
                                    const createdAt = bill.createdAt || bill.CreatedAt || bill.createdDate || bill.CreatedDate;
                                    const billingPeriod = bill.billingPeriod || bill.BillingPeriod || bill.month || bill.Month;

                                    return (
                                        <tr key={billId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">
                                                #{billId?.slice(0, 8)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getBillTypeBadge(billType)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {roomName}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {billingPeriod || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-bold text-green-600 dark:text-green-400 text-right">
                                                {formatCurrency(totalAmount)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {getStatusBadge(status)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(createdAt)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {status === 'Unpaid' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleMarkAsPaid(billId)}
                                                                className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
                                                                title="Mark as Paid"
                                                            >
                                                                ✅ Paid
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelBill(billId)}
                                                                className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                                                                title="Cancel Bill"
                                                            >
                                                                ❌ Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                    {status === 'Paid' && (
                                                        <span className="text-green-600 text-sm">✓ Completed</span>
                                                    )}
                                                    {status === 'Cancelled' && (
                                                        <span className="text-gray-500 text-sm">Cancelled</span>
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
            </div>
        </div>
    );
}
