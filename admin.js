/**
 * SSKY Admin System
 * Hidden admin access with shortcut key: Esc (press twice quickly)
 * Credentials: admin/admin
 */

class SSKYAdminSystem {
    constructor() {
        this.isAuthenticated = false;
        this.escapeKeyPresses = [];
        this.escapeKeyTimeout = null;
        this.customImageFile = null;
        this.init();
    }

    init() {
        this.setupShortcutListener();
        this.injectAdminStyles();
        
        // Debug logging
        console.log('Admin system initialized');
    }

    setupShortcutListener() {
        document.addEventListener('keydown', (e) => {
            // Check if Esc key is pressed
            if (e.key === 'Escape' || e.code === 'Escape') {
                e.preventDefault();
                
                // Record the time of this escape key press
                const now = Date.now();
                this.escapeKeyPresses.push(now);
                
                // Remove presses older than 1 second
                this.escapeKeyPresses = this.escapeKeyPresses.filter(time => now - time < 1000);
                
                // Check if we have 2 escape presses within 1 second
                if (this.escapeKeyPresses.length >= 2) {
                    this.escapeKeyPresses = []; // Reset
                    console.log('Admin shortcut triggered');
                    this.showLoginModal();
                }
                
                // Clear the timeout if it exists
                if (this.escapeKeyTimeout) {
                    clearTimeout(this.escapeKeyTimeout);
                }
                
                // Set a timeout to clear escape presses after 1 second
                this.escapeKeyTimeout = setTimeout(() => {
                    this.escapeKeyPresses = [];
                }, 1000);
            }
        });
    }

    showLoginModal() {
        // Remove any existing modals first
        const existingModal = document.querySelector('.admin-login-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        if (this.isAuthenticated) {
            console.log('Already authenticated, showing admin panel');
            this.showAdminPanel();
            return;
        }

        console.log('Showing login modal');
        const modal = this.createLoginModal();
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Focus on username field
        setTimeout(() => {
            const usernameField = modal.querySelector('#admin-username');
            if (usernameField) {
                usernameField.focus();
                console.log('Focused on username field');
            }
        }, 100);
    }

    createLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'admin-login-overlay';
        modal.innerHTML = `
            <div class="admin-login-modal">
                <div class="admin-login-header">
                    <h2>Admin Access</h2>
                    <button class="admin-close-btn" onclick="window.adminSystem.closeLoginModal()">&times;</button>
                </div>
                <form class="admin-login-form" onsubmit="window.adminSystem.handleLogin(event)">
                    <div class="admin-form-group">
                        <label for="admin-username">Username</label>
                        <input 
                            type="text" 
                            id="admin-username" 
                            name="username" 
                            required 
                            autocomplete="off"
                            spellcheck="false"
                        >
                    </div>
                    <div class="admin-form-group">
                        <label for="admin-password">Password</label>
                        <input 
                            type="password" 
                            id="admin-password" 
                            name="password" 
                            required 
                            autocomplete="off"
                        >
                    </div>
                    <button type="submit" class="admin-login-btn">Login</button>
                    <div class="admin-error-msg" id="admin-error" style="display: none;"></div>
                </form>
            </div>
        `;
        
