// ============================================
// UI RENDERING MODULE
// ============================================

import { config } from '../config.js';
import * as State from './state.js';
import { calculateTotals } from './cart.js';
import { handlePhoneInput } from '../utils/helpers.js';

// Update only the cart display without full re-render
export function updateCartDisplay() {
    const { selected, subtotal, tax, total } = calculateTotals();
    
    // Update order header count
    const orderHeader = document.querySelector('.order-header p');
    if (orderHeader) {
        orderHeader.textContent = `${selected.length} item(s) selected`;
    }
    
    // Update order items list
    const orderContent = document.querySelector('.order-content');
    if (!orderContent) return;
    
    if (selected.length === 0) {
        orderContent.innerHTML = `
            <div class="empty-order">
                <div class="icon">🍽️</div>
                <p>No items selected</p>
                <p>Click on items to add them</p>
            </div>
        `;
        return;
    }
    
    orderContent.innerHTML = `
        <div class="order-items">
            ${selected.map(item => `
                <div class="order-item">
                    <div class="order-item-top">
                        <div>
                            <div class="order-item-name">${item.name}</div>
                            ${item.boxSize !== 'Per Order' ? `<div class="order-item-box">📦 ${item.boxSize}</div>` : `<div class="order-item-box">🍽️ Per Order</div>`}
                        </div>
                        <button class="remove-btn" onclick="window.appFunctions.removeItem(${item.id})">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                    <div class="order-item-bottom">
                        <div class="qty-controls">
                            <span class="qty-label">${item.boxSize !== 'Per Order' ? 'Boxes:' : 'Qty:'}</span>
                            <div class="qty-wrapper">
                                <button class="qty-btn" onclick="window.appFunctions.updateQty(${item.id}, -1)">−</button>
                                <span class="qty-value">${item.qty}</span>
                                <button class="qty-btn" onclick="window.appFunctions.updateQty(${item.id}, 1)">+</button>
                            </div>
                        </div>
                        <div class="item-subtotal">
                            <div class="each">৳${item.price.toFixed(0)}/${item.boxSize !== 'Per Order' ? 'box' : 'order'}</div>
                            <div class="total">৳${(item.price * item.qty).toFixed(0)}</div>
                            ${item.boxSize !== 'Per Order' && item.totalUnits ? `<div class="total-units">= ${item.totalUnits} ${item.unit}</div>` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
            <h4>📊 Order Summary</h4>
            ${selected.map(item => `
                <div class="summary-item">
                    <span>${item.name}</span>
                    <span>${item.qty} ${item.boxSize !== 'Per Order' ? (item.qty > 1 ? 'boxes' : 'box') : ''}${item.boxSize !== 'Per Order' && item.totalUnits ? ` = ${item.totalUnits} ${item.unit}` : ''}</span>
                </div>
            `).join('')}
        </div>

        <div class="order-totals">
            <div class="total-row">
                <span class="label">Subtotal</span>
                <span class="value">৳${subtotal.toFixed(0)}</span>
            </div>
            <div class="grand-total">
                <span class="label">Total (excl. delivery)</span>
                <span class="value">৳${subtotal.toFixed(0)}</span>
            </div>
        </div>

        <!-- Delivery Information Form Container -->
        <div id="deliveryFormContainer"></div>
    `;
    
    // Re-render delivery form
    renderDeliveryForm();
}

// Render while preserving scroll position (for menu item toggles)
export function renderWithScrollPreserve() {
    const scrollPos = window.scrollY || window.pageYOffset;
    render();
    requestAnimationFrame(() => {
        window.scrollTo(0, scrollPos);
    });
}

// Render the app
export function render() {
    const menuItems = State.getMenuItems();
    const selectedItems = State.getSelectedItems();
    const isDemo = State.getIsDemo();
    
    const categories = [...new Set(menuItems.map(item => item.category))];
    const { selected, subtotal, tax, total } = calculateTotals();

    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
            <h1>🍽️ Sayema's Kitchen</h1>
            <p>Click items to add them to your order</p>
        </header>

        ${isDemo ? `
        <div class="setup-guide">
            <h3>📋 Demo Mode - Connect Your Google Sheet!</h3>
            <ol>
                <li>Open your Google Sheet with menu items</li>
                <li>Go to <strong>File → Share → Publish to web</strong></li>
                <li>Select <strong>"Comma-separated values (.csv)"</strong></li>
                <li>Click <strong>Publish</strong> and copy the URL</li>
                <li>Edit the config.js file and update the googleSheetCsvUrl</li>
            </ol>
            <div class="sheet-example">
                <p style="margin-bottom: 10px; font-weight: 600; color: #1e40af;">Your Google Sheet should look like this:</p>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Box Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Chicken Wings</td>
                            <td>Main Course</td>
                            <td>18.99</td>
                            <td>6 pcs</td>
                        </tr>
                        <tr>
                            <td>Fried Rice</td>
                            <td>Main Course</td>
                            <td>15.00</td>
                            <td>1 kg</td>
                        </tr>
                        <tr>
                            <td>Fresh Juice</td>
                            <td>Beverages</td>
                            <td>6.50</td>
                            <td>1 L/bottle</td>
                        </tr>
                    </tbody>
                </table>
                <p style="margin-top: 10px; font-size: 0.85rem; color: #1e40af;">💡 <strong>Tip:</strong> Just write "6 pcs" or "1 kg" — "/box" is added automatically!</p>
            </div>
        </div>
        ` : `
        <div class="status-bar">
            <span class="status-badge">
                <span class="dot"></span>
                Taking Orders
            </span>
            <a href="${config.facebookPageUrl}" target="_blank" class="fb-link-btn"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Visit our Facebook Page</a>
        </div>
        `}

        ${selected.length > 0 ? `
        <div class="cart-warning-top">
            <span>⚠️</span>
            <span><strong>Important:</strong> Refreshing or closing this page will empty your cart and you'll have to start again!</span>
        </div>
        ` : ''}

        <div class="main-grid">
            <div class="menu-section">
                ${categories.map(category => `
                    <div class="category-card">
                        <div class="category-header">
                            <h2>${category}</h2>
                        </div>
                        <div class="category-items">
                            ${menuItems.filter(item => item.category === category).map(item => `
                                <div class="menu-item ${selectedItems[item.id] ? 'selected' : ''}" onclick="window.appFunctions.toggleItem(${item.id})">
                                    <div class="item-left">
                                        <div class="checkbox">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                                <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </div>
                                        <div class="item-info">
                                            <span class="item-name">${item.name}</span>
                                            ${item.boxSize !== 'Per Order' ? `<span class="item-box-size">📦 ${item.boxSize}</span>` : `<span class="item-box-size">🍽️ Per Order</span>`}
                                        </div>
                                    </div>
                                    <div class="item-price-section">
                                        <span class="item-price">৳${item.price.toFixed(0)}</span>
                                        <div class="price-per">${item.boxSize !== 'Per Order' ? 'per box' : 'per order'}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="order-panel">
                <div class="order-card">
                    <div class="order-header">
                        <h2>📋 Your Order</h2>
                        <p>${selected.length} item(s) selected</p>
                    </div>
                    <div class="order-content">
                        ${selected.length === 0 ? `
                            <div class="empty-order">
                                <div class="icon">🍽️</div>
                                <p>No items selected</p>
                                <p>Click on items to add them</p>
                            </div>
                        ` : `
                            <div class="order-items">
                                ${selected.map(item => `
                                    <div class="order-item">
                                        <div class="order-item-top">
                                            <div>
                                                <div class="order-item-name">${item.name}</div>
                                                ${item.boxSize !== 'Per Order' ? `<div class="order-item-box">📦 ${item.boxSize}</div>` : `<div class="order-item-box">🍽️ Per Order</div>`}
                                            </div>
                                            <button class="remove-btn" onclick="window.appFunctions.removeItem(${item.id})">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/>
                                                </svg>
                                            </button>
                                        </div>
                                        <div class="order-item-bottom">
                                            <div class="qty-controls">
                                                <span class="qty-label">${item.boxSize !== 'Per Order' ? 'Boxes:' : 'Qty:'}</span>
                                                <div class="qty-wrapper">
                                                    <button class="qty-btn" onclick="window.appFunctions.updateQty(${item.id}, -1)">−</button>
                                                    <span class="qty-value">${item.qty}</span>
                                                    <button class="qty-btn" onclick="window.appFunctions.updateQty(${item.id}, 1)">+</button>
                                                </div>
                                            </div>
                                            <div class="item-subtotal">
                                                <div class="each">৳${item.price.toFixed(0)}/${item.boxSize !== 'Per Order' ? 'box' : 'order'}</div>
                                                <div class="total">৳${(item.price * item.qty).toFixed(0)}</div>
                                                ${item.boxSize !== 'Per Order' && item.totalUnits ? `<div class="total-units">= ${item.totalUnits} ${item.unit}</div>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>

                            <!-- Order Summary -->
                            <div class="order-summary">
                                <h4>📊 Order Summary</h4>
                                ${selected.map(item => `
                                    <div class="summary-item">
                                        <span>${item.name}</span>
                                        <span>${item.qty} ${item.boxSize !== 'Per Order' ? (item.qty > 1 ? 'boxes' : 'box') : ''}${item.boxSize !== 'Per Order' && item.totalUnits ? ` = ${item.totalUnits} ${item.unit}` : ''}</span>
                                    </div>
                                `).join('')}
                            </div>

                            <div class="order-totals">
                                <div class="total-row">
                                    <span class="label">Subtotal</span>
                                    <span class="value">৳${subtotal.toFixed(0)}</span>
                                </div>
                                <div class="grand-total">
                                    <span class="label">Total (excl. delivery)</span>
                                    <span class="value">৳${subtotal.toFixed(0)}</span>
                                </div>
                            </div>

                            <!-- Delivery Information Form Container -->
                            <div id="deliveryFormContainer"></div>
                        `}
                    </div>
                </div>
            </div>
        </div>

        <footer>
            Sayema's Kitchen • Powered by Google Sheets
        </footer>
    `;

    // Render delivery form separately if items are selected
    if (selected.length > 0) {
        renderDeliveryForm();
    }
}

// Separate function to render delivery form (doesn't cause scroll issues)
export function renderDeliveryForm() {
    const container = document.getElementById('deliveryFormContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="delivery-form">
            <h4>🚚 Delivery Information</h4>
            
            <div class="form-group">
                <label>Full Name <span class="required">*</span></label>
                <input type="text" id="customerName" placeholder="Enter your full name" oninput="window.appFunctions.updateCustomerInfo('name', this.value)">
            </div>
            
            <div class="form-group">
                <label>Phone Number <span class="required">*</span></label>
                <div class="phone-input-wrapper">
                    <span class="country-code">+88</span>
                    <input type="tel" id="customerPhone" placeholder="01XXXXXXXXX" oninput="window.appFunctions.handlePhoneInputWrapper(this)" maxlength="11">
                </div>
            </div>
            
            <div class="form-group">
                <label>Delivery Area <span class="required">*</span></label>
                <select id="deliveryArea" onchange="window.appFunctions.updateCustomerInfo('area', this.value)">
                    <option value="">-- Select Area --</option>
                    <option value="inside">📍 Inside Dhaka City</option>
                    <option value="outside">📍 Outside Dhaka City</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Delivery Address <span class="required">*</span></label>
                <textarea id="customerAddress" placeholder="Enter your complete delivery address (House, Road, Area, City)" oninput="window.appFunctions.updateCustomerInfo('address', this.value)"></textarea>
            </div>
            
            <div class="form-group">
                <label>Special Instructions (Optional)</label>
                <input type="text" id="specialInstructions" placeholder="Any special requests or notes" oninput="window.appFunctions.updateCustomerInfo('notes', this.value)">
            </div>
            
            <div class="delivery-note">
                <span class="icon">📢</span>
                <p><strong>Note:</strong> Delivery charge varies on distance from our (Segunbagicha, Dhaka) kitchen and will be informed via phone or Messenger.</p>
            </div>
            
            <button class="place-order-btn" id="confirmOrderBtn" onclick="window.appFunctions.confirmOrder()" disabled>
                Generate Order 🎉
            </button>
        </div>
    `;

    // Restore form values from state
    restoreFormValues();
}

// Restore form values after render
function restoreFormValues() {
    const customerInfo = State.getCustomerInfo();
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const areaSelect = document.getElementById('deliveryArea');
    const addressInput = document.getElementById('customerAddress');
    const notesInput = document.getElementById('specialInstructions');

    if (nameInput) nameInput.value = customerInfo.name;
    if (phoneInput) phoneInput.value = customerInfo.phone;
    if (areaSelect) areaSelect.value = customerInfo.area;
    if (addressInput) addressInput.value = customerInfo.address;
    if (notesInput) notesInput.value = customerInfo.notes;

    updateConfirmButtonState();
}

// Update just the confirm button state
export function updateConfirmButtonState() {
    const customerInfo = State.getCustomerInfo();
    
    // Inline validation
    const phoneLength = customerInfo.phone.trim().length;
    const phoneValid = (phoneLength === 10 || phoneLength === 11) && /^[0-9]{10,11}$/.test(customerInfo.phone);
    const isValid = customerInfo.name.trim() !== '' &&
           phoneValid &&
           customerInfo.area !== '' &&
           customerInfo.address.trim() !== '';
    
    const btn = document.getElementById('confirmOrderBtn');
    if (btn) {
        btn.disabled = !isValid;
    }
}

// Show order confirmation modal
export function showOrderConfirmationModal(orderId) {
    const { selected, subtotal } = calculateTotals();
    const customerInfo = State.getCustomerInfo();
    
    const itemsHtml = selected.map(item => `
        <div class="order-item">
            <div class="order-item-top">
                <div>
                    <div class="order-item-name">${item.name}</div>
                    ${item.boxSize !== 'Per Order' ? `<div class="order-item-box">📦 ${item.boxSize}</div>` : `<div class="order-item-box">🍽️ Per Order</div>`}
                </div>
            </div>
            <div class="order-item-bottom">
                <div class="qty-controls">
                    <span class="qty-label">${item.boxSize !== 'Per Order' ? 'Boxes:' : 'Qty:'}</span>
                    <span class="qty-value">${item.qty}</span>
                </div>
                <div class="item-subtotal">
                    <div class="total">৳${(item.price * item.qty).toFixed(0)}</div>
                </div>
            </div>
        </div>
    `).join('');
    
    const modalHtml = `
        <div class="modal-overlay" onclick="window.appFunctions.closeModal(event)">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <div class="success-icon">🎉</div>
                    <h3>Order Generated!</h3>
                    <p>Review your order and place it</p>
                </div>
                <div class="modal-body">
                    <div class="order-id-section">
                        <div class="order-id-label">YOUR ORDER ID</div>
                        <div class="order-id-value" id="orderIdDisplay">${orderId}</div>
                    </div>
                    
                    <div class="order-details-summary">
                        <div class="detail-row">
                            <span class="detail-label">Name:</span>
                            <span class="detail-value">${customerInfo.name}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Phone:</span>
                            <span class="detail-value">+880${customerInfo.phone.replace(/^0/, '')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Area:</span>
                            <span class="detail-value">${customerInfo.area === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Items:</span>
                            <span style="display: flex; align-items: center; justify-content: space-between;">
                                <span class="detail-value detail-value-clickable" onclick="window.appFunctions.toggleItemsDetails()">${selected.length} item(s) <span class="dropdown-arrow">▼</span></span>
                                <button class="place-order-btn" style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 6px 14px; font-size: 0.85rem; margin: 0; width: auto;" onclick="window.appFunctions.editOrder()">✏️ Edit</button>
                            </span>
                        </div>
                        <div id="itemsDetailsContainer" class="items-details-hidden">
                            ${itemsHtml}
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Subtotal:</span>
                            <span class="detail-value">৳${subtotal.toFixed(0)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Delivery Charge:</span>
                            <span class="detail-value">To be confirmed</span>
                        </div>
                    </div>
                    
                    <button class="place-order-btn" style="width: 100%; background: linear-gradient(135deg, #10b981, #14b8a6); margin-top: 20px; padding: 16px; font-size: 1.1rem;" onclick="window.appFunctions.placeOrderConfirmed('${orderId}')">
                        ✅ Place Order
                    </button>
                    
                    <button class="messenger-btn" onclick="window.appFunctions.openMessenger('${orderId}')" style="margin-top: 12px;">
                        💬 Let's Chat on Messenger
                    </button>
                    
                    <button class="close-modal-btn" onclick="window.appFunctions.closeModalOnly()">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    const modalContainer = document.createElement('div');
    modalContainer.id = 'orderModal';
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Scroll to top to show modal
    window.scrollTo(0, 0);
}

// Toggle items details visibility
export function toggleItemsDetails() {
    const container = document.getElementById('itemsDetailsContainer');
    if (container) {
        container.classList.toggle('items-details-hidden');
        container.classList.toggle('items-details-visible');
        
        // Rotate arrow
        const arrow = document.querySelector('.dropdown-arrow');
        if (arrow) {
            arrow.style.transform = container.classList.contains('items-details-visible') ? 'rotate(180deg)' : 'rotate(0deg)';
            arrow.style.transition = 'transform 0.3s ease';
        }
    }
}

// Close modal
export function closeModal(event) {
    if (event.target.classList.contains('modal-overlay')) {
        closeModalOnly();
    }
}

// Close modal only (keep order data)
export function closeModalOnly() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.remove();
    }
}

// Show loading screen with random cooking message
export function showLoading() {
    const cookingMessages = [
        "Preheating the kitchen...",
        "Chopping fresh ingredients...",
        "Seasoning with love...",
        "Stirring the pot...",
        "Marinating flavors...",
        "Grilling to perfection...",
        "Adding a pinch of magic...",
        "Tasting for perfection...",
        "Preparing deliciousness...",
        "Cooking up something special...",
        "Warming up the oven...",
        "Mixing spices...",
        "Simmering with care...",
        "Garnishing the dishes...",
        "Plating the menu..."
    ];
    
    const randomMessage = cookingMessages[Math.floor(Math.random() * cookingMessages.length)];
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>${randomMessage}</p>
        </div>
    `;
}
