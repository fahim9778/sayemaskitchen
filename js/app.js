// ============================================
// SAYEMA'S KITCHEN - MAIN APPLICATION
// ============================================

import * as State from './modules/state.js';
import * as Cart from './modules/cart.js';
import * as Orders from './modules/orders.js';
import * as UI from './modules/ui.js';
import * as GoogleSheets from './services/googleSheets.js';
import * as Helpers from './utils/helpers.js';

// ============================================
// GLOBAL FUNCTIONS (exposed for onclick handlers)
// ============================================

window.appFunctions = {
    // Cart functions
    toggleItem: Cart.toggleItem,
    updateQty: Cart.updateQty,
    removeItem: Cart.removeItem,
    
    // Order functions
    confirmOrder: Orders.confirmOrder,
    placeOrderConfirmed: Orders.placeOrderConfirmed,
    editOrder: Orders.editOrder,
    copyOrderId: Orders.copyOrderId,
    openMessenger: Orders.openMessenger,
    
    // UI functions
    toggleItemsDetails: UI.toggleItemsDetails,
    closeModal: UI.closeModal,
    closeModalOnly: UI.closeModalOnly,
    filterMenu: UI.filterMenu,
    scrollToCart: UI.scrollToCart,
    
    // Form handlers
    updateCustomerInfo: (field, value) => {
        State.updateCustomerInfo(field, value);
        UI.updateConfirmButtonState();
    },
    
    handlePhoneInputWrapper: (input) => {
        const value = Helpers.handlePhoneInput(input);
        State.updateCustomerInfo('phone', value);
        UI.updateConfirmButtonState();
    }
};

// ============================================
// APPLICATION INITIALIZATION
// ============================================

async function init() {
    // Show loading screen
    UI.showLoading();
    
    try {
        // Fetch menu from Google Sheets
        await GoogleSheets.fetchMenu();
        
        // Render the app
        UI.render();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        const app = document.getElementById('app');
        app.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <h2 style="color: #dc2626;">⚠️ Failed to Load Menu</h2>
                <p style="color: #6b7280; margin-top: 10px;">Please refresh the page to try again.</p>
                <button onclick="location.reload()" class="refresh-btn" style="margin-top: 20px;">
                    🔄 Refresh Page
                </button>
            </div>
        `;
    }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
