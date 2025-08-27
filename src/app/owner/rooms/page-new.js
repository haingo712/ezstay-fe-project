"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { roomAPI, boardingHouseAPI, amenityAPI } from "@/utils/api";

export default function RoomsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [rooms, setRooms] = useState([]);
  const [boardingHouses, setBoardingHouses] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomData, setRoomData] = useState({
    roomName: "",
    houseId: "",
    area: "",
    price: "",
    maxTenants: "",
    rentalCondition: "",
    isAvailable: true,
  });

  // Mock owner ID - trong thực tế sẽ lấy từ authentication
  const ownerId = "123e4567-e89b-12d3-a456-426614174000";

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy boarding houses của owner
      const houses = await boardingHouseAPI.getByOwnerId(ownerId);
      setBoardingHouses(houses);

      // Lấy amenities của owner
      try {
        const ownerAmenities = await amenityAPI.getByOwnerId(ownerId);
        setAmenities(ownerAmenities);
      } catch (error) {
        console.error("Error fetching amenities:", error);
        setAmenities([]);
      }

      // Lấy tất cả rooms của các houses
      const allRooms = [];
      for (const house of houses) {
        try {
          const houseRooms = await roomAPI.getByHouseId(house.id);
          const roomsWithHouseInfo = houseRooms.map((room) => ({
            ...room,
            houseName: house.houseName,
            houseLocationId: house.id, // Tạm thời dùng house ID
            // Add mock data for missing fields
            rentalCondition: room.rentalCondition || "Điều kiện thuê chuẩn",
            currentTenant: room.isAvailable
              ? null
              : {
                  name: "Khách thuê",
                  email: "tenant@example.com",
                  phone: "+84 123 456 789",
                  moveInDate: "2023-12-01",
                },
            amenities: ["WiFi", "Parking"], // Mock amenities
            images: ["/api/placeholder/400/300"],
            views: Math.floor(Math.random() * 200),
            inquiries: Math.floor(Math.random() * 50),
            rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
            reviews: Math.floor(Math.random() * 30),
          }));
          allRooms.push(...roomsWithHouseInfo);
        } catch (error) {
          console.error(`Error fetching rooms for house ${house.id}:`, error);
        }
      }

      setRooms(allRooms);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối API.");

      // Fallback to mock data
      setRooms([
        {
          id: "1",
          roomName: "Modern Studio Apartment (Mock)",
          houseId: "1",
          houseName: "Sunrise Residence",
          houseLocationId: "1",
          area: 35,
          price: 250,
          maxTenants: 2,
          rentalCondition: "No smoking, no pets. Security deposit required.",
          isAvailable: true,
          createdAt: "2023-01-20",
          currentTenant: null,
          amenities: ["WiFi", "Parking", "Laundry", "Gym"],
          images: ["/api/placeholder/400/300"],
          views: 156,
          inquiries: 23,
          rating: 4.8,
          reviews: 24,
        },
      ]);
      setBoardingHouses([{ id: "1", houseName: "Sunrise Residence" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    try {
      const newRoom = {
        houseId: roomData.houseId,
        roomName: roomData.roomName,
        area: parseInt(roomData.area),
        price: parseFloat(roomData.price),
        maxTenants: parseInt(roomData.maxTenants),
        rentalCondition: roomData.rentalCondition,
        isAvailable: roomData.isAvailable,
      };

      const result = await roomAPI.create(newRoom);

      if (result.isSuccess) {
        alert("Tạo phòng thành công!");
        setShowRoomModal(false);
        resetRoomData();
        fetchData(); // Reload list
      } else {
        alert("Lỗi tạo phòng: " + result.message);
      }
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Lỗi kết nối API khi tạo phòng");
    }
  };

  const handleUpdateRoom = async () => {
    try {
      const updateData = {
        roomName: roomData.roomName,
        area: parseInt(roomData.area),
        price: parseFloat(roomData.price),
        maxTenants: parseInt(roomData.maxTenants),
        rentalCondition: roomData.rentalCondition,
        isAvailable: roomData.isAvailable,
      };

      const result = await roomAPI.update(editingRoom.id, updateData);

      if (result.isSuccess) {
        alert("Cập nhật phòng thành công!");
        setShowRoomModal(false);
        setEditingRoom(null);
        resetRoomData();
        fetchData(); // Reload list
      } else {
        alert("Lỗi cập nhật phòng: " + result.message);
      }
    } catch (error) {
      console.error("Error updating room:", error);
      alert("Lỗi kết nối API khi cập nhật phòng");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phòng này?")) return;

    try {
      await roomAPI.delete(roomId);
      alert("Xóa phòng thành công!");
      fetchData(); // Reload list
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Lỗi kết nối API khi xóa phòng");
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomData({
      roomName: room.roomName,
      houseId: room.houseId,
      area: room.area.toString(),
      price: room.price.toString(),
      maxTenants: room.maxTenants.toString(),
      rentalCondition: room.rentalCondition,
      isAvailable: room.isAvailable,
    });
    setShowRoomModal(true);
  };

  const resetRoomData = () => {
    setRoomData({
      roomName: "",
      houseId: "",
      area: "",
      price: "",
      maxTenants: "",
      rentalCondition: "",
      isAvailable: true,
    });
  };

  const handleSubmit = () => {
    if (!roomData.roomName.trim()) {
      alert("Vui lòng nhập tên phòng");
      return;
    }
    if (!roomData.houseId) {
      alert("Vui lòng chọn nhà trọ");
      return;
    }
    if (!roomData.area || !roomData.price || !roomData.maxTenants) {
      alert("Vui lòng điền đầy đủ thông tin phòng");
      return;
    }

    if (editingRoom) {
      handleUpdateRoom();
    } else {
      handleCreateRoom();
    }
  };

  const filteredRooms = rooms.filter((room) => {
    switch (activeTab) {
      case "available":
        return room.isAvailable;
      case "occupied":
        return !room.isAvailable;
      default:
        return true;
    }
  });

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">
              Đang tải danh sách phòng...
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
            Quản lý Phòng trọ
          </h1>
          <p className="text-gray-600">
            Quản lý tất cả các phòng trong nhà trọ của bạn
          </p>

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
                <p className="text-sm font-medium text-gray-500">Tổng phòng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rooms.length}
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
                <p className="text-sm font-medium text-gray-500">Đã cho thuê</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rooms.filter((r) => !r.isAvailable).length}
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
                <p className="text-sm font-medium text-gray-500">Còn trống</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rooms.filter((r) => r.isAvailable).length}
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
                  {rooms
                    .filter((r) => !r.isAvailable)
                    .reduce((sum, r) => sum + r.price, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Create Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Tất cả ({rooms.length})
            </button>
            <button
              onClick={() => setActiveTab("available")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "available"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Còn trống ({rooms.filter((r) => r.isAvailable).length})
            </button>
            <button
              onClick={() => setActiveTab("occupied")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "occupied"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Đã thuê ({rooms.filter((r) => !r.isAvailable).length})
            </button>
          </div>

          <button
            onClick={() => {
              setEditingRoom(null);
              resetRoomData();
              setShowRoomModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Thêm phòng mới
          </button>
        </div>

        {/* Rooms Grid */}
        {filteredRooms.length === 0 ? (
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
              {activeTab === "all"
                ? "Chưa có phòng nào"
                : activeTab === "available"
                ? "Không có phòng trống"
                : "Không có phòng đã thuê"}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === "all"
                ? "Bắt đầu bằng cách tạo phòng đầu tiên"
                : activeTab === "available"
                ? "Tất cả phòng đã được thuê"
                : "Chưa có phòng nào được thuê"}
            </p>
            {activeTab === "all" && (
              <button
                onClick={() => setShowRoomModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tạo phòng đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={room.images?.[0] || "/api/placeholder/400/300"}
                    alt={room.roomName}
                    className="w-full h-48 object-cover"
                  />
                  <div
                    className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${
                      room.isAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {room.isAvailable ? "Còn trống" : "Đã thuê"}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    ${room.price}/tháng
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {room.roomName}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{room.houseName}</p>

                  {/* Room Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Diện tích</div>
                      <div className="font-semibold">{room.area}m²</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Sức chứa</div>
                      <div className="font-semibold">
                        {room.maxTenants} người
                      </div>
                    </div>
                  </div>

                  {/* Tenant Info (if occupied) */}
                  {!room.isAvailable && room.currentTenant && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">
                        Khách thuê hiện tại
                      </div>
                      <div className="font-medium text-gray-900">
                        {room.currentTenant.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {room.currentTenant.email}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        {room.views}
                      </div>
                      <div className="text-xs text-gray-500">Lượt xem</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        {room.inquiries}
                      </div>
                      <div className="text-xs text-gray-500">Liên hệ</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        {room.rating}
                      </div>
                      <div className="text-xs text-gray-500">Đánh giá</div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {room.amenities?.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities?.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{room.amenities.length - 3} khác
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/owner/rooms/${room.id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Chi tiết
                    </Link>
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
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

        {/* Create/Edit Room Modal */}
        {showRoomModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-screen overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {editingRoom ? "Chỉnh sửa phòng" : "Tạo phòng mới"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên phòng *
                  </label>
                  <input
                    type="text"
                    value={roomData.roomName}
                    onChange={(e) =>
                      setRoomData({ ...roomData, roomName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên phòng"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhà trọ *
                  </label>
                  <select
                    value={roomData.houseId}
                    onChange={(e) =>
                      setRoomData({ ...roomData, houseId: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn nhà trọ</option>
                    {boardingHouses.map((house) => (
                      <option key={house.id} value={house.id}>
                        {house.houseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diện tích (m²) *
                    </label>
                    <input
                      type="number"
                      value={roomData.area}
                      onChange={(e) =>
                        setRoomData({ ...roomData, area: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá/tháng ($) *
                    </label>
                    <input
                      type="number"
                      value={roomData.price}
                      onChange={(e) =>
                        setRoomData({ ...roomData, price: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="250"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số người tối đa *
                  </label>
                  <input
                    type="number"
                    value={roomData.maxTenants}
                    onChange={(e) =>
                      setRoomData({ ...roomData, maxTenants: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điều kiện thuê
                  </label>
                  <textarea
                    value={roomData.rentalCondition}
                    onChange={(e) =>
                      setRoomData({
                        ...roomData,
                        rentalCondition: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Các điều kiện và quy định thuê phòng"
                  ></textarea>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={roomData.isAvailable}
                    onChange={(e) =>
                      setRoomData({
                        ...roomData,
                        isAvailable: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">
                    Phòng còn trống
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRoomModal(false);
                    setEditingRoom(null);
                    resetRoomData();
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingRoom ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
