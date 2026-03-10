const mongoose = require('mongoose');
require('dotenv').config({ path: 'g:/coding/sela/backend/.env' });
const Product = require('g:/coding/sela/backend/src/models/Product');

async function seedProducts() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found in .env');
        
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri, {
            dbName: 'test', // Explicitly setting a DB name often helps with certain clusters
            serverSelectionTimeoutMS: 10000,
        });
        console.log('Connected to MongoDB');

        const products = [];
        const categories = ['Mobiles', 'Tech', 'Home', 'Style', 'Beauty', 'Sports', 'Books', 'Gaming'];

        for (let i = 1; i <= 100; i++) {
            products.push({
                asin: `MOCKASIN${i.toString().padStart(3, '0')}`,
                title: `Mock Product ${i}`,
                description: `This is a mock description for product ${i}`,
                price: Math.floor(Math.random() * 5000) + 100,
                currency: 'EGP',
                category: categories[Math.floor(Math.random() * categories.length)],
                images: ['https://placehold.co/400x400?text=Mock+Product+' + i],
                amazonLink: 'https://example.com/dp/MOCKASIN' + i,
                isFeatured: i % 10 === 0,
                isOnSale: i % 5 === 0,
                salePrice: i % 5 === 0 ? Math.floor(Math.random() * 4000) + 50 : undefined
            });
        }

        console.log(`Seeding ${products.length} products...`);
        await Product.insertMany(products);
        console.log('Successfully seeded mock products!');

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedProducts();
