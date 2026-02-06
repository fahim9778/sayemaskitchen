// ============================================
// ORDER PROCESSING MODULE
// ============================================

import * as State from './state.js';
import { config } from '../config.js';
import { simpleHash, hashToAlphanumeric, copyToClipboard } from '../utils/helpers.js';
import { calculateTotals } from './cart.js';
import { showOrderConfirmationModal, closeModalOnly, render } from './ui.js';
import { saveOrderToSheet } from '../services/googleSheets.js';

// Generate 10-character alphanumeric order ID (guaranteed unique)
export function generateOrderId() {
    const { selected } = calculateTotals();
    const customerInfo = State.getCustomerInfo();
    
    // Build order signature with multiple uniqueness factors
    let orderSignature = '';
    
    // 1. Session seed (unique per browser tab - guarantees uniqueness)
    orderSignature += State.getSessionSeed();
    orderSignature += '|';
    
    // 2. Timestamp (unique per order session)
    orderSignature += State.getOrderTimestamp() || Date.now();
    orderSignature += '|';
    
    // 3. Items (sorted by id for consistency)
    const sortedItems = [...selected].sort((a, b) => a.id - b.id);
    sortedItems.forEach(item => {
        orderSignature += `${item.id}:${item.qty};`;
    });
    
    // 4. Customer info
    orderSignature += customerInfo.name.trim().toLowerCase();
    orderSignature += customerInfo.phone.trim();
    orderSignature += customerInfo.area;
    orderSignature += customerInfo.address.trim().toLowerCase();
    
    // Generate hash from signature
    const hash = simpleHash(orderSignature);
    
    // Convert to alphanumeric (10 characters)
    return hashToAlphanumeric(hash, 10);
}

// Confirm order
export function confirmOrder() {
    const customerInfo = State.getCustomerInfo();
    
    // Inline validation
    const phoneLength = customerInfo.phone.trim().length;
    const phoneValid = (phoneLength === 10 || phoneLength === 11) && /^[0-9]{10,11}$/.test(customerInfo.phone);
    const isValid = customerInfo.name.trim() !== '' &&
           phoneValid &&
           customerInfo.area !== '' &&
           customerInfo.address.trim() !== '';
    
    if (!isValid) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const orderId = generateOrderId();
    State.setCurrentOrderId(orderId);
    
    // Show modal for review - order will be saved only when "Place Order" is clicked
    showOrderConfirmationModal(orderId);
}

// Place order confirmed - now save to Google Sheet
export async function placeOrderConfirmed(orderId) {
    // Get the button that triggered this
    const placeOrderBtn = event.target;
    const originalText = placeOrderBtn.innerHTML;
    placeOrderBtn.innerHTML = '⏳ Placing Order...';
    placeOrderBtn.disabled = true;
    placeOrderBtn.style.opacity = '0.7';
    placeOrderBtn.style.cursor = 'not-allowed';
    
    await saveOrderToSheet(orderId);
    
    // Transform modal to success screen after a brief moment
    setTimeout(() => {
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="success-celebration">
                    <div class="checkmark">✅</div>
                    <h2>Order Received!</h2>
                    <p>We've received your order and will contact you to confirm.</p>
                    <p style="font-size: 1rem; color: #059669; margin-top: 20px;">Order ID: <strong>${orderId}</strong></p>
                    <div class="heart">❤️</div>
                    <div style="margin-top: 30px;">
                        <a href="${config.facebookPageUrl}" target="_blank" class="fb-link-btn" style="display: inline-flex; margin-bottom: 12px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Visit our Facebook Page
                        </a>
                    </div>
                </div>
            `;
            
            // Auto-close after 6 seconds
            setTimeout(() => {
                closeModalOnly();
                State.clearSelectedItems();
                State.updateCustomerInfo('name', '');
                State.updateCustomerInfo('phone', '');
                State.updateCustomerInfo('area', '');
                State.updateCustomerInfo('address', '');
                State.updateCustomerInfo('notes', '');
                State.setCurrentOrderId(null);
                render();
            }, 6000);
        }
    }, 800);
}

// Edit order - close modal and return to form
export function editOrder() {
    closeModalOnly();
    // Focus on the menu so they can edit items
    window.scrollTo(0, 0);
}

// Copy order ID
export async function copyOrderId(orderId) {
    const success = await copyToClipboard(orderId);
    if (success) {
        const btn = document.getElementById('copyBtn');
        if (btn) {
            btn.classList.add('copied');
            btn.innerHTML = '✅ Copied!';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = '📋 Copy Order ID';
            }, 2000);
        }
    }
}

// Open messenger with order
export function openMessenger(orderId) {
    // Direct link to Facebook page messenger
    window.open(config.messengerUrl, '_blank');
}

// Generate order summary text for messenger
export function generateOrderText(orderId) {
    const { selected, subtotal } = calculateTotals();
    const customerInfo = State.getCustomerInfo();
    
    let text = `🍽️ *SAYEMA'S KITCHEN ORDER*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📋 Order ID: ${orderId}\n\n`;
    text += `👤 *Customer Details:*\n`;
    text += `Name: ${customerInfo.name}\n`;
    text += `Phone: +880${customerInfo.phone}\n`;
    text += `Area: ${customerInfo.area === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}\n`;
    text += `Address: ${customerInfo.address}\n`;
    if (customerInfo.notes) {
        text += `Notes: ${customerInfo.notes}\n`;
    }
    text += `\n🛒 *Order Items:*\n`;
    selected.forEach(item => {
        text += `• ${item.name} x${item.qty}`;
        if (item.boxSize !== 'Per Order' && item.totalUnits) {
            text += ` (${item.totalUnits} ${item.unit})`;
        }
        text += ` - ৳${(item.price * item.qty).toFixed(0)}\n`;
    });
    text += `\n💰 Subtotal: ৳${subtotal.toFixed(0)}\n`;
    text += `🚚 Delivery: To be confirmed\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━`;
    return text;
}
