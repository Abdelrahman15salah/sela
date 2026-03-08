const axios = require('axios');

/**
 * Extracts ASIN from a standard Amazon URL
 * Matches formats like /dp/B0..., /gp/product/B0...
 * @param {string} url - Amazon URL
 * @returns {string|null} The extracted 10-character ASIN, or null if not found
 */
const extractAsin = (url) => {
    try {
        const match = url.match(/\/dp\/([A-Z0-9]{10})|\/gp\/product\/([A-Z0-9]{10})/i);
        return match ? (match[1] || match[2]) : null;
    } catch (e) {
        return null;
    }
};

/**
 * Resolves an amzn.to shortlink to its full URL and extracts the ASIN
 * @param {string} shortUrl - e.g., https://amzn.to/3xyz
 * @returns {Promise<string|null>} Resolves to the ASIN if found
 */
const resolveShortlink = async (shortUrl) => {
    try {
        // We only need the headers to get the redirect location,
        // but axios follows redirects by default. We want to catch the final URL.
        const response = await axios.get(shortUrl, {
            maxRedirects: 5,
            timeout: 5000,
        });

        const finalUrl = response.request.res.responseUrl || response.config.url;
        return extractAsin(finalUrl);
    } catch (error) {
        console.error(`Error resolving shortlink ${shortUrl}:`, error.message);
        return null;
    }
};

/**
 * Normalizes input string into an ASIN
 * Input can be a raw ASIN, a standard Amazon link, or a SiteStripe shortlink
 * @param {string} input
 * @returns {Promise<string|null>} The ASIN, or null if invalid
 */
const getAsinFromInput = async (input) => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Check if it's already a raw 10-char ASIN
    if (/^[A-Z0-9]{10}$/i.test(trimmed)) {
        return trimmed.toUpperCase();
    }

    // Check if it's a shortlink
    if (trimmed.includes('amzn.to/')) {
        return await resolveShortlink(trimmed);
    }

    // Otherwise, assume it's a regular URL and try to extract ASIN
    return extractAsin(trimmed);
};

module.exports = {
    extractAsin,
    resolveShortlink,
    getAsinFromInput
};
