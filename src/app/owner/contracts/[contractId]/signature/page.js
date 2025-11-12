"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import otpService from "@/services/otpService";
import contractService from "@/services/contractService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";

export default function ContractSignaturePage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const contractId = params.contractId;
    const email = searchParams.get('email');
    const boardingHouseId = searchParams.get('boardingHouseId');
    const otpId = searchParams.get('otpId'); // Get otpId from URL

    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpTimer, setOtpTimer] = useState(300); // 5 minutes
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);

    // Load contract data
    useEffect(() => {
        const loadContract = async () => {
            try {
                const data = await contractService.getById(contractId);
                setContract(data);

                // Pre-fill data from sessionStorage
                const pendingSignature = sessionStorage.getItem('pendingSignature');
                if (pendingSignature) {
                    const sigData = JSON.parse(pendingSignature);
                    setFullName(sigData.signatureName || '');
                }

                // Get phone from contract
                const phone = data?.identityProfiles?.[0]?.phoneNumber ||
                    data?.identityProfiles?.[0]?.PhoneNumber || '';
                setPhoneNumber(phone);

            } catch (error) {
                console.error('Error loading contract:', error);
                toast.error('Không thể tải thông tin hợp đồng');
            } finally {
                setLoading(false);
            }
        };

        if (contractId) {
            loadContract();
        }
    }, [contractId]);

    // OTP Timer countdown
    useEffect(() => {
        if (otpTimer > 0) {
            const interval = setInterval(() => {
                setOtpTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [otpTimer]);

    const handleResendOtp = async () => {
        try {
            setResending(true);

            console.log('📧 Resending OTP to:', email);
            console.log('📝 Contract ID:', contractId);

            // Backend will generate new OTP and send email
            const otpResult = await otpService.sendContractOtp(contractId, email);
            console.log('✅ New OTP sent, result:', otpResult);
            
            // Get new otpId
            const newOtpId = otpResult?.otpId || otpResult?.id || otpResult?.Id || otpResult?.data?.id;
            
            if (newOtpId) {
                // Update URL with new otpId
                router.push(`/owner/contracts/${contractId}/signature?email=${encodeURIComponent(email)}&boardingHouseId=${boardingHouseId}&otpId=${newOtpId}`, undefined, { shallow: true });
                
                // Update sessionStorage
                const pendingSignature = sessionStorage.getItem('pendingSignature');
                if (pendingSignature) {
                    const sigData = JSON.parse(pendingSignature);
                    sigData.otpId = newOtpId;
                    sessionStorage.setItem('pendingSignature', JSON.stringify(sigData));
                }
            }

            setOtpTimer(300); // Reset to 5 minutes
            setOtpCode(''); // Clear current input
            toast.success('Mã OTP mới đã được gửi');
        } catch (error) {
            console.error('Error resending OTP:', error);
            toast.error('Lỗi khi gửi lại mã OTP');
        } finally {
            setResending(false);
        }
    };

    const handleConfirm = async () => {
        if (!otpCode || otpCode.length !== 6) {
            toast.error('Vui lòng nhập mã OTP 6 chữ số');
            return;
        }

        if (!otpId) {
            toast.error('Không tìm thấy phiên OTP. Vui lòng thử lại.');
            return;
        }

        try {
            setVerifying(true);

            console.log('🔐 Verifying OTP...');
            console.log('🔑 OTP ID:', otpId);
            console.log('🔢 OTP Code:', otpCode);

            // Step 1: Verify OTP with backend
            const result = await otpService.verifyContractOtp(otpId, otpCode);
            console.log('✅ OTP verified:', result);
            
            toast.success('OTP đã xác thực! Đang upload chữ ký...');

            // Step 2: Get signature data and upload
            const pendingSignature = sessionStorage.getItem('pendingSignature');
            if (!pendingSignature) {
                toast.error('Không tìm thấy dữ liệu chữ ký. Vui lòng thử lại.');
                setVerifying(false);
                return;
            }

            const sigData = JSON.parse(pendingSignature);
            console.log('📝 Signature data:', sigData);

            // Step 3: Upload signature image to get URL
            let signatureUrl;
            
            if (sigData.signatureTab === 'draw' || sigData.signatureTab === 'file') {
                // Upload from data URL (canvas or uploaded file)
                const imageService = (await import('@/services/imageService')).default;
                signatureUrl = await imageService.uploadSignatureFromDataUrl(sigData.signaturePreview);
                console.log('🖼️ Signature uploaded to:', signatureUrl);
            } else if (sigData.signatureTab === 'manual') {
                // For manual signature, you might want to render text as image first
                // For now, we'll upload the preview data
                const imageService = (await import('@/services/imageService')).default;
                signatureUrl = await imageService.uploadSignatureFromDataUrl(sigData.signaturePreview);
                console.log('🖼️ Manual signature uploaded to:', signatureUrl);
            }

            if (!signatureUrl) {
                toast.error('Lỗi khi upload chữ ký. Vui lòng thử lại.');
                setVerifying(false);
                return;
            }

            toast.success('Chữ ký đã upload! Đang ký hợp đồng...');

            // Step 4: Sign contract with signature URL
            await contractService.signContract(contractId, signatureUrl);
            console.log('✅ Contract signed successfully');

            // Step 5: Generate and upload signed PDF with embedded signature
            toast.info('Đang tạo file PDF hợp đồng...');
            const contractPdfService = (await import('@/services/contractPdfService')).default;
            
            try {
                // Generate PDF with tenant signature embedded
                const pdfResult = await contractPdfService.signContractWithPdf(
                    contract, 
                    sigData.signaturePreview, // tenant signature
                    null // owner signature (if you have it, pass it here)
                );
                console.log('✅ Signed PDF generated and uploaded:', pdfResult.pdfUrl);
                toast.success('File PDF hợp đồng đã được tạo thành công!');
            } catch (pdfError) {
                console.error('⚠️ Error generating PDF, but contract is already signed:', pdfError);
                // Don't fail the whole process if PDF generation fails
                // The contract signature is already saved
                toast.warning('Hợp đồng đã ký nhưng không thể tạo PDF. Vui lòng liên hệ hỗ trợ.');
            }

            // Step 6: Clean up
            sessionStorage.removeItem('pendingSignature');
            
            toast.success('Hợp đồng đã được ký thành công! 🎉');

            // Navigate back to contracts page
            setTimeout(() => {
                if (boardingHouseId) {
                    router.push(`/owner/boarding-houses/${boardingHouseId}/contracts`);
                } else {
                    router.push('/owner/contracts');
                }
            }, 1500);

        } catch (error) {
            console.error('Error in signature process:', error);
            console.error('Error details:', error.response?.data);
            
            if (error.response?.status === 400) {
                toast.error('Mã OTP không đúng hoặc đã hết hạn');
            } else if (error.response?.status === 404) {
                toast.error('Không tìm thấy phiên OTP. Vui lòng thử lại.');
            } else {
                toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
            }
        } finally {
            setVerifying(false);
        }
    };

    const handleCancel = () => {
        if (boardingHouseId) {
            router.push(`/owner/boarding-houses/${boardingHouseId}/contracts`);
        } else {
            router.push('/owner/contracts');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    const maskedPhone = phoneNumber ? `******${phoneNumber.slice(-4)}` : '****';
    const minutes = Math.floor(otpTimer / 60);
    const seconds = otpTimer % 60;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Signature Setting
                        </h1>
                        <button
                            onClick={handleCancel}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Signature Method */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Signature Method <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center space-x-3 p-4 border-2 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <input
                                type="radio"
                                checked
                                readOnly
                                className="w-5 h-5 text-blue-600"
                            />
                            <label className="text-base font-medium text-gray-900 dark:text-white">
                                Ký ảnh xác thực SMS OTP eContract
                            </label>
                        </div>
                    </div>

                    {/* Full Name and Phone Number */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                value={maskedPhone}
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Verification Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            Verification code sent to phone number <strong>{maskedPhone}</strong>
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Please enter the OTP to complete the contract signing
                        </p>
                    </div>

                    {/* OTP Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            OTP
                        </label>
                        <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg tracking-widest text-center"
                            placeholder="471278"
                            autoFocus
                        />
                    </div>

                    {/* Timer and Resend */}
                    <div className="flex justify-between items-center text-sm mb-8">
                        <span className="text-gray-600 dark:text-gray-400">
                            OTP is valid for{' '}
                            <strong className="text-red-600 dark:text-red-400">
                                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                            </strong>
                        </span>
                        <button
                            onClick={handleResendOtp}
                            disabled={otpTimer > 240 || resending}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            {resending ? 'Sending...' : 'Resend OTP'}
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={handleCancel}
                            disabled={verifying}
                            className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={verifying || otpCode.length !== 6}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-sm"
                        >
                            {verifying ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : (
                                'Confirm'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
