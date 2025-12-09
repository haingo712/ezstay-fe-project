'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import contractService from '@/services/contractService';
import reviewService from '@/services/reviewService';
import otpService from '@/services/otpService';
import { toast } from 'react-toastify';
import {
  Building2,
  Calendar,
  Star,
  MapPin,
  Phone,
  User,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Banknote,
  FileText,
  Eye,
  PenLine,
  Pen
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RoleBasedRedirect from '@/components/RoleBasedRedirect';

// ============ MOCK DATA FOR DEMO - DELETE AFTER SCREENSHOT ============
const MOCK_RENTAL_HISTORY = [
  {
    id: '1',
    roomName: 'Phòng A101 - Studio Premium',
    houseName: 'Nhà trọ Sunshine Residence',
    ownerName: 'Nguyễn Văn An',
    ownerPhone: '0901234567',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    checkinDate: '2025-06-01T00:00:00Z',
    checkoutDate: '2025-11-30T00:00:00Z',
    roomPrice: 5500000,
    depositAmount: 11000000,
    contractStatus: 3, // Expired - có thể review
    numberOfOccupants: 1
  },
  {
    id: '2',
    roomName: 'Phòng B205 - Deluxe Room',
    houseName: 'Green House Apartment',
    ownerName: 'Trần Thị Bình',
    ownerPhone: '0912345678',
    address: '456 Nguyễn Văn Linh, Quận 7, TP.HCM',
    checkinDate: '2025-01-15T00:00:00Z',
    checkoutDate: '2025-06-15T00:00:00Z',
    roomPrice: 4200000,
    depositAmount: 8400000,
    contractStatus: 3, // Expired
    numberOfOccupants: 2
  },
  {
    id: '3',
    roomName: 'Phòng C301 - Standard',
    houseName: 'Ký túc xá Thanh Xuân',
    ownerName: 'Lê Minh Cường',
    ownerPhone: '0923456789',
    address: '789 Võ Văn Ngân, Thủ Đức, TP.HCM',
    checkinDate: '2025-11-01T00:00:00Z',
    checkoutDate: '2026-04-30T00:00:00Z',
    roomPrice: 2800000,
    depositAmount: 5600000,
    contractStatus: 1, // Active
    numberOfOccupants: 1
  },
  {
    id: '4',
    roomName: 'Studio S401 - Luxury',
    houseName: 'The Vista Residence',
    ownerName: 'Phạm Hoàng Dũng',
    ownerPhone: '0934567890',
    address: '101 Điện Biên Phủ, Bình Thạnh, TP.HCM',
    checkinDate: '2024-12-01T00:00:00Z',
    checkoutDate: '2025-05-31T00:00:00Z',
    roomPrice: 7000000,
    depositAmount: 14000000,
    contractStatus: 3, // Expired
    numberOfOccupants: 1
  }
];
// ============ END MOCK DATA ============

export default function RentalHistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    content: '',
    imageFile: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Signature states
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureStep, setSignatureStep] = useState(1); // 1: Draw, 2: OTP
  const [signatureTab, setSignatureTab] = useState('draw'); // draw, manual, file
  const [signatureName, setSignatureName] = useState('');
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [signatureEmail, setSignatureEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [currentOtpId, setCurrentOtpId] = useState(null);
  const [otpTimer, setOtpTimer] = useState(300);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (user) {
      loadContracts();
    }
  }, [user]);

  // Initialize canvas when signature modal opens with draw tab
  useEffect(() => {
    if (showSignatureModal && signatureTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    }
  }, [showSignatureModal, signatureTab]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      // Sử dụng endpoint getByTenantId với user.id
      const response = await contractService.getByTenantId(user.id);
      console.log('Contracts response:', response);

      // Kiểm tra response là array hay object với value
      const contractsData = Array.isArray(response) ? response : (response.value || []);
      
      // ============ USE MOCK DATA IF NO REAL DATA ============
      const contractsToUse = contractsData.length > 0 ? contractsData : MOCK_RENTAL_HISTORY;
      setContracts(contractsToUse);
      // ============ END MOCK DATA USAGE ============
    } catch (error) {
      console.error('Error loading contracts:', error);
      // ============ USE MOCK DATA ON ERROR ============
      setContracts(MOCK_RENTAL_HISTORY);
      // ============ END MOCK DATA ON ERROR ============
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewModal = (contract) => {
    setSelectedContract(contract);
    setShowReviewModal(true);
    setReviewForm({ rating: 5, content: '' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReviewForm({ ...reviewForm, imageFile: file });

      // Create temporary preview using base64 Data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedContract(null);
    setReviewForm({ rating: 5, content: '', imageFile: null });
    setImagePreview(null);
  };

  const handleSubmitReview = async () => {
    if (!selectedContract) return;

    if (!reviewForm.content.trim()) {
      toast.warning(t('rentalHistory.writeReviewPlaceholder'));
      return;
    }

    // Image is now optional
    // if (!reviewForm.imageFile) {
    //   alert('Please upload an image for your review!');
    //   return;
    // }

    try {
      setSubmitting(true);

      // Create FormData for file upload to backend
      // Backend will upload the file to Filebase IPFS and return IPFS URL
      const formData = new FormData();
      formData.append('Rating', reviewForm.rating);
      formData.append('Content', reviewForm.content);

      // Only append image if user uploaded one (optional)
      if (reviewForm.imageFile) {
        formData.append('ImageUrl', reviewForm.imageFile);
      }

      console.log('📤 Submitting review with image:', {
        rating: reviewForm.rating,
        contentLength: reviewForm.content.length,
        imageFileName: reviewForm.imageFile.name
      });

      // Backend returns created review with id
      const createdReview = await reviewService.createReview(selectedContract.id, formData);
      console.log('✅ Created review:', createdReview);

      toast.success('Review submitted successfully! ✅');
      handleCloseReviewModal();

      // Navigate to the created review detail page
      if (createdReview && createdReview.id) {
        console.log('🔀 Navigating to review:', createdReview.id);
        router.push(`/reviews/${createdReview.id}`);
      } else {
        // Fallback: reload contracts if no reviewId returned
        loadContracts();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
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
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4" />
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

  const canReview = (contract) => {
    // User có thể review nếu hợp đồng đã kết thúc (Expired=3) và trong vòng 30 ngày
    // Hoặc hợp đồng Active (1) cũng có thể review
    const checkoutDate = new Date(contract.checkoutDate);
    const now = new Date();
    const daysSinceCheckout = (now - checkoutDate) / (1000 * 60 * 60 * 24);

    // Có thể review nếu: Active (1) hoặc Expired (3) trong vòng 30 ngày
    return contract.contractStatus === 1 || (contract.contractStatus === 3 && daysSinceCheckout <= 30);
  };

  const handleOpenCancelModal = (contract) => {
    setSelectedContract(contract);
    setShowCancelModal(true);
    setCancelReason('');
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setSelectedContract(null);
    setCancelReason('');
  };

  const handleCancelContract = async () => {
    if (!selectedContract) return;

    if (!cancelReason.trim()) {
      toast.warning('Vui lòng nhập lý do hủy hợp đồng!');
      return;
    }

    try {
      setCancelling(true);
      await contractService.terminate(selectedContract.id, cancelReason);
      toast.success('Hủy hợp đồng thành công!');
      handleCloseCancelModal();
      loadContracts();
    } catch (error) {
      console.error('Error cancelling contract:', error);
      toast.error(error.response?.data?.message || 'Không thể hủy hợp đồng. Vui lòng thử lại.');
    } finally {
      setCancelling(false);
    }
  };

  // Signature functions
  const handleOpenSignatureModal = (contract) => {
    setSelectedContract(contract);
    setShowSignatureModal(true);
    setSignatureStep(1);
    setSignatureTab('draw');
    setSignatureName('');
    setSignaturePreview(null);
    setSignatureEmail(user?.email || '');
    setOtpCode('');
    setCurrentOtpId(null);
    setOtpTimer(300);
  };

  const handleCloseSignatureModal = () => {
    setShowSignatureModal(false);
    setSelectedContract(null);
    setSignatureStep(1);
    setSignatureName('');
    setSignaturePreview(null);
    setOtpCode('');
    setCurrentOtpId(null);
  };

  // Canvas drawing functions
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    }
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    updateSignaturePreview();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setSignaturePreview(null);
    }
  };

  const updateSignaturePreview = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSignaturePreview(dataUrl);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateManualSignature = () => {
    if (!signatureName.trim()) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'italic 40px "Brush Script MT", cursive';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(signatureName, canvas.width / 2, canvas.height / 2);
    setSignaturePreview(canvas.toDataURL('image/png'));
  };

  const handleSendOtp = async () => {
    if (!signaturePreview) {
      toast.warning('Vui lòng tạo chữ ký trước!');
      return;
    }
    if (!signatureEmail) {
      toast.warning('Vui lòng nhập email!');
      return;
    }

    try {
      setSendingOtp(true);
      const contractId = selectedContract?.id;
      console.log('📧 Sending OTP to:', signatureEmail);

      const result = await otpService.sendContractOtp(contractId, signatureEmail);
      console.log('✅ OTP sent:', result);

      const otpId = result?.otpId || result?.id || result?.data?.id;
      setCurrentOtpId(otpId);
      setSignatureStep(2);
      setOtpTimer(300);
      toast.success('Mã OTP đã được gửi đến email của bạn!');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleConfirmSignature = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.warning('Vui lòng nhập mã OTP 6 chữ số!');
      return;
    }
    if (!currentOtpId) {
      toast.warning('Không tìm thấy phiên OTP. Vui lòng thử lại.');
      return;
    }

    try {
      setVerifyingOtp(true);
      const contractId = selectedContract?.id;

      // Step 1: Verify OTP
      console.log('🔐 Verifying OTP...');
      const verifyResult = await otpService.verifyContractOtp(currentOtpId, otpCode);
      console.log('✅ OTP verified:', verifyResult);

      // Step 2: Sign contract
      console.log('✍️ Signing contract...');
      await contractService.signContract(contractId, signaturePreview);
      console.log('✅ Contract signed!');

      toast.success('Ký hợp đồng thành công! 🎉');
      handleCloseSignatureModal();
      loadContracts();
    } catch (error) {
      console.error('Error signing contract:', error);
      if (error.response?.status === 400) {
        toast.error('Mã OTP không đúng hoặc đã hết hạn!');
      } else {
        toast.error(error.response?.data?.message || 'Không thể ký hợp đồng. Vui lòng thử lại.');
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  // OTP Timer
  useEffect(() => {
    let interval;
    if (showSignatureModal && signatureStep === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showSignatureModal, signatureStep, otpTimer]);

  // Check if user needs to sign (Pending status and no tenant signature)
  const needsToSign = (contract) => {
    return contract.contractStatus === 0 && !contract.tenantSignature;
  };

  return (
    <RoleBasedRedirect allowedRoles={['User']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Lịch sử thuê trọ
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Xem tất cả hợp đồng thuê trọ của bạn
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải lịch sử thuê trọ...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && contracts.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Chưa có lịch sử thuê trọ
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Bạn chưa thuê phòng trọ nào
              </p>
            </div>
          )}

          {/* Contracts List */}
          {!loading && contracts.length > 0 && (
            <div className="space-y-6">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Contract Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-white">
                          <h3 className="text-lg font-semibold">
                            {contract.roomName || 'Phòng trọ'}
                          </h3>
                          <p className="text-sm text-white/80">
                            {contract.houseName || 'Nhà trọ'}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(contract.contractStatus)}
                    </div>
                  </div>

                  {/* Contract Body */}
                  <div className="p-6">
                    {/* Price & Deposit Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Giá thuê</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(contract.roomPrice)}
                        </p>
                        <p className="text-xs text-gray-400">/tháng</p>
                      </div>
                      <div className="text-center border-x border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tiền cọc</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(contract.depositAmount)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Số người ở</p>
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {contract.numberOfOccupants || 1} người
                        </p>
                      </div>
                    </div>

                    {/* Contract Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-600" />
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Ngày nhận phòng</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(contract.checkinDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <Calendar className="h-5 w-5 text-red-600" />
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Ngày trả phòng</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(contract.checkoutDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Services */}
                    {contract.serviceInfors && contract.serviceInfors.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dịch vụ:</p>
                        <div className="flex flex-wrap gap-2">
                          {contract.serviceInfors.map((service, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                            >
                              {service.serviceName}: {formatCurrency(service.price)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {contract.notes && (
                      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Ghi chú:</span> {contract.notes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => router.push(`/profile/contracts/${contract.id}`)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        Xem chi tiết
                      </button>

                      {/* Pending = 0 và chưa ký: hiện nút ký hợp đồng */}
                      {contract.contractStatus === 0 && !contract.tenantSignature && (
                        <button
                          onClick={() => handleOpenSignatureModal(contract)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          <Pen className="h-4 w-4" />
                          Ký hợp đồng
                        </button>
                      )}

                      {/* Pending = 0 đã ký hoặc Active = 1: có thể viết đánh giá */}
                      {(contract.contractStatus === 0 || contract.contractStatus === 1) && (
                        <button
                          onClick={() => handleOpenReviewModal(contract)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <PenLine className="h-4 w-4" />
                          Viết đánh giá
                        </button>
                      )}

                      {/* Active = 1: có thể hủy hợp đồng */}
                      {contract.contractStatus === 1 && (
                        <button
                          onClick={() => handleOpenCancelModal(contract)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Hủy hợp đồng
                        </button>
                      )}

                      {/* Active (1) hoặc Expired (3) trong 30 ngày: có thể đánh giá */}
                      {canReview(contract) && (
                        <button
                          onClick={() => handleOpenReviewModal(contract)}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                        >
                          <Star className="h-4 w-4" />
                          Đánh giá
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Viết đánh giá
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedContract?.roomName} - {selectedContract?.houseName}
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Đánh giá
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${star <= reviewForm.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nội dung đánh giá <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reviewForm.content}
                    onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                    placeholder="Chia sẻ trải nghiệm thuê trọ của bạn..."
                    rows={6}
                    maxLength={1000}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {reviewForm.content.length}/1000 ký tự
                  </p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tải ảnh lên (tùy chọn)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-3 relative h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-blue-500">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Review Preview"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Xem trước
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
                <button
                  onClick={handleCloseReviewModal}
                  disabled={submitting}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || !reviewForm.content.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      Gửi đánh giá
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Contract Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <XCircle className="h-6 w-6 text-red-500" />
                  Hủy hợp đồng
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedContract?.roomName} - {selectedContract?.houseName}
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    ⚠️ Lưu ý: Việc hủy hợp đồng có thể ảnh hưởng đến tiền cọc và các điều khoản khác.
                  </p>
                </div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lý do hủy hợp đồng <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do bạn muốn hủy hợp đồng..."
                  rows={4}
                  maxLength={500}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {cancelReason.length}/500 ký tự
                </p>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
                <button
                  onClick={handleCloseCancelModal}
                  disabled={cancelling}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Đóng
                </button>
                <button
                  onClick={handleCancelContract}
                  disabled={cancelling || !cancelReason.trim()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {cancelling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      Xác nhận hủy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Signature Modal */}
        {showSignatureModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Pen className="h-5 w-5 text-green-600" />
                      Ký hợp đồng
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedContract?.roomName} - {selectedContract?.houseName}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseSignatureModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mt-4 gap-4">
                  <div className={`flex items-center gap-2 ${signatureStep >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${signatureStep >= 1 ? 'bg-green-600' : 'bg-gray-300'}`}>1</div>
                    <span className="text-sm font-medium">Tạo chữ ký</span>
                  </div>
                  <div className="w-12 h-0.5 bg-gray-300"></div>
                  <div className={`flex items-center gap-2 ${signatureStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${signatureStep >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}>2</div>
                    <span className="text-sm font-medium">Xác thực OTP</span>
                  </div>
                </div>
              </div>

              {/* Step 1: Create Signature */}
              {signatureStep === 1 && (
                <div className="p-6">
                  {/* Signature Tabs */}
                  <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    <button
                      onClick={() => setSignatureTab('draw')}
                      className={`px-4 py-2 text-sm font-medium ${signatureTab === 'draw' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
                    >
                      Vẽ chữ ký
                    </button>
                    <button
                      onClick={() => setSignatureTab('manual')}
                      className={`px-4 py-2 text-sm font-medium ${signatureTab === 'manual' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
                    >
                      Nhập tên
                    </button>
                    <button
                      onClick={() => setSignatureTab('file')}
                      className={`px-4 py-2 text-sm font-medium ${signatureTab === 'file' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
                    >
                      Tải ảnh lên
                    </button>
                  </div>

                  {/* Draw Tab */}
                  {signatureTab === 'draw' && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Vẽ chữ ký của bạn vào khung bên dưới:</p>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2">
                        <canvas
                          ref={canvasRef}
                          width={500}
                          height={200}
                          className="w-full bg-white rounded cursor-crosshair touch-none"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                      </div>
                      <button
                        onClick={clearCanvas}
                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                      >
                        Xóa và vẽ lại
                      </button>
                    </div>
                  )}

                  {/* Manual Tab */}
                  {signatureTab === 'manual' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nhập họ tên để tạo chữ ký
                      </label>
                      <input
                        type="text"
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        onClick={generateManualSignature}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Tạo chữ ký
                      </button>
                    </div>
                  )}

                  {/* File Tab */}
                  {signatureTab === 'file' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tải lên ảnh chữ ký
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      />
                    </div>
                  )}

                  {/* Signature Preview */}
                  {signaturePreview && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Xem trước chữ ký:</p>
                      <div className="bg-white rounded-lg p-4 border">
                        <img src={signaturePreview} alt="Signature Preview" className="max-h-24 mx-auto" />
                      </div>
                    </div>
                  )}

                  {/* Email Input */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email xác thực <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={signatureEmail}
                      onChange={(e) => setSignatureEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={handleCloseSignatureModal}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSendOtp}
                      disabled={!signaturePreview || !signatureEmail || sendingOtp}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sendingOtp ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Đang gửi...
                        </>
                      ) : (
                        'Tiếp tục'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: OTP Verification */}
              {signatureStep === 2 && (
                <div className="p-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Mã OTP đã được gửi đến email <strong>{signatureEmail}</strong>
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Vui lòng nhập mã OTP để hoàn tất ký hợp đồng
                    </p>
                  </div>

                  {/* OTP Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mã OTP
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      placeholder="123456"
                      className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      autoFocus
                    />
                  </div>

                  {/* Timer */}
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
                    OTP có hiệu lực trong{' '}
                    <span className="font-bold text-red-600">
                      {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <button
                      onClick={() => setSignatureStep(1)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800"
                    >
                      ← Quay lại
                    </button>
                    <button
                      onClick={handleConfirmSignature}
                      disabled={verifyingOtp || otpCode.length !== 6}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {verifyingOtp ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Đang xác thực...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Xác nhận ký
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <Footer />
      </div>
    </RoleBasedRedirect>
  );
}
