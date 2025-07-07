const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

// Rate limiting and caching
const requestCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const isValidAmazonUrl = (url) => {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('amazon');
    } catch {
        return false;
    }
};

const extractProductInfo = ($) => {
    const product = {
        title: '',
        price: '',
        image: '',
        description: '',
        category: ''
    };

    // Extract title
    product.title = $('#productTitle').text().trim() ||
                   $('h1.a-size-large').text().trim() ||
                   $('h1').first().text().trim();

    // Extract price
    const priceSelectors = [
        '.a-price-whole',
        '.a-offscreen',
        '.a-price .a-offscreen',
        '.a-price-range .a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen',
        '.a-section.a-spacing-none.aok-align-center .a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen'
    ];

    for (const selector of priceSelectors) {
        const priceText = $(selector).first().text().trim();
        if (priceText) {
            // Extract numbers from price text
            const priceMatch = priceText.match(/[\d,]+/);
            if (priceMatch) {
                product.price = priceMatch[0].replace(/,/g, '');
                break;
            }
        }
    }

    // Extract main image
    const imageSelectors = [
        '#landingImage',
        '#imgTagWrapperId img',
        '.a-dynamic-image',
        '.a-image.a-image-stretch img'
    ];

    for (const selector of imageSelectors) {
        const imgSrc = $(selector).attr('src') || $(selector).attr('data-src');
        if (imgSrc && imgSrc.startsWith('http')) {
            product.image = imgSrc;
            break;
        }
    }

    // Extract description
    const descSelectors = [
        '#feature-bullets ul',
        '#productDescription',
        '.a-unordered-list.a-vertical.a-spacing-mini',
        '.a-section.a-spacing-medium.a-text-center'
    ];

    for (const selector of descSelectors) {
        const desc = $(selector).text().trim();
        if (desc && desc.length > 20) {
            product.description = desc.substring(0, 200) + (desc.length > 200 ? '...' : '');
            break;
        }
    }

    // Suggest category based on title and breadcrumbs
    const breadcrumbs = $('.a-breadcrumb .a-list-item').map((i, el) => $(el).text().trim()).get();
    const titleLower = product.title.toLowerCase();
    
    if (titleLower.includes('poster') || titleLower.includes('print') || titleLower.includes('wall art')) {
        product.category = 'posters';
    } else if (titleLower.includes('sticker') || titleLower.includes('decal')) {
        product.category = 'stickers';
    } else if (breadcrumbs.some(b => b.toLowerCase().includes('poster'))) {
        product.category = 'posters';
    } else if (breadcrumbs.some(b => b.toLowerCase().includes('sticker'))) {
        product.category = 'stickers';
    } else {
        product.category = 'posters'; // default
    }

    return product;
};

const scrapeWithPuppeteer = async (url) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        
        // Set user agent to avoid detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Set viewport
        await page.setViewport({ width: 1366, height: 768 });
        
        // Navigate to the page
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });

        // Wait for content to load
        await page.waitForTimeout(2000);

        const content = await page.content();
        const $ = cheerio.load(content);
        
        return extractProductInfo($);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

const scrapeWithFetch = async (url) => {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    };

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    return extractProductInfo($);
};

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { url } = req.body;
        
        if (!url || !isValidAmazonUrl(url)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Amazon URL'
            });
        }

        // Check cache first
        const cacheKey = url;
        const cached = requestCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return res.status(200).json({
                success: true,
                ...cached.data,
                cached: true
            });
        }

        let productData;
        
        try {
            // Try Puppeteer first for more reliable scraping
            productData = await scrapeWithPuppeteer(url);
        } catch (puppeteerError) {
            console.log('Puppeteer failed, trying fetch:', puppeteerError.message);
            
            try {
                // Fallback to simple fetch
                productData = await scrapeWithFetch(url);
            } catch (fetchError) {
                console.log('Fetch also failed:', fetchError.message);
                throw new Error('All scraping methods failed');
            }
        }

        // Validate extracted data
        if (!productData.title) {
            throw new Error('Could not extract product title');
        }

        // Cache the result
        requestCache.set(cacheKey, {
            timestamp: Date.now(),
            data: productData
        });

        // Clean up old cache entries
        if (requestCache.size > 100) {
            const oldestKey = requestCache.keys().next().value;
            requestCache.delete(oldestKey);
        }

        res.status(200).json({
            success: true,
            ...productData
        });

    } catch (error) {
        console.error('Scraping error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to scrape product data',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
