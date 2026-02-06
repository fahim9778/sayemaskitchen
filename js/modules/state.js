// ============================================
// STATE MANAGEMENT MODULE
// ============================================

// Application state
const state = {
    menuItems: [],
    selectedItems: {},
    isDemo: false,
    customerInfo: {
        name: '',
        phone: '',
        area: '',
        address: '',
        notes: ''
    },
    currentOrderId: null,
    orderTimestamp: null,
    sessionSeed: Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
};

// Getters
export const getMenuItems = () => state.menuItems;
export const getSelectedItems = () => state.selectedItems;
export const getIsDemo = () => state.isDemo;
export const getCustomerInfo = () => state.customerInfo;
export const getCurrentOrderId = () => state.currentOrderId;
export const getOrderTimestamp = () => state.orderTimestamp;
export const getSessionSeed = () => state.sessionSeed;

// Setters
export const setMenuItems = (items) => {
    state.menuItems = items;
};

export const setIsDemo = (value) => {
    state.isDemo = value;
};

export const setSelectedItem = (id, value) => {
    if (value) {
        state.selectedItems[id] = value;
        // Set order timestamp on first item selection
        if (!state.orderTimestamp) {
            state.orderTimestamp = Date.now();
        }
    } else {
        delete state.selectedItems[id];
    }
};

export const updateSelectedItemQty = (id, qty) => {
    if (state.selectedItems[id]) {
        state.selectedItems[id].qty = qty;
    }
};

export const removeSelectedItem = (id) => {
    delete state.selectedItems[id];
};

export const clearSelectedItems = () => {
    state.selectedItems = {};
    state.orderTimestamp = null;
};

export const updateCustomerInfo = (field, value) => {
    state.customerInfo[field] = value;
};

export const setCurrentOrderId = (orderId) => {
    state.currentOrderId = orderId;
};

export const resetState = () => {
    state.selectedItems = {};
    state.customerInfo = {
        name: '',
        phone: '',
        area: '',
        address: '',
        notes: ''
    };
    state.currentOrderId = null;
    state.orderTimestamp = null;
};
