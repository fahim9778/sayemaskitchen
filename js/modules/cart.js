// ============================================
// CART MANAGEMENT MODULE
// ============================================

import * as State from './state.js';
import { parseBoxSize } from '../utils/helpers.js';
import { renderWithScrollPreserve, updateCartDisplay } from './ui.js';

// Toggle item selection
export function toggleItem(id) {
    const menuItems = State.getMenuItems();
    const selectedItems = State.getSelectedItems();
    const item = menuItems.find(i => i.id === id);
    
    if (!item) return;
    
    if (selectedItems[id]) {
        // Remove item
        State.removeSelectedItem(id);
    } else {
        // Add item with quantity 1
        const parsed = parseBoxSize(item.boxSize);
        const totalUnits = parsed ? parsed.qty : null;
        const unit = parsed ? parsed.unit : null;
        
        State.setSelectedItem(id, {
            id: item.id,
            name: item.name,
            price: item.price,
            boxSize: item.boxSize,
            qty: 1,
            totalUnits,
            unit
        });
    }
    
    // Full render needed for menu item selection changes (to update styling)
    renderWithScrollPreserve();
}

// Update quantity
export function updateQty(id, delta) {
    const selectedItems = State.getSelectedItems();
    if (selectedItems[id]) {
        const newQty = selectedItems[id].qty + delta;
        if (newQty <= 0) {
            removeItem(id);
        } else {
            State.updateSelectedItemQty(id, newQty);
            
            // Update total units if applicable
            const parsed = parseBoxSize(selectedItems[id].boxSize);
            if (parsed) {
                selectedItems[id].totalUnits = parsed.qty * newQty;
            }
            
            updateCartDisplay();
        }
    }
}

// Remove item
export function removeItem(id) {
    State.removeSelectedItem(id);
    renderWithScrollPreserve();  // Full render to update menu item selection styling
}

// Calculate totals
export function calculateTotals() {
    const selectedItems = State.getSelectedItems();
    let subtotal = 0;
    const selected = [];
    
    for (const id in selectedItems) {
        const item = selectedItems[id];
        const parsed = parseBoxSize(item.boxSize);
        const totalUnits = parsed ? parsed.qty * item.qty : null;
        const unit = parsed ? parsed.unit : null;
        
        selected.push({
            ...item,
            totalUnits,
            unit
        });
        
        subtotal += item.price * item.qty;
    }
    
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    return { selected, subtotal, tax, total };
}

// Validate form
export function isFormValid() {
    const customerInfo = State.getCustomerInfo();
    // Phone can be 10 digits (1XXXXXXXXX) or 11 digits (01XXXXXXXXX)
    const phoneLength = customerInfo.phone.trim().length;
    const phoneValid = (phoneLength === 10 || phoneLength === 11) && /^[0-9]{10,11}$/.test(customerInfo.phone);
    return customerInfo.name.trim() !== '' &&
           phoneValid &&
           customerInfo.area !== '' &&
           customerInfo.address.trim() !== '';
}
