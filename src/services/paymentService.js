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
            // Use external payment API instead of local backend
            const externalApiUrl = 'https://payment-api-r4zy.onrender.com/api/Bank/gateway';
            
            console.log('🏦 Fetching bank gateways from external API:', externalApiUrl);

            // Direct fetch to external API (not using apiFetch which adds local API gateway URL)
            const response = await fetch(externalApiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Bank gateways fetched from external API:', data);
            
            // Return data in expected format (check if it's wrapped or direct array)
            return data.data || data;
        } catch (error) {
            console.error('❌ Error fetching bank gateways:', error);
            throw error;
        }
    }

    /**
     * Get only active bank gateways
     * Uses external API and filters for active banks
     * @returns {Promise} List of active bank gateways
     */
    async getActiveBankGateways() {
        try {
            console.log('🏦 Fetching active bank gateways...');

            // Get all banks from external API
            const allBanks = await this.getAllBankGateways();
            
            // Filter for active banks only
            const activeBanks = Array.isArray(allBanks) 
                ? allBanks.filter(bank => bank.isActive === true)
                : [];

            console.log(`✅ Found ${activeBanks.length} active bank gateways out of ${allBanks.length} total`);
            return activeBanks;
        } catch (error) {
            console.error('❌ Error fetching active bank gateways:', error);
            // Return empty array on error to avoid breaking the UI
            return [];
        }
    }

    /**
     * Sync bank gateways from VietQR API
     * Note: External API does not support sync endpoint
     * This method now just refetches the data
     * @returns {Promise} Synced bank gateways
     */
    async syncBankGateways() {
        try {
            console.log('🔄 Syncing bank gateways (refetching from external API)...');

            // External API doesn't have sync endpoint, just refetch the data
            const response = await this.getAllBankGateways();

            console.log('✅ Bank gateways refreshed:', response);
            return response;
        } catch (error) {
            console.error('❌ Error syncing bank gateways:', error);
            throw error;
        }
    }

    /**
     * Toggle bank gateway active status (Admin only)
     * Note: External API is read-only, toggle functionality disabled
     * @param {string} id - Bank gateway ID
     * @param {boolean} isActive - New active status
     * @returns {Promise} Update result
     */
    async toggleBankGateway(id, isActive) {
        try {
            console.log(`🔧 Toggling bank gateway ${id} to ${isActive ? 'active' : 'inactive'}`);
            console.warn('⚠️ External API is read-only. Toggle functionality is not available.');

            // External API doesn't support PUT/PATCH operations
            // Return mock success for UI purposes
            throw new Error('External API does not support toggling bank status. This is a read-only data source.');
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
