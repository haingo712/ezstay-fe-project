'use client';

import { useState, useEffect } from 'react';
import paymentService from '@/services/paymentService';

export default function PaymentGatewaysPage() {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Fetch bank gateways from API
  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.getAllBankGateways({
        $orderby: 'createdAt desc'
      });

      // Handle OData response format
      const gatewayData = response.value || response;
      setGateways(gatewayData);
    } catch (err) {
      console.error('Error fetching gateways:', err);
      setError('Không thể tải danh sách ngân hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncGateways = async () => {
    try {
      setSyncing(true);
      await paymentService.syncBankGateways();
      await fetchGateways(); // Refresh list after sync
      alert('Đồng bộ ngân hàng thành công!');
    } catch (err) {
      console.error('Error syncing gateways:', err);
      alert('Không thể đồng bộ ngân hàng. Vui lòng thử lại.');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleGateway = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await paymentService.toggleBankGateway(id, newStatus);

      // Update local state
      setGateways(gateways.map(g =>
        g.id === id ? { ...g, isActive: newStatus } : g
      ));

      alert(`${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} ngân hàng thành công!`);
    } catch (err) {
      console.error('Error toggling gateway:', err);
      alert('Không thể cập nhật trạng thái. Vui lòng thử lại.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải danh sách ngân hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchGateways}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            💳 Quản lý Cổng Thanh Toán
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý cấu hình cổng thanh toán ngân hàng
          </p>
        </div>
        <button
          onClick={handleSyncGateways}
          disabled={syncing}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 flex items-center gap-2"
        >
          {syncing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang đồng bộ...
            </>
          ) : (
            <>
              🔄 Đồng bộ từ VietQR
            </>
          )}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm">Ngân hàng hoạt động</p>
          <p className="text-3xl font-bold mt-2">
            {gateways.filter(g => g.isActive).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm">Tổng số ngân hàng</p>
          <p className="text-3xl font-bold mt-2">
            {gateways.length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-purple-100 text-sm">Ngân hàng vô hiệu</p>
          <p className="text-3xl font-bold mt-2">
            {gateways.filter(g => !g.isActive).length}
          </p>
        </div>
      </div>

      {/* Gateway List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gateways.map((gateway) => (
          <div key={gateway.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center flex-1">
                {gateway.logo ? (
                  <img
                    src={gateway.logo}
                    alt={gateway.bankName}
                    className="w-12 h-12 rounded-lg object-contain bg-white mr-4"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><text y="32" font-size="32">🏦</text></svg>';
                    }}
                  />
                ) : (
                  <div className="text-4xl mr-4">🏦</div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {gateway.bankName}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {gateway.fullName}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${gateway.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                {gateway.isActive ? '● Hoạt động' : '○ Vô hiệu'}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Ngày tạo</p>
                  <p className="text-gray-900 dark:text-white font-medium mt-1">
                    {new Date(gateway.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Cập nhật</p>
                  <p className="text-gray-900 dark:text-white font-medium mt-1">
                    {gateway.updatedAt
                      ? new Date(gateway.updatedAt).toLocaleDateString('vi-VN')
                      : 'Chưa cập nhật'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => handleToggleGateway(gateway.id, gateway.isActive)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${gateway.isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                  }`}
              >
                {gateway.isActive ? '🚫 Vô hiệu hóa' : '✅ Kích hoạt'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {gateways.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 border-2 border-dashed border-gray-300 dark:border-gray-700">
          <div className="text-center">
            <div className="text-6xl mb-4">🏦</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Chưa có ngân hàng nào
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Nhấn nút "Đồng bộ từ VietQR" ở trên để tải danh sách ngân hàng Việt Nam
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
