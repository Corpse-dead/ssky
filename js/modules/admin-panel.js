import modalManager from './modal-manager.js';

/**
 * Admin Panel Module
 * Handles the main admin interface - ONLY shows when shortcut is pressed
 */
class AdminPanel {
    constructor(adminAuth) {
        this.adminAuth = adminAuth;
        this.modalId = 'adminPanel';
        this.isVisible = false;
        this.currentTab = 'add';
        this.products = JSON.parse(localStorage.getItem('universalProducts') || '[]');
        this.init();
    }

    init() {
        this.setupEventListeners();
        modalManager.register(this.modalId, this);
    }

    /**
     * Setup event listeners for admin panel events
     */
    setupEventListeners() {
        // Listen for show admin panel event - ONLY way to show panel
        document.addEventListener('showAdminPanel', () => {
            if (this.adminAuth.isLoggedIn()) {
                this.show();
            } else {
                console.warn('Unauthorized access to admin panel');
            }
        });

        // Listen for admin logout event
        document.addEventListener('adminLogout', () => {
            this.hide();
        });

        // Global functions for panel management
        window.closeAdminPanel = () => this.hide();
        window.showAdminTab = (tab) => this.showTab(tab);
    }

    /**
     * Show the admin panel - ONLY when explicitly called
     */
    show() {
        if (!this.adminAuth.isLoggedIn()) {
            console.warn('Unauthorized access to admin panel');
            return;
        }

        // Remove existing panel
        this.removeExistingPanel();
        
        const panel = this.createPanel();
        document.body.appendChild(panel);
        modalManager.show(this.modalId);
        this.isVisible = true;
        
        // Show with animation
        setTimeout(() => {
            panel.classList.add('active');
        }, 10);
        
        // Initialize with Add Product tab
        this.showTab('add');
        
        console.log('Admin panel opened');
    }

    /**
     * Hide the admin panel
     */
    hide() {
        const panel = document.querySelector('.admin-panel');
        if (panel) {
            panel.classList.remove('active');
            setTimeout(() => {
                panel.remove();
                modalManager.hide(this.modalId);
                this.isVisible = false;
            }, 300);
        }
    }

    /**
     * Remove any existing admin panel
     */
    removeExistingPanel() {
        const existingPanel = document.querySelector('.admin-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
    }

    /**
     * Create the admin panel HTML
     */
    createPanel() {
        const panel = document.createElement('div');
        panel.className = 'admin-panel-container';
        panel.innerHTML = `
            <div class="admin-panel" style="position: fixed; top: 5rem; right: 1rem; background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: 12px; padding: var(--space-4); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); z-index: 1000; min-width: 350px; max-width: 90vw; opacity: 0; transform: translateY(-20px); transition: all 0.3s ease;" role="dialog" aria-labelledby="admin-panel-title" aria-modal="true">
                <div class="admin-panel-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
                    <h3 id="admin-panel-title" style="margin: 0; color: var(--text-primary, #0f172a); font-size: 1.125rem;">Admin Panel</h3>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span style="font-size: 0.75rem; color: var(--text-muted, #64748b);">Welcome, admin</span>
                        <button onclick="window.adminAuth.logout()" style="padding: 0.25rem 0.5rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Logout</button>
                        <button onclick="closeAdminPanel()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted, #64748b);" aria-label="Close admin panel">&times;</button>
                    </div>
                </div>
                
                <div class="admin-tabs" style="display: flex; gap: 0.5rem; margin-bottom: var(--space-4);">
                    <button class="admin-tab active" onclick="showAdminTab('add')" style="padding: 0.5rem 1rem; background: #e60023; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">Add Product</button>
                    <button class="admin-tab" onclick="showAdminTab('view')" style="padding: 0.5rem 1rem; background: var(--bg-secondary, #f8fafc); color: var(--text-primary, #0f172a); border: 1px solid var(--border-color, #e2e8f0); border-radius: 6px; cursor: pointer; font-size: 0.875rem;">View Products</button>
                    <button class="admin-tab" onclick="showAdminTab('manage')" style="padding: 0.5rem 1rem; background: var(--bg-secondary, #f8fafc); color: var(--text-primary, #0f172a); border: 1px solid var(--border-color, #e2e8f0); border-radius: 6px; cursor: pointer; font-size: 0.875rem;">Site Management</button>
                </div>
                
                <div id="admin-content">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        `;
        
        return panel;
    }

    /**
     * Show specific tab content
     */
    showTab(tab) {
        if (!this.adminAuth.isLoggedIn()) {
            console.warn('Unauthorized access to admin tab');
            return;
        }

        this.currentTab = tab;

        // Update tab buttons
        document.querySelectorAll('.admin-tab').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'var(--bg-secondary, #f8fafc)';
            btn.style.color = 'var(--text-primary, #0f172a)';
            btn.style.border = '1px solid var(--border-color, #e2e8f0)';
        });
        
