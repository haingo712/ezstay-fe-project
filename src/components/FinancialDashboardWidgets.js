'use client';

import { useState, useEffect } from 'react';
import financialStatisticsService from '@/services/financialStatisticsService';
import { Banknote, TrendingUp, ArrowUp, ArrowDown, Loader } from 'lucide-react';
import Link from 'next/link';

export default function FinancialDashboardWidgets() {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWidgets();
  }, []);

  const loadWidgets = async () => {
    try {
      const data = await financialStatisticsService.getDashboardWidgets();
      setWidgets(data || []);
    } catch (error) {
      console.error('Error loading financial widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const getGradientClass = (color) => {
    const gradients = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      yellow: 'from-yellow-500 to-yellow-600',
      purple: 'from-purple-500 to-purple-600',
      red: 'from-red-500 to-red-600',
    };
    return gradients[color] || gradients.blue;
  };

  const getIconComponent = (iconName) => {
    const icons = {
      banknote: Banknote,
      'trending-up': TrendingUp,
    };
    return icons[iconName] || Banknote;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {widgets.map((widget, index) => {
        const Icon = getIconComponent(widget.icon);
        const gradientClass = getGradientClass(widget.color);
        
        return (
          <div
            key={index}
            className={`bg-gradient-to-br ${gradientClass} rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow`}
          >
            <div className="flex items-center justify-between mb-4">
              <Icon className="w-8 h-8 opacity-80" />
              {widget.changePercentage !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${
                  widget.changeDirection === 'up' ? 'opacity-90' : 
                  widget.changeDirection === 'down' ? 'opacity-75' : 'opacity-50'
                }`}>
                  {widget.changeDirection === 'up' && <ArrowUp className="w-4 h-4" />}
                  {widget.changeDirection === 'down' && <ArrowDown className="w-4 h-4" />}
                  {Math.abs(widget.changePercentage).toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-white/80 text-sm mb-2">{widget.title}</p>
            <p className="text-2xl font-bold">{widget.formattedValue}</p>
            {widget.changeDirection !== 'neutral' && (
              <p className="text-white/60 text-xs mt-2">
                {widget.changeDirection === 'up' ? '↗ Growing' : '↘ Declining'} from last period
              </p>
            )}
          </div>
        );
      })}
      
      {/* View Full Report Link */}
      <Link
        href="/admin/financial-reports-new"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col justify-center items-center text-center group"
      >
        <TrendingUp className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
        <p className="font-semibold text-gray-900 dark:text-white mb-1">
          View Full Report
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Detailed financial analytics →
        </p>
      </Link>
    </div>
  );
}
