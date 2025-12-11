"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import boardingHouseService from "@/services/boardingHouseService";
import { rentalPostService } from "@/services/rentalPostService";
import { useGuestRedirect } from "@/hooks/useGuestRedirect";
import { FaStar, FaSmile, FaMeh, FaFrown, FaMapMarkerAlt, FaTrophy } from "react-icons/fa";

export default function TopRankedHouses() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useGuestRedirect();
  
  // Separate states for each ranking type
  const [ratingHouses, setRatingHouses] = useState([]);
  const [sentimentHouses, setSentimentHouses] = useState([]);
  const [loadingRating, setLoadingRating] = useState(true);
  const [loadingSentiment, setLoadingSentiment] = useState(true);
  const [activeTab, setActiveTab] = useState("Rating");
  const [navigatingId, setNavigatingId] = useState(null);

  // Fetch rating data
  const fetchRatingHouses = useCallback(async () => {
    try {
      setLoadingRating(true);
      let data = [];
      if (isAuthenticated) {
        data = await boardingHouseService.getRankedHouses("Rating", "desc", 6);
      } else {
        data = await boardingHouseService.getRankedHousesPublic("Rating", "desc", 6);
      }
      setRatingHouses(data || []);
    } catch (error) {
      console.error("Error fetching rating houses:", error);
      setRatingHouses([]);
    } finally {
      setLoadingRating(false);
    }
  }, [isAuthenticated]);

  // Fetch sentiment data
  const fetchSentimentHouses = useCallback(async () => {
    try {
      setLoadingSentiment(true);
      let data = [];
      if (isAuthenticated) {
        data = await boardingHouseService.getRankedHouses("Sentiment", "desc", 6);
      } else {
        data = await boardingHouseService.getRankedHousesPublic("Sentiment", "desc", 6);
      }
      setSentimentHouses(data || []);
    } catch (error) {
      console.error("Error fetching sentiment houses:", error);
      setSentimentHouses([]);
    } finally {
      setLoadingSentiment(false);
    }
  }, [isAuthenticated]);

  // Fetch both on mount
  useEffect(() => {
    if (!authLoading) {
      fetchRatingHouses();
      fetchSentimentHouses();
    }
  }, [authLoading, isAuthenticated, fetchRatingHouses, fetchSentimentHouses]);

  const handleViewDetails = async (houseId) => {
    try {
      setNavigatingId(houseId);
      // Find posts for this boarding house and navigate to the first post detail
      let allPosts = [];
      if (isAuthenticated) {
        allPosts = await rentalPostService.getAllForUser();
      } else {
        allPosts = await rentalPostService.getAllPublic();
      }
      
      // Filter posts by boardingHouseId
      const housePosts = (allPosts || []).filter(
        post => (post.boardingHouseId || post.BoardingHouseId) === houseId
      );
      
      if (housePosts.length > 0) {
        // Navigate to the first post detail
        const postId = housePosts[0].id || housePosts[0].Id;
        router.push(`/rental-posts/${postId}`);
      } else {
        // Fallback: navigate to rental posts page filtered by boarding house
        router.push(`/rental-posts?boardingHouseId=${houseId}`);
      }
    } catch (error) {
      console.error("Error finding posts for boarding house:", error);
      // Fallback to list page
      router.push(`/rental-posts?boardingHouseId=${houseId}`);
    } finally {
      setNavigatingId(null);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <FaTrophy className="text-yellow-500 text-2xl" />;
    if (index === 1) return <FaTrophy className="text-gray-400 text-xl" />;
    if (index === 2) return <FaTrophy className="text-orange-600 text-lg" />;
    return <span className="text-gray-500 font-bold text-lg">#{index + 1}</span>;
  };

  const getSentimentIcon = (score) => {
    const percentage = score * 100;
    if (percentage >= 80) return <FaSmile className="text-green-500 text-xl" />;
    if (percentage >= 50) return <FaMeh className="text-yellow-500 text-xl" />;
    return <FaFrown className="text-red-500 text-xl" />;
  };

  // Get current data based on active tab
  const currentHouses = activeTab === "Rating" ? ratingHouses : sentimentHouses;
  const isLoading = activeTab === "Rating" ? loadingRating : loadingSentiment;

  const renderHouseCard = (house, index) => (
    <div
      key={`${activeTab}-${house.boardingHouseId}`}
      className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer ${
        index < 3 ? "ring-2 ring-offset-2" : ""
      } ${
        index === 0
          ? "ring-yellow-500"
          : index === 1
          ? "ring-gray-400"
          : index === 2
          ? "ring-orange-600"
          : ""
      }`}
      onClick={() => handleViewDetails(house.boardingHouseId)}
    >
      {/* Rank Badge */}
      <div className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-900 rounded-full p-3 shadow-lg">
        {getRankIcon(index)}
      </div>

      {/* Content */}
      <div className="p-6 pt-16">
        {/* House Name */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {house.houseName}
        </h3>

        {/* Address */}
        <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 mb-4">
          <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" />
          <p className="text-sm line-clamp-2">{house.fullAddress}</p>
        </div>

        {/* Score Display */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {activeTab === "Rating" ? (
              <>
                <FaStar className="text-yellow-500 text-xl" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {house.score.toFixed(1)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">/5.0</span>
              </>
            ) : (
              <>
                {getSentimentIcon(house.score)}
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(house.score * 100).toFixed(0)}%
                </span>
                <span className="text-gray-500 dark:text-gray-400">positive</span>
              </>
            )}
          </div>

          {/* View Button */}
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={navigatingId === house.boardingHouseId}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(house.boardingHouseId);
            }}
          >
            {navigatingId === house.boardingHouseId ? "Loading..." : "View Details"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 transition-colors">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🏆 Top Rated Boarding Houses
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            Discover the best boarding houses based on user reviews
          </p>

          {/* Toggle Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab("Rating")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "Rating"
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md"
              }`}
            >
              <FaStar className="inline mr-2" />
              Star Rating
            </button>
            <button
              onClick={() => setActiveTab("Sentiment")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "Sentiment"
                  ? "bg-green-600 text-white shadow-lg scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md"
              }`}
            >
              <FaSmile className="inline mr-2" />
              AI Sentiment
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        )}

        {/* Houses Grid */}
        {!isLoading && currentHouses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentHouses.map((house, index) => renderHouseCard(house, index))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && currentHouses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No ranked boarding houses available yet.
            </p>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-10">
          <button
            onClick={() => router.push('/rental-posts')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            View All Posts
          </button>
        </div>
      </div>
    </section>
  );
}
