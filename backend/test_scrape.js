const { getItems } = require('./src/services/amazonService');

async function testScrape() {
    const asin = 'B0D8LXRHQ8';
    const domain = 'www.amazon.com';
    const fallbackTitle = 'Keurig Single Serve Coffee Maker';

    console.log(`Scraping ASIN: ${asin} on ${domain}`);

    try {
        const result = await getItems([{ asin, fallbackTitle, domain }]);
        const item = result.ItemsResult.Items[0];

        console.log('--- Product Details ---');
        console.log(`Title: ${item.ItemInfo.Title.DisplayValue}`);
        console.log(`Price: ${item.Offers.Listings[0].Price.DisplayAmount}`);
        console.log(`Currency: ${item.Offers.Listings[0].Price.Currency}`);
        console.log(`Needs Review: ${item.needsReview}`);
    } catch (error) {
        console.error('Error during scrape:', error.message);
    }
}

testScrape();
