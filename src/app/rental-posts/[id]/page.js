'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import rentalPostService from '@/services/rentalPostService';
import reviewService from '@/services/reviewService';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Calendar, 
  User, 
  Star,
  ArrowLeft,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatDialog from '@/components/ChatDialog';
import Image from 'next/image';

export default function RentalPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id;
  const { isAuthenticated, user } = useAuth();

  const [post, setPost] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showChatDialog, setShowChatDialog] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
      loadReviews();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await rentalPostService.getPostById(postId);
      console.log('Post detail:', response);
      setPost(response.data || response);
    } catch (error) {
      console.error('Error loading post:', error);
      alert('Failed to load post details');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await reviewService.getReviewsByPostId(postId);
      console.log('Reviews:', response);
      
      // Backend returns ApiResponse with data field
      const reviewsData = response.data || response.value || response || [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      0: { label: 'Available', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      1: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      2: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
      3: { label: 'Inactive', color: 'bg-gray-100 text-gray-800', icon: XCircle },
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

  const StarRating = ({ rating }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading post details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Post Not Found
            </h3>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Posts
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              {/* Image */}
              <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-6">
                <Image
                  src="/image.png"
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4">
                  {getStatusBadge(post.postStatus)}
                </div>
              </div>

              {/* Title & Info */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {post.title}
              </h1>

              <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {post.authorName || 'Unknown'}
                </div>
              </div>

              {/* Description */}
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {post.description}
                </p>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Reviews
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {calculateAverageRating()}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
              </div>

              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No reviews yet. Be the first to review!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {review.userName || 'Anonymous'}
                            </span>
                            <StarRating rating={review.rating} />
                          </div>
                          
                          <p className="text-gray-700 dark:text-gray-300 mb-2">
                            {review.content}
                          </p>
                          
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Property Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">House</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {post.houseName || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Room</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {post.roomName || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Contact</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {post.contactPhone || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Posted by</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {post.authorName || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                {isAuthenticated ? (
                  <>
                    <button 
                      onClick={() => setShowChatDialog(true)}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat with Owner
                    </button>
                    
                    <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      Call Owner
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <button 
                      onClick={() => router.push('/login')}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Login to Chat
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Please login to contact the owner
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Chat Dialog */}
      <ChatDialog 
        isOpen={showChatDialog}
        onClose={() => setShowChatDialog(false)}
        postId={postId}
        postTitle={post?.title}
        ownerName={post?.authorName}
      />
    </div>
  );
}
