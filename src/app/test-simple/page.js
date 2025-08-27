// src/app/test-simple/page.js
// Trang test đơn giản mà không cần MongoDB

"use client";

import { useState, useEffect } from "react";

export default function SimpleTestPage() {
  const [backendStatus, setBackendStatus] = useState({});
  const [loading, setLoading] = useState(false);

  // Test chỉ Swagger endpoints (không cần MongoDB)
  const testSwaggerEndpoints = async () => {
    setLoading(true);
    const results = {};

    const endpoints = [
      { name: "API Gateway", url: "https://localhost:7000/swagger/index.html" },
      {
        name: "BoardingHouse API",
        url: "https://localhost:7186/swagger/index.html",
      },
      { name: "Amenity API", url: "https://localhost:7111/swagger/index.html" },
      { name: "Room API", url: "https://localhost:7086/swagger/index.html" },
      {
        name: "HouseLocation API",
        url: "https://localhost:7278/swagger/index.html",
      },
      {
        name: "RoomAmenity API",
        url: "https://localhost:7152/swagger/index.html",
      },
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: "GET",
          mode: "no-cors", // Bypass CORS for this test
        });

        results[endpoint.name] = {
          status: "running",
          message: "Service is responding",
          url: endpoint.url,
        };
        console.log(`✅ ${endpoint.name} is running`);
      } catch (error) {
        results[endpoint.name] = {
          status: "error",
          message: "Service not responding",
          error: error.message,
          url: endpoint.url,
        };
        console.log(`❌ ${endpoint.name} failed:`, error.message);
      }
    }

    setBackendStatus(results);
    setLoading(false);
  };

  // Test basic API calls (có thể fail do MongoDB)
  const testBasicAPIs = async () => {
    setLoading(true);
    const results = { ...backendStatus };

    try {
      // Test một API endpoint đơn giản
      const response = await fetch(
        "https://localhost:7000/api/BoardingHouses",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        results["API Gateway Routes"] = {
          status: "success",
          message: `API Gateway working - Got ${data.length || 0} records`,
          data: data,
        };
      } else {
        results["API Gateway Routes"] = {
          status: "warning",
          message: `API Gateway responding but returned ${response.status}`,
          details: await response.text(),
        };
      }
    } catch (error) {
      results["API Gateway Routes"] = {
        status: "error",
        message: "API Gateway not accessible",
        error: error.message,
      };
    }

    setBackendStatus(results);
    setLoading(false);
  };

  // Tạo dữ liệu mock thay vì MongoDB
  const createMockData = () => {
    const mockData = {
      boardingHouses: [
        {
          id: "1",
          name: "Mock House 1",
          description: "Test house for development",
        },
        { id: "2", name: "Mock House 2", description: "Another test house" },
      ],
      rooms: [
        { id: "1", name: "Mock Room 101", price: 3000000, houseId: "1" },
        { id: "2", name: "Mock Room 102", price: 3500000, houseId: "1" },
      ],
      amenities: [
        { id: "1", name: "WiFi miễn phí" },
        { id: "2", name: "Chỗ đậu xe" },
      ],
    };

    // Lưu vào localStorage để sử dụng trong app
    localStorage.setItem("mockData", JSON.stringify(mockData));

    alert(
      "✅ Mock data đã được tạo và lưu vào localStorage!\nBây giờ app có thể sử dụng dữ liệu này thay vì MongoDB."
    );
  };

  useEffect(() => {
    testSwaggerEndpoints();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🧪 Simple Backend Test (Bypass MongoDB)
          </h1>
          <p className="text-gray-600">
            Test backend services mà không phụ thuộc vào MongoDB connection
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={testSwaggerEndpoints}
            disabled={loading}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "⏳ Testing..." : "🔍 Test Swagger Endpoints"}
          </button>

          <button
            onClick={testBasicAPIs}
            disabled={loading}
            className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "⏳ Testing..." : "🌐 Test API Routes"}
          </button>

          <button
            onClick={createMockData}
            className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700"
          >
            📊 Create Mock Data
          </button>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(backendStatus).map(([service, result]) => (
            <div key={service} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{service}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    result.status === "success" || result.status === "running"
                      ? "bg-green-100 text-green-800"
                      : result.status === "warning"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.status === "running"
                    ? "🟢 Running"
                    : result.status === "success"
                    ? "✅ Success"
                    : result.status === "warning"
                    ? "⚠️ Warning"
                    : "❌ Error"}
                </span>
              </div>

              <p className="text-gray-600 mb-2">{result.message}</p>

              {result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  🔗 Open Swagger UI
                </a>
              )}

              {result.error && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <p className="text-red-700 text-sm">{result.error}</p>
                </div>
              )}

              {result.data && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 text-sm">
                    Data: {JSON.stringify(result.data).substring(0, 100)}...
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* MongoDB Troubleshooting */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            🚨 MongoDB Connection Issues - Giải pháp:
          </h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>
              <strong>1. Timeout errors:</strong> MongoDB Atlas có thể bị
              suspend do không sử dụng lâu
            </p>
            <p>
              <strong>2. Network issues:</strong> Firewall hoặc VPN có thể chặn
              MongoDB Atlas
            </p>
            <p>
              <strong>3. Connection string:</strong> Kiểm tra username/password
              trong appsettings.json
            </p>
            <p>
              <strong>4. Alternative:</strong> Sử dụng Mock Data button để test
              frontend mà không cần database
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            📋 Next Steps:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              1. <strong>Test Swagger:</strong> Đảm bảo tất cả services running
            </li>
            <li>
              2. <strong>Test API Routes:</strong> Kiểm tra API Gateway có route
              được không
            </li>
            <li>
              3. <strong>Create Mock Data:</strong> Nếu MongoDB lỗi, dùng mock
              data để test UI
            </li>
            <li>
              4. <strong>Check MongoDB Atlas:</strong> Login vào Atlas dashboard
              kiểm tra cluster status
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
