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
     * Get deposit bill for a contract
     * @param {string} contractId - Contract ID
     * @returns {Promise} Deposit bill or null
     */
    async getDepositBillByContractId(contractId) {
        try {
            console.log('💰 Fetching deposit bill for contract:', contractId);
            
            // Try to get all tenant bills first, then filter client-side
            // This is more reliable than OData filter which can be finicky with GUIDs
            const response = await apiFetch(`/api/UtilityBills/tenant`, {
                method: 'GET',
            });
            
            const bills = response?.value || response || [];
            console.log('✅ All tenant bills:', bills);
            
            // Filter by contractId and BillType = Deposit (2)
            const depositBill = bills.find(b => {
                const billContractId = (b.contractId || b.ContractId || '').toLowerCase();
                const targetContractId = contractId.toLowerCase();
                const billType = b.billType || b.BillType;
                const status = b.status || b.Status;
                
                return billContractId === targetContractId && 
                       (billType === 2 || billType === 'Deposit') && 
                       status !== 'Cancelled';
            });
            
            console.log('✅ Deposit bill for contract:', contractId, depositBill);
            return depositBill || null;
        } catch (error) {
            console.error('❌ Error fetching deposit bill:', error);
            return null;
        }
    }

    /**
     * Create deposit bill for a contract (Owner only)
     * @param {string} contractId - Contract ID
     * @returns {Promise} Created deposit bill
     */
    async createDepositBill(contractId) {
        try {
            console.log('💰 Creating deposit bill for contract:', contractId);
            
            const response = await apiFetch(`/api/UtilityBills/deposit/${contractId}`, {
                method: 'POST',
            });
            
            console.log('✅ Deposit bill created:', response);
            return response;
        } catch (error) {
            console.error('❌ Error creating deposit bill:', error);
            throw error;
        }
    }

    /**
     * Get deposit bill for a contract (Owner version - uses owner endpoint)
     * @param {string} contractId - Contract ID
     * @returns {Promise} Deposit bill or null
     */
    async getDepositBillByContractIdForOwner(contractId) {
        try {
            console.log('💰 Fetching deposit bill for contract (owner):', contractId);
            
            // Use owner endpoint
            const response = await apiFetch(`/api/UtilityBills/owner`, {
                method: 'GET',
            });
            
            const bills = response?.value || response || [];
            console.log('✅ All owner bills:', bills);
            
            // Filter by contractId and BillType = Deposit (2)
            const depositBill = bills.find(b => {
                const billContractId = (b.contractId || b.ContractId || '').toLowerCase();
                const targetContractId = contractId.toLowerCase();
                const billType = b.billType || b.BillType;
                const status = b.status || b.Status;
                
                return billContractId === targetContractId && 
                       (billType === 2 || billType === 'Deposit') && 
                       status !== 'Cancelled';
            });
            
            console.log('✅ Deposit bill for contract:', contractId, depositBill);
            return depositBill || null;
        } catch (error) {
            console.error('❌ Error fetching deposit bill (owner):', error);
            return null;
        }
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
