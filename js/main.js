/**
 * Main JavaScript functions untuk Portal Karyawan SAG v3.0
 * Enhanced with CORS handling and error management
 */

// Global variables
let currentUser = null;
let isLoading = false;

/**
 * Enhanced API call function with CORS handling
 */
async function callAPI(action, data = {}) {
    if (isLoading) {
        console.log('API call in progress, please wait...');
        return { success: false, message: 'Request in progress' };
    }
    
    isLoading = true;
    showLoading(true);
    
    try {
        const payload = {
            action: action,
            ...data,
            timestamp: new Date().toISOString()
        };
        
        console.log('API Call:', action, payload);
        
        const response = await fetch(CONFIG.API_BASE_URL, {
            method: 'POST',
            mode: 'cors', // Enable CORS
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        
        return result;
        
    } catch (error) {
        console.error('API call failed:', error);
        
        // Handle specific CORS errors
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
            return {
                success: false,
                error: 'Koneksi ke server bermasalah. Silakan coba lagi atau hubungi administrator.',
                technical_error: error.message
            };
        }
        
        return {
            success: false,
            error: error.message || 'Terjadi kesalahan tidak dikenal'
        };
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

/**
 * Alternative API call using XMLHttpRequest for better CORS handling
 */
function callAPIXHR(action, data = {}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const payload = {
            action: action,
            ...data,
            timestamp: new Date().toISOString()
        };
        
        xhr.open('POST', CONFIG.API_BASE_URL, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const result = JSON.parse(xhr.responseText);
                        resolve(result);
                    } catch (e) {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            }
        };
        
        xhr.onerror = function() {
            reject(new Error('Network error occurred'));
        };
        
        xhr.send(JSON.stringify(payload));
    });
}

/**
 * Show/hide loading indicator
 */
function showLoading(show = true) {
    let loader = document.getElementById('globalLoader');
    
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'globalLoader';
        loader.innerHTML = `
            <div class="loading-overlay">
                <div class="loading-spinner">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="mt-2">Memuat data...</div>
                </div>
            </div>
        `;
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
        `;
        document.body.appendChild(loader);
    }
    
    loader.style.display = show ? 'flex' : 'none';
}

/**
 * Show alert messages
 */
function showAlert(message, type = 'info', duration = 5000) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show custom-alert`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
    `;
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, duration);
    }
}

/**
 * Format date to Indonesian format
 */
function formatDateID(date) {
    if (!date) return '';
    
    const d = new Date(date);
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format number with thousand separators
 */
function formatNumber(num, decimals = 0) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    
    return parseFloat(num).toLocaleString('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Safe number conversion
 */
function safeNumber(value, defaultValue = 0) {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
}

/**
 * Get current user from localStorage
 */
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Set current user to localStorage
 */
function setCurrentUser(user) {
    try {
        localStorage.setItem('currentUser', JSON.stringify(user));
        currentUser = user;
    } catch (error) {
        console.error('Error setting current user:', error);
    }
}

/**
 * Clear current user
 */
function clearCurrentUser() {
    localStorage.removeItem('currentUser');
    currentUser = null;
}

/**
 * Check if user has permission for specific action
 */
function hasPermission(permission) {
    const user = getCurrentUser();
    if (!user || !user.permissions) return false;
    
    return user.permissions.includes(permission) || user.role === 'admin';
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * Logout function
 */
function logout() {
    clearCurrentUser();
    showAlert('Anda telah logout', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

/**
 * Export data to CSV
 */
function exportToCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) {
        showAlert('Tidak ada data untuk diekspor', 'warning');
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
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * Initialize common page elements
 */
function initializePage() {
    // Check authentication
    if (!requireAuth()) return;
    
    // Set user info in navbar
    const user = getCurrentUser();
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    
    if (userNameElement) userNameElement.textContent = user.name || user.email;
    if (userRoleElement) userRoleElement.textContent = user.role || 'User';
    
    // Add logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Debounce function for search inputs
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
 * Initialize page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Don't initialize on login page
    if (!window.location.pathname.includes('login.html')) {
        initializePage();
    }
});

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    if (CONFIG.DEBUG) {
        showAlert(`Error: ${e.error.message}`, 'danger');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    if (CONFIG.DEBUG) {
        showAlert(`Promise rejection: ${e.reason}`, 'danger');
    }
});

// Export functions for global use
window.callAPI = callAPI;
window.callAPIXHR = callAPIXHR;
window.showAlert = showAlert;
window.showLoading = showLoading;
window.formatDateID = formatDateID;
window.formatNumber = formatNumber;
window.safeNumber = safeNumber;
window.getCurrentUser = getCurrentUser;
window.setCurrentUser = setCurrentUser;
window.hasPermission = hasPermission;
window.logout = logout;
window.exportToCSV = exportToCSV;
