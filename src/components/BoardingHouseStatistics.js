"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import boardingHouseService from "@/services/boardingHouseService";
import { FaStar, FaSmile, FaMeh, FaFrown, FaChartBar } from "react-icons/fa";

export default function BoardingHouseStatistics({ boardingHouseId }) {
  const [ratingData, setRatingData] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("rating"); // "rating" or "sentiment"
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (boardingHouseId && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchStatistics();
    }
  }, [boardingHouseId]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const [ratingResponse, sentimentResponse] = await Promise.all([
        boardingHouseService.getRatingSummary(boardingHouseId).catch(() => null),
        boardingHouseService.getSentimentSummary(boardingHouseId).catch(() => null),
      ]);
      
      // Extract data properly and set separately
      const ratingResult = ratingResponse?.data || ratingResponse;
      const sentimentResult = sentimentResponse?.data || sentimentResponse;
      
      setRatingData(ratingResult);
      setSentimentData(sentimentResult);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Memoize the rating stats to prevent recalculation
  const rating = useMemo(() => {
    if (!ratingData) return null;
    return {
      ...ratingData,
      averageRating: Number(ratingData.averageRating) || 0,
      totalReviews: Number(ratingData.totalReviews) || 0,
      fiveStarCount: Number(ratingData.fiveStarCount) || 0,
      fourStarCount: Number(ratingData.fourStarCount) || 0,
      threeStarCount: Number(ratingData.threeStarCount) || 0,
      twoStarCount: Number(ratingData.twoStarCount) || 0,
      oneStarCount: Number(ratingData.oneStarCount) || 0,
    };
  }, [ratingData]);

  // Memoize the sentiment stats to prevent recalculation
  const sentiment = useMemo(() => {
    if (!sentimentData) return null;
    return {
      ...sentimentData,
      totalReviews: Number(sentimentData.totalReviews) || 0,
      positiveCount: Number(sentimentData.positiveCount) || 0,
      neutralCount: Number(sentimentData.neutralCount) || 0,
      negativeCount: Number(sentimentData.negativeCount) || 0,
    };
  }, [sentimentData]);

  const renderStarBar = (count, total, starNumber) => {
    // Ensure values are valid numbers and percentage doesn't exceed 100
    const safeCount = Number(count) || 0;
    const safeTotal = Number(total) || 0;
    const percentage = safeTotal > 0 ? Math.min((safeCount / safeTotal) * 100, 100) : 0;
    return (
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-1 w-16">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {starNumber}
          </span>
          <FaStar className="text-yellow-500 text-xs" />
        </div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-yellow-500 h-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-right">
          {safeCount}
        </span>
      </div>
    );
  };

  const renderSentimentBar = (label, count, total, color) => {
    // Ensure values are valid numbers and percentage doesn't exceed 100
    const safeCount = Number(count) || 0;
    const safeTotal = Number(total) || 0;
    const percentage = safeTotal > 0 ? Math.min((safeCount / safeTotal) * 100, 100) : 0;
    const icons = {
      "Positive": <FaSmile className="text-green-500" />,
      "Neutral": <FaMeh className="text-yellow-500" />,
      "Negative": <FaFrown className="text-red-500" />,
    };

    return (
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2 w-28">
          {icons[label]}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
        </div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${color}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20 text-right">
          {safeCount} ({percentage.toFixed(0)}%)
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FaChartBar className="text-blue-600 text-2xl" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Review Statistics
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("rating")}
          className={`pb-3 px-4 font-semibold transition-colors ${
            activeTab === "rating"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 dark:text-gray-400 hover:text-blue-600"
          }`}
        >
          <FaStar className="inline mr-2" />
          Star Rating
        </button>
        <button
          onClick={() => setActiveTab("sentiment")}
          className={`pb-3 px-4 font-semibold transition-colors ${
            activeTab === "sentiment"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-600 dark:text-gray-400 hover:text-green-600"
          }`}
        >
          <FaSmile className="inline mr-2" />
          Sentiment Analysis (AI)
        </button>
      </div>

      {/* Rating Tab */}
      {activeTab === "rating" && rating && (
        <div key="rating-tab">
          {/* Overall Rating */}
          <div className="flex items-center justify-center gap-6 mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {rating.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < Math.round(rating.averageRating)
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {rating.totalReviews} reviews
              </div>
            </div>
          </div>

          {/* Star Distribution */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Rating Distribution
            </h3>
            {renderStarBar(rating.fiveStarCount, rating.totalReviews, 5)}
            {renderStarBar(rating.fourStarCount, rating.totalReviews, 4)}
            {renderStarBar(rating.threeStarCount, rating.totalReviews, 3)}
            {renderStarBar(rating.twoStarCount, rating.totalReviews, 2)}
            {renderStarBar(rating.oneStarCount, rating.totalReviews, 1)}
          </div>

          {/* Recent Reviews Preview */}
          {rating.details && rating.details.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Reviews
              </h3>
              <div className="space-y-3">
                {rating.details.slice(0, 3).map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-500 text-sm" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {review.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sentiment Tab */}
      {activeTab === "sentiment" && sentiment && (
        <div key="sentiment-tab">
          {/* Overall Sentiment */}
          <div className="text-center mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
            <div className="flex items-center justify-center gap-4 mb-3">
              <FaSmile className="text-green-500 text-4xl" />
              <div className="text-5xl font-bold text-gray-900 dark:text-white">
                {sentiment.totalReviews > 0
                  ? Math.min(((sentiment.positiveCount / sentiment.totalReviews) * 100), 100).toFixed(0)
                  : 0}
                %
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {sentiment.totalReviews} reviews analyzed by AI
            </div>
          </div>

          {/* Sentiment Distribution */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sentiment Analysis
            </h3>
            {renderSentimentBar(
              "Positive",
              sentiment.positiveCount,
              sentiment.totalReviews,
              "bg-green-500"
            )}
            {renderSentimentBar(
              "Neutral",
              sentiment.neutralCount,
              sentiment.totalReviews,
              "bg-yellow-500"
            )}
            {renderSentimentBar(
              "Negative",
              sentiment.negativeCount,
              sentiment.totalReviews,
              "bg-red-500"
            )}
          </div>

          {/* Sentiment Details Preview */}
          {sentiment.details && sentiment.details.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Detailed Analysis Samples
              </h3>
              <div className="space-y-3">
                {sentiment.details.slice(0, 3).map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {item.label === "positive" && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-semibold">
                          Positive {item.confidence.toFixed(0)}%
                        </span>
                      )}
                      {item.label === "neutral" && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-semibold">
                          Neutral {item.confidence.toFixed(0)}%
                        </span>
                      )}
                      {item.label === "negative" && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-semibold">
                          Negative {item.confidence.toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!rating && !sentiment && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No statistics data available
          </p>
        </div>
      )}
    </div>
  );
}
