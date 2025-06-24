/**
 * API Configuration for Portal Karyawan SAG v2.0
 * Centralized configuration for all API endpoints
 */

const API_CONFIG = {
  // Production API (existing - enhanced)
  PRODUKSI: {
    url: 'https://script.google.com/macros/s/AKfycbzlXjdPrLyUqqDGkJYqdlhGa0DL9cXtagtTGf4zfXBGrcv5cYikDMrifCcObpWuqrPQvw/exec',
    sheetId: '1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs',
    name: 'Produksi API',
    description: 'Production data management'
  },
  
  // Absensi API (new - to be deployed)
  ABSENSI: {
    url: 'https://script.google.com/macros/s/AKfycbzJ5pd5sC3idY0H7z4zwyX6DvTVxRyI7o7awuoAP7VfG-wyHGOltIKbJHfYKy2Me9L-_A/exec', // Replace after deployment
    sheetId: '1UaETaH6VgTAG0agxrsoVuUvJYrCbbM3mTErAW6_eviM',
    name: 'Absensi API',
    description: 'Employee attendance management'
  },
  
  // Booking API (new - to be deployed)
  BOOKING: {
    url: 'https://script.google.com/macros/s/AKfycbyPexx8tcTcr4uueb3tZvTmrqVcoXZA58r7VV2ZNZNHrTT8xpy3UPNpzXvNRfUBMZBGdQ/exec', // Replace after deployment
    sheetId: '1dPpQKnjNFvVssl12at6hC8416Atmr4GWrNspMRaLOiA',
    name: 'Booking API',
    description: 'Room and facility booking system'
  },
  
  // Asset/KPI API (new - to be deployed)
  ASSET: {
    url: 'https://script.google.com/macros/s/AKfycbz51UR2MCv5jYXhAIfadGwueAmOfpBSpI4VjE9YMmPgezXw1RalZ3_pT6lOLSY7v3yv6Q/exec', // Replace after deployment
    sheetId: '1uL8dPo07vIRFc3eOBcahlLVgJG6uIpD67SQlXZA9zNI',
    name: 'Asset/KPI API',
    description: 'Asset management and KPI tracking'
  },
  
  // Users API (new - to be deployed)
  USERS: {
    url: 'https://script.google.com/macros/s/AKfycbw0oC6qCpr8S8LWF3A5OUj6sKYgjE9qlTNtfAt3uKdT2Jpo5QCHfDSGkRGqNnjWrxiAmA/exec', // Replace after deployment
    sheetId: '1YetLgN6ppoHtOjJ9vwzqHlrpoo532BqTKQbmyHNa0ks',
    name: 'Users API',
    description: 'User authentication and management'
  }
};

// API Settings
const API_SETTINGS = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  enableLogging: true,
  enableCaching: false,
  cacheTimeout: 300000 // 5 minutes
};

/**
 * Enhanced API Service Class with error handling and retry logic
 */
