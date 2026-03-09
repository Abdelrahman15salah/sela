const axios = require('axios');

/**
 * Extracts ASIN from a standard Amazon URL
 * Matches formats like /dp/B0..., /gp/product/B0...
 * @param {string} url - Amazon URL
 * @returns {string|null} The extracted 10-character ASIN, or null if not found
 */
const extractAsin = (url) => {
    try {
        // Standard /dp/, /gp/product/, and also ?asin= patterns
        const patterns = [
            /\/dp\/([A-Z0-9]{10})/i,
            /\/gp\/product\/([A-Z0-9]{10})/i,
            /[?&]asin=([A-Z0-9]{10})/i,
            /\/ASIN\/([A-Z0-9]{10})/i
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) return match[1];
        }

        return null;
    } catch (e) {
        return null;
    }
};

/**
 * Resolves an amzn.to shortlink to its full URL
 * @param {string} shortUrl - e.g., https://amzn.to/3xyz
 * @returns {Promise<string|null>} Resolves to the full destination URL
 */
const resolveShortlink = async (shortUrl) => {
    try {
        const response = await axios.get(shortUrl, {
            maxRedirects: 5,
            timeout: 8000,
            headers: {
                // Some regions block axios default UA
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        return response.request.res.responseUrl || response.config.url;
    } catch (error) {
        console.error(`Error resolving shortlink ${shortUrl}:`, error.message);
        return null;
    }
};

/**
 * Normalizes input string into its components
 * @param {string} input - URL or ASIN
 * @returns {Promise<Object>} { asin, domain, fallbackTitle }
 */
const resolveProductInput = async (input) => {
    const trimmed = input.trim();
    let asin = null;
    let finalUrl = trimmed;
    let domain = 'www.amazon.com';

    // 1. If it's a raw ASIN
    if (/^[A-Z0-9]{10}$/i.test(trimmed)) {
        return { asin: trimmed.toUpperCase(), domain: 'www.amazon.com', fallbackTitle: null };
    }

    // 2. If it's a shortlink, resolve it first
    if (trimmed.includes('amzn.to/') || trimmed.includes('a.co/')) {
        const resolved = await resolveShortlink(trimmed);
        if (resolved) finalUrl = resolved;
    }

    // 3. Extract details from the (potentially resolved) URL
    asin = extractAsin(finalUrl);
    domain = extractDomain(finalUrl);
    const fallbackTitle = extractTitleFromUrl(finalUrl);

    return { asin, domain, fallbackTitle };
};

/**
 * Normalizes input string into an ASIN
 */
const getAsinFromInput = async (input) => {
    const result = await resolveProductInput(input);
    return result.asin;
};

/**
 * Extracts a human-readable title from the Amazon URL slug
 */
const extractTitleFromUrl = (url) => {
    try {
        const match = url.match(/amazon\.[a-z\.]+\/([^/]+)\/(?:dp|gp\/product)\//i);
        if (!match || !match[1]) return null;

        const slug = match[1];
        return slug
            .split(/[-_]/)
            .map(word => {
                // Filter out non-alphabetic chars for title
                const clean = word.replace(/[^a-zA-Z]/g, '');
                return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
            })
            .filter(word => word.length > 1)
            .join(' ')
            .trim();
    } catch (e) {
        return null;
    }
};

/**
 * Extracts the Amazon domain from a URL (e.g., amazon.com, amazon.eg)
 */
const extractDomain = (url) => {
    try {
        const match = url.match(/https?:\/\/([^/]+)/i);
        if (match && match[1] && (match[1].includes('amazon.') || match[1].includes('amzn.'))) {
            let d = match[1].toLowerCase();
            // Ensure we have www. prefix if it's missing for consistency in scraping
            if (!d.startsWith('www.') && !d.includes('media-amazon')) d = 'www.' + d;
            return d;
        }
        return 'www.amazon.com';
    } catch (e) {
        return 'www.amazon.com';
    }
};

module.exports = {
    extractAsin,
    extractTitleFromUrl,
    extractDomain,
    resolveShortlink,
    getAsinFromInput,
    resolveProductInput
};
