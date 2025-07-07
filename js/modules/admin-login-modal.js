import modalManager from './modal-manager.js';

/**
 * Admin Login Modal Component
 * Handles the admin login interface
 */
class AdminLoginModal {
    constructor(adminAuth) {
        this.adminAuth = adminAuth;
        this.modalId = 'adminLogin';
        this.isVisible = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        modalManager.register(this.modalId, this);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for show admin login event
        document.addEventListener('showAdminLogin', () => {
            this.show();
        });

        // Form submission handler
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
        modalManager.show(this.modalId);
        this.isVisible = true;
        
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
                modalManager.hide(this.modalId);
                this.isVisible = false;
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
                    <button class="modal-close" onclick="window.adminLoginModal.hide()" aria-label="Close modal">&times;</button>
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

        try {
            const result = await this.adminAuth.authenticate(username, password);
            
            if (result.success) {
                // Successful login
                this.hide();
                
                // Dispatch event to show admin panel
                document.dispatchEvent(new CustomEvent('showAdminPanel'));
                
                console.log('Admin login successful');
            } else {
                // Failed login
                errorDiv.textContent = result.error;
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
        } catch (error) {
            errorDiv.textContent = 'Login failed. Please try again.';
            errorDiv.style.display = 'block';
        }
        
        // Reset button state
        loginBtn.disabled = false;
        loginText.style.display = 'block';
        loginSpinner.style.display = 'none';
    }
}

export default AdminLoginModal;
