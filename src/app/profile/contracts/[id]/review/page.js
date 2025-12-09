'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import contractService from '@/services/contractService';
import reviewService from '@/services/reviewService';
import { ArrowLeft, Star, Image as ImageIcon, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RoleBasedRedirect from '@/components/RoleBasedRedirect';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export default function AddReviewPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const { t } = useTranslation();
    const contractId = params.id;

    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        content: '',
        imageFile: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (contractId) {
            loadContractAndCheckReview();
        }
    }, [contractId]);

    const loadContractAndCheckReview = async () => {
        try {
            setLoading(true);

            // Load contract details
            const contractResponse = await contractService.getById(contractId);
            const contractData = contractResponse.data || contractResponse;
            setContract(contractData);

            // Check if contract is Active (status 1 or "Active")
            if (contractData.contractStatus !== 1 && contractData.contractStatus !== 'Active') {
                toast.error('Chỉ có thể đánh giá hợp đồng đang hoạt động');
                router.push('/profile/contracts');
                return;
            }

            // Check if review already exists using backend endpoint
            const exists = await reviewService.checkReviewExists(contractId);
            if (exists) {
                toast.info('Bạn đã đánh giá hợp đồng này rồi');
                router.push('/profile/contracts');
                return;
            }
        } catch (error) {
            console.error('Error loading contract:', error);
            toast.error('Không thể tải thông tin hợp đồng');
            router.push('/profile/contracts');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (reviewForm.rating < 1 || reviewForm.rating > 5) {
            newErrors.rating = 'Đánh giá phải từ 1 đến 5 sao';
        }

        if (!reviewForm.content.trim()) {
            newErrors.content = 'Nội dung đánh giá là bắt buộc';
        } else if (reviewForm.content.length > 1000) {
            newErrors.content = 'Nội dung không được vượt quá 1000 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Kích thước ảnh không được vượt quá 5MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Chỉ chấp nhận file ảnh');
                return;
            }

            setReviewForm({ ...reviewForm, imageFile: file });

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setReviewForm({ ...reviewForm, imageFile: null });
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);

            // Create FormData matching backend CreateReviewRequest
            // Backend expects: Rating (int), Content (string), ImageUrl (IFormFileCollection - Required)
            const formData = new FormData();
            formData.append('Rating', reviewForm.rating);
            formData.append('Content', reviewForm.content);

            // Backend requires ImageUrl (IFormFileCollection with [Required] attribute)
            // If no image, we must provide at least one file to pass validation
            if (reviewForm.imageFile) {
                formData.append('ImageUrl', reviewForm.imageFile);
            } else {
                // Create a minimal transparent 1x1 PNG as placeholder
                // This is a base64 encoded 1x1 transparent PNG (67 bytes)
                const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'image/png' });
                const placeholderImage = new File([blob], 'placeholder.png', { type: 'image/png' });
                formData.append('ImageUrl', placeholderImage);
            }

            console.log('📤 Submitting review for contract:', contractId);
            console.log('📤 FormData:', {
                rating: reviewForm.rating,
                content: reviewForm.content,
                hasImage: !!reviewForm.imageFile
            });

            // Call backend API: POST /api/Review/{contractId}
            const response = await reviewService.createReview(contractId, formData);

            console.log('✅ Review created:', response);
            toast.success('Đánh giá của bạn đã được gửi thành công!');

            // Redirect back to contracts list
            router.push('/profile/contracts');
        } catch (error) {
            console.error('❌ Error creating review:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.title ||
                error.message ||
                'Không thể gửi đánh giá. Vui lòng thử lại.';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="focus:outline-none transform transition-transform hover:scale-110"
                    >
                        <Star
                            className={`h-8 w-8 ${star <= rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <RoleBasedRedirect allowedRoles={['User']} />
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <RoleBasedRedirect allowedRoles={['User']} />
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400">Không tìm thấy hợp đồng</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <RoleBasedRedirect allowedRoles={['User']} />
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Quay lại
                </button>

                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Đánh giá hợp đồng
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Chia sẻ trải nghiệm của bạn về hợp đồng này
                    </p>
                </div>

                {/* Contract Info Card */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                        Thông tin hợp đồng
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
                        <div>
                            <span className="font-medium">Phòng:</span> {contract.roomName || 'N/A'}
                        </div>
                        <div>
                            <span className="font-medium">Mã HĐ:</span> {contractId.slice(0, 8)}...
                        </div>
                    </div>
                </div>

                {/* Review Form */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Đánh giá <span className="text-red-500">*</span>
                        </label>
                        {renderStars(reviewForm.rating)}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {reviewForm.rating} {reviewForm.rating === 1 ? 'sao' : 'sao'}
                        </p>
                        {errors.rating && (
                            <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
                        )}
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nội dung đánh giá <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reviewForm.content}
                            onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                            placeholder="Chia sẻ trải nghiệm của bạn về hợp đồng này..."
                            rows={8}
                            maxLength={1000}
                            required
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none ${errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {reviewForm.content.length}/1000 ký tự
                            </p>
                            {errors.content && (
                                <p className="text-red-500 text-sm">{errors.content}</p>
                            )}
                        </div>
                    </div>

                    {/* Image Upload (Optional but backend requires it) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Hình ảnh (Tùy chọn)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Tối đa 5MB. Hỗ trợ: JPG, PNG, GIF
                        </p>

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="mt-3 relative h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-blue-500">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <span className="text-xs font-bold">✕</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            disabled={submitting}
                            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Send className="h-5 w-5" />
                                    Gửi đánh giá
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
}
