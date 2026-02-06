// ============================================
// UTILITY HELPER FUNCTIONS
// ============================================

// Format timestamp in BD timezone (UTC+6) as YYYY-MM-DD HH:MM:SS
export function formatBdTimestamp(date = new Date()) {
    const bdOffsetMinutes = 6 * 60; // UTC+6
    const utcMillis = date.getTime() + (date.getTimezoneOffset() * 60000);
    const bdDate = new Date(utcMillis + bdOffsetMinutes * 60000);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${bdDate.getFullYear()}-${pad(bdDate.getMonth() + 1)}-${pad(bdDate.getDate())} ${pad(bdDate.getHours())}:${pad(bdDate.getMinutes())}:${pad(bdDate.getSeconds())}`;
}

// Format phone number to 11 digits (01XXXXXXXXX)
export function formatPhoneNumber(phone) {
    phone = phone.trim();
    
    // If already 11 digits and starts with 0, use as-is
    if (phone.length === 11 && phone.startsWith('0')) {
        return phone;
    }
    
    // If 11 digits and starts with 1, replace first digit with 0
    if (phone.length === 11 && phone.startsWith('1')) {
        return '0' + phone.substring(1);
    }
    
    // If 10 digits, add 0 prefix
    if (phone.length === 10) {
        return '0' + phone;
    }
    
    // Fallback (shouldn't reach here if validation works)
    return phone;
}

// Parse box size string to extract quantity and unit
export function parseBoxSize(boxSize) {
    if (boxSize === 'Per Order') return null;
    const match = boxSize.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/);
    if (match) {
        return { qty: parseFloat(match[1]), unit: match[2] };
    }
    return null;
}

// Format box size for display (adds "/box" if not specified)
export function formatBoxSize(boxSize) {
    if (!boxSize || boxSize.trim() === '') {
        return 'Per Order';
    }
    
    const lower = boxSize.toLowerCase();
    if (lower.includes('/box') || lower.includes('per box') || lower === 'per order') {
        return boxSize;
    }
    
    return `${boxSize}/box`;
}

// Copy to clipboard
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
    }
}

// Simple hash function (djb2 algorithm)
export function simpleHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

// Convert hash to alphanumeric string
export function hashToAlphanumeric(hash, length) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: 0,O,1,I
    let result = '';
    let num = hash;
    
    // Use the hash to generate characters
    for (let i = 0; i < length; i++) {
        // Mix in position to ensure all chars are different
        const mixed = (num + (i * 7919)) % chars.length; // 7919 is a prime
        result += chars[Math.abs(mixed)];
        num = Math.floor(num / chars.length) + simpleHash(result);
    }
    
    return result;
}

// Handle phone input (numbers only)
export function handlePhoneInput(input) {
    // Remove any non-numeric characters
    input.value = input.value.replace(/[^0-9]/g, '');
    // Keep only first 11 digits
    if (input.value.length > 11) {
        input.value = input.value.substring(0, 11);
    }
    return input.value;
}
