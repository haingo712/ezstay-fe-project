'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import contractService from '@/services/contractService';
import {
    Building2,
    Calendar,
    ArrowLeft,
    CheckCircle,
    Clock,
    XCircle,
    Users,
    Banknote,
    FileText,
    User,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    PenLine,
    Image as ImageIcon
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RoleBasedRedirect from '@/components/RoleBasedRedirect';

export default function ContractDetailPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (params.id) {
            loadContract();
        }
    }, [params.id]);

    const loadContract = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await contractService.getById(params.id);
            console.log('Contract detail:', response);
            setContract(response.data || response);
        } catch (error) {
            console.error('Error loading contract:', error);
            setError('Không thể tải thông tin hợp đồng');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        // Backend enum: Pending=0, Active=1, Cancelled=2, Expired=3, Evicted=4
        const statusConfig = {
            0: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            1: { label: 'Đang hoạt động', color: 'bg-green-100 text-green-800', icon: CheckCircle },
            2: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-800', icon: XCircle },
            3: { label: 'Đã hết hạn', color: 'bg-red-100 text-red-800', icon: XCircle },
            4: { label: 'Bị chấm dứt', color: 'bg-red-100 text-red-800', icon: XCircle },
        };

        const config = statusConfig[status] || statusConfig[0];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
                <Icon className="h-5 w-5" />
                {config.label}
            </span>
        );
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

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <RoleBasedRedirect allowedRoles={['User', 'Owner']}>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <Navbar />
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải thông tin hợp đồng...</p>
                        </div>
                    </div>
                    <Footer />
                </div>
            </RoleBasedRedirect>
        );
    }

    if (error || !contract) {
        return (
            <RoleBasedRedirect allowedRoles={['User', 'Owner']}>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <Navbar />
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {error || 'Không tìm thấy hợp đồng'}
                            </h3>
                            <button
                                onClick={() => router.back()}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Quay lại
                            </button>
                        </div>
                    </div>
                    <Footer />
                </div>
            </RoleBasedRedirect>
        );
    }

    return (
        <RoleBasedRedirect allowedRoles={['User', 'Owner']}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-6"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Quay lại
                    </button>

                    {/* Sign Contract Banner - Show when user hasn't signed yet */}
                    {contract.contractStatus === 0 && !contract.tenantSignature && (
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 mb-6 text-white">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                        <PenLine className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Hợp đồng đang chờ chữ ký của bạn</h2>
                                        <p className="text-white/80">Vui lòng ký để hoàn tất hợp đồng thuê phòng</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push(`/profile/contracts/${params.id}/signature`)}
                                    className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
                                >
                                    <PenLine className="h-5 w-5" />
                                    Ký ngay
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Header Card */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-6 text-white">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                    <Building2 className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">{contract.roomName || 'Phòng trọ'}</h1>
                                    <p className="text-white/80">{contract.houseName || 'Nhà trọ'}</p>
                                </div>
                            </div>
                            {getStatusBadge(contract.contractStatus)}
                        </div>
                    </div>

                    {/* Price & Deposit */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-green-600" />
                            Thông tin tài chính
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Giá thuê hàng tháng</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(contract.roomPrice)}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Tiền cọc</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(contract.depositAmount)}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Số người ở</p>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {contract.numberOfOccupants || 1} người
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contract Period */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Thời gian hợp đồng
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <Calendar className="h-6 w-6 text-green-600" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Ngày nhận phòng</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {formatDate(contract.checkinDate)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <Calendar className="h-6 w-6 text-red-600" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Ngày trả phòng</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {formatDate(contract.checkoutDate)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Utility Readings */}
                    {(contract.electricityReading || contract.waterReading) && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-yellow-600" />
                                Chỉ số điện nước ban đầu
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {contract.electricityReading && (
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Chỉ số điện</p>
                                        <p className="text-xl font-bold text-yellow-600">
                                            {contract.electricityReading.reading || contract.electricityReading} kWh
                                        </p>
                                    </div>
                                )}
                                {contract.waterReading && (
                                    <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Chỉ số nước</p>
                                        <p className="text-xl font-bold text-cyan-600">
                                            {contract.waterReading.reading || contract.waterReading} m³
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Services */}
                    {contract.serviceInfors && contract.serviceInfors.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-indigo-600" />
                                Dịch vụ đi kèm
                            </h2>
                            <div className="space-y-3">
                                {contract.serviceInfors.map((service, idx) => (
                                    <div
                                        key={idx}
                                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                    >
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {service.serviceName}
                                        </span>
                                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                            {formatCurrency(service.price)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Identity Profiles */}
                    {contract.identityProfiles && contract.identityProfiles.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-600" />
                                Thông tin thành viên
                            </h2>
                            <div className="space-y-4">
                                {contract.identityProfiles.map((profile, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            {profile.avatar ? (
                                                <img
                                                    src={profile.avatar}
                                                    alt={profile.fullName}
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                    <User className="h-6 w-6 text-blue-600" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {profile.fullName}
                                                </p>
                                                <span className={`text-xs px-2 py-1 rounded ${profile.isSigner
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                                                    }`}>
                                                    {profile.isSigner ? 'Người ký' : 'Thành viên'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                            {profile.phone && (
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <Phone className="h-4 w-4" />
                                                    {profile.phone}
                                                </div>
                                            )}
                                            {profile.email && (
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <Mail className="h-4 w-4" />
                                                    {profile.email}
                                                </div>
                                            )}
                                            {profile.citizenIdNumber && (
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <CreditCard className="h-4 w-4" />
                                                    CCCD: {profile.citizenIdNumber}
                                                </div>
                                            )}
                                            {profile.address && (
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <MapPin className="h-4 w-4" />
                                                    {profile.address}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Signatures */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <PenLine className="h-5 w-5 text-green-600" />
                            Chữ ký
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Chủ trọ</p>
                                {contract.ownerSignature ? (
                                    <div>
                                        <img
                                            src={contract.ownerSignature}
                                            alt="Owner Signature"
                                            className="h-20 object-contain"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            Ký lúc: {formatDateTime(contract.ownerSignedAt)}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic">Chưa ký</p>
                                )}
                            </div>
                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Người thuê (Bạn)</p>
                                {contract.tenantSignature ? (
                                    <div>
                                        <img
                                            src={contract.tenantSignature}
                                            alt="Tenant Signature"
                                            className="h-20 object-contain"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            Ký lúc: {formatDateTime(contract.tenantSignedAt)}
                                        </p>
                                    </div>
                                ) : contract.contractStatus === 0 ? (
                                    <div>
                                        <p className="text-orange-500 italic mb-2">⚠️ Bạn chưa ký hợp đồng này</p>
                                        <button
                                            onClick={() => router.push(`/profile/contracts/${params.id}/signature`)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 text-sm"
                                        >
                                            <PenLine className="h-4 w-4" />
                                            Ký ngay
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic">Chưa ký</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contract Images */}
                    {contract.contractImage && contract.contractImage.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-pink-600" />
                                Ảnh hợp đồng
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {contract.contractImage.map((img, idx) => (
                                    <a
                                        key={idx}
                                        href={img}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-80 transition"
                                    >
                                        <img
                                            src={img}
                                            alt={`Contract image ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </a>
                                ))}
                            </div>
                            {contract.contractUploadedAt && (
                                <p className="text-xs text-gray-400 mt-2">
                                    Tải lên lúc: {formatDateTime(contract.contractUploadedAt)}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Notes */}
                    {contract.notes && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Ghi chú
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300">{contract.notes}</p>
                        </div>
                    )}

                    {/* Cancel Reason */}
                    {contract.contractStatus === 3 && contract.reason && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-6">
                            <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                                Lý do hủy hợp đồng
                            </h2>
                            <p className="text-red-700 dark:text-red-400">{contract.reason}</p>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
                        <p>Tạo lúc: {formatDateTime(contract.createdAt)}</p>
                        {contract.updatedAt && contract.updatedAt !== contract.createdAt && (
                            <p>Cập nhật: {formatDateTime(contract.updatedAt)}</p>
                        )}
                    </div>
                </div>

                <Footer />
            </div>
        </RoleBasedRedirect>
    );
}
