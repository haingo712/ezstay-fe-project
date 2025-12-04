'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import contractService from '@/services/contractService';
import roomService from '@/services/roomService';
import { toast } from 'react-toastify';
import {
    Home,
    Calendar,
    Users,
    Clock,
    Building2,
    Search,
    CheckCircle,
    XCircle,
    Eye,
    User,
    FileText,
    Phone,
    Mail,
    CreditCard,
    MapPin,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function OwnerRentalRequestsPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { t } = useTranslation();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [expandedRequestId, setExpandedRequestId] = useState(null);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchRentalRequests();
        }
    }, [authLoading, isAuthenticated]);

    const fetchRentalRequests = async () => {
        try {
            setLoading(true);
            console.log('📋 Fetching rental requests for owner...');

            const response = await contractService.getRentalRequestsByOwner();
            console.log('📋 Rental requests:', response);

            // Enrich with room info
            const enrichedRequests = await Promise.all(
                (response || []).map(async (request) => {
                    try {
                        if (request.roomId) {
                            const roomData = await roomService.getById(request.roomId);
                            return {
                                ...request,
                                roomName: roomData?.name || roomData?.roomName || 'N/A',
                                roomPrice: roomData?.price || 0,
                                boardingHouseName: roomData?.boardingHouseName || 'N/A'
                            };
                        }
                        return request;
                    } catch (error) {
                        console.error('Error fetching room info:', error);
                        return request;
                    }
                })
            );

            setRequests(enrichedRequests);
        } catch (error) {
            console.error('❌ Error fetching rental requests:', error);
            toast.error(t('ownerRentalRequests.errors.loadFailed'));
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatPrice = (price) => {
        if (!price) return 'N/A';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return '';
        const now = new Date();
        const date = new Date(dateString);
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) return t('ownerRentalRequests.justNow');
        if (diffInHours < 24) return t('ownerRentalRequests.hoursAgo', { count: diffInHours });
        const diffInDays = Math.floor(diffInHours / 24);
        return t('ownerRentalRequests.daysAgo', { count: diffInDays });
    };

    const handleApprove = async (requestId) => {
        try {
            setProcessingId(requestId);
            // TODO: Call API to approve request
            // await contractService.approveRentalRequest(requestId);
            toast.success(t('ownerRentalRequests.approveSuccess'));
            fetchRentalRequests();
        } catch (error) {
            console.error('Error approving request:', error);
            toast.error(t('ownerRentalRequests.errors.approveFailed'));
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requestId) => {
        try {
            setProcessingId(requestId);
            // TODO: Call API to reject request
            // await contractService.rejectRentalRequest(requestId);
            toast.success(t('ownerRentalRequests.rejectSuccess'));
            fetchRentalRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
            toast.error(t('ownerRentalRequests.errors.rejectFailed'));
        } finally {
            setProcessingId(null);
        }
    };

    // Create contract from rental request
    const handleCreateContract = async (request) => {
        try {
            setProcessingId(request.id);

            // Get room details to find boardingHouseId
            let boardingHouseId = request.boardingHouseId;

            if (!boardingHouseId && request.roomId) {
                console.log('🏠 Fetching room to get boardingHouseId...');
                const roomData = await roomService.getById(request.roomId);
                boardingHouseId = roomData?.boardingHouseId || roomData?.BoardingHouseId || roomData?.houseId || roomData?.HouseId;
                console.log('🏠 BoardingHouseId from room:', boardingHouseId);
            }

            if (!boardingHouseId) {
                toast.error(t('ownerRentalRequests.errors.noBoardingHouse'));
                return;
            }

            // Prepare contract data from rental request
            const contractData = {
                roomId: request.roomId,
                checkinDate: request.checkinDate,
                checkoutDate: request.checkoutDate,
                numberOfOccupants: request.numberOfOccupants,
                roomPrice: request.roomPrice || 0,
                tenantUserId: request.userId,
                rentalRequestId: request.id,
                // Additional info for display
                roomName: request.roomName,
                boardingHouseName: request.boardingHouseName,
                // Tenant Identity Profile
                tenantProfile: {
                    fullName: request.fullName,
                    gender: request.gender,
                    dateOfBirth: request.dateOfBirth,
                    phone: request.phone,
                    email: request.email,
                    provinceId: request.provinceId,
                    provinceName: request.provinceName,
                    wardId: request.wardId,
                    wardName: request.wardName,
                    address: request.address,
                    temporaryResidence: request.temporaryResidence,
                    citizenIdNumber: request.citizenIdNumber,
                    citizenIdIssuedDate: request.citizenIdIssuedDate,
                    citizenIdIssuedPlace: request.citizenIdIssuedPlace,
                    frontImageUrl: request.frontImageUrl,
                    backImageUrl: request.backImageUrl,
                    avatar: request.avatar
                }
            };

            // Store in sessionStorage and navigate to contract creation page
            sessionStorage.setItem('rentalRequestData', JSON.stringify(contractData));

            // Navigate to the contracts page of the boarding house with create mode
            router.push(`/owner/boarding-houses/${boardingHouseId}/contracts?action=create&fromRentalRequest=true`);
        } catch (error) {
            console.error('Error preparing contract creation:', error);
            toast.error(t('ownerRentalRequests.errors.createContractFailed'));
        } finally {
            setProcessingId(null);
        }
    };

    const filteredRequests = requests.filter(request => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            request.roomName?.toLowerCase().includes(search) ||
            request.boardingHouseName?.toLowerCase().includes(search) ||
            request.fullName?.toLowerCase().includes(search) ||
            request.phone?.toLowerCase().includes(search) ||
            request.citizenIdNumber?.toLowerCase().includes(search)
        );
    });

    const getGenderText = (gender) => {
        switch (gender) {
            case 0: return t('ownerRentalRequests.genderMale');
            case 1: return t('ownerRentalRequests.genderFemale');
            case 2: return t('ownerRentalRequests.genderOther');
            default: return 'N/A';
        }
    };

    const toggleExpand = (requestId) => {
        setExpandedRequestId(expandedRequestId === requestId ? null : requestId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Home className="h-7 w-7 text-green-600" />
                        {t('ownerRentalRequests.title')}
                    </h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        {t('ownerRentalRequests.subtitle')}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('ownerRentalRequests.searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Home className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('ownerRentalRequests.stats.total')}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('ownerRentalRequests.stats.pending')}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('ownerRentalRequests.stats.thisMonth')}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {requests.filter(r => {
                                    const date = new Date(r.createdAt);
                                    const now = new Date();
                                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                                }).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">{t('ownerRentalRequests.loading')}</p>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {t('ownerRentalRequests.empty.title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('ownerRentalRequests.empty.description')}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map((request) => (
                        <div
                            key={request.id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                {/* Left: Room & User Info */}
                                <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                            <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {request.roomName || 'Phòng'}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {request.boardingHouseName || 'Nhà trọ'}
                                            </p>

                                            {/* User Info */}
                                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                <User className="h-4 w-4" />
                                                <span>{t('ownerRentalRequests.requestFrom')}: </span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {request.fullName || request.userName || 'Người dùng'}
                                                </span>
                                            </div>

                                            {/* Phone & Email */}
                                            <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                                {request.phone && (
                                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                        <Phone className="h-4 w-4" />
                                                        <span>{request.phone}</span>
                                                    </div>
                                                )}
                                                {request.email && (
                                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                        <Mail className="h-4 w-4" />
                                                        <span>{request.email}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{t('ownerRentalRequests.checkin')}: {formatDate(request.checkinDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{t('ownerRentalRequests.checkout')}: {formatDate(request.checkoutDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                    <Users className="h-4 w-4" />
                                                    <span>{request.numberOfOccupants} {t('ownerRentalRequests.people')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Price & Actions */}
                                <div className="flex flex-col gap-4">
                                    {/* Price */}
                                    {request.roomPrice > 0 && (
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('ownerRentalRequests.price')}</p>
                                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                                {formatPrice(request.roomPrice)}/{t('common.month')}
                                            </p>
                                        </div>
                                    )}

                                    {/* Status & Time */}
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                            <Clock className="h-4 w-4" />
                                            {t('ownerRentalRequests.status.pending')}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {getTimeAgo(request.createdAt)}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleCreateContract(request)}
                                            disabled={processingId === request.id}
                                            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                        >
                                            <FileText className="h-4 w-4" />
                                            {t('ownerRentalRequests.createContract')}
                                        </button>
                                        <button
                                            onClick={() => handleApprove(request.id)}
                                            disabled={processingId === request.id}
                                            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            {t('ownerRentalRequests.approve')}
                                        </button>
                                        <button
                                            onClick={() => handleReject(request.id)}
                                            disabled={processingId === request.id}
                                            className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            {t('ownerRentalRequests.reject')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Request ID & Date */}
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    ID: {request.id?.substring(0, 8)}...
                                </span>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('ownerRentalRequests.sentOn')}: {formatDate(request.createdAt)}
                                    </span>
                                    <button
                                        onClick={() => toggleExpand(request.id)}
                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        {expandedRequestId === request.id ? (
                                            <>
                                                <ChevronUp className="h-4 w-4" />
                                                {t('ownerRentalRequests.hideDetails')}
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="h-4 w-4" />
                                                {t('ownerRentalRequests.viewDetails')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Details - Identity Profile */}
                            {expandedRequestId === request.id && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-purple-600" />
                                        {t('ownerRentalRequests.tenantDetails')}
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                        {/* Basic Info */}
                                        <div className="space-y-2">
                                            <h5 className="font-medium text-gray-700 dark:text-gray-300">{t('ownerRentalRequests.basicInfo')}</h5>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">{t('ownerRentalRequests.fullName')}:</span> {request.fullName || 'N/A'}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">{t('ownerRentalRequests.gender')}:</span> {getGenderText(request.gender)}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">{t('ownerRentalRequests.dateOfBirth')}:</span> {formatDate(request.dateOfBirth)}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">{t('ownerRentalRequests.phone')}:</span> {request.phone || 'N/A'}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">{t('ownerRentalRequests.email')}:</span> {request.email || 'N/A'}
                                            </p>
                                        </div>

                                        {/* Address */}
                                        <div className="space-y-2">
                                            <h5 className="font-medium text-gray-700 dark:text-gray-300">{t('ownerRentalRequests.addressInfo')}</h5>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">{t('ownerRentalRequests.address')}:</span> {request.address || 'N/A'}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">{t('ownerRentalRequests.ward')}:</span> {request.wardName || 'N/A'}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">{t('ownerRentalRequests.province')}:</span> {request.provinceName || 'N/A'}
                                            </p>
                                            {request.temporaryResidence && (
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium">{t('ownerRentalRequests.temporaryResidence')}:</span> {request.temporaryResidence}
                                                </p>
                                            )}
                                        </div>

                                        {/* CCCD Info */}
                                        <div className="space-y-2">
                                            <h5 className="font-medium text-gray-700 dark:text-gray-300">{t('ownerRentalRequests.cccdInfo')}</h5>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">{t('ownerRentalRequests.cccdNumber')}:</span> {request.citizenIdNumber || 'N/A'}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">{t('ownerRentalRequests.cccdIssuedDate')}:</span> {formatDate(request.citizenIdIssuedDate)}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">{t('ownerRentalRequests.cccdIssuedPlace')}:</span> {request.citizenIdIssuedPlace || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* CCCD Images */}
                                    {(request.frontImageUrl || request.backImageUrl) && (
                                        <div className="mt-4">
                                            <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{t('ownerRentalRequests.cccdImages')}</h5>
                                            <div className="grid grid-cols-2 gap-4 max-w-md">
                                                {request.frontImageUrl && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('ownerRentalRequests.cccdFront')}</p>
                                                        <img
                                                            src={request.frontImageUrl}
                                                            alt="CCCD Front"
                                                            className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                                                        />
                                                    </div>
                                                )}
                                                {request.backImageUrl && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('ownerRentalRequests.cccdBack')}</p>
                                                        <img
                                                            src={request.backImageUrl}
                                                            alt="CCCD Back"
                                                            className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
