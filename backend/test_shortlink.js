const { getAsinFromInput, extractDomain } = require('./src/utils/urlResolver');
const axios = require('axios');

async function testLink() {
    const input = 'https://amzn.to/3PpSHE2';
    console.log(`Testing link: ${input}`);

    // Step 1: Resolve Shortlink
    const response = await axios.get(input, { maxRedirects: 5 });
    const finalUrl = response.request.res.responseUrl || response.config.url;
    console.log(`Resolved URL: ${finalUrl}`);

    // Step 2: Extract Info
    const asin = await getAsinFromInput(input);
    const domain = extractDomain(finalUrl);
    console.log(`Extracted ASIN: ${asin}`);
    console.log(`Extracted Domain: ${domain}`);
}

testLink();
