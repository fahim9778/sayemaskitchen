# Sayema's Kitchen - Google Sheet Integration Setup Guide

## Step 1: Create Google Apps Script

1. Open your Google Sheet: https://docs.google.com/spreadsheets
2. Click **Extensions → Apps Script**
3. Delete any default code
4. **Copy-paste the code below:**

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Append row with order data
    const newRow = [
      data.orderId,                    // A: Order ID
      data.orderTime,                  // B: Order Time
      data.customerName,               // C: Customer Name
      data.address,                    // D: Address
      data.phone,                      // E: Phone
      data.itemsList,                  // F: Items
      data.subtotal,                   // G: Item Total
      data.deliveryCharge || 0,        // H: Delivery Charge
      data.grandTotal,                 // I: Grand Total
      'Pending'                        // J: Status
    ];
    
    sheet.appendRow(newRow);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Order saved successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Step 2: Deploy the Script

1. Click **Deploy** (top right)
2. Click **New deployment**
3. Select **Type: Web app**
4. Set:
   - **Execute as**: Your Google Account
   - **Who has access**: Anyone
5. Click **Deploy**
6. Copy the **Deployment URL** (it looks like: `https://script.google.com/macros/d/...`)
7. Save this URL - you'll need it in the next step

## Step 3: Update Your HTML File

Replace `YOUR_APPS_SCRIPT_URL` in your HTML file with the URL from Step 2.

That's it! Your orders will now auto-save to Google Sheet when customers confirm their order.

---

## How It Works

1. ✅ Customer adds items to cart
2. ✅ Fills in delivery information
3. ✅ Clicks "Confirm Order"
4. ✅ Order ID is generated
5. 📊 **Data is saved to Google Sheet automatically**
6. 💬 Customer can click "Send to Messenger" to notify you
7. ✅ You see order in your sheet with status "Pending"

---

## Column Mapping

Your Google Sheet columns should be:
- **A** - Order ID
- **B** - Order Time
- **C** - Customer Name
- **D** - Address
- **E** - Phone
- **F** - Items
- **G** - Item Total
- **H** - Delivery Charge
- **I** - Grand Total
- **J** - Status

If your columns are in a different order, let me know and I'll adjust the script!
