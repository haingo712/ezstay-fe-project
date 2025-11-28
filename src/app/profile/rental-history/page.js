'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import contractService from '@/services/contractService';
import reviewService from '@/services/reviewService';
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
  XCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RoleBasedRedirect from '@/components/RoleBasedRedirect';

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

  useEffect(() => {
    if (user) {
      loadContracts();
    }
  }, [user]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      // Sử dụng endpoint getByTenantId với user.id
      const response = await contractService.getByTenantId(user.id);
      console.log('Contracts response:', response);
      
      // Kiểm tra response là array hay object với value
      const contractsData = Array.isArray(response) ? response : (response.value || []);
      setContracts(contractsData);
    } catch (error) {
      console.error('Error loading contracts:', error);
      setContracts([]);
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
      alert(t('rentalHistory.writeReviewPlaceholder'));
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
      
      alert(t('rentalHistory.reviewSuccess'));
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
      alert(error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      0: { label: t('rentalHistory.active'), color: 'bg-green-100 text-green-800', icon: CheckCircle },
      1: { label: t('rentalHistory.pending'), color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      2: { label: t('rentalHistory.expired'), color: 'bg-red-100 text-red-800', icon: XCircle },
      3: { label: t('rentalHistory.cancelled'), color: 'bg-gray-100 text-gray-800', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig[1];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4" />
        {config.label}
      </span>
    );
  };

  const canReview = (contract) => {
    // User có thể review nếu hợp đồng đã kết thúc và trong vòng 30 ngày
    const checkoutDate = new Date(contract.checkoutDate);
    const now = new Date();
    const daysSinceCheckout = (now - checkoutDate) / (1000 * 60 * 60 * 24);
    
    return contract.contractStatus === 2 && daysSinceCheckout <= 30;
  };

  return (
    <RoleBasedRedirect allowedRoles={['User']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('rentalHistory.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('rentalHistory.subtitle')}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">{t('rentalHistory.loading')}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && contracts.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('rentalHistory.noHistory')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('rentalHistory.noHistoryDesc')}
              </p>
            </div>
          )}

          {/* Contracts List */}
          {!loading && contracts.length > 0 && (
            <div className="space-y-6">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  {/* Contract Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {contract.roomName || 'Room'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {contract.houseName || 'Boarding House'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(contract.contractStatus)}
                  </div>

                  {/* Contract Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{t('rentalHistory.checkIn')}:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(contract.checkinDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{t('rentalHistory.checkOut')}:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(contract.checkoutDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{t('rentalHistory.owner')}:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {contract.ownerName || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{t('profile.phone')}:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {contract.ownerPhone || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {t('common.view')}
                    </button>
                    
                    <button
                      onClick={() => handleOpenReviewModal(contract)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Star className="h-4 w-4" />
                      {t('rentalHistory.writeReview')}
                    </button>

                    <button
                      onClick={() => router.push(`/reviews/8e4212b9-a0b5-4a91-9b53-cefb1bd81673`)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Star className="h-4 w-4 fill-current" />
                      {t('rentalPostDetail.reviews')}
                    </button>
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
                  {t('rentalHistory.reviewTitle')}
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
                    {t('rentalHistory.yourRating')}
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
                          className={`h-8 w-8 ${
                            star <= reviewForm.rating
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
                    {t('rentalHistory.yourReview')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reviewForm.content}
                    onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                    placeholder={t('rentalHistory.writeReviewPlaceholder')}
                    rows={6}
                    maxLength={1000}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {reviewForm.content.length}/1000
                  </p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('rentalHistory.uploadImage')}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
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
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || !reviewForm.content.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t('rentalHistory.submitting')}
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      {t('rentalHistory.submitReview')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </RoleBasedRedirect>
  );
}
