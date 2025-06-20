// Configuration file untuk Portal Karyawan SAG
const CONFIG = {
    // Google Sheets Configuration
    GOOGLE_SHEETS_ID: '1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs',
    
    // Google Apps Script Web App URL - UPDATED with correct URL
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbwBskOo2xT69KZ0kBQlCodPd4EL4daUqNUZyXfOna6S8hsBlFMcbPUOjfDbwKZt0gupHQ/exec',
    
    // Google OAuth Client ID (untuk Google Sign-In)
    GOOGLE_CLIENT_ID: '67c37218d77b709b2ac0d3aa5cdcc89e6e922dd0',
    
    // Sheet Names
    SHEETS: {
        DATA_HARIAN: 'DATA HARIAN',
        MASTER_DATA: 'MASTER DATA',
        USERS: 'USERS',
        BOOKING: 'BOOKING',
        ABSENSI: 'ABSENSI',
        KPI: 'KPI',
        ASSET: 'ASSET'
    },
    
    // Application Settings
    APP: {
        NAME: 'Portal Karyawan SAG',
        VERSION: '3.0.0',
        COMPANY: 'PT Sawit Asahan Graha',
        SUPPORT_EMAIL: 'it@sag.co.id'
    },
    
    // Default Values
    DEFAULTS: {
        SPH_PANEN: 130,
        BUDGET_DEFAULT: 1000,
        PAGINATION_SIZE: 10,
        CHART_COLORS: [
            '#2E7D32', '#4CAF50', '#81C784', 
            '#FF9800', '#2196F3', '#9C27B0',
            '#F44336', '#795548', '#607D8B'
        ]
    },
    
    // Feature Flags
    FEATURES: {
        GOOGLE_OAUTH: true,
        OFFLINE_MODE: true,
        EXPORT_PDF: true,
        REAL_TIME_SYNC: true,
        PUSH_NOTIFICATIONS: false
    },
    
    // Room Configuration for Booking
    ROOMS: [
        { id: 'meeting-a', name: 'Meeting Room A', capacity: 8, facilities: ['Projector', 'Whiteboard', 'AC'] },
        { id: 'meeting-b', name: 'Meeting Room B', capacity: 12, facilities: ['TV', 'Whiteboard', 'AC'] },
        { id: 'conference', name: 'Conference Hall', capacity: 50, facilities: ['Sound System', 'Projector', 'AC'] },
        { id: 'training', name: 'Training Room', capacity: 20, facilities: ['Projector', 'Whiteboard', 'AC'] },
        { id: 'boardroom', name: 'Board Room', capacity: 15, facilities: ['Video Conference', 'Projector', 'AC'] }
    ],
    
    // Time Slots for Booking
    TIME_SLOTS: [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00'
    ],
    
    // KPI Categories
    KPI_CATEGORIES: [
        { id: 'produksi', name: 'Produksi', weight: 40 },
        { id: 'kualitas', name: 'Kualitas', weight: 30 },
        { id: 'kehadiran', name: 'Kehadiran', weight: 20 },
        { id: 'inisiatif', name: 'Inisiatif', weight: 10 }
    ],
    
    // Asset Categories
    ASSET_CATEGORIES: [
        'Kendaraan', 'Elektronik', 'Furniture', 'Alat Kerja', 'Lainnya'
    ],
    
    // Notification Settings
    NOTIFICATIONS: {
        BOOKING_REMINDER: 30, // minutes before
        KPI_DEADLINE: 3, // days before
        ASSET_RETURN: 1 // days before
    },
    
    // Debug and CORS settings
    DEBUG: true,
    CORS_MODE: 'cors' // Handle CORS properly
};

// Export configuration for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Make available globally
window.CONFIG = CONFIG;
