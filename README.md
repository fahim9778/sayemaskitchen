# Sayema's Kitchen - Order Management System

A modern, modular web application for managing food orders with Google Sheets integration.

## 📁 Project Structure

```
sayemaskitchen/
├── index-new.html          # Clean HTML entry point
├── css/
│   └── styles.css          # All application styles
├── js/
│   ├── app.js              # Main application entry point
│   ├── config.js           # Configuration (URLs, constants)
│   ├── modules/
│   │   ├── state.js        # State management
│   │   ├── cart.js         # Cart operations
│   │   ├── orders.js       # Order processing
│   │   └── ui.js           # UI rendering
│   ├── services/
│   │   └── googleSheets.js # Google Sheets API integration
│   └── utils/
│       └── helpers.js      # Utility functions
├── index.html              # Original monolithic file (backup)
└── SETUP_GOOGLE_APPS_SCRIPT.md
```

## 🚀 Features

- **Modular Architecture**: Clean separation of concerns with ES6 modules
- **Google Sheets Integration**: Menu data from CSV, order storage via Apps Script
- **Responsive Design**: Mobile-first approach with elegant UI
- **Real-time Updates**: Dynamic cart updates without page refresh
- **Order Management**: Unique order ID generation, confirmation modals
- **Beautiful Design**: Hand-drawn cooking icons background, smooth animations

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6 Modules)
- **Styling**: Pure CSS with custom properties and animations
- **Backend**: Google Sheets + Apps Script
- **No Build Tools**: Direct browser module loading

## 📦 Module Overview

### `js/config.js`
Configuration constants including:
- Google Sheets CSV URL
- Apps Script deployment URL
- Social media links
- Demo data

### `js/modules/state.js`
Central state management with getters/setters for:
- Menu items
- Selected cart items
- Customer information
- Order session data

### `js/modules/cart.js`
Cart operations:
- Add/remove items
- Update quantities
- Calculate totals
- Form validation

### `js/modules/orders.js`
Order processing:
- Generate unique order IDs
- Confirm orders
- Place orders (save to Google Sheets)
- Order text generation for sharing

### `js/modules/ui.js`
UI rendering and updates:
- Main app render
- Cart display updates
- Delivery form rendering
- Modal management
- Scroll preservation

### `js/services/googleSheets.js`
Google Sheets integration:
- Fetch menu data from CSV
- Parse CSV format
- Save orders to sheet via Apps Script

### `js/utils/helpers.js`
Utility functions:
- Date/time formatting (Bangladesh timezone)
- Phone number formatting
- Hash generation for order IDs
- Clipboard operations
- Input validation helpers

## 🔧 Configuration

### 1. Google Sheets Setup

Edit `js/config.js` and update:

```javascript
googleSheetCsvUrl: 'YOUR_PUBLISHED_CSV_URL_HERE'
```

Your sheet should have columns: Item, Category, Price, Box Size

### 2. Apps Script Setup

1. Follow instructions in `SETUP_GOOGLE_APPS_SCRIPT.md`
2. Deploy as web app
3. Update `js/config.js`:

```javascript
appsScriptUrl: 'YOUR_APPS_SCRIPT_DEPLOYMENT_URL_HERE'
```

### 3. Social Media Links

Update in `js/config.js`:

```javascript
facebookPageUrl: 'YOUR_FACEBOOK_PAGE_URL'
messengerUrl: 'YOUR_MESSENGER_LINK'
```

## 🌐 Deployment

### Local Development

Simply open `index-new.html` in a modern browser that supports ES6 modules.

**Note**: Due to CORS restrictions, you may need to serve via a local web server:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000/index-new.html`

### Production Deployment

Deploy to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- Any web server

Just upload all files maintaining the folder structure.

## 🎨 Customization

### Colors & Branding

Edit `css/styles.css` - look for:
- Color variables (search for `#ff6b35`, `#10b981`, etc.)
- Gradient backgrounds
- Font families

### Background Icons

The hand-drawn cooking icons are embedded as SVG data URLs in `css/styles.css` in the `body::before` pseudo-element. Modify positions, sizes, or add new icons there.

### Menu Categories

Menu categories are automatically generated from your Google Sheet data. No code changes needed!

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

**Requirements**: ES6 Module support

## 🐛 Troubleshooting

### "Loading menu..." stuck

- Check browser console for errors
- Verify Google Sheets CSV URL is publicly accessible
- Ensure sheet is published to web as CSV

### Orders not saving

- Verify Apps Script deployment URL in `config.js`
- Check Apps Script logs for errors
- Ensure script has proper permissions

### Styles not loading

- Check that `css/styles.css` path is correct
- Verify file was deployed/uploaded
- Clear browser cache

## 📄 License

Private project for Sayema's Kitchen

## 🤝 Credits

- Design & Development: Custom implementation
- Icons: Hand-drawn SVG icons
- Fonts: Google Fonts (Poppins)
