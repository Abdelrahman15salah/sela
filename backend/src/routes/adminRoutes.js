const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Visitor = require('../models/Visitor');

const adminAuth = require('../middleware/adminAuth');



// Login Route (Just checks credentials and returns success)
router.post('/login', adminAuth, (req, res) => {
    res.json({ success: true, message: 'Authentication successful' });
});

// Dashboard Stats Route
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();

        // Aggregate to find number of unique categories
        const categoriesResult = await Product.aggregate([
            { $group: { _id: "$category" } },
            { $count: "total" }
        ]);
        const totalCategories = categoriesResult.length > 0 ? categoriesResult[0].total : 0;

        // Get recent products (last 5)
        const recentProducts = await Product.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title price currency category images imageURL createdAt');

        // Products on sale
        const saleProductsCount = await Product.countDocuments({ isOnSale: true });

        // Total Visitors
        const visitorDoc = await Visitor.findOne({ id: 'global' });
        const totalVisitors = visitorDoc ? visitorDoc.count : 0;

        // --- NEW ANALYTICS AGGREGATIONS ---

        // 1. Products Over Time (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const productsOverTimeRaw = await Product.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill in missing days with 0
        const productsOverTime = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            const found = productsOverTimeRaw.find(item => item._id === dateString);
            productsOverTime.push({
                date: dateString,
                count: found ? found.count : 0
            });
        }

        // 2. Products by Category for Pie Chart
        const categoryDistribution = await Product.aggregate([
            {
                $group: {
                    _id: { $cond: [{ $eq: ["$category", null] }, "Uncategorized", "$category"] },
                    value: { $sum: 1 }
                }
            },
            { $project: { name: "$_id", value: 1, _id: 0 } },
            { $sort: { value: -1 } }
        ]);

        // 3. Top 5 Most Expensive Products
        const topExpensiveProducts = await Product.find()
            .sort({ price: -1 })
            .limit(5)
            .select('title price currency category imageURL images');

        res.json({
            stats: {
                totalProducts,
                totalCategories,
                saleProductsCount,
                totalVisitors
            },
            recentProducts,
            analytics: {
                productsOverTime,
                categoryDistribution,
                topExpensiveProducts
            }
        });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;
