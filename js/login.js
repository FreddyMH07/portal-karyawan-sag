// Login functionality for Portal Karyawan SAG
class LoginManager {
    constructor() {
        this.initializeEventListeners();
        this.checkExistingSession();
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Google login
        document.getElementById('googleLogin').addEventListener('click', () => {
            this.handleGoogleLogin();
        });

        // Toggle password visibility
        document.getElementById('togglePassword').addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // Remember me functionality
        this.loadRememberedCredentials();
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        if (!email || !password) {
            this.showAlert('Silakan masukkan email dan password', 'warning');
            return;
        }

        this.showLoading(true);

        try {
            // Simulate API call - replace with actual authentication
            const loginResult = await this.authenticateUser(email, password);
            
            if (loginResult.success) {
                // Save session
                this.saveSession(loginResult.user, rememberMe);
                
                // Save credentials if remember me is checked
                if (rememberMe) {
                    this.saveCredentials(email);
                }

                this.showAlert('Login berhasil! Mengalihkan...', 'success');
                
                // Redirect to main portal
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                this.showAlert(loginResult.message || 'Email atau password salah', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('Terjadi kesalahan saat login. Silakan coba lagi.', 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    async authenticateUser(email, password) {
        try {
            console.log('Attempting login for:', email);
            
            // Call actual API
            const response = await callAPI('login', {
                email: email,
                password: password
            });
            
            console.log('Login response:', response);
            
            if (response.success) {
                return {
                    success: true,
                    user: response.user
                };
            } else {
                return {
                    success: false,
                    message: response.message || 'Login gagal'
                };
            }
        } catch (error) {
            console.error('Authentication error:', error);
            
            // Fallback to demo users if API fails
            console.log('API failed, using demo users...');
            
// GANTI SELURUH BLOK INI DI login.js
  const demoUsers = [
                {
                    email: 'admin@sag.com',
                    password: 'admin123',
                    name: 'Administrator',
                    role: 'admin',
                    permissions: ['DATA_HARIAN', 'BOOKING', 'ABSENSI', 'KPI', 'ASSET', 'MASTER_DATA', 'USERS']
                },
                {
                    email: 'manager@sag.com',
                    password: 'manager123',
                    name: 'Manager',
                    role: 'manager',
                    permissions: ['DATA_HARIAN', 'BOOKING', 'ABSENSI', 'KPI', 'ASSET']
                },
                {
                    email: 'staff@sag.com',
                    password: 'staff123',
                    name: 'Staff',
                    role: 'staff',
                    permissions: ['DATA_HARIAN', 'BOOKING']
                }
            ];

            const user = demoUsers.find(u => u.email === email && u.password === password);
            
            if (user) {
                return {
                    success: true,
                    user: {
                        id: Date.now(),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        permissions: user.permissions,
                        loginTime: new Date().toISOString()
                    }
                };
            } else {
                return {
                    success: false,
                    message: 'Email atau password salah'
                };
            }
        }
    }


    async handleGoogleLogin() {
        this.showLoading(true);
        
        try {
            // Simulate Google OAuth - replace with actual Google Sign-In
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Demo Google user
            const googleUser = {
                id: 'google_' + Date.now(),
                email: 'user.google@sahabatagro.co.id',
                name: 'Google User',
                role: 'user',
                permissions: ['umum'],
                loginTime: new Date().toISOString(),
                provider: 'google'
            };

            this.saveSession(googleUser, false);
            this.showAlert('Login Google berhasil! Mengalihkan...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            console.error('Google login error:', error);
            this.showAlert('Gagal login dengan Google. Silakan coba lagi.', 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.querySelector('#togglePassword i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    }

    saveSession(user, rememberMe) {
        const sessionData = {
            user: user,
            timestamp: Date.now(),
            rememberMe: rememberMe
        };

        localStorage.setItem('sag_session', JSON.stringify(sessionData));
        
        if (rememberMe) {
            // Set longer expiration for remember me
            const expiration = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
            localStorage.setItem('sag_session_expiry', expiration.toString());
        } else {
            // Session expires when browser closes
            sessionStorage.setItem('sag_temp_session', JSON.stringify(sessionData));
        }
    }

    saveCredentials(email) {
        localStorage.setItem('sag_remembered_email', email);
    }

    loadRememberedCredentials() {
        const rememberedEmail = localStorage.getItem('sag_remembered_email');
        if (rememberedEmail) {
            document.getElementById('email').value = rememberedEmail;
            document.getElementById('rememberMe').checked = true;
        }
    }

    checkExistingSession() {
        const session = localStorage.getItem('sag_session');
        const tempSession = sessionStorage.getItem('sag_temp_session');
        const expiry = localStorage.getItem('sag_session_expiry');

        if (session) {
            const sessionData = JSON.parse(session);
            
            // Check if remember me session is still valid
            if (expiry && Date.now() < parseInt(expiry)) {
                window.location.href = 'index.html';
                return;
            }
        }

        if (tempSession) {
            // Temporary session exists
            window.location.href = 'index.html';
            return;
        }
    }

    showLoading(show) {
        const modal = new bootstrap.Modal(document.getElementById('loadingModal'));
        if (show) {
            modal.show();
        } else {
            modal.hide();
        }
    }

    showAlert(message, type) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        // Create new alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Insert alert before the form
        const form = document.getElementById('loginForm');
        form.parentNode.insertBefore(alertDiv, form);

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Initialize login manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});