        const activeBtn = document.querySelector(`[onclick="showAdminTab('${tab}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.style.background = '#e60023';
            activeBtn.style.color = 'white';
            activeBtn.style.border = 'none';
        }

        const content = document.getElementById('admin-content');
        if (!content) return;

        switch (tab) {
            case 'add':
                content.innerHTML = this.getAddProductForm();
                this.setupAddProductForm();
                break;
            case 'view':
                this.loadProductList();
                break;
            case 'manage':
                content.innerHTML = this.getManagementContent();
                break;
        }
    }

    /**
     * Get Add Product form HTML
     */
    getAddProductForm() {
        return `
            <form id="adminAddProductForm" style="display: flex; flex-direction: column; gap: 1rem; min-width: 300px;">
                <input type="text" id="adminProductTitle" placeholder="Product Title" required style="padding: 0.5rem; border: 1px solid var(--border-color, #e2e8f0); border-radius: 6px; background: var(--bg-secondary, #f8fafc); color: var(--text-primary, #0f172a);">
                
                <select id="adminProductCategory" required style="padding: 0.5rem; border: 1px solid var(--border-color, #e2e8f0); border-radius: 6px; background: var(--bg-secondary, #f8fafc); color: var(--text-primary, #0f172a);">
                    <option value="">Select Category</option>
                    <option value="posters">Posters</option>
                    <option value="die-cut-stickers">Die Cut Stickers</option>
                    <option value="normal-stickers">Normal Stickers</option>
                    <option value="keychains">Keychains</option>
                    <option value="badges">Badges</option>
                    <option value="kpop">K-pop</option>
                    <option value="anime">Anime</option>
                    <option value="aesthetic">Aesthetic</option>
                    <option value="cats">Cats</option>
                    <option value="cars">Cars</option>
                </select>
                
                <input type="number" id="adminProductPrice" placeholder="Price (₹)" required style="padding: 0.5rem; border: 1px solid var(--border-color, #e2e8f0); border-radius: 6px; background: var(--bg-secondary, #f8fafc); color: var(--text-primary, #0f172a);">
                
                <input type="url" id="adminProductImage" placeholder="Image URL" required style="padding: 0.5rem; border: 1px solid var(--border-color, #e2e8f0); border-radius: 6px; background: var(--bg-secondary, #f8fafc); color: var(--text-primary, #0f172a);">
                
                <input type="url" id="adminProductLink" placeholder="Purchase Link" required style="padding: 0.5rem; border: 1px solid var(--border-color, #e2e8f0); border-radius: 6px; background: var(--bg-secondary, #f8fafc); color: var(--text-primary, #0f172a);">
                
                <select id="adminProductBadge" style="padding: 0.5rem; border: 1px solid var(--border-color, #e2e8f0); border-radius: 6px; background: var(--bg-secondary, #f8fafc); color: var(--text-primary, #0f172a);">
                    <option value="">No Badge</option>
                    <option value="new">New</option>
                    <option value="trending">Trending</option>
                    <option value="bestseller">Best Seller</option>
                    <option value="limited">Limited Edition</option>
                </select>
                
                <textarea id="adminProductDescription" placeholder="Product Description (optional)" rows="3" style="padding: 0.5rem; border: 1px solid var(--border-color, #e2e8f0); border-radius: 6px; background: var(--bg-secondary, #f8fafc); color: var(--text-primary, #0f172a); resize: vertical;"></textarea>
                
                <button type="submit" style="padding: 0.75rem; background: #e60023; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Add Product</button>
            </form>
        `;
    }

    /**
     * Setup Add Product form event listeners
     */
    setupAddProductForm() {
        const form = document.getElementById('adminAddProductForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProduct();
            });
        }
    }

    /**
     * Add a new product
     */
    addProduct() {
        const formData = {
            id: 'prod_' + Date.now(),
            title: document.getElementById('adminProductTitle').value,
            category: document.getElementById('adminProductCategory').value,
            price: parseInt(document.getElementById('adminProductPrice').value),
            image: document.getElementById('adminProductImage').value,
            link: document.getElementById('adminProductLink').value,
            badge: document.getElementById('adminProductBadge').value || null,
            description: document.getElementById('adminProductDescription').value || '',
            createdAt: new Date().toISOString(),
            page: window.location.pathname
        };

        // Validate form data
        if (!formData.title || !formData.category || !formData.price || !formData.image || !formData.link) {
            alert('Please fill in all required fields');
            return;
        }

        // Add to products array
        this.products.push(formData);
        
        // Save to localStorage
        localStorage.setItem('universalProducts', JSON.stringify(this.products));
        
        alert('Product added successfully!');
        
        // Clear form
        document.getElementById('adminAddProductForm').reset();
        
        // Refresh page products if available
        this.refreshPageProducts();
    }

    /**
     * Load and display product list
     */
    loadProductList() {
        const content = document.getElementById('admin-content');
        if (!content) return;

        content.innerHTML = `
            <div style="min-width: 400px; max-height: 400px; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="margin: 0; color: var(--text-primary, #0f172a);">Product List (${this.products.length})</h4>
                    <button onclick="window.adminPanel.loadProductList()" style="padding: 0.25rem 0.5rem; background: var(--bg-secondary, #f8fafc); border: 1px solid var(--border-color, #e2e8f0); border-radius: 4px; cursor: pointer; color: var(--text-primary, #0f172a); font-size: 0.75rem;">Refresh</button>
                </div>
                <div id="productListContainer">
                    ${this.products.length === 0 ? 
                        '<div style="text-align: center; padding: 2rem; color: var(--text-muted, #64748b);">No products found</div>' :
                        this.products.map(product => `
                            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid var(--border-color, #e2e8f0); border-radius: 6px; margin-bottom: 0.5rem; background: var(--bg-secondary, #f8fafc);">
                                <img src="${product.image}" alt="${product.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNSAzNUM3IDM1IDcgMjUgMjUgMjVTNDMgMzUgMjUgMzVaIiBmaWxsPSIjOUI5Qjk5Ii8+CjxjaXJjbGUgY3g9IjI1IiBjeT0iMjAiIHI9IjUiIGZpbGw9IiM5QjlCOTkiLz4KPC9zdmc+Cg=='">
                                <div style="flex: 1;">
                                    <h5 style="margin: 0 0 0.25rem 0; color: var(--text-primary, #0f172a); font-size: 0.9rem;">${product.title}</h5>
                                    <div style="font-size: 0.8rem; color: var(--text-muted, #64748b);">
                                        ${product.category} • ₹${product.price}
                                        ${product.badge ? ` • <span style="color: #e60023;">${product.badge}</span>` : ''}
                                    </div>
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button onclick="window.adminPanel.editProduct('${product.id}')" style="padding: 0.25rem 0.5rem; background: var(--bg-tertiary, #f1f5f9); border: 1px solid var(--border-color, #e2e8f0); border-radius: 4px; cursor: pointer; color: var(--text-primary, #0f172a); font-size: 0.8rem;">Edit</button>
                                    <button onclick="window.adminPanel.deleteProduct('${product.id}')" style="padding: 0.25rem 0.5rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Delete</button>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
    }

    /**
     * Get management content
     */
    getManagementContent() {
        return `
            <div style="min-width: 300px;">
                <h4 style="margin: 0 0 1rem 0; color: var(--text-primary, #0f172a);">Site Management</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <button onclick="window.adminPanel.clearAllProducts()" style="padding: 0.5rem 1rem; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer;">Clear All Products</button>
                    <button onclick="window.adminPanel.exportProducts()" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">Export Products</button>
                    <button onclick="window.adminPanel.importProducts()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">Import Products</button>
                    <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-secondary, #f8fafc); border-radius: 6px; font-size: 0.875rem; color: var(--text-muted, #64748b);">
                        <strong>Current Page:</strong> ${window.location.pathname}<br>
                        <strong>Session Expires:</strong> ${new Date(parseInt(localStorage.getItem('adminSessionExpiry') || '0')).toLocaleString()}
                    </div>
                </div>
            </div>
        `;
    }

    // ...existing methods for product management...
    editProduct(id) {
        // Implementation for editing products
    }

    deleteProduct(id) {
        // Implementation for deleting products
    }

    clearAllProducts() {
        // Implementation for clearing all products
    }

    exportProducts() {
        // Implementation for exporting products
    }

    importProducts() {
        // Implementation for importing products
    }

    refreshPageProducts() {
        // Refresh products on current page if applicable
        if (typeof window.posterPage?.renderProducts === 'function') {
            window.posterPage.renderProducts();
        }
    }
}

export default AdminPanel;
