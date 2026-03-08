const adminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'admin';

    if (username === validUsername && password === validPassword) {
        next();
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

module.exports = adminAuth;
