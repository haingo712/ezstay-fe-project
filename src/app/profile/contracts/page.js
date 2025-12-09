'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
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
    Filter,
    Star
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RoleBasedRedirect from '@/components/RoleBasedRedirect';

export default function UserContractsPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
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
            console.log('Contract status details:', response.map(c => ({
                id: c.id,
                status: c.contractStatus,
                tenantSig: c.tenantSignature || c.TenantSignature,
                ownerSig: c.ownerSignature || c.OwnerSignature
            })));
            setContracts(response.data || response || []);
        } catch (error) {
            console.error('Error loading contracts:', error);
            setError(t('profileContracts.errors.loadFailed') || 'Failed to load contracts');
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        // Backend enum: Pending=0, Active=1, Cancelled=2, Expired=3, CancelledByOwner=4
        // Handle both string and number status
        let statusKey = status;
        if (typeof status === 'string') {
            const statusMap = {
                'Pending': 0,
                'Active': 1,
                'Cancelled': 2,
                'Expired': 3,
                'CancelledByOwner': 4
            };
            statusKey = statusMap[status] ?? 0;
        }

        const configs = {
            0: { label: t('profileContracts.status.pending') || 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
            1: { label: t('profileContracts.status.active') || 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
            2: { label: t('profileContracts.status.cancelled') || 'Cancelled', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400', icon: XCircle },
            3: { label: t('profileContracts.status.expired') || 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
            4: { label: t('profileContracts.status.cancelledByOwner') || 'Cancelled by Owner', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: XCircle },
        };
        return configs[statusKey] || configs[0];
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
        // Normalize status to number for filtering
        let statusNum = contract.contractStatus;
        if (typeof statusNum === 'string') {
            const statusMap = { 'Pending': 0, 'Active': 1, 'Cancelled': 2, 'Expired': 3, 'CancelledByOwner': 4 };
            statusNum = statusMap[statusNum] ?? 0;
        }

        // Filter by status
        if (filter === 'pending' && statusNum !== 0) return false;
        if (filter === 'active' && statusNum !== 1) return false;
        if (filter === 'expired' && statusNum !== 3) return false;
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
                                {t('profileContracts.title') || 'My Contracts'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {t('profileContracts.subtitle') || 'Manage your rental contracts'}
                            </p>
                        </div>

                        {/* Pending Signature Badge */}
                        {pendingSignatureCount > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">
                                <PenLine className="h-5 w-5" />
                                <span className="font-medium">{pendingSignatureCount} {t('profileContracts.needsSign') || 'contracts need signature'}</span>
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
                                    placeholder={t('profileContracts.searchPlaceholder') || 'Search by room, house...'}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                                {[
                                    { value: 'all', label: t('profileContracts.filter.all') || 'All' },
                                    { value: 'needs-sign', label: `⚠️ ${t('profileContracts.filter.needsSign') || 'Needs Sign'}`, highlight: pendingSignatureCount > 0 },
                                    { value: 'pending', label: t('profileContracts.filter.pending') || 'Pending' },
                                    { value: 'active', label: t('profileContracts.filter.active') || 'Active' },
                                    { value: 'expired', label: t('profileContracts.filter.expired') || 'Expired' },
                                ].map(item => (
                                    <button
                                        key={item.value}
                                        onClick={() => setFilter(item.value)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === item.value
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
                            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading') || 'Loading...'}</p>
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
                                {t('common.retry') || 'Retry'}
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && filteredContracts.length === 0 && (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {searchTerm || filter !== 'all'
                                    ? (t('profileContracts.empty.noResults') || 'No contracts found')
                                    : (t('profileContracts.empty.noContracts') || 'No contracts yet')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {searchTerm || filter !== 'all'
                                    ? (t('profileContracts.empty.tryFilter') || 'Try changing the filter or search term')
                                    : (t('profileContracts.empty.description') || 'When you rent a room, contracts will appear here')}
                            </p>
                        </div>
                    )}

                    {/* Contracts List */}
                    {!loading && !error && filteredContracts.length > 0 && (
                        <div className="space-y-4">
                            {filteredContracts.map(contract => {
                                console.log('Rendering contract:', contract.id, 'Status:', contract.contractStatus, 'Full contract:', contract);
                                const statusConfig = getStatusConfig(contract.contractStatus);
                                const StatusIcon = statusConfig.icon;
                                const needsSign = canUserSign(contract);

                                return (
                                    <div
                                        key={contract.id}
                                        className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden ${needsSign ? 'ring-2 ring-orange-400 dark:ring-orange-500' : ''
                                            }`}
                                    >
                                        {/* Needs Signature Banner */}
                                        {needsSign && (
                                            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 flex items-center gap-2">
                                                <PenLine className="h-5 w-5" />
                                                <span className="font-medium">{t('profileContracts.waitingSignature') || 'Contract is waiting for your signature'}</span>
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
                                                                {contract.roomName || t('profileContracts.room') || 'Room'}
                                                            </h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {contract.houseName || t('profileContracts.house') || 'House'}
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
                                                        {contract.depositAmount > 0 && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Banknote className="h-4 w-4 text-green-500" />
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                    {t('profileContracts.deposit') || 'Deposit'}: {formatCurrency(contract.depositAmount)}
                                                                </span>
                                                            </div>
                                                        )}
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
                                                                {t('profileContracts.you') || 'You'}: {getTenantSignature(contract) ? (t('profileContracts.signed') || 'Signed') : (t('profileContracts.notSigned') || 'Not signed')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {getOwnerSignature(contract) ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <Clock className="h-4 w-4 text-gray-400" />
                                                            )}
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {t('profileContracts.owner') || 'Owner'}: {getOwnerSignature(contract) ? (t('profileContracts.signed') || 'Signed') : (t('profileContracts.notSigned') || 'Not signed')}
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
                                                    {t('profileContracts.viewDetails') || 'View Details'}
                                                </button>

                                                {/* Show sign button if user hasn't signed yet */}
                                                {!getTenantSignature(contract) && (
                                                    <button
                                                        onClick={() => router.push(`/profile/contracts/${contract.id}/signature`)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-colors shadow-lg"
                                                    >
                                                        <PenLine className="h-4 w-4" />
                                                        {t('profileContracts.signContract') || 'Sign Contract'}
                                                    </button>
                                                )}

                                                {/* Show Add Review button only for Active contracts */}
                                                {(contract.contractStatus === 1 || contract.contractStatus === 'Active') && (
                                                    <button
                                                        onClick={() => router.push(`/profile/contracts/${contract.id}/review`)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-colors shadow-lg"
                                                    >
                                                        <Star className="h-4 w-4" />
                                                        {t('profileContracts.addReview') || 'Add Review'}
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
