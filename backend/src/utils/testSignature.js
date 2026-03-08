const { createSignature } = require('./amazonApiAuth');

const mockConfig = {
    accessKey: 'AKIAIOSFODNN7EXAMPLE',
    secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    region: 'us-east-1'
};

const payload = JSON.stringify({
    ItemIds: ['B08N5WRWNW'],
    Resources: ['ItemInfo.Title']
});

const reqOptions = {
    method: 'POST',
    host: 'webservices.amazon.com',
    path: '/paapi5/getitems',
    target: 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems'
};

const signatureHeaders = createSignature(reqOptions, payload, mockConfig);

console.log('--- TEST: AWS Signature V4 Generation ---');
if (signatureHeaders['Authorization'] && signatureHeaders['Authorization'].includes('AWS4-HMAC-SHA256')) {
    console.log('✅ Signature successfully generated');
    console.log('Authorization Header:', signatureHeaders['Authorization']);
    console.log('x-amz-date Header:', signatureHeaders['x-amz-date']);
} else {
    console.log('❌ Failed to construct valid signature header');
    process.exit(1);
}
