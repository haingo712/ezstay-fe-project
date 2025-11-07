// Payment Service for Bank Gateway Management
import { apiFetch } from "@/utils/api";

class PaymentService {
    /**
     * Get all bank gateways with OData support
     * @param {Object} odataParams - OData query parameters ($filter, $orderby, $top, $skip)
     * @returns {Promise} List of bank gateways
     */
    async getAllBankGateways(odataParams = {}) {
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
            const endpoint = queryString ? `/api/BankGateway?${queryString}` : '/api/BankGateway';

            console.log('🏦 Fetching bank gateways from:', endpoint);

            const response = await apiFetch(endpoint, {
                method: 'GET',
            });

            console.log('✅ Bank gateways fetched:', response);
            return response;
        } catch (error) {
            console.error('❌ Error fetching bank gateways:', error);
            throw error;
        }
    }

    /**
     * Sync bank gateways from VietQR API
     * @returns {Promise} Synced bank gateways
     */
    async syncBankGateways() {
        try {
            console.log('🔄 Syncing bank gateways from VietQR...');

            const response = await apiFetch('/api/BankGateway/sync', {
                method: 'POST',
            });

            console.log('✅ Bank gateways synced:', response);
            return response;
        } catch (error) {
            console.error('❌ Error syncing bank gateways:', error);
            throw error;
        }
    }

    /**
     * Toggle bank gateway active status (Admin only)
     * @param {string} id - Bank gateway ID
     * @param {boolean} isActive - New active status
     * @returns {Promise} Update result
     */
    async toggleBankGateway(id, isActive) {
        try {
            console.log(`🔧 Toggling bank gateway ${id} to ${isActive ? 'active' : 'inactive'}`);

            const response = await apiFetch(`/api/BankGateway/${id}?isActive=${isActive}`, {
                method: 'PUT',
            });

            console.log('✅ Bank gateway toggled:', response);
            return response;
        } catch (error) {
            console.error('❌ Error toggling bank gateway:', error);
            throw error;
        }
    }

    // ========== Bank Account Management ==========

    /**
     * Get bank account by ID
     * @param {string} id - Bank account ID
     * @returns {Promise} Bank account details
     */
    async getBankAccountById(id) {
        try {
            console.log('🏦 Fetching bank account:', id);

            const response = await apiFetch(`/api/BankAccount?id=${id}`, {
                method: 'GET',
            });

            console.log('✅ Bank account fetched:', response);
            return response;
        } catch (error) {
            console.error('❌ Error fetching bank account:', error);
            throw error;
        }
    }

    /**
     * Create bank account (Owner/Admin only)
     * @param {Object} bankAccountData - Bank account data
     * @returns {Promise} Created bank account
     */
    async createBankAccount(bankAccountData) {
        try {
            console.log('💳 Creating bank account:', bankAccountData);

            const response = await apiFetch('/api/BankAccount/bank-account', {
                method: 'POST',
                body: JSON.stringify(bankAccountData),
            });

            console.log('✅ Bank account created:', response);
            return response;
        } catch (error) {
            console.error('❌ Error creating bank account:', error);
            throw error;
        }
    }

    /**
     * Update bank account (Owner/Admin only)
     * @param {string} id - Bank account ID
     * @param {Object} bankAccountData - Updated bank account data
     * @returns {Promise} Update result
     */
    async updateBankAccount(id, bankAccountData) {
        try {
            console.log(`🔧 Updating bank account ${id}:`, bankAccountData);

            const response = await apiFetch(`/api/BankAccount/bank-account/${id}`, {
                method: 'PUT',
                body: JSON.stringify(bankAccountData),
            });

            console.log('✅ Bank account updated:', response);
            return response;
        } catch (error) {
            console.error('❌ Error updating bank account:', error);
            throw error;
        }
    }

    /**
     * Get transactions
     * @returns {Promise} List of transactions
     */
    async getTransactions() {
        try {
            console.log('💰 Fetching transactions...');

            const response = await apiFetch('/api/BankAccount/transactions', {
                method: 'GET',
            });

            console.log('✅ Transactions fetched:', response);
            return response;
        } catch (error) {
            console.error('❌ Error fetching transactions:', error);
            throw error;
        }
    }
}

const paymentService = new PaymentService();
export default paymentService;
