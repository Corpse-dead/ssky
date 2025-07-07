/**
 * Modal Manager - Centralized modal state management
 * Prevents conflicts between multiple modals
 */
class ModalManager {
    constructor() {
        this.activeModals = new Set();
        this.modalStack = [];
        this.init();
    }

    init() {
        this.setupGlobalEventListeners();
        this.setupEscapeKeyHandler();
    }

    /**
     * Register a modal instance
     */
    register(modalId, modalInstance) {
        this.modals = this.modals || new Map();
        this.modals.set(modalId, modalInstance);
    }

    /**
     * Show a modal and manage the stack
     */
    show(modalId) {
        // Close any conflicting modals first
        this.closeConflictingModals(modalId);
        
        this.activeModals.add(modalId);
        this.modalStack.push(modalId);
        document.body.style.overflow = 'hidden';
        
        console.log(`Modal ${modalId} opened`);
    }

    /**
     * Hide a modal and update the stack
     */
    hide(modalId) {
        this.activeModals.delete(modalId);
        this.modalStack = this.modalStack.filter(id => id !== modalId);
        
        // Restore body scroll if no modals are active
        if (this.activeModals.size === 0) {
            document.body.style.overflow = 'auto';
        }
        
        console.log(`Modal ${modalId} closed`);
    }

    /**
     * Close modals that conflict with the one being opened
     */
    closeConflictingModals(modalId) {
        const conflicts = {
            'adminLogin': ['customPrint', 'dieCutPrint'],
            'customPrint': ['adminLogin', 'dieCutPrint'],
            'dieCutPrint': ['adminLogin', 'customPrint'],
            'adminPanel': [] // Admin panel can coexist with others
        };

        const conflictingModals = conflicts[modalId] || [];
        conflictingModals.forEach(conflictId => {
            if (this.activeModals.has(conflictId) && this.modals?.has(conflictId)) {
                this.modals.get(conflictId).hide();
            }
        });
    }

    /**
     * Get the top modal in the stack
     */
    getTopModal() {
        return this.modalStack.length > 0 ? this.modalStack[this.modalStack.length - 1] : null;
    }

    /**
     * Check if any modal is currently active
     */
    hasActiveModal() {
        return this.activeModals.size > 0;
    }

    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                const modalId = this.identifyModalFromElement(e.target);
                if (modalId && this.modals?.has(modalId)) {
                    this.modals.get(modalId).hide();
                }
            }
        });
    }

    /**
     * Setup escape key handler
     */
    setupEscapeKeyHandler() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.hasActiveModal()) {
                const topModal = this.getTopModal();
                if (topModal && this.modals?.has(topModal)) {
                    this.modals.get(topModal).hide();
                }
            }
        });
    }

    /**
     * Identify modal from DOM element
     */
    identifyModalFromElement(element) {
        if (element.id) {
            if (element.id.includes('adminLogin')) return 'adminLogin';
            if (element.id.includes('customPrint')) return 'customPrint';
            if (element.id.includes('dieCut')) return 'dieCutPrint';
        }
        return null;
    }
}

// Export singleton instance
export default new ModalManager();
