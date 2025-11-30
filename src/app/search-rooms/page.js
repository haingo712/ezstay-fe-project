"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useTranslation } from "@/hooks/useTranslation";
import {
  sampleRooms,
  sampleAmenities,
  sampleLocations,
} from "@/sampleData/rooms";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    keyword: searchParams.get("q") || "",
    location: searchParams.get("location") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minArea: searchParams.get("minArea") || "",
    maxArea: searchParams.get("maxArea") || "",
    maxTenants: searchParams.get("maxTenants") || "",
    amenities:
      searchParams.get("amenities")?.split(",").map(Number).filter(Boolean) ||
      [],
    minRating: parseInt(searchParams.get("minRating")) || 0,
    availability: searchParams.get("availability") || "all",
  });

  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showFilters, setShowFilters] = useState(false);

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "" && value !== "all") {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(","));
        } else if (!Array.isArray(value)) {
          params.set(key, value.toString());
        }
      }
    });

    if (sortBy !== "newest") {
      params.set("sort", sortBy);
    }

    const newURL = params.toString()
      ? `/search?${params.toString()}`
      : "/search";
    router.replace(newURL, { scroll: false });
  }, [filters, sortBy, router]);

  useEffect(() => {
    // Load rooms data
    setRooms(sampleRooms);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Apply filters and search
    let filtered = rooms.filter((room) => {
      // Keyword search
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        if (
          !room.house.house_name.toLowerCase().includes(keyword) &&
          !room.location.full_address.toLowerCase().includes(keyword) &&
          !room.room_name.toLowerCase().includes(keyword) &&
          !room.house.description.toLowerCase().includes(keyword)
        ) {
          return false;
        }
      }

      // Location filter
      if (
        filters.location &&
        !room.location.full_address.includes(filters.location)
      ) {
        return false;
      }

      // Price filter
      if (filters.minPrice && room.price < parseInt(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && room.price > parseInt(filters.maxPrice)) {
        return false;
      }

      // Area filter
      if (filters.minArea && room.area < parseFloat(filters.minArea)) {
        return false;
      }
      if (filters.maxArea && room.area > parseFloat(filters.maxArea)) {
        return false;
      }

      // Max tenants filter
      if (
        filters.maxTenants &&
        room.max_tenants < parseInt(filters.maxTenants)
      ) {
        return false;
      }

      // Rating filter
      if (filters.minRating && room.avg_rating < filters.minRating) {
        return false;
      }

      // Availability filter
      if (filters.availability === "available" && !room.is_available) {
        return false;
      }
      if (filters.availability === "rented" && room.is_available) {
        return false;
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const roomAmenityIds = room.amenities.map((a) => a.amenity_id);
        if (
          !filters.amenities.every((amenityId) =>
            roomAmenityIds.includes(amenityId)
          )
        ) {
          return false;
        }
      }

      return true;
    });

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "area-large":
        filtered.sort((a, b) => b.area - a.area);
        break;
      case "area-small":
        filtered.sort((a, b) => a.area - b.area);
        break;
      case "rating":
        filtered.sort((a, b) => b.avg_rating - a.avg_rating);
        break;
      case "newest":
      default:
        filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
    }

    setFilteredRooms(filtered);

    // Update URL with current filters
    updateURL();
  }, [rooms, filters, sortBy, updateURL]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAmenityToggle = (amenityId) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((id) => id !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      maxTenants: "",
      amenities: [],
      minRating: 0,
      availability: "all",
    });
    setSortBy("newest");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${
          i < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('searchRooms.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('searchRooms.searchPlaceholder')}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={filters.keyword}
                  onChange={(e) =>
                    handleFilterChange("keyword", e.target.value)
                  }
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                  />
                </svg>
                <span>{t('searchRooms.filters')}</span>
              </button>

              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div
            className={`lg:w-1/4 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6 sticky top-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('searchRooms.filters')}
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {t('searchRooms.clearAll')}
                </button>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('searchRooms.location')}
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={filters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                >
                  <option value="">{t('searchRooms.allAreas')}</option>
                  {sampleLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('searchRooms.rentPrice')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder={t('searchRooms.from')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder={t('searchRooms.to')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Area Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('searchRooms.area')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder={t('searchRooms.from')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={filters.minArea}
                    onChange={(e) =>
                      handleFilterChange("minArea", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder={t('searchRooms.to')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={filters.maxArea}
                    onChange={(e) =>
                      handleFilterChange("maxArea", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Max Tenants Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('searchRooms.maxOccupancy')}
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={filters.maxTenants}
                  onChange={(e) =>
                    handleFilterChange("maxTenants", e.target.value)
                  }
                >
                  <option value="">{t('searchRooms.noRequirement')}</option>
                  <option value="1">{t('searchRooms.onePerson')}</option>
                  <option value="2">{t('searchRooms.twoPeople')}</option>
                  <option value="3">{t('searchRooms.threePeople')}</option>
                  <option value="4">{t('searchRooms.fourPlusPeople')}</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('searchRooms.status')}
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={filters.availability}
                  onChange={(e) =>
                    handleFilterChange("availability", e.target.value)
                  }
                >
                  <option value="all">{t('searchRooms.all')}</option>
                  <option value="available">{t('searchRooms.available')}</option>
                  <option value="rented">{t('searchRooms.rented')}</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('searchRooms.minRating')}
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={filters.minRating}
                  onChange={(e) =>
                    handleFilterChange("minRating", parseInt(e.target.value))
                  }
                >
                  <option value={0}>{t('searchRooms.all')}</option>
                  <option value={1}>1 {t('searchRooms.starUp')}</option>
                  <option value={2}>2 {t('searchRooms.starsUp')}</option>
                  <option value={3}>3 {t('searchRooms.starsUp')}</option>
                  <option value={4}>4 {t('searchRooms.starsUp')}</option>
                  <option value={5}>{t('searchRooms.fiveStars')}</option>
                </select>
              </div>

              {/* Amenities Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('searchRooms.amenities')}
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {sampleAmenities.map((amenity) => (
                    <label
                      key={amenity.amenity_id}
                      className="flex items-center"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={filters.amenities.includes(amenity.amenity_id)}
                        onChange={() => handleAmenityToggle(amenity.amenity_id)}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {amenity.amenity_name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('searchRooms.searchResults')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('searchRooms.foundRooms').replace('{count}', filteredRooms.length)}
                </p>
              </div>

              <select
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">{t('searchRooms.newest')}</option>
                <option value="price-low">{t('searchRooms.priceLowHigh')}</option>
                <option value="price-high">{t('searchRooms.priceHighLow')}</option>
                <option value="area-large">{t('searchRooms.areaLargeSmall')}</option>
                <option value="area-small">{t('searchRooms.areaSmallLarge')}</option>
                <option value="rating">{t('searchRooms.highestRated')}</option>
              </select>
            </div>
                <option value="area-large">Area: Large to Small</option>
                <option value="area-small">Area: Small to Large</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Results */}
            {filteredRooms.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-6"
                }
              >
                {filteredRooms.map((room) => (
                  <div
                    key={room.room_id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                  >
                    <div
                      className={`relative ${
                        viewMode === "list" ? "w-64 flex-shrink-0" : ""
                      }`}
                    >
                      <img
                        src={
                          room.images[0]?.image_url || "/placeholder-room.jpg"
                        }
                        alt={room.room_name}
                        className={`object-cover ${
                          viewMode === "list" ? "w-full h-full" : "w-full h-48"
                        }`}
                      />
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            room.is_available
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {room.is_available ? t('searchRooms.available') : t('searchRooms.rented')}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {room.room_name} - {room.house.house_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        📍 {room.location.full_address}
                      </p>

                      <div className="flex items-center mb-2">
                        {renderStars(Math.floor(room.avg_rating))}
                        <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                          ({room.total_reviews})
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                          {formatPrice(room.price)}{t('searchRooms.perMonth')}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {room.area}{t('searchRooms.sqm')} • {room.max_tenants} {t('searchRooms.people')}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {room.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity.amenity_id}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300"
                          >
                            {amenity.amenity_name}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300">
                            +{room.amenities.length - 3}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/rooms/${room.room_id}`}
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                      >
                        {t('searchRooms.viewDetails')}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('searchRooms.noResults')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {t('searchRooms.noRoomsMatch')}
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  {t('searchRooms.clearFilters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
