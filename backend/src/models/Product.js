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

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
