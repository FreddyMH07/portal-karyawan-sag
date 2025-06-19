// Main portal functionality
class PortalManager {
    constructor() {
        this.currentUser = null;
        this.selectedPortal = null;
        this.initializePortal();
    }

    initializePortal() {
        this.checkAuthentication();
        this.loadUserInfo();
        this.initializeEventListeners();
        this.updateDateTime();
        this.loadQuickStats();
        
        // Update time every minute
        setInterval(() => this.updateDateTime(), 60000);
    }

    checkAuthentication() {
        const session = localStorage.getItem('sag_session');
        const tempSession = sessionStorage.getItem('sag_temp_session');
        
        if (!session && !tempSession) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const sessionData = JSON.parse(session || tempSession);
            this.currentUser = sessionData.user;
            
            // Check session expiry
            const expiry = localStorage.getItem('sag_session_expiry');
            if (expiry && Date.now() > parseInt(expiry)) {
                this.logout();
                return;
            }
        } catch (error) {
            console.error('Session parsing error:', error);
            this.logout();
        }
    }

    loadUserInfo() {
        if (this.currentUser) {
            document.getElementById('userName').textContent = this.currentUser.name;
        }
    }

    initializeEventListeners() {
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Portal access confirmation
        document.getElementById('confirmAccess').addEventListener('click', () => {
            this.confirmPortalAccess();
        });

        // Portal cards click handlers are set via onclick in HTML
        window.accessPortal = (portalType) => {
            this.requestPortalAccess(portalType);
        };
    }

    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        document.getElementById('currentDate').textContent = 
            now.toLocaleDateString('id-ID', options);
        
        document.getElementById('currentTime').textContent = 
            now.toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
    }

    async loadQuickStats() {
        try {
            // Simulate API calls for quick stats
            const stats = await this.fetchQuickStats();
            
            document.getElementById('attendanceToday').textContent = stats.attendance;
            document.getElementById('productionToday').textContent = stats.production;
            document.getElementById('bookingToday').textContent = stats.booking;
            document.getElementById('ticketToday').textContent = stats.tickets;
        } catch (error) {
            console.error('Error loading quick stats:', error);
        }
    }

    async fetchQuickStats() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Demo data - replace with actual API calls
        return {
            attendance: Math.floor(Math.random() * 100) + 150,
            production: (Math.random() * 50 + 20).toFixed(1),
            booking: Math.floor(Math.random() * 10) + 5,
            tickets: Math.floor(Math.random() * 20) + 3
        };
    }

    requestPortalAccess(portalType) {
        this.selectedPortal = portalType;
        
        // Check user permissions
        if (!this.currentUser.permissions.includes(portalType) && this.currentUser.role !== 'admin') {
            this.showAlert('Anda tidak memiliki akses ke portal ini', 'warning');
            return;
        }

        // For production portal, require additional verification
        if (portalType === 'produksi') {
            const modal = new bootstrap.Modal(document.getElementById('accessModal'));
            modal.show();
        } else {
            this.redirectToPortal(portalType);
        }
    }

    confirmPortalAccess() {
        const password = document.getElementById('portalPassword').value;
        
        if (!password) {
            this.showAlert('Silakan masukkan password', 'warning');
            return;
        }

        // Verify password (demo - replace with actual verification)
        if (password === 'produksi123' || password === this.currentUser.email.split('@')[0] + '123') {
            const modal = bootstrap.Modal.getInstance(document.getElementById('accessModal'));
            modal.hide();
            
            this.showAlert('Akses dikonfirmasi! Mengalihkan...', 'success');
            setTimeout(() => {
                this.redirectToPortal(this.selectedPortal);
            }, 1500);
        } else {
            this.showAlert('Password salah', 'danger');
        }
    }

    redirectToPortal(portalType) {
        const portalUrls = {
            'produksi': 'produksi.html',
            'hr': 'hr.html',
            'umum': 'umum.html'
        };

        if (portalUrls[portalType]) {
            window.location.href = portalUrls[portalType];
        }
    }

    logout() {
        // Clear all session data
        localStorage.removeItem('sag_session');
        localStorage.removeItem('sag_session_expiry');
        sessionStorage.removeItem('sag_temp_session');
        
        // Redirect to login
        window.location.href = 'login.html';
    }

    showAlert(message, type) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        // Create new alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 100px; right: 20px; z-index: 1050; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Utility functions
class Utils {
    static formatNumber(num) {
        return new Intl.NumberFormat('id-ID').format(num);
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    }

    static formatDate(date) {
        return new Date(date).toLocaleDateString('id-ID');
    }

    static formatDateTime(date) {
        return new Date(date).toLocaleString('id-ID');
    }

    static exportToCSV(data, filename) {
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    static convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => 
                JSON.stringify(row[header] || '')
            ).join(','))
        ].join('\n');
        
        return csvContent;
    }
}

// Initialize portal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortalManager();
});
