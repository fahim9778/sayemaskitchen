// ============================================
// GOOGLE SHEETS SERVICE
// ============================================

import { config } from '../config.js';
import * as State from '../modules/state.js';
import { formatBoxSize, formatBdTimestamp } from '../utils/helpers.js';
import { calculateTotals } from '../modules/cart.js';

// Parse CSV
function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];
    
    const items = [];
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
        const fields = parseCSVLine(lines[i]);
        
        if (fields.length >= 4) {
            const item = fields[0].trim();
            const category = fields[1].trim();
            const boxSize = fields[2].trim();  // Swapped: boxSize is column 2
            const priceStr = fields[3].trim();  // Swapped: price is column 3
            
            // Parse price
            const price = parseFloat(priceStr);
            if (isNaN(price)) continue;
            
            items.push({
                id: i, // Use line number as ID
                name: item,
                category: category,
                price: price,
                boxSize: formatBoxSize(boxSize)
            });
        }
    }
    
    return items;
}

// Parse a single CSV line (handles quoted fields)
function parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            fields.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    fields.push(current);
    
    return fields;
}

// Fetch menu data from Google Sheets
export async function fetchMenu() {
    console.log('🔄 Fetching menu from Google Sheets...');
    console.log('📍 URL:', config.googleSheetCsvUrl);
    
    try {
        const response = await fetch(config.googleSheetCsvUrl);
        console.log('📥 Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csv = await response.text();
        console.log('📄 CSV length:', csv.length, 'characters');
        console.log('📄 First 200 chars:', csv.substring(0, 200));
        
        const items = parseCSV(csv);
        console.log('✅ Parsed items:', items.length);
        
        if (items.length === 0) {
            throw new Error('No items found in CSV');
        }
        
        State.setMenuItems(items);
        State.setIsDemo(false);
        console.log('✅ Menu loaded successfully from Google Sheets!');
        return items;
    } catch (error) {
        console.error('❌ Failed to load from Google Sheets:', error);
        console.error('Error details:', error.message);
        console.warn('⚠️ Using demo data as fallback');
        
        // Use demo data
        const demoItems = config.demoData.map((item, index) => ({
            id: index + 1,
            name: item.item,
            category: item.category,
            price: item.price,
            boxSize: formatBoxSize(item.boxSize)
        }));
        
        State.setMenuItems(demoItems);
        State.setIsDemo(true);
        return demoItems;
    }
}

// Save order to Google Sheet
export async function saveOrderToSheet(orderId) {
    if (config.appsScriptUrl === 'YOUR_APPS_SCRIPT_URL') {
        console.warn('Apps Script URL not configured. Order will not be saved to sheet.');
        return;
    }

    try {
        const { selected, subtotal, total } = calculateTotals();
        const customerInfo = State.getCustomerInfo();
        
        // Format items list with enumerated breakdown (each item on new line)
        const itemsList = selected.map((item, index) => {
            let itemStr = `${index + 1}. ${item.name} x${item.qty}`;
            if (item.boxSize !== 'Per Order' && item.totalUnits) {
                itemStr += ` (${item.totalUnits} ${item.unit})`;
            }
            itemStr += ` - ৳${(item.price * item.qty).toFixed(0)}`;
            return itemStr;
        }).join('\n');
        
        // Format order time in BD timezone (UTC+6)
        const orderTime = formatBdTimestamp();
        
        // Prepare order data (match field names expected by Apps Script)
        const orderData = {
            orderId: orderId,
            orderTime: orderTime,
            customerName: customerInfo.name,
            phone: customerInfo.phone,
            address: customerInfo.address,
            itemsList: itemsList,
            subtotal: subtotal.toFixed(0),
            deliveryCharge: 0,
            area: customerInfo.area,
            comment: customerInfo.notes || ''
        };
        
        console.log('📤 Sending order data:', orderData);
        
        // Send to Apps Script
        const response = await fetch(config.appsScriptUrl, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Order saved to Google Sheet successfully');
        } else {
            console.error('❌ Failed to save order:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Error saving order to sheet:', error);
        // Don't show alert - order confirmation still works
        // Just notify in console for debugging
    }
}
