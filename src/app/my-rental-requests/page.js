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
    ArrowLeft,
    Search,
    User,
    Phone,
    Mail,
    CreditCard
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MyRentalRequestsPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { t } = useTranslation();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchRentalRequests();
        }
    }, [authLoading, isAuthenticated]);

    const fetchRentalRequests = async () => {
        try {
            setLoading(true);
            console.log('📋 Fetching rental requests for user...');

            const response = await contractService.getRentalRequestsByUser();
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
                                boardingHouseName: roomData?.boardingHouseName || 'N/A',
                                // Normalize citizenIdNumber field
                                citizenIdNumber: request.citizenIdNumber || request.CitizenIdNumber || []
                            };
                        }
                        return {
                            ...request,
                            citizenIdNumber: request.citizenIdNumber || request.CitizenIdNumber || []
                        };
                    } catch (error) {
                        console.error('Error fetching room info:', error);
                        return {
                            ...request,
                            citizenIdNumber: request.citizenIdNumber || request.CitizenIdNumber || []
                        };
                    }
                })
            );

            console.log('📋 Enriched requests with CCCD:', enrichedRequests);
            setRequests(enrichedRequests);
        } catch (error) {
            console.error('❌ Error fetching rental requests:', error);
            toast.error(t('myRentalRequests.errors.loadFailed'));
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

        if (diffInHours < 1) return t('myRentalRequests.justNow');
        if (diffInHours < 24) return t('myRentalRequests.hoursAgo', { count: diffInHours });
        const diffInDays = Math.floor(diffInHours / 24);
        return t('myRentalRequests.daysAgo', { count: diffInDays });
    };

    const filteredRequests = requests.filter(request => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            request.roomName?.toLowerCase().includes(search) ||
            request.boardingHouseName?.toLowerCase().includes(search)
        );
    });

    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
        router.push('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        {t('common.back')}
                    </button>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Home className="h-8 w-8 text-green-600" />
                            {t('myRentalRequests.title')}
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            {t('myRentalRequests.subtitle')}
                        </p>
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
                            placeholder={t('myRentalRequests.searchPlaceholder')}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Home className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{t('myRentalRequests.stats.total')}</p>
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
                                <p className="text-sm text-gray-600 dark:text-gray-400">{t('myRentalRequests.stats.pending')}</p>
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
                                <p className="text-sm text-gray-600 dark:text-gray-400">{t('myRentalRequests.stats.thisMonth')}</p>
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
                        <p className="mt-4 text-gray-600 dark:text-gray-400">{t('myRentalRequests.loading')}</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                        <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {t('myRentalRequests.empty.title')}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {t('myRentalRequests.empty.description')}
                        </p>
                        <button
                            onClick={() => router.push('/rental-posts')}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            {t('myRentalRequests.empty.browse')}
                        </button>
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
                                                    <span>{t('ownerRentalRequests.requestFrom') || 'Request from'}: </span>
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
                                                        <span>{t('myRentalRequests.checkin')}: {formatDate(request.checkinDate)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{t('myRentalRequests.checkout')}: {formatDate(request.checkoutDate)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                        <Users className="h-4 w-4" />
                                                        <span>{request.numberOfOccupants} {t('myRentalRequests.people')}</span>
                                                    </div>
                                                </div>

                                                {/* CCCD Numbers - Always visible */}
                                                <div className="mt-3 space-y-2">
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
                                                        <CreditCard className="h-4 w-4" />
                                                        {t('ownerRentalRequests.cccdNumber') || 'ID Card Number'}:
                                                    </span>
                                                    <div className="space-y-1.5">
                                                        {(() => {
                                                            const cccdArray = Array.isArray(request.citizenIdNumber)
                                                                ? request.citizenIdNumber.filter(Boolean)
                                                                : (request.citizenIdNumber ? [request.citizenIdNumber] : []);

                                                            if (cccdArray.length === 0) {
                                                                return (
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                        No ID card information provided
                                                                    </div>
                                                                );
                                                            }

                                                            return cccdArray.map((cccd, idx) => (
                                                                <div key={idx} className="flex items-center gap-2">
                                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${idx === 0
                                                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                                        }`}>
                                                                        {idx === 0
                                                                            ? (t('ownerRentalRequests.representative') || 'Representative')
                                                                            : (t('ownerRentalRequests.coOccupant') || 'Co-occupant')
                                                                        }
                                                                    </span>
                                                                    <span className="font-mono text-sm text-gray-900 dark:text-white">{cccd}</span>
                                                                </div>
                                                            ));
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Price & Sent Date */}
                                    <div className="flex flex-col gap-4">
                                        {/* Price */}
                                        {request.roomPrice > 0 && (
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('myRentalRequests.price')}</p>
                                                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                                    {formatPrice(request.roomPrice)}/{t('common.month')}
                                                </p>
                                            </div>
                                        )}

                                        {/* Sent Date */}
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {t('myRentalRequests.sentOn') || 'Sent on'}: {formatDate(request.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