        // Add click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeLoginModal();
            }
        });
        
        return modal;
    }

    handleLogin(event) {
        event.preventDefault();
        console.log('Login form submitted');
        
        const formData = new FormData(event.target);
        const username = formData.get('username');
        const password = formData.get('password');
        
        console.log('Username:', username, 'Password:', password);
        
        // Simple authentication (in production, use proper auth)
        if (username === 'admin' && password === 'admin') {
            console.log('Authentication successful');
            this.isAuthenticated = true;
            this.closeLoginModal();
            
            // Small delay to ensure modal is closed before showing admin panel
            setTimeout(() => {
                this.showAdminPanel();
            }, 100);
        } else {
            console.log('Authentication failed');
            const errorEl = document.getElementById('admin-error');
            if (errorEl) {
                errorEl.textContent = 'Invalid credentials';
                errorEl.style.display = 'block';
            }
        }
    }

    closeLoginModal() {
        const modal = document.querySelector('.admin-login-overlay');
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
            console.log('Login modal closed');
        }
    }

    showAdminPanel() {
        // Remove any existing admin panel first
        const existingPanel = document.querySelector('.admin-panel-overlay');
        if (existingPanel) {
            existingPanel.remove();
        }

        console.log('Showing admin panel');
        const panel = this.createAdminPanel();
        document.body.appendChild(panel);
        document.body.style.overflow = 'hidden';
        
        // Ensure the panel is visible
        setTimeout(() => {
            panel.style.opacity = '1';
            panel.style.visibility = 'visible';
        }, 50);
    }

    createAdminPanel() {
        const panel = document.createElement('div');
        panel.className = 'admin-panel-overlay';
        panel.innerHTML = `
            <div class="admin-panel">
                <div class="admin-panel-header">
                    <h2>SSKY Admin Panel</h2>
                    <div class="admin-header-actions">
                        <button class="admin-minimize-btn" onclick="window.adminSystem.minimizePanel()">−</button>
                        <button class="admin-close-btn" onclick="window.adminSystem.closeAdminPanel()">&times;</button>
                    </div>
                </div>
                
                <div class="admin-panel-content">
                    <div class="admin-tabs">
                        <button class="admin-tab active" onclick="window.adminSystem.switchTab('add-product')">Add Product</button>
                        <button class="admin-tab" onclick="window.adminSystem.switchTab('manage-products')">Manage Products</button>
                    </div>
                    
                    <div class="admin-tab-content">
                        <div class="admin-tab-pane active" id="add-product-pane">
                            ${this.createAddProductForm()}
                        </div>
                        <div class="admin-tab-pane" id="manage-products-pane">
                            ${this.createManageProductsSection()}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add click outside to close (optional)
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                // Don't close by clicking outside for better UX
                // this.closeAdminPanel();
            }
        });
        
        return panel;
    }

    createAddProductForm() {
        return `
            <form class="admin-product-form" onsubmit="window.adminSystem.handleProductSubmit(event)">
                <div class="admin-form-row">
                    <div class="admin-form-group admin-form-full">
                        <label for="amazon-link">Amazon Product Link (Optional - for image only)</label>
                        <div class="admin-url-input-container">
                            <input 
                                type="url" 
                                id="amazon-link" 
                                name="amazonLink" 
                                placeholder="https://amazon.in/dp/... (Optional)" 
                                onpaste="window.adminSystem.handleAmazonLinkPaste(event)"
                            >
                            <button type="button" class="admin-analyze-btn" onclick="window.adminSystem.fetchAmazonImage()">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                Fetch Image
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="admin-form-row">
                    <div class="admin-form-group">
                        <label for="product-name">Product Name *</label>
                        <input type="text" id="product-name" name="productName" required placeholder="Enter product name">
                    </div>
                    <div class="admin-form-group">
                        <label for="product-price">Price (₹) *</label>
                        <input type="number" id="product-price" name="productPrice" min="0" step="0.01" required placeholder="299">
                    </div>
                </div>
                
                <div class="admin-form-row">
                    <div class="admin-form-group">
                        <label for="product-category">Category *</label>
                        <select id="product-category" name="productCategory" required onchange="window.adminSystem.updateSubcategories()">
                            <option value="">Select Category</option>
                            <option value="posters">Posters</option>
                            <option value="stickers">Die-cut Stickers</option>
                            <option value="wall-posters">Custom Wall Posters</option>
                            <option value="custom-stickers">Custom Stickers</option>
                        </select>
                    </div>
                    <div class="admin-form-group">
                        <label for="product-subcategory">Subcategory</label>
                        <select id="product-subcategory" name="productSubcategory">
                            <option value="">Select Subcategory</option>
                        </select>
                    </div>
                </div>
                
                <div class="admin-form-row">
                    <div class="admin-form-group admin-form-full">
                        <label for="product-image">Product Image *</label>
                        <div class="admin-image-input-options">
                            <div class="admin-image-option">
                                <label>Option 1: Image URL</label>
                                <input type="url" id="product-image" name="productImage" placeholder="https://example.com/image.jpg" onchange="window.adminSystem.previewImage()">
                            </div>
                            <div class="admin-image-option-divider">OR</div>
                            <div class="admin-image-option">
                                <label>Option 2: Upload Custom Image</label>
                                <div class="admin-file-upload">
                                    <input type="file" id="custom-image-upload" accept="image/*" onchange="window.adminSystem.handleCustomImageUpload(event)">
                                    <div class="admin-file-upload-text">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                                            <path d="M14 2v6h6M16 13a4 4 0 11-8 0 4 4 0 018 0zM12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"/>
                                        </svg>
                                        <strong>Click to upload</strong><br>
                                        <small>PNG, JPG, GIF up to 5MB</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="admin-image-preview" id="image-preview" style="display: none;">
                            <img id="preview-img" src="" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                            <button type="button" class="admin-remove-image" onclick="window.adminSystem.removeImage()">Remove</button>
                        </div>
                    </div>
                </div>
                
                <div class="admin-form-row">
                    <div class="admin-form-group admin-form-full">
                        <label for="product-description">Description *</label>
                        <textarea id="product-description" name="productDescription" rows="4" required placeholder="Enter detailed product description..."></textarea>
                    </div>
                </div>
                
                <div class="admin-form-row">
                    <div class="admin-form-group">
                        <label for="product-badge">Badge (Optional)</label>
                        <select id="product-badge" name="productBadge">
                            <option value="">No Badge</option>
                            <option value="new">New</option>
                            <option value="trending">Trending</option>
                            <option value="sale">Sale</option>
                        </select>
                    </div>
                    <div class="admin-form-group">
                        <label for="product-stock">Stock Status</label>
                        <select id="product-stock" name="productStock">
                            <option value="in-stock">In Stock</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                        </select>
                    </div>
                </div>
                
                <div class="admin-form-actions">
                    <button type="button" class="admin-btn admin-btn-secondary" onclick="window.adminSystem.clearForm()">Clear Form</button>
                    <button type="submit" class="admin-btn admin-btn-primary">
                        <span class="admin-btn-text">Add Product</span>
                        <div class="admin-btn-spinner" style="display: none;">
                            <div class="spinner"></div>
                        </div>
                    </button>
                </div>
            </form>
        `;
    }

    createManageProductsSection() {
        return `
            <div class="admin-products-list">
                <div class="admin-products-header">
                    <h3>Existing Products</h3>
                    <button class="admin-btn admin-btn-secondary" onclick="window.adminSystem.loadProducts()">Refresh</button>
                </div>
                <div class="admin-products-container" id="admin-products-container">
                    <div class="admin-loading">Loading products...</div>
                </div>
            </div>
        `;
    }

    // AI Analysis simplified to fetch image only
    async fetchAmazonImage() {
        const linkInput = document.getElementById('amazon-link');
        const fetchBtn = document.querySelector('.admin-analyze-btn');
        
        if (!linkInput.value) {
            this.showNotification('Please enter an Amazon product link first.', 'warning');
            return;
        }

        // Show loading state
        fetchBtn.innerHTML = '<div class="spinner"></div> Fetching...';
        fetchBtn.disabled = true;

        try {
            // Simplified AI analysis - image only
            const imageData = await this.performImageFetch(linkInput.value);
            
            if (imageData.success) {
                // Auto-fill only the image field
                document.getElementById('product-image').value = imageData.image || '';
                
                // Preview image
                this.previewImage();
                
                // Show success message
                this.showNotification('Product image fetched successfully!', 'success');
            } else {
                throw new Error(imageData.error || 'Image fetch failed');
            }
        } catch (error) {
            console.error('Image fetch failed:', error);
            // Fallback to scraping
            await this.fallbackImageScraping(linkInput.value);
        } finally {
            // Reset button
            fetchBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Fetch Image
            `;
            fetchBtn.disabled = false;
        }
    }

    async performImageFetch(amazonUrl) {
        // Simplified AI/API call for image only
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock response with image only
                const mockData = {
                    success: true,
                    image: "https://via.placeholder.com/400x400/e60023/ffffff?text=Fetched+Image"
                };
                resolve(mockData);
            }, 1500);
        });
    }

    async fallbackImageScraping(amazonUrl) {
        try {
            // Fallback server-side scraping for image only
            const response = await fetch('/api/scrape-amazon-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: amazonUrl })
            });
            
            const data = await response.json();
            
            if (data.success && data.image) {
                document.getElementById('product-image').value = data.image;
                this.previewImage();
                this.showNotification('Product image scraped successfully!', 'success');
            } else {
                this.showNotification('Could not fetch image. Please upload manually.', 'warning');
            }
        } catch (error) {
            console.error('Image scraping failed:', error);
            this.showNotification('Image fetch failed. Please upload manually.', 'error');
        }
    }

    // Handle custom image upload
    handleCustomImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('File size must be less than 5MB', 'error');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }

        // Create file URL for preview
        const reader = new FileReader();
        reader.onload = (e) => {
            // Clear URL input when custom image is uploaded
            document.getElementById('product-image').value = '';
            
            // Show preview with uploaded image
            const preview = document.getElementById('image-preview');
            const previewImg = document.getElementById('preview-img');
            
            previewImg.src = e.target.result;
            preview.style.display = 'block';
            
            // Store file data for later upload
            this.customImageFile = file;
            
            this.showNotification('Image uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }

    // Remove image preview
    removeImage() {
        document.getElementById('product-image').value = '';
        document.getElementById('custom-image-upload').value = '';
        document.getElementById('image-preview').style.display = 'none';
        this.customImageFile = null;
    }

    previewImage() {
        const imageUrl = document.getElementById('product-image').value;
        const preview = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');
        
        if (imageUrl) {
            previewImg.src = imageUrl;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    }

    // Enhanced Amazon link paste handler
    handleAmazonLinkPaste(event) {
        setTimeout(() => {
            const link = event.target.value;
            if (link && link.includes('amazon')) {
                // Show suggestion to fetch image
                this.showNotification('Amazon link detected! Click "Fetch Image" to get the product image.', 'info');
            }
        }, 100);
    }

    updateSubcategories() {
        const category = document.getElementById('product-category').value;
        const subcategorySelect = document.getElementById('product-subcategory');
        
        const subcategories = {
            'posters': ['kpop', 'anime', 'aesthetic', 'cats', 'cars', 'movies', 'sports'],
            'stickers': ['gaming', 'tech', 'nature', 'vintage', 'abstract', 'cute'],
            'wall-posters': ['minimalist', 'vintage', 'modern', 'nature', 'abstract'],
            'custom-stickers': ['logo', 'text', 'photo', 'design']
        };
        
        subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
        
        if (subcategories[category]) {
            subcategories[category].forEach(sub => {
                const option = document.createElement('option');
                option.value = sub;
                option.textContent = sub.charAt(0).toUpperCase() + sub.slice(1);
                subcategorySelect.appendChild(option);
            });
        }
    }

    async handleProductSubmit(event) {
        event.preventDefault();
        console.log('Product form submitted');
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.admin-btn-text');
        const btnSpinner = submitBtn.querySelector('.admin-btn-spinner');
        
        // Show loading state
        btnText.style.display = 'none';
        btnSpinner.style.display = 'block';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData(event.target);
            const productData = Object.fromEntries(formData.entries());
            
            // Validate required fields
            if (!productData.productName || !productData.productPrice || !productData.productDescription || !productData.productCategory) {
                throw new Error('Please fill all required fields');
            }

            // Handle image - either URL or uploaded file
            let imageUrl = productData.productImage;
            
            if (this.customImageFile) {
                // Upload custom image first
                imageUrl = await this.uploadCustomImage(this.customImageFile);
            } else if (!imageUrl) {
                throw new Error('Please provide a product image (URL or upload)');
            }
            
            // Prepare final product data
            const finalProductData = {
                ...productData,
                productImage: imageUrl
            };
            
            console.log('Submitting product data:', finalProductData);
            
            // Simulate successful save for now
            setTimeout(() => {
                this.showNotification('Product added successfully!', 'success');
                this.clearForm();
                
                // Reset button state
                btnText.style.display = 'block';
                btnSpinner.style.display = 'none';
                submitBtn.disabled = false;
            }, 1000);
            
        } catch (error) {
            console.error('Error adding product:', error);
            this.showNotification(error.message, 'error');
            
            // Reset button state
            btnText.style.display = 'block';
            btnSpinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    async uploadCustomImage(file) {
        // Simulate image upload to server/cloud storage
        return new Promise((resolve) => {
            setTimeout(() => {
                // In production, this would return the actual uploaded URL
                resolve(URL.createObjectURL(file));
            }, 500);
        });
    }

    clearForm() {
        const form = document.querySelector('.admin-product-form');
        if (form) {
            form.reset();
            document.getElementById('image-preview').style.display = 'none';
            this.customImageFile = null;
        }
    }

    switchTab(tabName) {
        // Remove active class from all tabs and panes
        document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.admin-tab-pane').forEach(pane => pane.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding pane
        event.target.classList.add('active');
        document.getElementById(`${tabName}-pane`).classList.add('active');
        
        // Load products if manage tab is selected
        if (tabName === 'manage-products') {
            this.loadProducts();
        }
    }

    async loadProducts() {
        const container = document.getElementById('admin-products-container');
        container.innerHTML = '<div class="admin-loading">Loading products...</div>';
        
        try {
            // Simulate loading products
            setTimeout(() => {
                container.innerHTML = '<div class="admin-empty">No products found. Add some products first.</div>';
            }, 1000);
        } catch (error) {
            console.error('Error loading products:', error);
            container.innerHTML = '<div class="admin-error">Failed to load products.</div>';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification admin-notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    minimizePanel() {
        const panel = document.querySelector('.admin-panel');
        panel.classList.toggle('minimized');
    }

    closeAdminPanel() {
        const panel = document.querySelector('.admin-panel-overlay');
        if (panel) {
            panel.remove();
            document.body.style.overflow = 'auto';
            console.log('Admin panel closed');
        }
        // Keep authenticated for the session
        // this.isAuthenticated = false;
    }

    injectAdminStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            /* Admin System Styles */
            .admin-login-overlay, .admin-panel-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(4px);
                opacity: 1;
                visibility: visible;
            }

            .admin-login-modal {
                background: var(--bg-card, white);
                border-radius: 16px;
                padding: 32px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                border: 1px solid var(--border-color, #e2e8f0);
            }

            .admin-panel {
                background: var(--bg-card, white);
                border-radius: 16px;
                max-width: 1000px;
                width: 95%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                border: 1px solid var(--border-color, #e2e8f0);
                transition: all 0.3s ease;
            }

            .admin-panel.minimized {
                max-height: 60px;
                overflow: hidden;
            }

            .admin-login-header, .admin-panel-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 24px;
                border-bottom: 1px solid var(--border-color, #e2e8f0);
                flex-shrink: 0;
            }

            .admin-header-actions {
                display: flex;
                gap: 8px;
            }

            .admin-close-btn, .admin-minimize-btn {
                background: none;
                border: none;
                font-size: 24px;
                color: var(--text-muted, #64748b);
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 8px;
                transition: all 0.2s;
            }

            .admin-close-btn:hover, .admin-minimize-btn:hover {
                background: var(--bg-tertiary, #f1f5f9);
                color: var(--text-primary, #0f172a);
            }

            .admin-panel-content {
                flex: 1;
                overflow-y: auto;
                padding: 24px;
            }

            .admin-tabs {
                display: flex;
                gap: 4px;
                margin-bottom: 24px;
                border-bottom: 1px solid var(--border-color, #e2e8f0);
            }

            .admin-tab {
                padding: 12px 24px;
                background: none;
                border: none;
                cursor: pointer;
                color: var(--text-secondary, #475569);
                font-weight: 500;
                border-radius: 8px 8px 0 0;
                transition: all 0.2s;
                position: relative;
            }

            .admin-tab.active {
                color: var(--brand-red, #e60023);
                background: var(--brand-red-light, rgba(230, 0, 35, 0.1));
            }

            .admin-tab.active::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 0;
                right: 0;
                height: 2px;
                background: var(--brand-red, #e60023);
            }

            .admin-tab-pane {
                display: none;
            }

            .admin-tab-pane.active {
                display: block;
            }

            .admin-form-group {
                margin-bottom: 20px;
            }

            .admin-form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }

            .admin-form-full {
                grid-column: 1 / -1;
            }

            .admin-form-group label {
                display: block;
                font-weight: 600;
                color: var(--text-primary, #0f172a);
                margin-bottom: 8px;
                font-size: 14px;
            }

            .admin-form-group input,
            .admin-form-group select,
            .admin-form-group textarea {
                width: 100%;
                padding: 12px 16px;
                background: var(--bg-secondary, #f8fafc);
                border: 1px solid var(--border-color, #e2e8f0);
                border-radius: 8px;
                color: var(--text-primary, #0f172a);
                font-size: 14px;
                transition: all 0.2s;
                outline: none;
            }

            .admin-form-group input:focus,
            .admin-form-group select:focus,
            .admin-form-group textarea:focus {
                border-color: var(--brand-red, #e60023);
                box-shadow: 0 0 0 3px rgba(230, 0, 35, 0.1);
            }

            .admin-url-input-container {
                display: flex;
                gap: 12px;
                align-items: stretch;
            }

            .admin-url-input-container input {
                flex: 1;
            }

            .admin-analyze-btn {
                padding: 12px 20px;
                background: var(--brand-red, #e60023);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
                white-space: nowrap;
                min-width: 120px;
                justify-content: center;
            }

            .admin-analyze-btn:hover:not(:disabled) {
                background: var(--brand-red-hover, #c5001f);
                transform: translateY(-1px);
            }

            .admin-analyze-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
                transform: none;
            }

            .admin-image-input-options {
                border: 1px solid var(--border-color, #e2e8f0);
                border-radius: 12px;
                padding: 20px;
                background: var(--bg-tertiary, #f1f5f9);
            }

            .admin-image-option {
                margin-bottom: 16px;
            }

            .admin-image-option:last-child {
                margin-bottom: 0;
            }

            .admin-image-option label {
                display: block;
                font-weight: 600;
                color: var(--text-primary, #0f172a);
                margin-bottom: 8px;
                font-size: 14px;
            }

            .admin-image-option-divider {
                text-align: center;
                margin: 16px 0;
                color: var(--text-muted, #64748b);
                font-weight: 500;
                position: relative;
            }

            .admin-image-option-divider::before,
            .admin-image-option-divider::after {
                content: '';
                position: absolute;
                top: 50%;
                width: 40%;
                height: 1px;
                background: var(--border-color, #e2e8f0);
            }

            .admin-image-option-divider::before {
                left: 0;
            }

            .admin-image-option-divider::after {
                right: 0;
            }

            .admin-file-upload {
                position: relative;
                display: block;
                width: 100%;
                padding: 24px;
                border: 2px dashed var(--border-color, #e2e8f0);
                border-radius: 8px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
                background: var(--bg-secondary, #f8fafc);
            }

            .admin-file-upload:hover {
                border-color: var(--brand-red, #e60023);
                background: var(--brand-red-light, rgba(230, 0, 35, 0.1));
            }

            .admin-file-upload input {
                position: absolute;
                opacity: 0;
                width: 100%;
                height: 100%;
                cursor: pointer;
                top: 0;
                left: 0;
            }

            .admin-file-upload-text {
                color: var(--text-muted, #64748b);
                font-size: 14px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }

            .admin-file-upload-text svg {
                color: var(--text-secondary, #475569);
                margin-bottom: 8px;
            }

            .admin-image-preview {
                margin-top: 16px;
                text-align: center;
                padding: 16px;
                border: 1px solid var(--border-color, #e2e8f0);
                border-radius: 8px;
                background: var(--bg-secondary, #f8fafc);
                position: relative;
            }

            .admin-remove-image {
                position: absolute;
                top: 8px;
                right: 8px;
                background: #dc2626;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .admin-remove-image:hover {
                background: #b91c1c;
            }

            .admin-form-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid var(--border-color, #e2e8f0);
            }

            .admin-btn {
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }

            .admin-btn-primary {
                background: var(--brand-red, #e60023);
                color: white;
                border-color: var(--brand-red, #e60023);
            }

            .admin-btn-primary:hover:not(:disabled) {
                background: var(--brand-red-hover, #c5001f);
            }

            .admin-btn-secondary {
                background: var(--bg-secondary, #f8fafc);
                color: var(--text-secondary, #475569);
                border-color: var(--border-color, #e2e8f0);
            }

            .admin-btn-secondary:hover {
                background: var(--bg-tertiary, #f1f5f9);
            }

            .admin-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }

            .admin-login-btn {
                width: 100%;
                padding: 12px 24px;
                background: var(--brand-red, #e60023);
                color: white;
                border: none;