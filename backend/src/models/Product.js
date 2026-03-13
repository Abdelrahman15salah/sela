const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    asin: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    // Base price (can be a simple number for manual products,
    // or a PA-API price object for synced products)
    price: { type: mongoose.Schema.Types.Mixed },
    currency: { type: String },
    domain: { type: String, default: 'www.amazon.com' },
    // Optional sale information for manual products
    salePrice: { type: Number },
    salePercentage: { type: Number },
    isOnSale: { type: Boolean, default: false },
    images: [{ type: String }],
    imageURL: { type: String },
    category: { type: String },
    amazonLink: { type: String },
    isStocked: { type: Boolean, default: true },
    rating: {
        type: Number,
        min: 0,
        max: 5,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Indexes for search and listing
productSchema.index({ title: 1 });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
