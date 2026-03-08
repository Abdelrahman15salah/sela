const crypto = require('crypto');

/**
 * Creates an AWS Signature Version 4 for Amazon PA-API 5.0
 */
function createSignature(reqOptions, payload, config) {
    const { accessKey, secretKey, region } = config;
    const service = 'ProductAdvertisingAPI';
    const algorithm = 'AWS4-HMAC-SHA256';

    const method = reqOptions.method || 'POST';
    const host = reqOptions.host;
    const path = reqOptions.path;

    // Create dates
    const amzDate = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substr(0, 8); // YYYYMMDD

    // Canonical URI
    const canonicalUri = path;

    // Canonical Query String
    const canonicalQuerystring = '';

    // Canonical Headers
    const canonicalHeaders = `content-encoding:amz-1.0\ncontent-type:application/json; charset=utf-8\nhost:${host}\nx-amz-date:${amzDate}\nx-amz-target:${reqOptions.target}\n`;
    const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';

    // Payload Hash
    const payloadHash = crypto.createHash('sha256').update(payload, 'utf8').digest('hex');

    // Canonical Request
    const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    // Credential Scope
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

    // String to Sign
    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex');
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

    // Calculate Signature
    const kDate = getSignatureKey(secretKey, dateStamp, region, service);
    const signature = crypto.createHmac('sha256', kDate).update(stringToSign, 'utf8').digest('hex');

    // Construction of Authorization header
    const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
        'Authorization': authorizationHeader,
        'x-amz-date': amzDate,
    };
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
    const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp, 'utf8').digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName, 'utf8').digest();
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName, 'utf8').digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request', 'utf8').digest();
    return kSigning;
}

module.exports = {
    createSignature
};
