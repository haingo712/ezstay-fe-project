import api from '../utils/api';

const utilityService = {
  // Utility Rate Management
  async getUtilityRatesByOwnerId(ownerId) {
    try {
      console.log('🔄 Fetching utility rates for owner:', ownerId);
      
      // Use authenticated endpoint according to backend
      const rates = await api.get('/api/UtilityRate/ByOwnerId');
      console.log('✅ Utility rates fetched:', rates);
      return rates;
    } catch (error) {
      console.error('❌ Error fetching utility rates:', error);
      if (error.response?.status === 404) {
        console.log('📭 No utility rates found for owner');
        return [];
      }
      throw error;
    }
  },

  async createUtilityRate(rateData) {
    try {
      console.log('🔄 Creating utility rate:', rateData);
      
      // Convert from frontend format to backend DTO format
      const backendData = {
        Type: parseInt(rateData.utilityType), // Both UtilityReading and UtilityRate APIs now use same enum (Water=0, Electric=1)
        To: 999999, // Default max usage - can be made configurable
        Price: parseFloat(rateData.unitPrice)
      };
      
      console.log('📊 Converted rate data for backend:', backendData);
      
      const result = await api.post('/api/UtilityRate', backendData);
      console.log('✅ Utility rate created:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating utility rate:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Both APIs now use the same UtilityType enum (Water=0, Electric=1)
  convertUtilityTypeToRateAPI(readingType) {
    // No conversion needed - same enum for both APIs
    return parseInt(readingType);
  },

  convertUtilityTypeFromRateAPI(rateType) {
    // No conversion needed - same enum for both APIs  
    return parseInt(rateType);
  },

  // Handle response that can be either number or string
  getUtilityTypeFromResponse(type) {
    // If it's already a number, return it
    if (typeof type === 'number') {
      return type;
    }
    
    // If it's a string, convert to number based on enum
    if (typeof type === 'string') {
      const lowerType = type.toLowerCase();
      switch (lowerType) {
        case 'water': return 0;
        case 'electric': return 1;
        default: return parseInt(type) || 0; // Try parsing as number, fallback to 0
      }
    }
    
    // Fallback
    return parseInt(type) || 0;
  },

  async updateUtilityRate(rateId, rateData) {
    try {
      const result = await api.put(`/api/UtilityRate/${rateId}`, rateData);
      return result;
    } catch (error) {
      console.error('Error updating utility rate:', error);
      throw error;
    }
  },

  async deleteUtilityRate(rateId) {
    try {
      await api.delete(`/api/UtilityRate/${rateId}`);
      return true;
    } catch (error) {
      console.error('Error deleting utility rate:', error);
      throw error;
    }
  },

  // Utility Reading Management
  async getUtilityReadingsByRoomId(roomId, utilityType = null) {
    try {
      console.log('🔄 Fetching utility readings for room:', roomId, 'type:', utilityType);
      
      // If specific utility type is requested
      if (utilityType !== null) {
        const url = `/odata/${roomId}?utilityType=${utilityType}`;
        const readings = await api.get(url);
        console.log('✅ Utility readings fetched via OData (specific type):', readings);
        return readings;
      }
      
      // Get both electric and water readings separately since backend requires utilityType
      const [electricReadings, waterReadings] = await Promise.all([
        this.getUtilityReadingsByType(roomId, 1), // Electric
        this.getUtilityReadingsByType(roomId, 0)  // Water
      ]);
      
      // Combine both arrays
      const allReadings = [...electricReadings, ...waterReadings];
      console.log('✅ All utility readings fetched:', allReadings);
      return allReadings;
    } catch (error) {
      console.error('❌ Error fetching utility readings:', error);
      if (error.response?.status === 404) {
        console.log('📭 No utility readings found for room');
        return [];
      }
      throw error;
    }
  },

  async getUtilityReadingsByType(roomId, utilityType) {
    try {
      const url = `/odata/${roomId}?utilityType=${utilityType === 1 ? 'Electric' : 'Water'}`;
      console.log(`🔄 Fetching ${utilityType === 1 ? 'Electric' : 'Water'} readings from:`, url);
      
      const readings = await api.get(url);
      console.log(`✅ ${utilityType === 1 ? 'Electric' : 'Water'} readings raw response:`, readings);
      
      // Handle different response formats
      let processedData = [];
      if (Array.isArray(readings)) {
        processedData = readings;
      } else if (readings?.value && Array.isArray(readings.value)) {
        processedData = readings.value;
      } else if (readings?.data && Array.isArray(readings.data)) {
        processedData = readings.data;
      } else if (readings && typeof readings === 'object') {
        // If response is an object, try to extract array from common properties
        processedData = readings.items || readings.results || [];
      }
      
      console.log(`📊 ${utilityType === 1 ? 'Electric' : 'Water'} processed data:`, processedData);
      
      // Debug: Log first item to see structure
      if (processedData.length > 0) {
        console.log(`🔍 First ${utilityType === 1 ? 'Electric' : 'Water'} item structure:`, processedData[0]);
        console.log(`🔍 Type field value:`, processedData[0].type || processedData[0].Type);
        console.log(`🔍 Type field type:`, typeof (processedData[0].type || processedData[0].Type));
      }
      
      return processedData;
    } catch (error) {
      console.error(`❌ Error fetching ${utilityType === 1 ? 'electric' : 'water'} readings:`, error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 404) {
        console.log(`📭 No ${utilityType === 1 ? 'electric' : 'water'} readings found for room`);
        return []; // Return empty array if no readings found for this type
      }
      throw error;
    }
  },

  async getUtilityReadingById(readingId) {
    try {
      const reading = await api.get(`/api/UtilityReading/${readingId}`);
      return reading;
    } catch (error) {
      console.error('Error fetching utility reading:', error);
      throw error;
    }
  },

  async createUtilityReading(roomId, readingData) {
    try {
      console.log('🔄 Creating utility reading for room:', roomId);
      console.log('📊 Reading data:', readingData);
      
      // Convert frontend data to match backend DTO
      const backendData = {
        price: parseFloat(readingData.price),
        type: parseInt(readingData.type), // 0 = Water, 1 = Electric
        note: readingData.note || '',
        currentIndex: parseFloat(readingData.currentIndex)
      };
      
      console.log('📊 Converted data for backend:', backendData);
      console.log('🌐 API URL:', `/api/UtilityReading/${roomId}`);
      
      const result = await api.post(`/api/UtilityReading/${roomId}`, backendData);
      
      console.log('✅ Utility reading created:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating utility reading:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
      throw error;
    }
  },

  async updateUtilityReading(readingId, readingData) {
    try {
      console.log('🔄 Updating utility reading:', readingId);
      
      // Convert to backend UpdateUtilityReadingDto format
      const backendData = {
        price: parseFloat(readingData.price),
        note: readingData.note || '',
        currentIndex: parseFloat(readingData.currentIndex)
      };
      
      console.log('📊 Update data:', backendData);
      
      const result = await api.put(`/api/UtilityReading/${readingId}`, backendData);
      console.log('✅ Utility reading updated:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating utility reading:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  },

  async deleteUtilityReading(readingId) {
    try {
      await api.delete(`/api/UtilityReading/${readingId}`);
      return true;
    } catch (error) {
      console.error('Error deleting utility reading:', error);
      throw error;
    }
  },

  // Utility Helper Functions
  getUtilityTypeLabel(type) {
    const typeNum = parseInt(type);
    // Based on backend enum: Water = 0, Electric = 1
    switch (typeNum) {
      case 0: return 'Water';
      case 1: return 'Electric';
      default: return 'Unknown';
    }
  },

  getUtilityTypeUnit(type) {
    const typeNum = parseInt(type);
    // Based on backend enum: Water = 0, Electric = 1
    switch (typeNum) {
      case 0: return 'm³';
      case 1: return 'kWh';
      default: return 'unit';
    }
  },

  getUtilityTypeIcon(type) {
    const typeNum = parseInt(type);
    switch (typeNum) {
      case 0: return '💧'; // Water
      case 1: return '⚡'; // Electric
      default: return '📊';
    }
  },

  // Calculate consumption based on backend logic
  calculateConsumption(currentIndex, previousIndex) {
    const consumption = parseFloat(currentIndex) - parseFloat(previousIndex || 0);
    return consumption >= 0 ? consumption : 0;
  },

  // Calculate total cost (matches backend: price * consumption)
  calculateTotalCost(price, currentIndex, previousIndex) {
    const consumption = this.calculateConsumption(currentIndex, previousIndex);
    const total = parseFloat(price || 0) * consumption;
    return Math.round(total); // Round to nearest VND
  },

  // Format consumption with unit
  formatConsumption(consumption, type) {
    const unit = this.getUtilityTypeUnit(type);
    return `${parseFloat(consumption || 0).toFixed(2)} ${unit}`;
  },

  // Format currency in VND
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  },

  // Format date
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Validate reading data before submit
  validateReadingData(data) {
    const errors = [];
    
    if (!data.price || parseFloat(data.price) <= 0) {
      errors.push('Price must be greater than 0');
    }
    
    if (!data.currentIndex || parseFloat(data.currentIndex) < 0) {
      errors.push('Current index must be greater than or equal to 0');
    }
    
    if (data.type === undefined || data.type === null) {
      errors.push('Utility type is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
};

export default utilityService;