// ============================================
// SAYEMA'S KITCHEN - CONFIGURATION
// ============================================

export const config = {
    // Google Sheets CSV URL for menu data
    googleSheetCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDe5h2DvTf5EGFZH6OcKObSGwW48VYyYo7fXBOvmob0Hs2hKDiYdHXqcvFnoyJQl5xP1teNDiCVQ8G/pub?gid=0&single=true&output=csv',
    
    // Apps Script deployment URL for order storage
    appsScriptUrl: 'https://script.google.com/macros/s/AKfycbxhfWFUJxyxIqXrgSqR__zXLZ8bwAoQ0gqoizlj3pfx2aRTm9Q20PKbeib0Jk8NV7_xWQ/exec',
    
    // Social Media
    facebookPageUrl: 'https://www.facebook.com/sayemaskitchen/',
    messengerUrl: 'https://m.me/102361321738656',
    
    // Demo data (fallback when Google Sheet is not available)
    demoData: [
        { item: 'Chicken Wings', category: 'Main Course', price: 18.99, boxSize: '6 pcs' },
        { item: 'Fried Rice', category: 'Main Course', price: 15.00, boxSize: '1 kg' },
        { item: 'Fresh Juice', category: 'Beverages', price: 6.50, boxSize: '1 L' },
        { item: 'Garden Salad', category: 'Sides', price: 8.00, boxSize: 'Per Order' },
        { item: 'Chocolate Cake', category: 'Desserts', price: 12.00, boxSize: '4 slices' }
    ]
};
