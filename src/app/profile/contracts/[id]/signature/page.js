'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import contractService from '@/services/contractService';
import imageService from '@/services/imageService';
import otpService from '@/services/otpService';
import profileService from '@/services/profileService';
import { toast } from 'react-toastify';
import {
    ArrowLeft,
    PenLine,
    Check,
    X,
    Trash2,
    Upload,
    Type,
    Building2,
    Calendar,
    Banknote,
    FileText,
    AlertCircle,
    Loader2,
    Mail,
    KeyRound,
    RotateCcw
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RoleBasedRedirect from '@/components/RoleBasedRedirect';

export default function UserSignContractPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const contractId = params.id;

    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);
    const [error, setError] = useState(null);

    // Signature states
    const [signatureTab, setSignatureTab] = useState('draw'); // draw, upload, type
    const [signatureData, setSignatureData] = useState(null);
    const [signatureName, setSignatureName] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);

    // OTP flow states
    const [signatureStep, setSignatureStep] = useState(1); // 1: create signature, 2: verify OTP
    const [signatureEmail, setSignatureEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [currentOtpId, setCurrentOtpId] = useState(null);
    const [otpTimer, setOtpTimer] = useState(0);
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    // Canvas ref
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    useEffect(() => {
        if (contractId) {
            loadContract();
        }
    }, [contractId]);

    // Load email from user or profile
    useEffect(() => {
        const loadUserEmail = async () => {
            // Try to get email from user auth
            if (user?.email) {
                setSignatureEmail(user.email);
                return;
            }
            
            // If not available, fetch from profile
            try {
                const profileData = await profileService.getProfile();
                if (profileData?.email) {
                    setSignatureEmail(profileData.email);
                }
            } catch (error) {
                console.log('Could not load profile email:', error);
            }
        };
        
        if (user?.fullName) {
            setSignatureName(user.fullName);
        }
        
        loadUserEmail();
    }, [user]);

    // OTP timer countdown
    useEffect(() => {
        let interval;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    // Initialize canvas
    useEffect(() => {
        if (signatureTab === 'draw' && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#1a365d';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }, [signatureTab]);

    const loadContract = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await contractService.getById(contractId);
            const contractData = response.data || response;
            setContract(contractData);

            // Try to get email from contract
            const contractEmail = contractData.tenantEmail || contractData.TenantEmail || 
                                  contractData.userEmail || contractData.UserEmail;
            if (contractEmail && !signatureEmail) {
                setSignatureEmail(contractEmail);
            }

            // Check if already signed by tenant
            const tenantSig = contractData.tenantSignature || contractData.TenantSignature;
            if (tenantSig) {
                setError('Bạn đã ký hợp đồng này rồi');
            }
            // User can sign as long as they haven't signed yet - no status check needed
        } catch (error) {
            console.error('Error loading contract:', error);
            setError('Không thể tải thông tin hợp đồng');
        } finally {
            setLoading(false);
        }
    };

    // Canvas drawing functions
    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if (e.touches && e.touches.length > 0) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        setIsDrawing(true);
        const ctx = canvasRef.current.getContext('2d');
        const coords = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const ctx = canvasRef.current.getContext('2d');
        const coords = getCoordinates(e);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        setHasDrawn(true);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        // Save signature data
        if (hasDrawn) {
            const canvas = canvasRef.current;
            setSignatureData(canvas.toDataURL('image/png'));
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
        setSignatureData(null);
    };

    // Handle file upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Vui lòng chọn file hình ảnh');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File quá lớn. Tối đa 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                setSignatureData(event.target.result);
                setUploadedFile(file);
            };
            reader.readAsDataURL(file);
        }
    };

    // Generate text signature
    const generateTextSignature = () => {
        if (!signatureName.trim()) return null;

        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');

        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Signature text
        ctx.font = 'italic 40px "Brush Script MT", cursive, sans-serif';
        ctx.fillStyle = '#1a365d';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(signatureName, canvas.width / 2, canvas.height / 2);

        return canvas.toDataURL('image/png');
    };

    // Get current signature - chỉ còn vẽ tay
    const getCurrentSignature = () => {
        return signatureData;
    };

    // Validate email
    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Send OTP for contract signing
    const handleSendOtp = async () => {
        const signature = getCurrentSignature();
        
        if (!signature) {
            toast.error('Vui lòng tạo chữ ký trước khi tiếp tục');
            return;
        }
        
        if (!signatureEmail || !validateEmail(signatureEmail)) {
            toast.error('Email không hợp lệ. Vui lòng kiểm tra lại.');
            return;
        }
        
        setIsSendingOtp(true);
        try {
            console.log('📧 Sending OTP to:', signatureEmail, 'for contract:', contractId);
            const response = await otpService.sendContractOtp(contractId, signatureEmail);
            console.log('📧 OTP Response:', response);
            
            // Backend returns { success, message, otpId } directly
            const otpId = response?.otpId || response?.data?.otpId;
            if (response?.success && otpId) {
                setCurrentOtpId(otpId);
                setSignatureStep(2);
                setOtpTimer(120); // 2 minutes
                toast.success('Mã OTP đã được gửi đến email của bạn');
            } else {
                toast.error('Không thể gửi mã OTP. Vui lòng thử lại');
            }
        } catch (error) {
            console.error('Lỗi gửi OTP:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi OTP');
        } finally {
            setIsSendingOtp(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (otpTimer > 0) return;
        await handleSendOtp();
    };

    // Go back to signature step
    const handleBackToSignature = () => {
        setSignatureStep(1);
        setOtpCode('');
        setCurrentOtpId(null);
        setOtpTimer(0);
    };

    // Handle sign contract - with OTP verification
    const handleSignContract = async () => {
        // Verify OTP first
        if (!otpCode || otpCode.length < 6) {
            toast.error('Vui lòng nhập đầy đủ mã OTP (6 số)');
            return;
        }

        const signature = getCurrentSignature();
        if (!signature) {
            toast.error('Vui lòng ký tên trước khi xác nhận');
            return;
        }

        try {
            setSigning(true);

            // Step 1: Verify OTP
            console.log('🔐 Verifying OTP...', { otpId: currentOtpId, otpCode });
            const otpResponse = await otpService.verifyContractOtp(currentOtpId, otpCode);
            console.log('🔐 OTP Response:', otpResponse);
            
            // Backend returns { success: true/false, message: "..." }
            if (!otpResponse?.success) {
                toast.error(otpResponse?.message || 'Mã OTP không chính xác hoặc đã hết hạn');
                setSigning(false);
                return;
            }
            console.log('✅ OTP verified!');

            // Step 2: Upload signature image
            console.log('📤 Uploading signature...');
            const signatureUrl = await imageService.uploadSignatureFromDataUrl(signature);
            console.log('✅ Signature uploaded:', signatureUrl);

            // Step 3: Sign contract
            console.log('✍️ Signing contract...');
            await contractService.signContract(contractId, signatureUrl);
            console.log('✅ Contract signed!');

            toast.success('🎉 Ký hợp đồng thành công!');

            // Navigate back
            setTimeout(() => {
                router.push('/profile/contracts');
            }, 1500);
        } catch (error) {
            console.error('Error signing contract:', error);
            if (error.response?.status === 400) {
                toast.error('Mã OTP không chính xác hoặc đã hết hạn');
            } else {
                toast.error(error.message || 'Có lỗi xảy ra khi ký hợp đồng');
            }
        } finally {
            setSigning(false);
        }
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

    if (loading) {
        return (
            <RoleBasedRedirect allowedRoles={['User']}>
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

    if (error) {
        return (
            <RoleBasedRedirect allowedRoles={['User']}>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <Navbar />
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                            <AlertCircle className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {error}
                            </h3>
                            <button
                                onClick={() => router.push('/profile/contracts')}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Quay lại danh sách
                            </button>
                        </div>
                    </div>
                    <Footer />
                </div>
            </RoleBasedRedirect>
        );
    }

    return (
        <RoleBasedRedirect allowedRoles={['User']}>
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

                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 mb-6 text-white">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                <PenLine className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Ký hợp đồng</h1>
                                <p className="text-white/80">Xác nhận và ký tên để hoàn tất hợp đồng</p>
                            </div>
                        </div>
                    </div>

                    {/* Step Indicator */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-center space-x-4">
                            <div className={`flex items-center ${signatureStep >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${signatureStep >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
                                    <PenLine className="h-5 w-5" />
                                </div>
                                <span className="ml-2 font-medium hidden sm:block">Tạo chữ ký</span>
                            </div>
                            
                            <div className="w-16 h-1 bg-gray-200 rounded">
                                <div className={`h-full rounded transition-all ${signatureStep >= 2 ? 'bg-orange-600 w-full' : 'w-0'}`}></div>
                            </div>
                            
                            <div className={`flex items-center ${signatureStep >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${signatureStep >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
                                    <KeyRound className="h-5 w-5" />
                                </div>
                                <span className="ml-2 font-medium hidden sm:block">Xác nhận OTP</span>
                            </div>
                        </div>
                    </div>

                    {/* Contract Summary */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Thông tin hợp đồng
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <Building2 className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Phòng</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {contract?.roomName || contract?.RoomName || `Phòng #${contract?.roomId?.slice(0, 8) || 'N/A'}`}
                                        {(contract?.houseName || contract?.HouseName) && ` - ${contract?.houseName || contract?.HouseName}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <Banknote className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Giá thuê</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(contract?.roomPrice)}/tháng
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Thời hạn</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formatDate(contract?.checkinDate || contract?.CheckinDate || contract?.startDate)} - {formatDate(contract?.checkoutDate || contract?.CheckoutDate || contract?.endDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <Banknote className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tiền cọc</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(contract?.depositAmount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 1: Signature Section */}
                    {signatureStep === 1 && (
                        <>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <PenLine className="h-5 w-5 text-orange-600" />
                                    Bước 1: Tạo chữ ký của bạn
                                </h2>

                                {/* Chỉ có vẽ chữ ký */}

                        {/* Vẽ chữ ký */}
                            <div>
                                <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-white overflow-hidden">
                                    <canvas
                                        ref={canvasRef}
                                        width={600}
                                        height={200}
                                        className="w-full h-48 cursor-crosshair touch-none"
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                    />
                                    {!hasDrawn && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <p className="text-gray-400">Vẽ chữ ký của bạn tại đây</p>
                                        </div>
                                    )}
                                    {hasDrawn && (
                                        <button
                                            onClick={clearCanvas}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    ✍️ Sử dụng chuột hoặc ngón tay để vẽ chữ ký
                                </p>
                            </div>
                            </div>

                            {/* Email xác nhận - dùng email user có sẵn */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                    Email xác nhận
                                </h2>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-900 dark:text-white font-medium">{signatureEmail || user?.email || 'Chưa có email'}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Mã OTP sẽ được gửi đến email này để xác nhận ký hợp đồng
                                </p>
                            </div>

                            {/* Agreement */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>Lưu ý:</strong> Bằng việc ký hợp đồng này, bạn xác nhận đã đọc và đồng ý với 
                                    tất cả các điều khoản trong hợp đồng thuê phòng. Chữ ký điện tử có giá trị pháp lý 
                                    tương đương chữ ký tay.
                                </p>
                            </div>

                            {/* Actions Step 1 */}
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => router.back()}
                                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleSendOtp}
                                    disabled={!getCurrentSignature() || isSendingOtp}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                                >
                                    {isSendingOtp ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Đang gửi OTP...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="h-5 w-5" />
                                            Gửi mã xác nhận
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Step 2: OTP Verification */}
                    {signatureStep === 2 && (
                        <>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <KeyRound className="h-5 w-5 text-orange-600" />
                                    Bước 2: Xác nhận mã OTP
                                </h2>

                                {/* OTP sent notification */}
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                                    <p className="text-green-700 dark:text-green-300">
                                        ✅ Mã OTP đã được gửi đến email <strong>{signatureEmail}</strong>
                                    </p>
                                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                        Vui lòng kiểm tra hộp thư (bao gồm thư mục spam) và nhập mã xác nhận.
                                    </p>
                                </div>

                                {/* Signature preview */}
                                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Chữ ký của bạn:</p>
                                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 flex justify-center">
                                        <img
                                            src={getCurrentSignature()}
                                            alt="Your signature"
                                            className="max-h-20 object-contain"
                                        />
                                    </div>
                                </div>

                                {/* OTP Input */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nhập mã OTP (6 số)
                                    </label>
                                    <input
                                        type="text"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="Nhập mã 6 số"
                                        maxLength={6}
                                        className="w-full px-4 py-4 text-center text-2xl tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>

                                {/* Resend OTP */}
                                <div className="text-center mb-6">
                                    {otpTimer > 0 ? (
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Gửi lại mã sau <span className="font-medium text-orange-600">{Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}</span>
                                        </p>
                                    ) : (
                                        <button
                                            onClick={handleResendOtp}
                                            disabled={isSendingOtp}
                                            className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium mx-auto"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            {isSendingOtp ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    <strong>⚠️ Lưu ý:</strong> Mã OTP có hiệu lực trong 2 phút. Sau khi xác nhận, bạn sẽ không thể hủy hoặc thay đổi hợp đồng.
                                </p>
                            </div>

                            {/* Actions Step 2 */}
                            <div className="flex justify-between">
                                <button
                                    onClick={handleBackToSignature}
                                    disabled={signing}
                                    className="flex items-center gap-2 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                    Quay lại
                                </button>
                                
                                <button
                                    onClick={handleSignContract}
                                    disabled={signing || otpCode.length < 6}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                                >
                                    {signing ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Đang ký hợp đồng...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-5 w-5" />
                                            Xác nhận ký hợp đồng
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <Footer />
            </div>
        </RoleBasedRedirect>
    );
}
