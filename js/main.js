/**
 * Main JavaScript functions for SAG Employee Portal v3.0
 * Includes: API, CORS fallback, loading, alerts, auth, utilities, CSV export.
 * PM-friendly, ready for teamwork & documentation.
 */

// ===== GLOBAL STATE =====
let currentUser = null;
let isLoading = false;

// ===== API CALLER WITH CORS FALLBACK =====
/**
 * Call API backend, fallback to XHR if fetch fails (CORS/Network)
 * @param {string} action - Action key for backend router
 * @param {object} data - Request payload
 * @returns {Promise<object>}
 */
async function callAPI(action, data = {}) {
    if (isLoading) {
        console.log('API call in progress, please wait...');
        return { success: false, message: 'Request in progress' };
    }
    isLoading = true;
    showLoading(true);

    try {
        const payload = { action, ...data, timestamp: new Date().toISOString() };
        console.log('[API] Call:', action, payload);

        const response = await fetch(CONFIG.API_BASE_URL, {
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        console.log('[API] Response:', result);
        return result;

    } catch (error) {
        console.error('[API] call failed:', error);

        // CORS/Network fallback to XHR
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
            console.warn('[API] CORS error detected, fallback to XHR...');
            try {
                const xhrResult = await callAPIXHR(action, data);
                return xhrResult;
            } catch (xhrError) {
                console.error('[API] XHR fallback failed:', xhrError);
                return {
                    success: false,
                    error: 'Koneksi ke server bermasalah. Silakan coba lagi atau hubungi administrator.',
                    technical_error: error.message,
                    fallback_attempted: true
                };
            }
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
 * XHR fallback for API call (for legacy CORS/network issues)
 * @param {string} action
 * @param {object} data
 * @returns {Promise<object>}
 */
function callAPIXHR(action, data = {}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const payload = { action, ...data, timestamp: new Date().toISOString() };

        xhr.open('POST', CONFIG.API_BASE_URL, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            }
        };

        xhr.onerror = function () {
            reject(new Error('Network error occurred'));
        };

        xhr.send(JSON.stringify(payload));
    });
}

// ===== UI/UX UTILITIES =====

/**
 * Show or hide loading overlay
 * @param {boolean} show
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
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;
            z-index: 9999; color: white;
        `;
        document.body.appendChild(loader);
    }
    loader.style.display = show ? 'flex' : 'none';
}

/**
 * Show alert message, auto-hide after duration
 * @param {string} message
 * @param {string} type ('info','success','warning','danger')
 * @param {number} duration ms
 */
function showAlert(message, type = 'info', duration = 5000) {
    // Remove existing
    document.querySelectorAll('.custom-alert').forEach(alert => alert.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show custom-alert`;
    alertDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000; min-width: 300px; max-width: 500px;
    `;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    if (duration > 0) setTimeout(() => alertDiv.remove(), duration);
}

// ===== FORMATTER =====
function formatDateID(date) {
    if (!date) return '';
    const d = new Date(date);
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
function formatNumber(num, decimals = 0) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return parseFloat(num).toLocaleString('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}
function safeNumber(value, def = 0) {
    const num = parseFloat(value);
    return isNaN(num) ? def : num;
}

// ===== USER AUTH / SESSION =====
// GANTI DENGAN KODE INI
function getCurrentUser() {
    try {
        // 1. Baca dari 'sag_session' yang benar, sesuai dengan yang disimpan login.js
        const sessionStr = localStorage.getItem('sag_session');
        if (!sessionStr) return null;

        // 2. Ubah string JSON menjadi objek
        const sessionData = JSON.parse(sessionStr);
        
        // 3. Kembalikan HANYA objek 'user' dari dalam data sesi tersebut
        return sessionData.user; 

    } catch (e) {
        console.error('Error getCurrentUser:', e);
        return null;
    }
}
function setCurrentUser(user) {
    try {
        localStorage.setItem('currentUser', JSON.stringify(user));
        currentUser = user;
    } catch (e) {
        console.error('Error setCurrentUser:', e);
    }
}
function clearCurrentUser() {
    localStorage.removeItem('currentUser');
    currentUser = null;
}
function hasPermission(permission) {
    const user = getCurrentUser();
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission) || user.role === 'admin';
}
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}
function logout() {
    localStorage.removeItem('sag_session');
    localStorage.removeItem('sag_session_expiry');
    localStorage.removeItem('sag_remembered_email');
    sessionStorage.removeItem('sag_temp_session');
    clearCurrentUser();
    showAlert('Anda telah berhasil logout', 'success');
    setTimeout(() => window.location.replace('login.html'), 1500);
}

// ===== EXPORTER =====
function exportToCSV(data, filename = 'export.csv') {
    if (!data || !data.length) {
        showAlert('Tidak ada data untuk diekspor', 'warning');
        return;
    }
    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===== PAGE INIT & TOOLS =====

/**
 * Initialize user session, header, tooltips, etc.
 * Call on each page except login.
 */
function initializePage() {
    // Ganti jadi getValidSession()
    const session = getValidSession();
    if (!session || !session.user) {
        window.location.replace('login.html');
        return;
    }
    // Set user global (biar dashboard bisa akses window.currentUser)
    currentUser = session.user;
    window.currentUser = currentUser; // (optional, biar semua JS bisa akses)

    // Update header (jika ada)
    const userNameElement = document.getElementById('userName');
    if (userNameElement) userNameElement.textContent = currentUser.name || currentUser.email;
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Bootstrap tooltips
    if (window.bootstrap) {
        [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
            .map(el => new bootstrap.Tooltip(el));
    }
}



/**
 * Debounce utility
 * @param {function} func
 * @param {number} wait
 * @returns {function}
 */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// ===== DOMContentLoaded: INIT PAGE (except login) =====
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('login.html')) {
        initializePage();
    }
});

// ===== GLOBAL ERROR HANDLERS =====
window.addEventListener('error', function (e) {
    console.error('[GLOBAL ERROR]', e.error);
    if (CONFIG && CONFIG.DEBUG) {
        showAlert(`Error: ${e.error?.message}`, 'danger');
    }
});
window.addEventListener('unhandledrejection', function (e) {
    console.error('[PROMISE REJECTED]', e.reason);
    if (CONFIG && CONFIG.DEBUG) {
        showAlert(`Promise rejection: ${e.reason}`, 'danger');
    }
});

// ===== EXPORTS (for browser global use) =====
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