class APIService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.cache = new Map();
  }

  /**
   * Make API call with retry logic and error handling
   */
  async makeRequest(apiType, data, options = {}) {
    const config = API_CONFIG[apiType];
    if (!config) {
      throw new Error(`API type ${apiType} not found`);
    }

    const requestOptions = {
      timeout: options.timeout || API_SETTINGS.timeout,
      retryAttempts: options.retryAttempts || API_SETTINGS.retryAttempts,
      retryDelay: options.retryDelay || API_SETTINGS.retryDelay,
      useCache: options.useCache || API_SETTINGS.enableCaching
    };

    // Check cache first
    const cacheKey = `${apiType}_${JSON.stringify(data)}`;
    if (requestOptions.useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < API_SETTINGS.cacheTimeout) {
        return cached.data;
      }
    }

    let lastError;
    for (let attempt = 1; attempt <= requestOptions.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestOptions.timeout);

        const response = await fetch(config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Cache successful responses
        if (requestOptions.useCache && result.success) {
          this.cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
        }

        // Log successful requests
        if (API_SETTINGS.enableLogging) {
          this.logRequest(apiType, data.action, 'SUCCESS', attempt);
        }

        return result;

      } catch (error) {
        lastError = error;
        
        if (API_SETTINGS.enableLogging) {
          this.logRequest(apiType, data.action, 'ERROR', attempt, error.message);
        }

        // Don't retry on certain errors
        if (error.name === 'AbortError' || error.message.includes('401') || error.message.includes('403')) {
          break;
        }

        // Wait before retry (except on last attempt)
        if (attempt < requestOptions.retryAttempts) {
          await this.delay(requestOptions.retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }

  /**
   * Delay function for retry logic
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log API requests
   */
  logRequest(apiType, action, status, attempt, error = null) {
    const log = {
      timestamp: new Date().toISOString(),
      apiType: apiType,
      action: action,
      status: status,
      attempt: attempt,
      error: error,
      user: this.user.email || 'anonymous'
    };

    const logs = JSON.parse(localStorage.getItem('apiLogs') || '[]');
    logs.push(log);
    
    // Keep only last 500 logs
    if (logs.length > 500) {
      logs.splice(0, logs.length - 500);
    }
    
    localStorage.setItem('apiLogs', JSON.stringify(logs));
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  // ==================== PRODUKSI API METHODS ====================
  
  async getProduksiData(filters = {}, options = {}) {
    return this.makeRequest('PRODUKSI', {
      action: 'getData',
      filters: filters,
      ...options
    });
  }

  async addProduksiData(data) {
    return this.makeRequest('PRODUKSI', {
      action: 'addData',
      ...data
    });
  }

  async updateProduksiData(data) {
    return this.makeRequest('PRODUKSI', {
      action: 'updateData',
      ...data
    });
  }

  async deleteProduksiData(rowIndex) {
    return this.makeRequest('PRODUKSI', {
      action: 'deleteData',
      rowIndex: rowIndex
    });
  }

  async getMasterData() {
    return this.makeRequest('PRODUKSI', {
      action: 'getMasterData'
    });
  }

  async getProduksiStatistics(filters = {}) {
    return this.makeRequest('PRODUKSI', {
      action: 'getStatistics',
      filters: filters
    });
  }

  // ==================== ABSENSI API METHODS ====================
  
  async getAbsensiData(filters = {}) {
    return this.makeRequest('ABSENSI', {
      action: 'getAbsensi',
      filters: filters
    });
  }

  async addAbsensiData(data) {
    return this.makeRequest('ABSENSI', {
      action: 'addAbsensi',
      ...data
    });
  }

  async checkIn(data) {
    return this.makeRequest('ABSENSI', {
      action: 'checkIn',
      ...data
    });
  }

  async checkOut(data) {
    return this.makeRequest('ABSENSI', {
      action: 'checkOut',
      ...data
    });
  }

  async getAbsensiByNIK(nik) {
    return this.makeRequest('ABSENSI', {
      action: 'getAbsensiByNIK',
      nik: nik
    });
  }

  // ==================== BOOKING API METHODS ====================
  
  async getBookings(filters = {}) {
    return this.makeRequest('BOOKING', {
      action: 'getBookings',
      filters: filters
    });
  }

  async addBooking(data) {
    return this.makeRequest('BOOKING', {
      action: 'addBooking',
      ...data
    });
  }

  async updateBooking(data) {
    return this.makeRequest('BOOKING', {
      action: 'updateBooking',
      ...data
    });
  }

  async deleteBooking(id) {
    return this.makeRequest('BOOKING', {
      action: 'deleteBooking',
      id: id
    });
  }

  async approveBooking(id, catatan = '') {
    return this.makeRequest('BOOKING', {
      action: 'approveBooking',
      id: id,
      catatan: catatan
    });
  }

  async checkAvailability(data) {
    return this.makeRequest('BOOKING', {
      action: 'checkAvailability',
      ...data
    });
  }

  // ==================== ASSET API METHODS ====================
  
  async getAssets(filters = {}) {
    return this.makeRequest('ASSET', {
      action: 'getAssets',
      filters: filters
    });
  }

  async addAsset(data) {
    return this.makeRequest('ASSET', {
      action: 'addAsset',
      ...data
    });
  }

  async updateAsset(data) {
    return this.makeRequest('ASSET', {
      action: 'updateAsset',
      ...data
    });
  }

  async getKPISummary(filters = {}) {
    return this.makeRequest('ASSET', {
      action: 'getKPISummary',
      filters: filters
    });
  }

  // ==================== USERS API METHODS ====================
  
  async login(email, password) {
    const result = await this.makeRequest('USERS', {
      action: 'login',
      email: email,
      password: password
    });

    if (result.success) {
      this.token = result.token;
      this.user = result.user;
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }

    return result;
  }

  async getUsers() {
    return this.makeRequest('USERS', {
      action: 'getUsers'
    });
  }

  async updateUser(data) {
    return this.makeRequest('USERS', {
      action: 'updateUser',
      ...data
    });
  }

  async changePassword(id, oldPassword, newPassword) {
    return this.makeRequest('USERS', {
      action: 'changePassword',
      id: id,
      oldPassword: oldPassword,
      newPassword: newPassword
    });
  }

  // ==================== UTILITY METHODS ====================
  
  logout() {
    this.token = null;
    this.user = {};
    this.clearCache();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }

  isAuthenticated() {
    return !!this.token && !!this.user.id;
  }

  getCurrentUser() {
    return this.user;
  }

  hasPermission(permission) {
    if (!this.user.permissions) return false;
    const permissions = Array.isArray(this.user.permissions) 
      ? this.user.permissions 
      : this.user.permissions.split(',');
    return permissions.includes(permission) || this.user.role === 'admin';
  }

  /**
   * Test API connectivity
   */
  async testAPI(apiType) {
    try {
      const config = API_CONFIG[apiType];
      const response = await fetch(config.url, { method: 'GET' });
      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        url: config.url
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        url: API_CONFIG[apiType]?.url || 'Unknown'
      };
    }
  }

  /**
   * Get API status for all endpoints
   */
  async getAPIStatus() {
    const results = {};
    const apiTypes = Object.keys(API_CONFIG);
    
    for (const apiType of apiTypes) {
      results[apiType] = await this.testAPI(apiType);
    }
    
    return results;
  }
}

// Create global API service instance
const apiService = new APIService();
window.apiService = apiService;

// Auto-update user info on page load
document.addEventListener('DOMContentLoaded', function() {
  if (apiService.isAuthenticated()) {
    // Update user info in UI
    const userElements = document.querySelectorAll('[data-user-name]');
    userElements.forEach(el => {
      el.textContent = apiService.user.name || apiService.user.email;
    });
  }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { APIService, API_CONFIG, API_SETTINGS, apiService };
}
