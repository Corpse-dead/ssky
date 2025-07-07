/**
 * Admin Authentication Module
 * Handles secure admin login and session management
 */
class AdminAuth {
    constructor() {
        this.credentials = {
            username: 'admin',
            password: 'admin'
        };
        this.sessionKey = 'adminLoggedIn';
        this.sessionExpiryKey = 'adminSessionExpiry';
        this.tokenKey = 'adminToken';
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.checkExistingSession();
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
                this.isAuthenticated = true;
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
                
                if (this.isAuthenticated) {
                    // Dispatch event to show admin panel
                    document.dispatchEvent(new CustomEvent('showAdminPanel'));
                } else {
                    // Show login modal
                    document.dispatchEvent(new CustomEvent('showAdminLogin'));
                }
            }
        });
    }

    /**
     * Authenticate admin credentials
     */
    async authenticate(username, password) {
        // Simulate API call delay for security
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (username === this.credentials.username && password === this.credentials.password) {
            this.login();
            return { success: true };
        } else {
            return { success: false, error: 'Invalid username or password' };
        }
    }

    /**
     * Set admin as logged in
     */
    login() {
        const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
        localStorage.setItem(this.sessionKey, 'true');
        localStorage.setItem(this.sessionExpiryKey, expiryTime.toString());
        localStorage.setItem(this.tokenKey, 'admin-token-' + Date.now());
        this.isAuthenticated = true;
        
        // Dispatch login event
        document.dispatchEvent(new CustomEvent('adminLogin'));
    }

    /**
     * Logout admin and clear session
     */
    logout() {
        localStorage.removeItem(this.sessionKey);
        localStorage.removeItem(this.sessionExpiryKey);
        localStorage.removeItem(this.tokenKey);
        this.isAuthenticated = false;
        
        // Dispatch logout event
        document.dispatchEvent(new CustomEvent('adminLogout'));
        
        console.log('Admin logged out successfully');
    }

    /**
     * Check if admin is currently authenticated
     */
    isLoggedIn() {
        return this.isAuthenticated;
    }

    /**
     * Get admin token for API calls
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }
}

export default AdminAuth;
