'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import contractService from '@/services/contractService';
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    PenLine,
    Building2,
    Calendar,
    Banknote,
    Search,
    Filter
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RoleBasedRedirect from '@/components/RoleBasedRedirect';

export default function UserContractsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, active, expired
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user?.id) {
            loadContracts();
        }
    }, [user]);

    const loadContracts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await contractService.getByTenantId(user.id);
            console.log('User contracts:', response);
            setContracts(response.data || response || []);
        } catch (error) {
            console.error('Error loading contracts:', error);
            setError('Không thể tải danh sách hợp đồng');
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        // Backend enum: Pending=0, Active=1, Cancelled=2, Expired=3, Evicted=4
        const configs = {
            0: { label: 'Chờ ký', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
            1: { label: 'Đang hoạt động', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
            2: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400', icon: XCircle },
            3: { label: 'Đã hết hạn', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
            4: { label: 'Bị chấm dứt', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
        };
        return configs[status] || configs[0];
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Get tenant signature - handle both cases
    const getTenantSignature = (contract) => contract.tenantSignature || contract.TenantSignature;
    const getOwnerSignature = (contract) => contract.ownerSignature || contract.OwnerSignature;

    // Check if user can sign - simply check if user hasn't signed yet
    const canUserSign = (contract) => {
        const tenantSig = getTenantSignature(contract);
        return !tenantSig; // User can sign if they haven't signed yet
    };

    // Filter contracts
    const filteredContracts = contracts.filter(contract => {
        // Filter by status
        if (filter === 'pending' && contract.contractStatus !== 0) return false;
        if (filter === 'active' && contract.contractStatus !== 1) return false;
        if (filter === 'expired' && contract.contractStatus !== 3) return false;
        if (filter === 'needs-sign' && !canUserSign(contract)) return false;

        // Filter by search
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                contract.roomName?.toLowerCase().includes(search) ||
                contract.houseName?.toLowerCase().includes(search)
            );
        }
        return true;
    });

    // Count contracts needing signature
    const pendingSignatureCount = contracts.filter(c => canUserSign(c)).length;

    return (
        <RoleBasedRedirect allowedRoles={['User']}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText className="h-7 w-7 text-blue-600" />
                                Hợp đồng của tôi
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Quản lý các hợp đồng thuê trọ
                            </p>
                        </div>

                        {/* Pending Signature Badge */}
                        {pendingSignatureCount > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">
                                <PenLine className="h-5 w-5" />
                                <span className="font-medium">{pendingSignatureCount} hợp đồng cần ký</span>
                            </div>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Tìm kiếm theo tên phòng, nhà trọ..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                                {[
                                    { value: 'all', label: 'Tất cả' },
                                    { value: 'needs-sign', label: '⚠️ Cần ký', highlight: pendingSignatureCount > 0 },
                                    { value: 'pending', label: 'Chờ xử lý' },
                                    { value: 'active', label: 'Đang hoạt động' },
                                    { value: 'expired', label: 'Đã hết hạn' },
                                ].map(item => (
                                    <button
                                        key={item.value}
                                        onClick={() => setFilter(item.value)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                            filter === item.value
                                                ? 'bg-blue-600 text-white'
                                                : item.highlight
                                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">{error}</p>
                            <button
                                onClick={loadContracts}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && filteredContracts.length === 0 && (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {searchTerm || filter !== 'all' ? 'Không tìm thấy hợp đồng' : 'Chưa có hợp đồng nào'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {searchTerm || filter !== 'all'
                                    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                                    : 'Khi bạn thuê phòng, hợp đồng sẽ xuất hiện ở đây'}
                            </p>
                        </div>
                    )}

                    {/* Contracts List */}
                    {!loading && !error && filteredContracts.length > 0 && (
                        <div className="space-y-4">
                            {filteredContracts.map(contract => {
                                const statusConfig = getStatusConfig(contract.contractStatus);
                                const StatusIcon = statusConfig.icon;
                                const needsSign = canUserSign(contract);

                                return (
                                    <div
                                        key={contract.id}
                                        className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden ${
                                            needsSign ? 'ring-2 ring-orange-400 dark:ring-orange-500' : ''
                                        }`}
                                    >
                                        {/* Needs Signature Banner */}
                                        {needsSign && (
                                            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 flex items-center gap-2">
                                                <PenLine className="h-5 w-5" />
                                                <span className="font-medium">Hợp đồng đang chờ chữ ký của bạn</span>
                                            </div>
                                        )}

                                        <div className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    {/* Room & House */}
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                                            <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                {contract.roomName || 'Phòng trọ'}
                                                            </h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {contract.houseName || 'Nhà trọ'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Contract Details */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Banknote className="h-4 w-4 text-gray-400" />
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {formatCurrency(contract.roomPrice)}/tháng
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Signature Status */}
                                                    <div className="flex gap-4 mt-4 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            {getTenantSignature(contract) ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <Clock className="h-4 w-4 text-orange-500" />
                                                            )}
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                Bạn: {getTenantSignature(contract) ? 'Đã ký' : 'Chưa ký'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {getOwnerSignature(contract) ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <Clock className="h-4 w-4 text-gray-400" />
                                                            )}
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                Chủ trọ: {getOwnerSignature(contract) ? 'Đã ký' : 'Chưa ký'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status Badge */}
                                                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusConfig.color}`}>
                                                    <StatusIcon className="h-4 w-4" />
                                                    {statusConfig.label}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <button
                                                    onClick={() => router.push(`/profile/contracts/${contract.id}`)}
                                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Xem chi tiết
                                                </button>

                                                {/* Show sign button if user hasn't signed yet */}
                                                {!getTenantSignature(contract) && (
                                                    <button
                                                        onClick={() => router.push(`/profile/contracts/${contract.id}/signature`)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-colors shadow-lg"
                                                    >
                                                        <PenLine className="h-4 w-4" />
                                                        Ký hợp đồng
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <Footer />
            </div>
        </RoleBasedRedirect>
    );
}
