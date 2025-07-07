import modalManager from './modal-manager.js';

/**
 * Custom Print Modal Component
 * Handles custom print order forms
 */
class CustomPrintModal {
    constructor() {
        this.modalId = 'customPrint';
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
            if (e.target.id === 'customPrintForm') {
                e.preventDefault();
                this.handleSubmit(e);
            }
        });

        // Global button handlers
        window.openCustomPrintModal = () => this.show();
        window.closeCustomPrintModal = () => this.hide();
    }

    /**
     * Create modal HTML in the DOM
     */
    createModalHTML() {
        // Only create if it doesn't exist
        if (document.getElementById('customPrintModal')) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'customPrintModal';
        modal.innerHTML = `
            <div class="modal-content" role="dialog" aria-labelledby="custom-print-title" aria-modal="true">
                <div class="modal-header">
                    <h2 class="modal-title" id="custom-print-title">Custom Print Order</h2>
                    <button class="modal-close" onclick="closeCustomPrintModal()" aria-label="Close modal">&times;</button>
                </div>
                
                <form id="customPrintForm">
                    <div class="form-group">
                        <label class="form-label" for="customImage">Upload Your Image</label>
                        <div class="file-upload">
                            <input type="file" id="customImage" accept="image/png,image/jpeg,image/jpg,image/webp" required>
                            <div class="file-upload-text">
                                <strong>Click to upload</strong> or drag and drop<br>
                                PNG, JPG, JPEG, WebP up to 10MB
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Size</label>
                        <div class="size-grid">
                            <div>
                                <label class="form-label" for="customWidth">Width (inches)</label>
                                <input type="number" class="form-input" id="customWidth" min="1" max="48" required>
                            </div>
                            <div>
                                <label class="form-label" for="customHeight">Height (inches)</label>
                                <input type="number" class="form-input" id="customHeight" min="1" max="48" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="customMaterial">Material</label>
                        <select class="form-select" id="customMaterial" required>
                            <option value="">Select material</option>
                            <option value="matte">Matte Paper</option>
                            <option value="glossy">Glossy Paper</option>
                            <option value="canvas">Canvas</option>
                            <option value="vinyl">Vinyl</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="customQuantity">Quantity</label>
                        <input type="number" class="form-input" id="customQuantity" min="1" max="100" value="1" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="customNotes">Additional Notes (Optional)</label>
                        <textarea class="form-input" id="customNotes" rows="3" placeholder="Any special instructions or requirements..."></textarea>
                    </div>
                    
                    <button type="submit" class="submit-btn">Submit for Quote</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Show the custom print modal
     */
    show() {
        const modal = document.getElementById('customPrintModal');
        if (modal) {
            modal.classList.add('active');
            modalManager.show(this.modalId);
            this.isVisible = true;
        }
    }

    /**
     * Hide the custom print modal
     */
    hide() {
        const modal = document.getElementById('customPrintModal');
        if (modal) {
            modal.classList.remove('active');
            modalManager.hide(this.modalId);
            this.isVisible = false;
            this.resetForm();
        }
    }

    /**
     * Handle form submission
     */
    async handleSubmit(event) {
        const formData = new FormData();
        const imageFile = document.getElementById('customImage').files[0];
        const width = document.getElementById('customWidth').value;
        const height = document.getElementById('customHeight').value;
        const material = document.getElementById('customMaterial').value;
        const quantity = document.getElementById('customQuantity').value;
        const notes = document.getElementById('customNotes').value;
        
        if (!imageFile) {
            alert('Please select an image file.');
            return;
        }
        
        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(imageFile.type)) {
            alert('Please upload only PNG, JPG, JPEG, or WebP image files.');
            return;
        }
        
        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024;
        if (imageFile.size > maxSize) {
            alert('File size must be less than 10MB.');
            return;
        }
        
        // Create form data
        formData.append('image', imageFile);
        formData.append('width', width);
        formData.append('height', height);
        formData.append('material', material);
        formData.append('quantity', quantity);
        formData.append('notes', notes);
        formData.append('timestamp', new Date().toISOString());
        formData.append('type', 'custom-print');
        
        this.showLoading();
        
        // Simulate API call (replace with actual endpoint)
        setTimeout(() => {
            this.hideLoading();
            alert('Your custom print request has been submitted! We will contact you within 24 hours with a quote.');
            this.hide();
        }, 2000);
    }

    /**
     * Reset form fields
     */
    resetForm() {
        const form = document.getElementById('customPrintForm');
        if (form) {
            form.reset();
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        // Add loading overlay or spinner if needed
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        // Remove loading overlay or spinner if needed
    }
}

export default CustomPrintModal;
