/**
 * Affiliate Link Engine
 * Appends the Amazon Associate Tag to any given Amazon ASIN or URL.
 */

// This would typically come from an environment variable or a settings API
const DEFAULT_ASSOCIATE_TAG = import.meta.env.VITE_AMAZON_ASSOCIATE_TAG || 'your_tag-20';

export const generateAffiliateLink = (asin, tag = DEFAULT_ASSOCIATE_TAG) => {
    if (!asin) return '#';
    return `https://www.amazon.com/dp/${asin}?tag=${tag}&linkCode=ogi&th=1&psc=1`;
};

export const appendTagToUrl = (url, tag = DEFAULT_ASSOCIATE_TAG) => {
    if (!url) return '#';
    try {
        const urlObj = new URL(url);
        urlObj.searchParams.set('tag', tag);
        return urlObj.toString();
    } catch (error) {
        console.warn('Invalid URL passed to affiliate engine', url);
        return url;
    }
};
