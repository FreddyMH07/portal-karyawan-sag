/**
 * Utility Functions for Portal Karyawan SAG v2.0
 * Common functions used across the application
 */

// ==================== ALERT & NOTIFICATION FUNCTIONS ====================

/**
 * Show alert message with different types
 */
function showAlert(message, type = 'info', duration = 5000) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert.auto-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show auto-alert`;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    
    const icon = getAlertIcon(type);
    alertDiv.innerHTML = `
        <i class="fas fa-${icon} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto dismiss
    if (duration > 0) {
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, duration);
    }
}

/**
 * Get icon for alert type
 */
function getAlertIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': 
        case 'danger': return 'exclamation-triangle';
        case 'warning': return 'exclamation-circle';
        case 'info': return 'info-circle';
        default: return 'info-circle';
    }
}

/**
 * Show loading spinner
 */
function showLoading(message = 'Loading...') {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'globalLoading';
    loadingDiv.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
    loadingDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
    loadingDiv.style.zIndex = '9999';
    
    loadingDiv.innerHTML = `
        <div class="bg-white p-4 rounded shadow text-center">
            <div class="spinner-border text-primary mb-3" role="status"></div>
            <div>${message}</div>
        </div>
    `;
    
    document.body.appendChild(loadingDiv);
}

/**
 * Hide loading spinner
 */
function hideLoading() {
    const loadingDiv = document.getElementById('globalLoading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// ==================== DATE & TIME FUNCTIONS ====================

/**
 * Format date to Indonesian format
 */
function formatDate(date, format = 'dd/mm/yyyy') {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    switch(format) {
        case 'dd/mm/yyyy': return `${day}/${month}/${year}`;
        case 'yyyy-mm-dd': return `${year}-${month}-${day}`;
        case 'dd-mm-yyyy': return `${day}-${month}-${year}`;
        case 'long': return d.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        default: return `${day}/${month}/${year}`;
    }
}

/**
 * Format time to Indonesian format
 */
function formatTime(time) {
    if (!time) return '';
    
    const t = new Date(time);
    if (isNaN(t.getTime())) return '';
    
    return t.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get current time in HH:MM format
 */
function getCurrentTime() {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
}

// ==================== NUMBER & CURRENCY FUNCTIONS ====================

/**
 * Format number with thousand separators
 */
function formatNumber(number, decimals = 0) {
    if (isNaN(number)) return '0';
    
    return parseFloat(number).toLocaleString('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Format currency in Indonesian Rupiah
 */
function formatCurrency(amount) {
    if (isNaN(amount)) return 'Rp 0';
    
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Parse number from formatted string
 */
function parseNumber(str) {
    if (!str) return 0;
    return parseFloat(str.toString().replace(/[^\d.-]/g, '')) || 0;
}

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (Indonesian format)
 */
function isValidPhone(phone) {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate required fields
 */
function validateRequired(fields) {
    const errors = [];
    
    Object.keys(fields).forEach(key => {
        const value = fields[key];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors.push(`${key} is required`);
        }
    });
    
    return errors;
}

// ==================== DATA MANIPULATION FUNCTIONS ====================

/**
 * Deep clone object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Group array by key
 */
function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const group = item[key];
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(item);
        return groups;
    }, {});
}

/**
 * Sort array by key
 */
function sortBy(array, key, direction = 'asc') {
    return array.sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        
        if (direction === 'desc') {
            return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
    });
}

/**
 * Filter array by multiple criteria
 */
function filterBy(array, filters) {
    return array.filter(item => {
        return Object.keys(filters).every(key => {
            const filterValue = filters[key];
            const itemValue = item[key];
            
            if (!filterValue) return true;
            
            if (typeof filterValue === 'string') {
                return itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
            }
            
            return itemValue === filterValue;
        });
    });
}

// ==================== LOCAL STORAGE FUNCTIONS ====================

/**
 * Save data to localStorage with expiration
 */
function saveToStorage(key, data, expirationMinutes = 60) {
    const item = {
        data: data,
        timestamp: Date.now(),
        expiration: expirationMinutes * 60 * 1000
    };
    
    localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Get data from localStorage with expiration check
 */
function getFromStorage(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    try {
        const item = JSON.parse(itemStr);
        
        // Check if expired
        if (Date.now() - item.timestamp > item.expiration) {
            localStorage.removeItem(key);
            return null;
        }
        
        return item.data;
    } catch (error) {
        localStorage.removeItem(key);
        return null;
    }
}

/**
 * Clear expired items from localStorage
 */
function clearExpiredStorage() {
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
        try {
            const item = JSON.parse(localStorage.getItem(key));
            if (item.timestamp && item.expiration) {
                if (Date.now() - item.timestamp > item.expiration) {
                    localStorage.removeItem(key);
                }
            }
        } catch (error) {
            // Not a structured item, skip
        }
    });
}

// ==================== EXPORT FUNCTIONS ====================

/**
 * Export data to CSV
 */
function exportToCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) {
        showAlert('No data to export', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header] || '';
            return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(','))
    ].join('\n');
    
    downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export data to JSON
 */
function exportToJSON(data, filename = 'export.json') {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Download file
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ==================== DEBOUNCE & THROTTLE FUNCTIONS ====================

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ==================== INITIALIZATION ====================

// Clear expired storage on page load
document.addEventListener('DOMContentLoaded', function() {
    clearExpiredStorage();
});

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showAlert, showLoading, hideLoading,
        formatDate, formatTime, getCurrentDate, getCurrentTime,
        formatNumber, formatCurrency, parseNumber,
        isValidEmail, isValidPhone, validateRequired,
        deepClone, groupBy, sortBy, filterBy,
        saveToStorage, getFromStorage, clearExpiredStorage,
        exportToCSV, exportToJSON, downloadFile,
        debounce, throttle
    };
}
