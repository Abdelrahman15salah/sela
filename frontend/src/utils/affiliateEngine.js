/**
 * Affiliate Link Engine
 * Appends the Amazon Associate Tag to any given Amazon ASIN or URL.
 */

// These would typically come from an environment variable or a settings API
const DEFAULT_TAG = import.meta.env.VITE_AMAZON_ASSOCIATE_TAG || 'sela01-20';
const EG_TAG = import.meta.env.VITE_AMAZON_EG_ASSOCIATE_TAG || 'selastore-21';

/**
 * Gets the correct associate tag for a given domain
 * @param {string} domain 
 * @returns {string}
 */
const getTagForDomain = (domain) => {
    if (domain?.includes('amazon.eg')) return EG_TAG;
    return DEFAULT_TAG;
};

export const generateAffiliateLink = (asin, domain = 'www.amazon.com') => {
    if (!asin) return '#';
    const tag = getTagForDomain(domain);
    return `https://${domain}/dp/${asin}?tag=${tag}&linkCode=ogi&th=1&psc=1`;
};

export const appendTagToUrl = (url) => {
    if (!url) return '#';
    try {
        const urlObj = new URL(url);
        const tag = getTagForDomain(urlObj.hostname);
        urlObj.searchParams.set('tag', tag);
        return urlObj.toString();
    } catch (error) {
        console.warn('Invalid URL passed to affiliate engine', url);
        return url;
    }
};
