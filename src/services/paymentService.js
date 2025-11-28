// Payment Service for Bank Gateway Management
import { apiFetch } from "@/utils/api";

// Helper function to get auth token
const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('authToken') ||
            localStorage.getItem('ezstay_token') ||
            localStorage.getItem('token');
    }
    return null;
};

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
     * @param {string} id - Bank gateway ID
     * @param {boolean} isActive - New active status
     * @returns {Promise} Update result
     */
    async toggleBankGateway(id, isActive) {
        try {
            console.log(`🔧 Toggling bank gateway ${id} to ${isActive ? 'active' : 'inactive'}`);

            const externalApiUrl = `https://payment-api-r4zy.onrender.com/api/Bank/gateway/${id}?isActive=${isActive}`;

            console.log('🏦 Calling toggle API:', externalApiUrl);

            const response = await fetch(externalApiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Bank gateway toggled successfully:', data);
            return data;
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

            const externalApiUrl = 'https://payment-api-r4zy.onrender.com/api/Bank/bank-account';
            const token = getAuthToken();

            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(externalApiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(bankAccountData),
            });

            if (!response.ok) {
                // Backend returns error message as plain text or JSON
                const errorText = await response.text();
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorJson.Message || errorJson || errorMessage;
                } catch {
                    // If not JSON, use plain text
                    if (errorText) errorMessage = errorText;
                }
                console.error('❌ Create bank account error:', errorMessage);
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ Bank account created:', data);
            return data;
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

            const externalApiUrl = `https://payment-api-r4zy.onrender.com/api/Bank/bank-account/${id}`;
            const token = getAuthToken();

            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(externalApiUrl, {
                method: 'PUT',
                headers,
                body: JSON.stringify(bankAccountData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log('❌ Error response text (raw):', errorText);
                let errorMessage = `HTTP error! status: ${response.status}`;

                if (errorText) {
                    try {
                        const errorJson = JSON.parse(errorText);
                        console.log('❌ Error JSON (full):', JSON.stringify(errorJson, null, 2));

                        // Handle ApiResponse format from backend: { success: false, message: "..." }
                        if (errorJson.success === false && errorJson.message) {
                            errorMessage = errorJson.message;
                        }
                        // Handle wrapped data format: { data: { message: "..." } }
                        else if (errorJson.data && errorJson.data.message) {
                            errorMessage = errorJson.data.message;
                        }
                        // Handle Problem Details format (RFC 7807) with errors object
                        else if (errorJson.errors) {
                            const firstErrorKey = Object.keys(errorJson.errors)[0];
                            if (firstErrorKey && Array.isArray(errorJson.errors[firstErrorKey])) {
                                errorMessage = errorJson.errors[firstErrorKey][0];
                            } else if (firstErrorKey) {
                                errorMessage = errorJson.errors[firstErrorKey];
                            }
                        }
                        // Try other common error message fields
                        else {
                            errorMessage = errorJson.message
                                || errorJson.Message
                                || errorJson.detail
                                || errorJson.Detail
                                || errorJson.error
                                || errorJson.Error
                                || (errorJson.title && errorJson.title !== 'Bad Request' && errorJson.title !== 'One or more validation errors occurred.' ? errorJson.title : null)
                                || (typeof errorJson === 'string' ? errorJson : null)
                                || errorMessage;
                        }
                    } catch {
                        // If not JSON, use plain text directly
                        errorMessage = errorText;
                    }
                }

                // Provide user-friendly message for common 400 errors
                // Backend returns plain text message like "Bank account already exists"
                if (response.status === 400 && errorMessage === `HTTP error! status: 400`) {
                    errorMessage = 'Bank account already exists';
                }

                console.error('❌ Parsed error message:', errorMessage);
                throw new Error(errorMessage);
            }

            // Handle empty or non-JSON response
            const text = await response.text();
            if (!text) {
                console.log('✅ Bank account updated (empty response)');
                return { success: true };
            }
            try {
                const data = JSON.parse(text);
                console.log('✅ Bank account updated:', data);
                return data;
            } catch {
                console.log('✅ Bank account updated:', text);
                return { success: true, message: text };
            }
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
