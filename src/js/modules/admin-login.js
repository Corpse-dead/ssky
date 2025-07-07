/**
 * Admin Login Modal Module
 * Handles authentication and session management for admin users
 */
class AdminLoginModal {
    constructor() {
        this.isLoggedIn = false;
        this.credentials = {
            username: 'admin',
            password: 'admin'
        };
        this.sessionKey = 'adminLoggedIn';
        this.sessionExpiryKey = 'adminSessionExpiry';
        this.tokenKey = 'adminToken';
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }

    /**
     * Check if admin has valid session from previous login
     */
    checkExistingSession() {
        const adminLoggedIn = localStorage.getItem(this.sessionKey);
        const sessionExpiry = localStorage.getItem(this.sessionExpiryKey);
        
        if (adminLoggedIn === 'true' && sessionExpiry) {
            const now = new Date().getTime();
            const expiry = parseInt(sessionExpiry);
            
            if (now < expiry) {
                this.isLoggedIn = true;
                console.log('Admin session validated - use Ctrl+Shift+A to access panel');
                return true;
            } else {
                this.logout();
            }
        }
        return false;
    }

    /**
     * Setup keyboard shortcuts for admin access
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Admin shortcut: Ctrl + Shift + A
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                
                if (this.isLoggedIn) {
                    // Dispatch event to show admin panel
                    document.dispatchEvent(new CustomEvent('showAdminPanel'));
                } else {
                    this.show();
                }
            }

            // Close modal on Escape
            if (e.key === 'Escape') {
                const modal = document.getElementById('adminLoginModal');
                if (modal && modal.classList.contains('active')) {
                    this.hide();
                }
            }
        });
    }

    /**
     * Setup event listeners for form and modal interactions
     */
    setupEventListeners() {
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') && e.target.id === 'adminLoginModal') {
                this.hide();
            }
        });

        // Form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'adminLoginForm') {
                e.preventDefault();
                this.handleLogin(e);
            }
        });
    }

    /**
     * Show the admin login modal
     */
    show() {
        // Remove any existing modal first
        this.removeExistingModal();
        
        const modal = this.createModal();
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Focus on username field
        setTimeout(() => {
            const usernameInput = document.getElementById('adminUsername');
            if (usernameInput) usernameInput.focus();
        }, 100);
    }

    /**
     * Hide the admin login modal
     */
    hide() {
        const modal = document.getElementById('adminLoginModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    /**
     * Remove any existing admin login modal
     */
    removeExistingModal() {
        const existingModal = document.getElementById('adminLoginModal');
        if (existingModal) {
            existingModal.remove();
        }
    }

    /**
     * Create the admin login modal HTML
     */
    createModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'adminLoginModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;" role="dialog" aria-labelledby="admin-login-title" aria-modal="true">
                <div class="modal-header">
                    <h2 class="modal-title" id="admin-login-title">Admin Login</h2>
                    <button class="modal-close" onclick="adminLogin.hide()" aria-label="Close modal">&times;</button>
                </div>
                
                <form id="adminLoginForm">
                    <div class="form-group">
                        <label class="form-label" for="adminUsername">Username</label>
                        <input type="text" class="form-input" id="adminUsername" placeholder="Enter username" required autocomplete="username">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="adminPassword">Password</label>
                        <input type="password" class="form-input" id="adminPassword" placeholder="Enter password" required autocomplete="current-password">
                    </div>
                    
                    <div id="adminLoginError" style="display: none; color: #ef4444; font-size: 0.875rem; margin-bottom: 1rem; text-align: center;" role="alert"></div>
                    
                    <button type="submit" class="submit-btn" id="adminLoginBtn">
                        <span id="adminLoginText">Login</span>
                        <span id="adminLoginSpinner" style="display: none;">
                            <div class="spinner" style="width: 1rem; height: 1rem; margin: 0 auto;"></div>
                        </span>
                    </button>
                </form>
                
                <div style="margin-top: 1rem; text-align: center; font-size: 0.75rem; color: var(--text-muted);">
                    Press Ctrl+Shift+A to access admin login
                </div>
            </div>
        `;
        
        // Add fade-in animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        return modal;
    }

    /**
     * Handle login form submission
     */
    async handleLogin(event) {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        const errorDiv = document.getElementById('adminLoginError');
        const loginBtn = document.getElementById('adminLoginBtn');
        const loginText = document.getElementById('adminLoginText');
        const loginSpinner = document.getElementById('adminLoginSpinner');

        // Clear previous errors
        errorDiv.style.display = 'none';
        
        // Show loading state
        loginBtn.disabled = true;
        loginText.style.display = 'none';
        loginSpinner.style.display = 'block';

        // Simulate API call delay for security
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (username === this.credentials.username && password === this.credentials.password) {
            // Successful login
            this.login();
            this.hide();
            
            // Dispatch event to show admin panel
            document.dispatchEvent(new CustomEvent('showAdminPanel'));
            
            console.log('Admin login successful');
        } else {
            // Failed login
            errorDiv.textContent = 'Invalid username or password';
            errorDiv.style.display = 'block';
            
            // Shake animation for visual feedback
            const modal = document.querySelector('#adminLoginModal .modal-content');
            if (modal) {
                modal.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    modal.style.animation = '';
                }, 500);
            }
        }
        
        // Reset button state
        loginBtn.disabled = false;
        loginText.style.display = 'block';
        loginSpinner.style.display = 'none';
    }

    /**
     * Set admin as logged in
     */
    login() {
        const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
        localStorage.setItem(this.sessionKey, 'true');
        localStorage.setItem(this.sessionExpiryKey, expiryTime.toString());
        localStorage.setItem(this.tokenKey, 'admin-token-' + Date.now());
        this.isLoggedIn = true;
    }

    /**
     * Logout admin and clear session
     */
    logout() {
        localStorage.removeItem(this.sessionKey);
        localStorage.removeItem(this.sessionExpiryKey);
        localStorage.removeItem(this.tokenKey);
        this.isLoggedIn = false;
        
        // Dispatch logout event
        document.dispatchEvent(new CustomEvent('adminLogout'));
        
        console.log('Admin logged out successfully');
    }

    /**
     * Check if admin is currently logged in
     */
    isAuthenticated() {
        return this.isLoggedIn;
    }
}

// CSS for shake animation
if (!document.querySelector('#admin-login-styles')) {
    const styles = document.createElement('style');
    styles.id = 'admin-login-styles';
    styles.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(styles);
}

export default AdminLoginModal;
