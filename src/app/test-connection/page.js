// src/app/test-connection/page.js
// Trang test kết nối Backend-Frontend

"use client";

import { useState, useEffect } from "react";
import { backendConnection } from "../../services/BackendConnectionService";
import authService from "@/services/authService";

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncedData, setSyncedData] = useState(null);
  const [sampleData, setSampleData] = useState(null);
  const [authTest, setAuthTest] = useState(null);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    setLoading(true);
    try {
      // Kiểm tra kết nối
      const isConnected = await backendConnection.checkConnection();

      if (isConnected) {
        // Test tất cả services
        const testResults = await backendConnection.testAllServices();
        setConnectionStatus(testResults);

        // Test Auth API specifically
        await testAuthAPI();

        // Sync dữ liệu hiện có
        try {
          const data = await backendConnection.syncData();
          setSyncedData(data);
        } catch (error) {
          console.log("No existing data or sync failed:", error.message);
        }
      }
    } catch (error) {
      console.error("Connection check failed:", error);
    }
    setLoading(false);
  };

  const testAuthAPI = async () => {
    try {
      // Test Auth API connectivity
      const response = await fetch("https://localhost:7000/api/Auth/test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setAuthTest({ status: "Connected", message: "Auth API is accessible" });
      } else {
        setAuthTest({ status: "Error", message: `HTTP ${response.status}` });
      }
    } catch (error) {
      setAuthTest({ status: "Failed", message: error.message });
    }
  };

  const createSampleData = async () => {
    try {
      setLoading(true);
      const data = await backendConnection.createSampleData();
      setSampleData(data);

      // Refresh synced data
      const refreshedData = await backendConnection.syncData();
      setSyncedData(refreshedData);

      alert("✅ Tạo dữ liệu mẫu thành công!");
    } catch (error) {
      alert("❌ Lỗi tạo dữ liệu: " + error.message);
    }
    setLoading(false);
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const data = await backendConnection.syncData();
      setSyncedData(data);
    } catch (error) {
      alert("❌ Lỗi đồng bộ dữ liệu: " + error.message);
    }
    setLoading(false);
  };

  if (loading && !connectionStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra kết nối backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔗 Backend-Frontend Connection Test
          </h1>
          <p className="text-gray-600">
            Kiểm tra và test kết nối giữa frontend và backend microservices
          </p>
        </div>

        {/* Connection Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              🔍 Trạng thái kết nối
            </h2>

            {connectionStatus ? (
              <div className="space-y-3">
                {Object.entries(connectionStatus).map(([service, result]) => (
                  <div
                    key={service}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium">{service}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        result.status === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {result.status === "success" ? "✅ Hoạt động" : "❌ Lỗi"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Chưa kiểm tra kết nối</p>
            )}
          </div>

          {/* Auth API Test */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              🔐 Auth API Test
            </h2>

            {authTest ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Auth Service</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      authTest.status === "Connected"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {authTest.status === "Connected" ? "✅ Connected" : "❌ Failed"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{authTest.message}</p>
              </div>
            ) : (
              <p className="text-gray-500">Đang kiểm tra Auth API...</p>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              ⚡ Hành động
            </h2>

            <div className="space-y-3">
              <button
                onClick={checkBackendConnection}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "⏳ Đang kiểm tra..." : "🔄 Kiểm tra lại kết nối"}
              </button>

              <button
                onClick={createSampleData}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "⏳ Đang tạo..." : "🏗️ Tạo dữ liệu mẫu"}
              </button>

              <button
                onClick={refreshData}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? "⏳ Đang đồng bộ..." : "📊 Đồng bộ dữ liệu"}
              </button>
            </div>
          </div>
        </div>

        {/* Synced Data Display */}
        {syncedData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Boarding Houses */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-600">
                🏠 Nhà trọ ({syncedData.houses?.length || 0})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {syncedData.houses?.map((house, index) => (
                  <div
                    key={house.id || index}
                    className="p-2 bg-blue-50 rounded"
                  >
                    <p className="font-medium text-sm">{house.houseName}</p>
                    <p className="text-xs text-gray-600">{house.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rooms */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-green-600">
                🏢 Phòng ({syncedData.rooms?.length || 0})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {syncedData.rooms?.map((room, index) => (
                  <div
                    key={room.id || index}
                    className="p-2 bg-green-50 rounded"
                  >
                    <p className="font-medium text-sm">{room.roomName}</p>
                    <p className="text-xs text-gray-600">
                      {room.area}m² - {room.price?.toLocaleString()}đ
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-orange-600">
                🛠️ Tiện nghi ({syncedData.amenities?.length || 0})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {syncedData.amenities?.map((amenity, index) => (
                  <div
                    key={amenity.id || index}
                    className="p-2 bg-orange-50 rounded"
                  >
                    <p className="font-medium text-sm">{amenity.amenityName}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-purple-600">
                📍 Vị trí ({syncedData.locations?.length || 0})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {syncedData.locations?.map((location, index) => (
                  <div
                    key={location.id || index}
                    className="p-2 bg-purple-50 rounded"
                  >
                    <p className="font-medium text-sm">{location.address}</p>
                    <p className="text-xs text-gray-600">
                      {location.ward}, {location.district}, {location.city}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sample Data Created */}
        {sampleData && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              ✅ Dữ liệu mẫu đã tạo thành công!
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p>
                  <strong>Nhà trọ:</strong> {sampleData.house?.houseName}
                </p>
                <p>
                  <strong>Phòng:</strong> {sampleData.room?.roomName}
                </p>
              </div>
              <div>
                <p>
                  <strong>Tiện nghi:</strong> {sampleData.amenity?.amenityName}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {sampleData.location?.address}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            📋 Hướng dẫn sử dụng
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>
              1. <strong>Kiểm tra kết nối:</strong> Xem các service nào đang
              hoạt động
            </li>
            <li>
              2. <strong>Tạo dữ liệu mẫu:</strong> Tạo một bộ dữ liệu test hoàn
              chỉnh
            </li>
            <li>
              3. <strong>Đồng bộ dữ liệu:</strong> Lấy dữ liệu mới nhất từ
              backend
            </li>
            <li>
              4. <strong>Xem dữ liệu:</strong> Kiểm tra dữ liệu đã được lưu
              trong database
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
