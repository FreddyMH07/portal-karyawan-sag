/**
 * Authentication and Authorization Module
 * Portal Karyawan SAG v2.0
 */

class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || '{}');
        this.sessionTimeout = null;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.token && !!this.user.id;
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.user;
    }

    /**
     * Check if user has specific permission
     */
    hasPermission(permission) {
        if (!this.user.permissions) return false;
        
        const permissions = Array.isArray(this.user.permissions) 
            ? this.user.permissions 
            : this.user.permissions.split(',');
            
        return permissions.includes(permission) || this.user.role === 'admin';
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        return this.user.role === role;
    }

    /**
     * Login user
     */
    async login(email, password) {
        try {
            // Use the global apiService
            if (!window.apiService) {
                throw new Error('API Service not available');
            }

            const result = await window.apiService.login(email, password);
            
            if (result.success) {
                this.token = result.token;
                this.user = result.user;
                this.logActivity('login', 'User logged in successfully');
                this.setupSessionTimeout();
                return result;
            } else {
                this.logActivity('login_failed', `Login failed: ${result.message}`);
                return result;
            }
        } catch (error) {
            this.logActivity('login_error', `Login error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Logout user
     */
    logout() {
        this.logActivity('logout', 'User logged out');
        this.clearSession();
        window.location.href = 'login.html';
    }

    /**
     * Clear session data
     */
    clearSession() {
        this.token = null;
        this.user = {};
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }

    /**
     * Redirect to login if not authenticated
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    /**
     * Require specific permission
     */
    requirePermission(permission) {
        if (!this.requireAuth()) return false;
        
        if (!this.hasPermission(permission)) {
            this.showAccessDenied(`You need '${permission}' permission to access this feature.`);
            return false;
        }
        return true;
    }

    /**
     * Require specific role
     */
    requireRole(role) {
        if (!this.requireAuth()) return false;
        
        if (!this.hasRole(role)) {
            this.showAccessDenied(`${role} role required to access this feature.`);
            return false;
        }
        return true;
    }

    /**
     * Show access denied message
     */
    showAccessDenied(message) {
        if (typeof showAlert === 'function') {
            showAlert(message, 'error');
        } else {
            alert('Access Denied: ' + message);
        }
    }

    /**
     * Initialize authentication for page
     */
    initPage(requiredPermission = null, requiredRole = null) {
        // Check authentication
        if (!this.requireAuth()) return false;

        // Check permission if required
        if (requiredPermission && !this.requirePermission(requiredPermission)) {
            return false;
        }

        // Check role if required
        if (requiredRole && !this.requireRole(requiredRole)) {
            return false;
        }

        // Update UI with user info
        this.updateUserUI();
        
        // Setup session timeout
        this.setupSessionTimeout();

        return true;
    }

    /**
     * Update UI with user information
     */
    updateUserUI() {
        // Update user name in navigation
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(element => {
            element.textContent = this.user.name || this.user.email;
        });

        // Update user role
        const userRoleElements = document.querySelectorAll('[data-user-role]');
        userRoleElements.forEach(element => {
            element.textContent = this.user.role;
        });

        // Show/hide elements based on permissions
        this.updatePermissionBasedUI();
    }

    /**
     * Update UI based on user permissions
     */
    updatePermissionBasedUI() {
        // Hide elements that require specific permissions
        const permissionElements = document.querySelectorAll('[data-require-permission]');
        permissionElements.forEach(element => {
            const requiredPermission = element.getAttribute('data-require-permission');
            if (!this.hasPermission(requiredPermission)) {
                element.style.display = 'none';
            }
        });

        // Hide elements that require specific roles
        const roleElements = document.querySelectorAll('[data-require-role]');
        roleElements.forEach(element => {
            const requiredRole = element.getAttribute('data-require-role');
            if (!this.hasRole(requiredRole)) {
                element.style.display = 'none';
            }
        });
    }

    /**
     * Setup session timeout
     */
    setupSessionTimeout() {
        const timeout = parseInt(localStorage.getItem('sessionTimeout') || '3600') * 1000; // Default 1 hour
        
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }
        
        this.sessionTimeout = setTimeout(() => {
            this.showSessionExpired();
        }, timeout);
    }

    /**
     * Show session expired message
     */
    showSessionExpired() {
        if (typeof showAlert === 'function') {
            showAlert('Session expired. Please login again.', 'warning');
        } else {
            alert('Session expired. Please login again.');
        }
        
        setTimeout(() => {
            this.logout();
        }, 2000);
    }

    /**
     * Log user activity
     */
    logActivity(action, details) {
        const log = {
            timestamp: new Date().toISOString(),
            user: this.user.email || 'anonymous',
            action: action,
            details: details,
            level: 'INFO'
        };

        // Store in localStorage
        const logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
        logs.push(log);
        
        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('systemLogs', JSON.stringify(logs));
    }

    /**
     * Change password
     */
    async changePassword(oldPassword, newPassword) {
        try {
            const result = await window.apiService.changePassword(
                this.user.id, 
                oldPassword, 
                newPassword
            );
            
            if (result.success) {
                this.logActivity('password_change', 'Password changed successfully');
            } else {
                this.logActivity('password_change_failed', `Password change failed: ${result.message}`);
            }
            
            return result;
        } catch (error) {
            this.logActivity('password_change_error', `Password change error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(userData) {
        try {
            const result = await window.apiService.updateUser({
                id: this.user.id,
                ...userData
            });
            
            if (result.success) {
                // Update local user data
                Object.assign(this.user, userData);
                localStorage.setItem('user', JSON.stringify(this.user));
                this.updateUserUI();
                this.logActivity('profile_update', 'Profile updated successfully');
            } else {
                this.logActivity('profile_update_failed', `Profile update failed: ${result.message}`);
            }
            
            return result;
        } catch (error) {
            this.logActivity('profile_update_error', `Profile update error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get user permissions list
     */
    getPermissions() {
        if (!this.user.permissions) return [];
        
        return Array.isArray(this.user.permissions) 
            ? this.user.permissions 
            : this.user.permissions.split(',');
    }

    /**
     * Check multiple permissions (OR logic)
     */
    hasAnyPermission(permissions) {
        return permissions.some(permission => this.hasPermission(permission));
    }

    /**
     * Check multiple permissions (AND logic)
     */
    hasAllPermissions(permissions) {
        return permissions.every(permission => this.hasPermission(permission));
    }
}

// Create global auth manager instance
const authManager = new AuthManager();

// Auto-initialize on DOM load (skip for login page)
document.addEventListener('DOMContentLoaded', function() {
    // Skip auth for login page
    if (window.location.pathname.includes('login.html')) {
        return;
    }

    // Get page requirements from body attributes
    const pagePermission = document.body.getAttribute('data-require-permission');
    const pageRole = document.body.getAttribute('data-require-role');
    
    // Initialize authentication
    authManager.initPage(pagePermission, pageRole);
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager, authManager };
}
