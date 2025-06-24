/**
 * Login functionality for Portal Karyawan SAG v2.0
 */

// Wait for DOM and API service to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (authManager.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize login form
    initializeLoginForm();
    
    // Add demo credentials info
    addDemoCredentialsInfo();
});

/**
 * Initialize login form
 */
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    loginForm.addEventListener('submit', handleLogin);
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Validation
    if (!email || !password) {
        showAlert('Please enter both email and password', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    setLoadingState(submitBtn, true);
    
    try {
        // Show loading modal
        showLoadingModal();
        
        const result = await authManager.login(email, password);
        
        if (result.success) {
            showAlert('Login successful! Redirecting...', 'success');
            
            // Hide loading modal
            hideLoadingModal();
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            hideLoadingModal();
            showAlert(result.message || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        hideLoadingModal();
        
        let errorMessage = 'Login failed. ';
        if (error.message.includes('fetch')) {
            errorMessage += 'Please check your internet connection.';
        } else if (error.message.includes('API')) {
            errorMessage += 'Service temporarily unavailable. Please try again later.';
        } else {
            errorMessage += 'Please try again.';
        }
        
        showAlert(errorMessage, 'error');
    } finally {
        setLoadingState(submitBtn, false, originalText);
    }
}

/**
 * Set loading state for button
 */
function setLoadingState(button, loading, originalText = 'Login') {
    if (loading) {
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Logging in...';
        button.disabled = true;
    } else {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

/**
 * Show loading modal
 */
function showLoadingModal() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        const modal = new bootstrap.Modal(loadingModal);
        modal.show();
    }
}

/**
 * Hide loading modal
 */
function hideLoadingModal() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        const modal = bootstrap.Modal.getInstance(loadingModal);
        if (modal) {
            modal.hide();
        }
    }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    const card = container.querySelector('.card');
    container.insertBefore(alertDiv, card);
    
    // Auto dismiss after 5 seconds for non-error messages
    if (type !== 'error') {
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Add demo credentials information
 */
function addDemoCredentialsInfo() {
    const cardBody = document.querySelector('.card-body');
    if (!cardBody) return;
    
    const demoInfo = document.createElement('div');
    demoInfo.className = 'alert alert-info mt-3';
    demoInfo.innerHTML = `
        <h6><i class="fas fa-info-circle me-2"></i>Demo Credentials</h6>
        <div class="row">
            <div class="col-md-6">
                <p class="mb-1"><strong>Admin:</strong></p>
                <small class="text-muted">admin@sag.com / admin123</small>
            </div>
            <div class="col-md-6">
                <p class="mb-1"><strong>Manager:</strong></p>
                <small class="text-muted">manager@sag.com / manager123</small>
            </div>
        </div>
        <div class="row mt-2">
            <div class="col-md-6">
                <p class="mb-1"><strong>Staff:</strong></p>
                <small class="text-muted">staff@sag.com / staff123</small>
            </div>
            <div class="col-md-6">
                <p class="mb-1"><strong>HR:</strong></p>
                <small class="text-muted">hr@sag.com / hr123</small>
            </div>
        </div>
        <hr>
        <small class="text-muted">
            <i class="fas fa-exclamation-triangle me-1"></i>
            Note: Create these users in the admin panel after API deployment
        </small>
    `;
    
    cardBody.appendChild(demoInfo);
}

/**
 * Handle forgot password (placeholder)
 */
function handleForgotPassword() {
    alert('Forgot password functionality will be implemented in the next version. Please contact your administrator.');
}

/**
 * Handle register (placeholder)
 */
function handleRegister() {
    alert('User registration is handled by administrators. Please contact your admin to create an account.');
}

// Add event listeners for forgot password and register links
document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordLink = document.querySelector('a[href="#forgot"]');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleForgotPassword();
        });
    }
    
    const registerLink = document.querySelector('a[href="#register"]');
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleRegister();
        });
    }
});

// Handle Enter key in password field
document.addEventListener('DOMContentLoaded', function() {
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('loginForm').dispatchEvent(new Event('submit'));
            }
        });
    }
});
