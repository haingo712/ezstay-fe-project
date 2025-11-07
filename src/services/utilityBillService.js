// Utility Bill Service for Guest Users
import { apiFetch } from "@/utils/api";

class UtilityBillService {
    /**
     * Get utility bills for tenant (Guest User)
     * @param {Object} odataParams - OData query parameters ($filter, $orderby, $top, $skip)
     * @returns {Promise} List of utility bills
     */
    async getTenantBills(odataParams = {}) {
        try {
            // Build OData query string
            const queryParams = new URLSearchParams();

            if (odataParams.$filter) {
                queryParams.append('$filter', odataParams.$filter);
            }
            if (odataParams.$orderby) {
                queryParams.append('$orderby', odataParams.$orderby);
            }
            if (odataParams.$top) {
                queryParams.append('$top', odataParams.$top);
            }
            if (odataParams.$skip) {
                queryParams.append('$skip', odataParams.$skip);
            }
            if (odataParams.$count !== undefined) {
                queryParams.append('$count', odataParams.$count);
            }

            const queryString = queryParams.toString();
            const endpoint = queryString ? `/api/UtilityBills/tenant?${queryString}` : '/api/UtilityBills/tenant';

            console.log('💰 Fetching tenant bills from:', endpoint);

            const response = await apiFetch(endpoint, {
                method: 'GET',
            });

            console.log('✅ Tenant bills fetched:', response);
            return response;
        } catch (error) {
            console.error('❌ Error fetching tenant bills:', error);
            throw error;
        }
    }

    /**
     * Get bill by ID
     * @param {string} billId - Bill ID
     * @returns {Promise} Bill details
     */
    async getBillById(billId) {
        try {
            console.log('💰 Fetching bill:', billId);

            const response = await apiFetch(`/api/UtilityBills/${billId}`, {
                method: 'GET',
            });

            console.log('✅ Bill fetched:', response);
            return response;
        } catch (error) {
            console.error('❌ Error fetching bill:', error);
            throw error;
        }
    }

    /**
     * Mark bill as paid
     * @param {string} billId - Bill ID
     * @param {string} paymentMethod - Payment method (Online/Offline)
     * @returns {Promise} Update result
     */
    async markBillAsPaid(billId, paymentMethod) {
        try {
            console.log(`💳 Marking bill ${billId} as paid with method ${paymentMethod}`);

            const response = await apiFetch(`/api/UtilityBills/${billId}/pay`, {
                method: 'PUT',
                body: JSON.stringify({ paymentMethod }),
            });

            console.log('✅ Bill marked as paid:', response);
            return response;
        } catch (error) {
            console.error('❌ Error marking bill as paid:', error);
            throw error;
        }
    }

    /**
     * Get utility bill status label
     * @param {string} status - Bill status enum value
     * @returns {Object} Label and color for status
     */
    getStatusLabel(status) {
        const statusMap = {
            'Unpaid': { label: 'Chưa thanh toán', color: 'warning', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
            'Paid': { label: 'Đã thanh toán', color: 'success', bgColor: 'bg-green-100', textColor: 'text-green-800' },
            'Overdue': { label: 'Quá hạn', color: 'error', bgColor: 'bg-red-100', textColor: 'text-red-800' },
            'Cancelled': { label: 'Đã hủy', color: 'default', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
        };

        return statusMap[status] || { label: status, color: 'default', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }

    /**
     * Format currency to VND
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    /**
     * Format date to Vietnamese format
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date
     */
    formatDate(date) {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

const utilityBillService = new UtilityBillService();
export default utilityBillService;
