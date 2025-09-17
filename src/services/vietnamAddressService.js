// Vietnam Address Service - Using Local Data
// Data source: vietnam_provinces package with local JSON file

class VietnamAddressService {
  constructor() {
    this.dataUrl = '/data/vietnam-provinces.json';
    this.cachedData = null;
  }

  /**
   * Load data from local JSON file
   * @returns {Promise<Array>} Array of provinces with nested wards
   */
  async loadData() {
    if (this.cachedData) {
      return this.cachedData;
    }

    try {
      const response = await fetch(this.dataUrl);
      if (!response.ok) {
        throw new Error('Failed to load Vietnam provinces data');
      }
      this.cachedData = await response.json();
      return this.cachedData;
    } catch (error) {
      console.error('❌ Error loading Vietnam provinces data:', error);
      throw error;
    }
  }

  /**
   * Get all provinces
   * @returns {Promise<Array>} Array of provinces
   */
  async getAllProvinces() {
    try {
      const data = await this.loadData();
      return data.map(province => ({
        code: province.code,
        name: province.name,
        codename: province.codename,
        division_type: province.division_type,
        phone_code: province.phone_code
      }));
    } catch (error) {
      console.error('❌ Error fetching provinces:', error);
      throw error;
    }
  }

  /**
   * Search provinces by name
   * @param {string} search - Search term
   * @returns {Promise<Array>} Array of provinces
   */
  async searchProvinces(search = '') {
    try {
      const provinces = await this.getAllProvinces();
      
      if (!search) return provinces;
      
      return provinces.filter(province => 
        province.name.toLowerCase().includes(search.toLowerCase()) ||
        province.codename.toLowerCase().includes(search.toLowerCase())
      );
    } catch (error) {
      console.error('❌ Error searching provinces:', error);
      throw error;
    }
  }

  /**
   * Get province by code with wards
   * @param {number} code - Province code
   * @returns {Promise<Object>} Province data with wards
   */
  async getProvinceByCode(code) {
    try {
      const data = await this.loadData();
      const province = data.find(p => p.code === parseInt(code));
      
      if (!province) {
        throw new Error(`Province with code ${code} not found`);
      }
      
      return province;
    } catch (error) {
      console.error(`❌ Error fetching province ${code}:`, error);
      throw error;
    }
  }

  /**
   * Get wards by province code
   * @param {number} provinceCode - Province code
   * @returns {Promise<Array>} Array of wards
   */
  async getWardsByProvince(provinceCode) {
    try {
      const province = await this.getProvinceByCode(provinceCode);
      
      return (province.wards || []).map(ward => ({
        code: ward.code,
        name: ward.name,
        codename: ward.codename,
        division_type: ward.division_type,
        short_codename: ward.short_codename
      }));
    } catch (error) {
      console.error(`❌ Error fetching wards for province ${provinceCode}:`, error);
      throw error;
    }
  }

  /**
   * Get formatted address options for UI dropdowns
   * @returns {Promise<Object>} Formatted address options
   */
  async getAddressOptions() {
    try {
      const provinces = await this.searchProvinces();
      
      return {
        provinces: provinces.map(p => ({
          value: p.code,
          label: p.name,
          codename: p.codename,
          division_type: p.division_type,
          phone_code: p.phone_code
        }))
      };
    } catch (error) {
      console.error('❌ Error getting address options:', error);
      throw error;
    }
  }

  /**
   * Search wards across all provinces
   * @param {string} search - Search term
   * @param {number} provinceCode - Optional province filter
   * @returns {Promise<Array>} Array of wards
   */
  async searchWards(search = '', provinceCode = null) {
    try {
      const data = await this.loadData();
      let allWards = [];

      // Filter by province if specified
      const provincesToSearch = provinceCode 
        ? data.filter(p => p.code === parseInt(provinceCode))
        : data;

      // Collect all wards
      provincesToSearch.forEach(province => {
        if (province.wards) {
          province.wards.forEach(ward => {
            allWards.push({
              ...ward,
              province_code: province.code,
              province_name: province.name
            });
          });
        }
      });

      // Filter by search term if provided
      if (search) {
        allWards = allWards.filter(ward =>
          ward.name.toLowerCase().includes(search.toLowerCase()) ||
          ward.codename.toLowerCase().includes(search.toLowerCase())
        );
      }

      return allWards;
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
