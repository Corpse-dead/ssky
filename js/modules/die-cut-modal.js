import modalManager from './modal-manager.js';

/**
 * Die-Cut Custom Print Modal Component
 * Handles die-cut sticker order forms
 */
class DieCutModal {
    constructor() {
        this.modalId = 'dieCutPrint';
        this.isVisible = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        modalManager.register(this.modalId, this);
        this.createModalHTML();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Form submission handler
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'customDieCutForm') {
                e.preventDefault();
                this.handleSubmit(e);
            }
        });

        // Dynamic form handlers
        document.addEventListener('change', (e) => {
            if (e.target.id === 'dieCutSize') {
                this.handleSizeChange(e);
            }
            if (e.target.id === 'dieCutQuantity') {
                this.handleQuantityChange(e);
            }
        });

        // Global button handlers
        window.openCustomDieCutModal = () => this.show();
        window.closeCustomDieCutModal = () => this.hide();
    }

    /**
     * Create modal HTML in the DOM
     */
    createModalHTML() {
        // Only create if it doesn't exist
        if (document.getElementById('customDieCutModal')) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'customDieCutModal';
        modal.innerHTML = `
            <div class="modal-content" role="dialog" aria-labelledby="die-cut-title" aria-modal="true">
                <div class="modal-header">
                    <h2 class="modal-title" id="die-cut-title">Custom Die Cut Sticker Order</h2>
                    <button class="modal-close" onclick="closeCustomDieCutModal()" aria-label="Close modal">&times;</button>
                </div>
                
                <form id="customDieCutForm">
                    <div class="form-group">
                        <label class="form-label" for="dieCutImage">Upload Your Design</label>
                        <div class="file-upload">
                            <input type="file" id="dieCutImage" accept="image/png,image/jpeg,image/jpg,image/webp" required>
                            <div class="file-upload-text">
                                <strong>Click to upload</strong> or drag and drop<br>
                                PNG, JPG, JPEG, WebP with transparent background preferred<br>
                                Maximum file size: 10MB
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="dieCutSize">Sticker Size</label>
                        <select class="form-select" id="dieCutSize" required>
                            <option value="">Select size</option>
                            <option value="small">Small (2-3 inches) - ₹25 each</option>
                            <option value="medium">Medium (3-4 inches) - ₹35 each</option>
                            <option value="large">Large (4-5 inches) - ₹45 each</option>
                            <option value="xl">Extra Large (5-6 inches) - ₹55 each</option>
                            <option value="custom">Custom Size (specify below)</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="customSizeGroup" style="display: none;">
                        <label class="form-label">Custom Dimensions</label>
                        <div class="size-grid">
                            <div>
                                <label class="form-label" for="dieCutWidth">Width (inches)</label>
                                <input type="number" class="form-input" id="dieCutWidth" min="1" max="12" step="0.1">
                            </div>
                            <div>
                                <label class="form-label" for="dieCutHeight">Height (inches)</label>
                                <input type="number" class="form-input" id="dieCutHeight" min="1" max="12" step="0.1">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="dieCutQuantity">Quantity</label>
                        <select class="form-select" id="dieCutQuantity" required>
                            <option value="">Select quantity</option>
                            <option value="10">10 stickers</option>
                            <option value="25">25 stickers (5% discount)</option>
                            <option value="50">50 stickers (10% discount)</option>
                            <option value="100">100 stickers (15% discount)</option>
                            <option value="custom">Custom quantity</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="customQuantityGroup" style="display: none;">
                        <label class="form-label" for="dieCutCustomQuantity">Custom Quantity</label>
                        <input type="number" class="form-input" id="dieCutCustomQuantity" min="1" max="1000" placeholder="Enter quantity">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="dieCutFinish">Finish Type</label>
                        <select class="form-select" id="dieCutFinish" required>
                            <option value="">Select finish</option>
                            <option value="matte">Matte (No glare, premium look)</option>
                            <option value="glossy">Glossy (Vibrant colors, shiny)</option>
                            <option value="transparent">Transparent (Clear background)</option>
                            <option value="holographic">Holographic (+₹10 each)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="dieCutNotes">Special Instructions (Optional)</label>
                        <textarea class="form-input" id="dieCutNotes" rows="3" placeholder="Any special cutting requirements, color preferences, or other instructions..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-lg); font-size: 0.875rem; color: var(--text-secondary);">
                            <strong>📋 Order Process:</strong><br>
                            1. Submit your design and requirements<br>
                            2. We'll review and send you a quote within 24 hours<br>
                            3. After approval, production takes 3-5 business days<br>
                            4. Free shipping on orders above ₹500
                        </div>
                    </div>
                    
                    <button type="submit" class="submit-btn">Submit Die Cut Order</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Show the die-cut modal
     */
    show() {
        const modal = document.getElementById('customDieCutModal');
        if (modal) {
            modal.classList.add('active');
            modalManager.show(this.modalId);
            this.isVisible = true;
        }
    }

    /**
     * Hide the die-cut modal
     */
    hide() {
        const modal = document.getElementById('customDieCutModal');
        if (modal) {
            modal.classList.remove('active');
            modalManager.hide(this.modalId);
            this.isVisible = false;
            this.resetForm();
        }
    }

    /**
     * Handle size selection change
     */
    handleSizeChange(event) {
        const customSizeGroup = document.getElementById('customSizeGroup');
        const widthInput = document.getElementById('dieCutWidth');
        const heightInput = document.getElementById('dieCutHeight');
        
        if (event.target.value === 'custom') {
            customSizeGroup.style.display = 'block';
            widthInput.required = true;
            heightInput.required = true;
        } else {
            customSizeGroup.style.display = 'none';
            widthInput.required = false;
            heightInput.required = false;
        }
    }

    /**
     * Handle quantity selection change
     */
    handleQuantityChange(event) {
        const customQuantityGroup = document.getElementById('customQuantityGroup');
        const customQuantityInput = document.getElementById('dieCutCustomQuantity');
        
        if (event.target.value === 'custom') {
            customQuantityGroup.style.display = 'block';
            customQuantityInput.required = true;
        } else {
            customQuantityGroup.style.display = 'none';
            customQuantityInput.required = false;
        }
    }

    /**
     * Handle form submission
     */
    async handleSubmit(event) {
        const formData = new FormData();
        const imageFile = document.getElementById('dieCutImage').files[0];
        const size = document.getElementById('dieCutSize').value;
        const quantity = document.getElementById('dieCutQuantity').value;
        const finish = document.getElementById('dieCutFinish').value;
        const notes = document.getElementById('dieCutNotes').value;

        if (!imageFile) {
            alert('Please upload your design');
            return;
        }

        if (!size || !quantity || !finish) {
            alert('Please fill in all required fields');
            return;
        }

        // Validate file
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(imageFile.type)) {
            alert('Please upload only PNG, JPG, JPEG, or WebP image files.');
            return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (imageFile.size > maxSize) {
            alert('File size must be less than 10MB.');
            return;
        }

        // Create form data
        formData.append('image', imageFile);
        formData.append('size', size);
        formData.append('quantity', quantity);
        formData.append('finish', finish);
        formData.append('notes', notes);
        formData.append('timestamp', new Date().toISOString());
        formData.append('type', 'die-cut-sticker');

        this.showLoading();

        // Simulate API call
        setTimeout(() => {
            this.hideLoading();
            alert(`Die Cut Sticker order submitted!\n\nSize: ${size}\nQuantity: ${quantity}\nFinish: ${finish}\n\nWe'll review your design and send you a quote within 24 hours.`);
            this.hide();
        }, 1500);
    }

    /**
     * Reset form fields
     */
    resetForm() {
        const form = document.getElementById('customDieCutForm');
        if (form) {
            form.reset();
            
            // Hide conditional fields
            const customSizeGroup = document.getElementById('customSizeGroup');
            const customQuantityGroup = document.getElementById('customQuantityGroup');
            if (customSizeGroup) customSizeGroup.style.display = 'none';
            if (customQuantityGroup) customQuantityGroup.style.display = 'none';
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        const submitBtn = document.querySelector('#customDieCutForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Submitting Order...';
            submitBtn.disabled = true;
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const submitBtn = document.querySelector('#customDieCutForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Submit Die Cut Order';
            submitBtn.disabled = false;
        }
    }
}

export default DieCutModal;
