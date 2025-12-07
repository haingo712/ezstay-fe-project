// Vietnam Address Service - Using API Gateway
// Routes to external API via Gateway: production.cas.so

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:7001';

class VietnamAddressService {
  constructor() {
    this.cachedProvinces = null;
    this.cachedWards = {}; // Cache wards by province code
  }

  /**
   * Get all provinces from API
   * @returns {Promise<Object>} Response with provinces array
   */
  async getAllProvinces() {
    if (this.cachedProvinces) {
      return this.cachedProvinces;
    }

    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/provinces`);
      if (!response.ok) {
        throw new Error('Failed to load provinces from API');
      }
      const data = await response.json();
      this.cachedProvinces = data;
      return data;
    } catch (error) {
      console.error('❌ Error loading provinces from API:', error);
      throw error;
    }
  }

  /**
   * Get wards/communes by province code from API
   * @param {string|number} provinceCode - Province code (will be used as-is from API)
   * @returns {Promise<Object>} Response with communes array
   */
  async getWardsByProvince(provinceCode) {
    // Use the code as-is (don't convert) to match API format
    const codeStr = String(provinceCode);

    // Check cache first
    if (this.cachedWards[codeStr]) {
      return this.cachedWards[codeStr];
    }

    try {
      console.log(`📡 Fetching communes for province code: "${codeStr}"`);
      const response = await fetch(`${API_GATEWAY_URL}/api/provinces/${codeStr}/communes`);

      console.log(`📊 API Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error (${response.status}):`, errorText);
        throw new Error(`Failed to load communes for province ${codeStr}: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Loaded communes data:`, data);
      this.cachedWards[codeStr] = data;
      return data;
    } catch (error) {
      console.error(`❌ Error loading communes for province ${codeStr}:`, error);
      throw error;
    }
  }

  /**
   * Search provinces by name (using cached data from API)
   * @param {string} search - Search term
   * @returns {Promise<Array>} Array of provinces
   */
  async searchProvinces(search = '') {
    try {
      const response = await this.getAllProvinces();
      const provinces = response.provinces || response || [];

      if (!search) return provinces;

      return provinces.filter(province =>
        province.name?.toLowerCase().includes(search.toLowerCase())
      );
    } catch (error) {
      console.error('❌ Error searching provinces:', error);
      throw error;
    }
  }

  /**
   * Get formatted address options for UI dropdowns
   * @returns {Promise<Object>} Formatted address options
   */
  async getAddressOptions() {
    try {
      const response = await this.getAllProvinces();
      const provinces = response.provinces || response || [];

      return {
        provinces: provinces.map(p => ({
          value: p.code,
          label: p.name,
          code: p.code,
          name: p.name
        }))
      };
    } catch (error) {
      console.error('❌ Error getting address options:', error);
      throw error;
    }
  }

  /**
   * Search wards/communes (using cached data from API)
   * @param {string} search - Search term
   * @param {string} provinceCode - Province code filter
   * @returns {Promise<Array>} Array of wards
   */
  async searchWards(search = '', provinceCode = null) {
    try {
      if (!provinceCode) {
        return [];
      }

      const response = await this.getWardsByProvince(provinceCode);
      let wards = response.communes || response || [];

      // Filter by search term if provided
      if (search) {
        wards = wards.filter(ward =>
          ward.name?.toLowerCase().includes(search.toLowerCase())
        );
      }

      return wards;
    } catch (error) {
      console.error('❌ Error searching wards:', error);
      throw error;
    }
  }

  /**
   * Get full address string
   * @param {Object} addressData - Address data object
   * @returns {string} Formatted full address
   */
  getFullAddress(addressData) {
    const { address, wardName, provinceName } = addressData;
    return [address, wardName, provinceName]
      .filter(Boolean)
      .join(', ');
  }

  /**
   * Validate address data
   * @param {Object} addressData - Address data to validate
   * @returns {Object} Validation result
   */
  validateAddress(addressData) {
    const errors = {};

    if (!addressData.provinceCode || !addressData.provinceName) {
      errors.province = 'Province is required';
    }

    if (!addressData.wardCode || !addressData.wardName) {
      errors.ward = 'Ward is required';
    }

    if (!addressData.address?.trim()) {
      errors.address = 'Detailed address is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Export singleton instance
const vietnamAddressService = new VietnamAddressService();
export default vietnamAddressService;
