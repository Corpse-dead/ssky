const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

// Rate limiting and caching for image scraping
const imageCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const isValidAmazonUrl = (url) => {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('amazon');
    } catch {
        return false;
    }
};

const extractProductImage = ($) => {
    // Extract main product image only
    const imageSelectors = [
        '#landingImage',
        '#imgTagWrapperId img',
        '.a-dynamic-image',
        '.a-image.a-image-stretch img',
        '[data-action="main-image-click"] img'
    ];

    for (const selector of imageSelectors) {
        const imgSrc = $(selector).attr('src') || $(selector).attr('data-src');
        if (imgSrc && imgSrc.startsWith('http')) {
            // Get high-quality version of the image
            const highQualityImg = imgSrc.replace(/\._[^.]*_\./, '._AC_SL1500_.');
            return highQualityImg;
        }
    }

    return null;
};

const scrapeImageWithPuppeteer = async (url) => {
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
            timeout: 20000 
        });

        // Wait for image to load
        await page.waitForTimeout(2000);

        const content = await page.content();
        const $ = cheerio.load(content);
        
        return extractProductImage($);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

const scrapeImageWithFetch = async (url) => {
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
    
    return extractProductImage($);
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
        const cached = imageCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return res.status(200).json({
                success: true,
                image: cached.image,
                cached: true
            });
        }

        let productImage;
        
        try {
            // Try Puppeteer first for more reliable scraping
            productImage = await scrapeImageWithPuppeteer(url);
        } catch (puppeteerError) {
            console.log('Puppeteer failed, trying fetch:', puppeteerError.message);
            
            try {
                // Fallback to simple fetch
                productImage = await scrapeImageWithFetch(url);
            } catch (fetchError) {
                console.log('Fetch also failed:', fetchError.message);
                throw new Error('All image scraping methods failed');
            }
        }

        // Validate extracted image
        if (!productImage) {
            throw new Error('Could not extract product image');
        }

        // Cache the result
        imageCache.set(cacheKey, {
            timestamp: Date.now(),
            image: productImage
        });

        // Clean up old cache entries
        if (imageCache.size > 50) {
            const oldestKey = imageCache.keys().next().value;
            imageCache.delete(oldestKey);
        }

        res.status(200).json({
            success: true,
            image: productImage
        });

    } catch (error) {
        console.error('Image scraping error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to scrape product image',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
