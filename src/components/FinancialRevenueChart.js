'use client';

import { useState, useEffect } from 'react';
import financialStatisticsService from '@/services/financialStatisticsService';
import { TrendingUp, TrendingDown, DollarSign, Loader, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function FinancialRevenueChart({ months = 6 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [months]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await financialStatisticsService.getMonthlyRevenue(months);
      setData(result || []);
    } catch (err) {
      console.error('Error loading revenue data:', err);
      setError('Unable to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value?.toLocaleString('vi-VN') || '0';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <AlertCircle className="w-12 h-12 mb-3 text-yellow-500" />
          <p>{error}</p>
          <button
            onClick={loadData}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <DollarSign className="w-12 h-12 mb-3 opacity-50" />
          <p>Chưa có dữ liệu doanh thu</p>
        </div>
      </div>
    );
  }

  // Calculate max value for scaling
  const maxValue = Math.max(...data.map(d => d.revenue || d.totalRevenue || 0));
  
  // Calculate total and average
  const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || d.totalRevenue || 0), 0);
  const avgRevenue = totalRevenue / data.length;

  // Calculate growth rate (last month vs previous)
  const lastMonth = data[data.length - 1]?.revenue || data[data.length - 1]?.totalRevenue || 0;
  const prevMonth = data[data.length - 2]?.revenue || data[data.length - 2]?.totalRevenue || 0;
  const growthRate = prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Biểu đồ Doanh thu
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Doanh thu {months} tháng gần nhất
            </p>
          </div>
          <Link
            href="/admin/financial-reports"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
          >
            Xem chi tiết →
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tổng doanh thu</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalRevenue)}đ</p>
        </div>
        <div className="text-center border-x border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trung bình/tháng</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(avgRevenue)}đ</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tăng trưởng</p>
          <p className={`text-lg font-bold flex items-center justify-center gap-1 ${
            growthRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {growthRate >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(growthRate).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="relative h-64">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 pr-2 text-right">
            <span>{formatCurrency(maxValue)}</span>
            <span>{formatCurrency(maxValue * 0.75)}</span>
            <span>{formatCurrency(maxValue * 0.5)}</span>
            <span>{formatCurrency(maxValue * 0.25)}</span>
            <span>0</span>
          </div>

          {/* Grid lines */}
          <div className="absolute left-16 right-0 top-0 bottom-8">
            <div className="h-full relative">
              {[0, 25, 50, 75, 100].map((percent) => (
                <div
                  key={percent}
                  className="absolute w-full border-t border-gray-100 dark:border-gray-700"
                  style={{ top: `${percent}%` }}
                />
              ))}
            </div>
          </div>

          {/* Bars */}
          <div className="absolute left-16 right-0 top-0 bottom-8 flex items-end justify-around gap-2 px-2">
            {data.map((item, index) => {
              const revenue = item.revenue || item.totalRevenue || 0;
              const height = maxValue > 0 ? (revenue / maxValue) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  {/* Tooltip */}
                  <div className="relative w-full">
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                      <p className="font-semibold">{item.monthName || item.month}</p>
                      <p className="text-green-400">{(revenue).toLocaleString('vi-VN')}đ</p>
                      {item.contractCount && (
                        <p className="text-gray-400">{item.contractCount} hợp đồng</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 dark:from-indigo-500 dark:to-indigo-300 rounded-t-lg transition-all duration-500 hover:from-indigo-700 hover:to-indigo-500 cursor-pointer min-h-[4px]"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div className="absolute left-16 right-0 bottom-0 h-8 flex justify-around px-2">
            {data.map((item, index) => (
              <div key={index} className="flex-1 text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.monthName?.substring(0, 3) || item.month?.substring(0, 3) || `T${index + 1}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
