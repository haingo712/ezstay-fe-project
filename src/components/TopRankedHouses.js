"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import boardingHouseService from "@/services/boardingHouseService";
import { useGuestRedirect } from "@/hooks/useGuestRedirect";
import { FaStar, FaSmile, FaMeh, FaFrown, FaMapMarkerAlt, FaTrophy } from "react-icons/fa";

export default function TopRankedHouses() {
  const router = useRouter();
  const { isGuest } = useGuestRedirect();
  const [rankedHouses, setRankedHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rankType, setRankType] = useState("Rating"); // "Rating" or "Sentiment"

  useEffect(() => {
    fetchRankedHouses();
  }, [rankType]);

  const fetchRankedHouses = async () => {
    try {
      setLoading(true);
      const data = await boardingHouseService.getRankedHouses(rankType, "desc", 6);
      setRankedHouses(data || []);
    } catch (error) {
      console.error("Error fetching ranked houses:", error);
      setRankedHouses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (houseId) => {
    const targetUrl = `/rental-posts?boardingHouseId=${houseId}`;
    if (isGuest) {
      router.push(`/login?returnUrl=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  };

  const handleViewAll = () => {
    if (isGuest) {
      router.push(`/login?returnUrl=${encodeURIComponent('/rental-posts')}`);
    } else {
      router.push('/rental-posts');
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <FaTrophy className="text-yellow-500 text-2xl" />;
    if (index === 1) return <FaTrophy className="text-gray-400 text-xl" />;
    if (index === 2) return <FaTrophy className="text-orange-600 text-lg" />;
    return <span className="text-gray-500 font-bold text-lg">#{index + 1}</span>;
  };

  const getSentimentIcon = (score) => {
    // Score is in range 0-1, convert to percentage
    const percentage = score * 100;
    if (percentage >= 80) return <FaSmile className="text-green-500" />;
    if (percentage >= 50) return <FaMeh className="text-yellow-500" />;
    return <FaFrown className="text-red-500" />;
  };

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

          {/* Toggle Rank Type */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setRankType("Rating")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                rankType === "Rating"
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md"
              }`}
            >
              <FaStar className="inline mr-2" />
              Star Rating
            </button>
            <button
              onClick={() => setRankType("Sentiment")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                rankType === "Sentiment"
                  ? "bg-green-600 text-white shadow-lg scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md"
              }`}
            >
              <FaSmile className="inline mr-2" />
              Positive Sentiment
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        )}

        {/* Ranked Houses Grid */}
        {!loading && rankedHouses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rankedHouses.map((house, index) => (
              <div
                key={house.boardingHouseId}
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
                      {rankType === "Rating" ? (
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(house.boardingHouseId);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && rankedHouses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No ranking data available
            </p>
          </div>
        )}

        {/* View All Button */}
        {!loading && rankedHouses.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={handleViewAll}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              View All Boarding Houses →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
