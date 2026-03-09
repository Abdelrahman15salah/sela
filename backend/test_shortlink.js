const { resolveProductInput } = require('./src/utils/urlResolver');

async function testLink() {
    const input = 'https://amzn.to/3PpSHE2';
    console.log(`Testing link: ${input}`);

    const result = await resolveProductInput(input);
    console.log('--- Resolved Result ---');
    console.log(JSON.stringify(result, null, 2));
}

testLink();
