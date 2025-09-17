"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { boardingHouseAPI, roomAPI } from "@/utils/api";

export default function PropertiesPage() {
  const [mounted, setMounted] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyData, setPropertyData] = useState({
    houseName: "",
    description: "",
    fullAddress: "",
  });

  // Mock owner ID - trong thực tế sẽ lấy từ authentication
  const ownerId = "123e4567-e89b-12d3-a456-426614174000";

  useEffect(() => {
    setMounted(true);
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy boarding houses của owner
      const boardingHouses = await boardingHouseAPI.getByOwnerId(ownerId);

      // Với mỗi boarding house, lấy thêm thông tin về rooms
      const propertiesWithRooms = await Promise.all(
        boardingHouses.map(async (house) => {
          try {
            const rooms = await roomAPI.getByHouseId(house.id);
            const occupiedRooms = rooms.filter(
              (room) => !room.isAvailable
            ).length;
            const vacantRooms = rooms.filter((room) => room.isAvailable).length;

            return {
              ...house,
              totalRooms: rooms.length,
              occupiedRooms,
              vacantRooms,
              monthlyRevenue: rooms.reduce(
                (sum, room) => sum + (room.price || 0),
                0
              ),
              averageRating: 4.5, // Mock data - sẽ tính từ reviews thực tế
              totalReviews: 15, // Mock data
              image: "/api/placeholder/400/300", // Mock image
              amenities: ["WiFi", "Parking"], // Mock amenities - sẽ lấy từ API
              status: "active",
              fullAddress: house.description || "Chưa có địa chỉ chi tiết",
            };
          } catch (error) {
            console.error(`Error fetching rooms for house ${house.id}:`, error);
            return {
              ...house,
              totalRooms: 0,
              occupiedRooms: 0,
              vacantRooms: 0,
              monthlyRevenue: 0,
              averageRating: 0,
              totalReviews: 0,
              image: "/api/placeholder/400/300",
              amenities: [],
              status: "active",
              fullAddress: house.description || "Chưa có địa chỉ chi tiết",
            };
          }
        })
      );

      setProperties(propertiesWithRooms);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setError(
        "Không thể tải danh sách nhà trọ. Vui lòng kiểm tra kết nối API."
      );

      // Fallback to mock data if API fails
      setProperties([
        {
          id: "1",
          houseName: "Sunrise Residence (Mock Data)",
          description:
            "Modern apartment complex with excellent amenities in downtown area",
          fullAddress: "123 Main Street, Downtown District, New York, NY 10001",
          totalRooms: 6,
          occupiedRooms: 5,
          vacantRooms: 1,
          monthlyRevenue: 1500,
          averageRating: 4.8,
          totalReviews: 42,
          createdAt: "2023-01-15",
          image: "/api/placeholder/400/300",
          amenities: ["WiFi", "Parking", "Gym", "Laundry", "Security"],
          status: "active",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProperty = async () => {
    try {
      const newProperty = {
        ownerId: ownerId,
        houseName: propertyData.houseName,
        description: propertyData.description,
      };

      const result = await boardingHouseAPI.create(newProperty);

      if (result.isSuccess) {
        alert("Tạo nhà trọ thành công!");
        setShowPropertyModal(false);
        setPropertyData({ houseName: "", description: "", fullAddress: "" });
        fetchProperties(); // Reload list
      } else {
        alert("Lỗi tạo nhà trọ: " + result.message);
      }
    } catch (error) {
      console.error("Error creating property:", error);
      alert("Lỗi kết nối API khi tạo nhà trọ");
    }
  };

  const handleUpdateProperty = async () => {
    try {
      const updateData = {
        houseName: propertyData.houseName,
        description: propertyData.description,
      };

      const result = await boardingHouseAPI.update(
        editingProperty.id,
        updateData
      );

      if (result.isSuccess) {
        alert("Cập nhật nhà trọ thành công!");
        setShowPropertyModal(false);
        setEditingProperty(null);
        setPropertyData({ houseName: "", description: "", fullAddress: "" });
        fetchProperties(); // Reload list
      } else {
        alert("Lỗi cập nhật nhà trọ: " + result.message);
      }
    } catch (error) {
      console.error("Error updating property:", error);
      alert("Lỗi kết nối API khi cập nhật nhà trọ");
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhà trọ này?")) return;

    try {
      const result = await boardingHouseAPI.delete(propertyId);

      if (result.isSuccess) {
        alert("Xóa nhà trọ thành công!");
        fetchProperties(); // Reload list
      } else {
        alert("Lỗi xóa nhà trọ: " + result.message);
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Lỗi kết nối API khi xóa nhà trọ");
    }
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setPropertyData({
      houseName: property.houseName,
      description: property.description,
      fullAddress: property.fullAddress,
    });
    setShowPropertyModal(true);
  };

  const handleSubmit = () => {
    if (!propertyData.houseName.trim()) {
      alert("Vui lòng nhập tên nhà trọ");
      return;
    }

    if (editingProperty) {
      handleUpdateProperty();
    } else {
      handleCreateProperty();
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">
              Đang tải danh sách nhà trọ...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý Nhà trọ
          </h1>
          <p className="text-gray-600">Quản lý tất cả các nhà trọ của bạn</p>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Tổng nhà trọ
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Phòng đã thuê
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.reduce((sum, p) => sum + p.occupiedRooms, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Phòng trống</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.reduce((sum, p) => sum + p.vacantRooms, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Doanh thu/tháng
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {properties
                    .reduce((sum, p) => sum + p.monthlyRevenue, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Danh sách nhà trọ
          </h2>
          <button
            onClick={() => {
              setEditingProperty(null);
              setPropertyData({
                houseName: "",
                description: "",
                fullAddress: "",
              });
              setShowPropertyModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Thêm nhà trọ mới
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có nhà trọ nào
            </h3>
            <p className="text-gray-600 mb-4">
              Bắt đầu bằng cách tạo nhà trọ đầu tiên của bạn
            </p>
            <button
              onClick={() => setShowPropertyModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tạo nhà trọ đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={property.image}
                    alt={property.houseName}
                    className="w-full h-48 object-cover"
                  />
                  <div
                    className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${
                      property.status === "active"
                        ? "bg-green-100 text-green-800"
                        : property.status === "maintenance"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {property.status === "active"
                      ? "Hoạt động"
                      : property.status === "maintenance"
                      ? "Bảo trì"
                      : "Dừng hoạt động"}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {property.houseName}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {property.description}
                  </p>
                  <p className="text-gray-500 text-xs mb-4">
                    {property.fullAddress}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {property.totalRooms}
                      </div>
                      <div className="text-xs text-gray-500">Tổng phòng</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {property.occupiedRooms}
                      </div>
                      <div className="text-xs text-gray-500">Đã thuê</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {property.vacantRooms}
                      </div>
                      <div className="text-xs text-gray-500">Còn trống</div>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-500">Doanh thu/tháng</div>
                    <div className="text-lg font-bold text-gray-900">
                      ${property.monthlyRevenue?.toLocaleString()}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(property.averageRating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {property.averageRating.toFixed(1)} (
                      {property.totalReviews} đánh giá)
                    </span>
                  </div>

                  {/* Amenities */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {property.amenities?.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                      {property.amenities?.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{property.amenities.length - 3} khác
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/owner/properties/${property.id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Xem chi tiết
                    </Link>
                    <button
                      onClick={() => handleEditProperty(property)}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(property.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Property Modal */}
        {showPropertyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingProperty ? "Chỉnh sửa nhà trọ" : "Tạo nhà trọ mới"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên nhà trọ *
                  </label>
                  <input
                    type="text"
                    value={propertyData.houseName}
                    onChange={(e) =>
                      setPropertyData({
                        ...propertyData,
                        houseName: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên nhà trọ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={propertyData.description}
                    onChange={(e) =>
                      setPropertyData({
                        ...propertyData,
                        description: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Mô tả ngắn về nhà trọ"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Address
                  </label>
                  <input
                    type="text"
                    value={propertyData.fullAddress}
                    onChange={(e) =>
                      setPropertyData({
                        ...propertyData,
                        fullAddress: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Địa chỉ chi tiết (tạm thời chưa lưu)"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowPropertyModal(false);
                    setEditingProperty(null);
                    setPropertyData({
                      houseName: "",
                      description: "",
                      fullAddress: "",
                    });
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingProperty ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
