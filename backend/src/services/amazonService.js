const axios = require('axios');
const cheerio = require('cheerio');

// Array of common user agents to rotate and prevent blocking
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15'
];

const getRandomUserAgent = () => {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

const getScrapeHeaders = () => ({
    'User-Agent': getRandomUserAgent(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0'
});

/**
 * Scrapes a single Amazon product page by ASIN.
 * @param {String} asin - The 10-character Amazon ASIN
 * @param {String} fallbackTitle - Optional title to use if scraping fails
 * @returns {Promise<Object|null>} An object resembling the PA-API response format
 */
const scrapeAmazonProduct = async (asin, fallbackTitle = null) => {
    try {
        const url = `https://www.amazon.com/dp/${asin}`;
        const response = await axios.get(url, { headers: getScrapeHeaders(), timeout: 15000 });
        const html = response.data;
        const $ = cheerio.load(html);

        const features = [];
        // Extract Title
        let title = $('#productTitle').text().trim();
        if (!title) {
            title = $('title').text().replace('Amazon.com:', '').trim();
        }

        // Detect bot protection
        let needsReview = false;
        const isRobotCheck = !title ||
            title.toLowerCase().includes('robot check') ||
            title.toLowerCase().includes('bot test') ||
            html.includes('api-services-support@amazon.com');

        if (isRobotCheck) {
            console.log(`Amazon blocked the scrape for ${asin}. Using fallback logic.`);
            title = fallbackTitle || `Amazon Product (${asin})`;
            needsReview = true;
            features.push('Details could not be automatically synced due to temporary Amazon bot protection.');
            features.push('The link is saved and you can manually update the description and price in the edit form.');
        }

        // If we have a title but no features, use a generic description
        if (title && features.length === 0) {
            const featureText = $('#feature-bullets li span').map((i, el) => $(el).text().trim()).get();
            if (featureText.length > 0) {
                features.push(...featureText);
            } else {
                features.push(`View full details and availability for the ${title} directly on Amazon.`);
            }
        }

        // Return data molded into the shape expected by productController
        return {
            ASIN: asin,
            needsReview,
            ItemInfo: {
                Title: { DisplayValue: title },
                Features: { DisplayValues: features }
            },
            Offers: {
                Listings: [{
                    Price: {
                        Amount: 0,
                        Currency: 'USD',
                        DisplayAmount: 'Check Amazon'
                    }
                }]
            },
            Images: {
                Primary: {
                    Large: { URL: `https://placehold.co/800x800/131921/FFFFFF?text=${encodeURIComponent(title)}\n(Sync Pending)&font=playfair-display` }
                },
                Variants: []
            }
        };

    } catch (error) {
        console.error(`Failed to scrape ASIN ${asin}:`, error.message);
        return {
            ASIN: asin,
            needsReview: true,
            ItemInfo: {
                Title: { DisplayValue: fallbackTitle || `Amazon Product (${asin})` },
                Features: { DisplayValues: ['Automatic sync is currently unavailable due to Amazon bot protection. Please click "Edit" below to finalize details manually.'] }
            },
            Offers: {
                Listings: [{ Price: { Amount: 0, Currency: 'USD', DisplayAmount: 'Check Amazon' } }]
            },
            Images: {
                Primary: { Large: { URL: `https://placehold.co/800x800/131921/FFFFFF?text=${encodeURIComponent(fallbackTitle || 'Product')}\n(Connection Error)&font=playfair-display` } },
                Variants: []
            }
        };
    }
};

/**
 * Mocks the getItems PA-API function by mapping asins to scraping promises
 * @param {Array<Object|String>} items - Array of ASINs or Objects { asin, fallbackTitle }
 * @returns {Promise<Object>} Mocked PA-API Response
 */
const getItems = async (items) => {
    // Process scrapings in parallel
    const promises = items.map(item => {
        const asin = typeof item === 'string' ? item : item.asin;
        const fallbackTitle = typeof item === 'object' ? item.fallbackTitle : null;
        return scrapeAmazonProduct(asin, fallbackTitle);
    });

    const results = await Promise.all(promises);
    const validItems = results.filter(item => item !== null);

    return {
        ItemsResult: {
            Items: validItems
        }
    };
};

/**
 * Scraping search results is complicated and often blocked.
 * We'll mock returning an empty array or basic text for now since the main request is Bulk Import (getItems).
 */
const searchItems = async (keyword, searchIndex = 'All') => {
    return { SearchResult: { Items: [] } };
};

module.exports = {
    getItems,
    searchItems
};
