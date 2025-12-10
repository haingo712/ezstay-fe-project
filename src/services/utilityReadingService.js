// Utility Reading Service for managing electricity and water readings
import api from "@/utils/api";

// UtilityType enum: 0 = Water, 1 = Electric
const UtilityType = {
    Water: 0,
    Electric: 1
};

class UtilityReadingService {
    /**
     * Get all utility readings by contract ID
     * @param {string} contractId - Contract ID
     * @returns {Promise} List of utility readings
     */
    async getAllByContractId(contractId) {
        try {
            console.log('⚡ Fetching all utility readings for contract:', contractId);
            const response = await api.get(`/api/UtilityReading/all/${contractId}`);
            console.log('✅ Utility readings fetched:', response);
            return response;
        } catch (error) {
            console.error('❌ Error fetching utility readings:', error);
            throw error;
        }
    }

    /**
     * Get utility readings by contract ID and utility type
     * @param {string} contractId - Contract ID
     * @param {number} utilityType - 0 = Water, 1 = Electric
     * @returns {Promise} List of utility readings
     */
    async getByContractAndType(contractId, utilityType) {
        try {
            console.log(`⚡ Fetching ${utilityType === 1 ? 'electric' : 'water'} readings for contract:`, contractId);
            const response = await api.get(`/api/UtilityReading/${contractId}/utilitytype/${utilityType}`);
            console.log('✅ Utility readings fetched:', response);
            return response;
        } catch (error) {
            console.error('❌ Error fetching utility readings:', error);
            throw error;
        }
    }

    /**
     * Get first (initial) utility reading by contract and type
     * This is the reading added when contract is created - should not be edited/deleted
     * @param {string} contractId - Contract ID
     * @param {number} utilityType - 0 = Water, 1 = Electric
     * @returns {Promise} First utility reading
     */
    async getFirstReading(contractId, utilityType) {
        try {
            console.log(`⚡ Fetching first ${utilityType === 1 ? 'electric' : 'water'} reading for contract:`, contractId);
            const response = await api.get(`/api/UtilityReading/first/${contractId}/type/${utilityType}`);
            console.log('✅ First reading fetched:', response);
            return response;
        } catch (error) {
            console.error('❌ Error fetching first reading:', error);
            // Return null instead of throwing - first reading might not exist
            return null;
        }
    }

    /**
     * Get latest utility reading by contract and type
     * @param {string} contractId - Contract ID
     * @param {number} utilityType - 0 = Water, 1 = Electric
     * @returns {Promise} Latest utility reading
     */
    async getLatest(contractId, utilityType) {
        try {
            console.log(`⚡ Fetching latest ${utilityType === 1 ? 'electric' : 'water'} reading for contract:`, contractId);
            const response = await api.get(`/api/UtilityReading/latest/${contractId}/${utilityType}`);
            console.log('✅ Latest reading fetched:', response);
            return response;
        } catch (error) {
            console.error('❌ Error fetching latest reading:', error);
            throw error;
        }
    }

    /**
     * Get utility reading by ID
     * @param {string} id - Utility reading ID
     * @returns {Promise} Utility reading details
     */
    async getById(id) {
        try {
            console.log('⚡ Fetching utility reading:', id);
            const response = await api.get(`/api/UtilityReading/${id}`);
            console.log('✅ Utility reading fetched:', response);
            return response;
        } catch (error) {
            console.error('❌ Error fetching utility reading:', error);
            throw error;
        }
    }

    /**
     * Create new utility reading
     * @param {string} contractId - Contract ID
     * @param {number} utilityType - 0 = Water, 1 = Electric
     * @param {Object} data - { Price, Note, CurrentIndex }
     * @returns {Promise} Created utility reading
     */
    async create(contractId, utilityType, data) {
        try {
            console.log(`⚡ Creating ${utilityType === 1 ? 'electric' : 'water'} reading for contract:`, contractId);
            console.log('📝 Data:', data);

            const requestData = {
                Price: parseFloat(data.price) || 0,
                Note: data.note || null,
                CurrentIndex: parseFloat(data.currentIndex) || 0
            };

            const response = await api.post(`/api/UtilityReading/${contractId}/utilitytype/${utilityType}`, requestData);
            console.log('✅ Utility reading created:', response);
            return response;
        } catch (error) {
            console.error('❌ Error creating utility reading:', error);
            throw error;
        }
    }

    /**
     * Update utility reading
     * @param {string} id - Utility reading ID
     * @param {Object} data - { Price, Note, CurrentIndex }
     * @returns {Promise} Updated utility reading
     */
    async update(id, data) {
        try {
            console.log('⚡ Updating utility reading:', id);
            console.log('📝 Data:', data);

            const requestData = {
                Price: parseFloat(data.price) || 0,
                Note: data.note || null,
                CurrentIndex: parseFloat(data.currentIndex) || 0
            };

            const response = await api.put(`/api/UtilityReading/${id}`, requestData);
            console.log('✅ Utility reading updated:', response);
            return response;
        } catch (error) {
            console.error('❌ Error updating utility reading:', error);
            throw error;
        }
    }

    /**
     * Delete utility reading
     * @param {string} id - Utility reading ID
     * @returns {Promise} Delete result
     */
    async delete(id) {
        try {
            console.log('⚡ Deleting utility reading:', id);
            const response = await api.delete(`/api/UtilityReading/${id}`);
            console.log('✅ Utility reading deleted');
            return response;
        } catch (error) {
            console.error('❌ Error deleting utility reading:', error);
            throw error;
        }
    }

    /**
     * Get utility type label
     * @param {number|string} type - Utility type
     * @returns {Object} Label and styling info
     */
    getTypeLabel(type) {
        const typeValue = typeof type === 'string' ? type : type;

        if (type === 0 || type === 'Water') {
            return {
                label: 'Nước',
                labelEn: 'Water',
                icon: '💧',
                color: 'blue',
                bgColor: 'bg-blue-100',
                textColor: 'text-blue-800',
                borderColor: 'border-blue-300'
            };
        } else if (type === 1 || type === 'Electric') {
            return {
                label: 'Điện',
                labelEn: 'Electric',
                icon: '⚡',
                color: 'yellow',
                bgColor: 'bg-yellow-100',
                textColor: 'text-yellow-800',
                borderColor: 'border-yellow-300'
            };
        }

        return {
            label: 'Unknown',
            labelEn: 'Unknown',
            icon: '❓',
            color: 'gray',
            bgColor: 'bg-gray-100',
            textColor: 'text-gray-800',
            borderColor: 'border-gray-300'
        };
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
     * Format date
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

const utilityReadingService = new UtilityReadingService();
export { UtilityType };
export default utilityReadingService;
