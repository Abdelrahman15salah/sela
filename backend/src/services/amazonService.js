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
 * @param {String} domain - Amazon domain (e.g., www.amazon.com, www.amazon.eg)
 * @returns {Promise<Object|null>} An object resembling the PA-API response format
 */
const scrapeAmazonProduct = async (asin, fallbackTitle = null, domain = 'www.amazon.com') => {
    try {
        const url = `https://${domain}/dp/${asin}`;
        const response = await axios.get(url, { headers: getScrapeHeaders(), timeout: 15000 });
        const html = response.data;
        const $ = cheerio.load(html);

        const features = [];

        // --- IMAGE EXTRACTION (Prioritize meta tags as they are rarely blocked) ---
        let imageUrl = $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content');

        // Fallback image extraction from landing page selectors
        if (!imageUrl) {
            const imgTag = $('#landingImage, #imgBlkFront, #main-image').first();
            if (imgTag.length > 0) {
                imageUrl = imgTag.attr('src');
                const dataDynamic = imgTag.attr('data-a-dynamic-image');
                if (dataDynamic) {
                    try {
                        const parsed = JSON.parse(dataDynamic);
                        imageUrl = Object.keys(parsed).sort((a, b) => parsed[b][0] - parsed[a][0])[0];
                    } catch (e) { }
                }
            }
        }

        // --- PRICE EXTRACTION ---
        let priceAmount = 0;
        let priceCurrency = domain.endsWith('.eg') ? 'EGP' : 'USD';
        let displayPrice = '';

        // 1. Try JSON-LD (Schema.org) - Very reliable and rarely blocked
        const jsonLd = $('script[type="application/ld+json"]');
        if (jsonLd.length > 0) {
            jsonLd.each((i, el) => {
                try {
                    const data = JSON.parse($(el).html());
                    const offer = data?.offers?.[0] || data?.offers;
                    if (offer && offer.price) {
                        priceAmount = parseFloat(offer.price);
                        if (offer.priceCurrency) priceCurrency = offer.priceCurrency;
                        displayPrice = `${priceCurrency === 'EGP' ? 'EGP' : '$'} ${priceAmount.toLocaleString()}`;
                    }
                } catch (e) { }
            });
        }

        // 2. Try Social Meta Tags (Twitter often has price in data1)
        if (!priceAmount) {
            const metaPrice = $('meta[name="twitter:data1"]').attr('content');
            if (metaPrice) {
                const match = metaPrice.match(/[\d,]+\.?\d*/);
                if (match) {
                    priceAmount = parseFloat(match[0].replace(/,/g, ''));
                    const hasCurrencySymbol = metaPrice.includes('$') || metaPrice.toLowerCase().includes('egp');
                    displayPrice = hasCurrencySymbol ? metaPrice : `${priceCurrency} ${priceAmount}`;
                }
            }
        }

        // 3. Last resort: Standard Price selectors
        if (!priceAmount) {
            const priceSelectors = [
                '#corePrice_desktop .a-price .a-offscreen',
                '#corePrice_mobile .a-price .a-offscreen',
                'span.a-price span.a-offscreen',
                '#priceblock_ourprice',
                '#priceblock_dealprice',
                '.a-price.priceToPay span.a-offscreen',
                '.a-price.apexPriceToPay span.a-offscreen',
                '.a-price-whole'
            ];

            for (const selector of priceSelectors) {
                const text = $(selector).first().clone().children().remove().end().text().trim() || $(selector).first().text().trim();
                if (text) {
                    const numericMatch = text.match(/[\d,]+\.?\d*/);
                    if (numericMatch) {
                        priceAmount = parseFloat(numericMatch[0].replace(/,/g, ''));

                        // Detect currency from symbol if not already set robustly
                        if (text.includes('EGP') || text.includes('ج.م')) priceCurrency = 'EGP';
                        else if (text.includes('$')) priceCurrency = 'USD';

                        // Guarantee currency in displayPrice and ensure a space
                        const hasCurrencySymbol = text.includes('$') || text.includes('EGP') || text.includes('ج.م') || text.includes('USD');
                        displayPrice = hasCurrencySymbol
                            ? text.replace(/([$£€]|EGP|USD|AED|SAR)(\d)/i, '$1 $2')
                            : `${priceCurrency === 'EGP' ? 'EGP' : '$'} ${priceAmount.toLocaleString()}`;
                        break;
                    }
                }
            }
        }

        // --- TITLE EXTRACTION ---
        let title = $('#productTitle').text().trim();
        if (!title) {
            title = $('meta[property="og:title"]').attr('content')?.replace('Amazon.com:', '')?.trim() ||
                $('title').text().replace('Amazon.com:', '').trim();
        }

        // Detect bot protection
        let needsReview = false;
        const isRobotCheck = (!title || title.toLowerCase().includes('robot check') || $('button:contains("Continue Shopping")').length > 0) && !imageUrl && !priceAmount;

        if (isRobotCheck) {
            console.log(`Amazon blocked the scrape for ${asin}. Using fallback logic.`);
            title = fallbackTitle || `Amazon Product (${asin})`;
            needsReview = true;
            features.push('Details could not be automatically synced due to temporary Amazon bot protection.');
            features.push('The link is saved and you can manually update the missing details in the edit form.');

            // Set regional-aware prices for robot check return
            priceCurrency = domain.endsWith('.eg') ? 'EGP' : 'USD';
            displayPrice = 'Check Amazon';
        }

        // If we have data but no features, use a generic description
        if (title && features.length === 0) {
            const featureText = $('#feature-bullets li span').map((i, el) => $(el).text().trim()).get();
            if (featureText.length > 0) {
                features.push(...featureText);
            } else {
                features.push(`View full details for ${title} on Amazon.`);
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
                        Amount: priceAmount,
                        Currency: priceCurrency,
                        DisplayAmount: displayPrice || (priceAmount ? `${priceCurrency === 'EGP' ? 'EGP' : '$'} ${priceAmount.toLocaleString()}` : 'Check Amazon')
                    }
                }]
            },
            Images: {
                Primary: {
                    Large: { URL: imageUrl || `https://placehold.co/800x800/131921/FFFFFF?text=${encodeURIComponent(title)}\n(Image Unavailable)&font=playfair-display` }
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
                Listings: [{ Price: { Amount: 0, Currency: domain.endsWith('.eg') ? 'EGP' : 'USD', DisplayAmount: 'Check Amazon' } }]
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
        const domain = typeof item === 'object' ? (item.domain || 'www.amazon.com') : 'www.amazon.com';
        return scrapeAmazonProduct(asin, fallbackTitle, domain);
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
