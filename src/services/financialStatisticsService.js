import { apiFetch } from '@/utils/api';

const financialStatisticsService = {
  /**
   * Get financial overview for specified period
   * @param {string} period - Period type: 'month', 'quarter', 'year'
   * @returns {Promise<Object>} Financial overview data
   */
  getOverview: async (period = 'month') => {
    return await apiFetch(`/api/FinancialStatistics/overview?period=${period}`);
  },

  /**
   * Get monthly revenue data for charts
   * @param {number} months - Number of months to retrieve (default: 12)
   * @returns {Promise<Array>} Monthly revenue data
   */
  getMonthlyRevenue: async (months = 12) => {
    return await apiFetch(`/api/FinancialStatistics/monthly-revenue?months=${months}`);
  },

  /**
   * Get top owners by revenue
   * @param {number} topCount - Number of top owners (default: 10)
   * @returns {Promise<Array>} Owner rankings
   */
  getOwnerRankings: async (topCount = 10) => {
    return await apiFetch(`/api/FinancialStatistics/owner-rankings?topCount=${topCount}`);
  },

  /**
   * Get recent contracts with revenue details
   * @param {number} count - Number of contracts (default: 20)
   * @returns {Promise<Array>} Recent contracts
   */
  getRecentContracts: async (count = 20) => {
    return await apiFetch(`/api/FinancialStatistics/recent-contracts?count=${count}`);
  },

  /**
   * Get dashboard widgets data
   * @returns {Promise<Array>} Dashboard widgets
   */
  getDashboardWidgets: async () => {
    return await apiFetch('/api/FinancialStatistics/dashboard-widgets');
  }
};

export default financialStatisticsService;
