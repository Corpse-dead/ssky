# SSKY Printing Website

A modern, responsive website for SSKY Printing with JSON-based product management and Google Forms integration.

## 🚀 Quick Start

### File Structure
```
modern-clothing-brand-homepage/
├── assets/
│   └── photos/          # Place your product images here
├── src/
│   └── index.html       # Main homepage
├── posters.html         # Posters product page
├── die-cut-stickers.html # Stickers product page
├── about.html           # About page
├── products.json        # Product database
└── README.md            # This file
```

### Adding Products

1. **Add images to `assets/photos/` folder**
2. **Update the `productDatabase` array in `posters.html`:**

```javascript
{
    id: 106,
    filename: "your_image.jpg",
    title: "Your Product Title",
    category: "auto", // Will auto-categorize based on filename
    price: 0, // Will auto-generate if set to 0
    image: "assets/photos/your_image.jpg",
    badge: "new", // Optional: "new", "trending", or null
    link: "", // Leave blank for custom print, or add Amazon URL
    source: "local"
}
```

### Categorization Rules

- **K-pop**: Files containing "bts", "kpop", "k-pop" → `category: "kpop"`
- **Cars**: Files containing "car", "vehicle", "auto" → `category: "cars"`  
- **Others**: All other files → `category: "others"`

### Google Forms Integration

Update these URLs in the respective files:

**For Posters (`posters.html`):**
```html
<a href="https://forms.google.com/YOUR_POSTER_FORM_ID" target="_blank" class="custom-print-btn">
```

**For Die-cut Stickers (`die-cut-stickers.html`):**
```html
<a href="https://forms.google.com/YOUR_STICKER_FORM_ID" target="_blank" class="custom-print-btn">
```

## 🛠️ Development

### Local Development
```bash
# Serve with Python
python -m http.server 3000

# Or with Node.js
npx serve .

# Or with any static file server
```

### Production Deployment

1. **GitHub Pages / Netlify / Vercel:**
   - Upload all files to your repository
   - Ensure `assets/photos/` folder is included
   - Update Google Form URLs
   - Deploy

2. **Traditional Hosting:**
   - Upload all files via FTP
   - Ensure file permissions are correct
   - Test all image paths

## 📊 Features

- ✅ **JSON-Based Products**: Easy product management
- ✅ **Auto-Categorization**: Smart filename-based sorting
- ✅ **Google Forms**: Custom print order integration
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Dark/Light Mode**: Theme switching
- ✅ **Search & Filter**: Enhanced UX
- ✅ **Clean Architecture**: Maintainable code

## 🔧 Customization

### Adding New Categories

1. **Update category rules in `posters.html`:**
```javascript
categorizeByFilename(filename) {
    const lowerFilename = filename.toLowerCase();
    
    if (lowerFilename.includes('your_keyword')) {
        return 'your_category';
    }
    
    // ...existing rules...
}
```

2. **Add category button in HTML:**
```html
<button class="category-btn" onclick="filterByCategory('your_category')">Your Category</button>
```

### Custom Pricing

Update pricing ranges in the `generatePrice` method:
```javascript
const pricing = {
    your_category: { min: 199, max: 599 },
    // ...existing categories...
};
```

## 🐛 Troubleshooting

### Images Not Loading
- Check file paths in `assets/photos/`
- Verify image file extensions (jpg, png, webp)
- Check browser console for errors

### Categories Not Showing
- Ensure filename contains category keywords
- Check `categorizeByFilename` function
- Verify category buttons are added

### Google Forms Not Opening
- Update form URLs with your actual Google Form IDs
- Test links in new tabs
- Check console for JavaScript errors

## 📞 Support

For technical support, contact the development team or refer to the code comments for implementation details.