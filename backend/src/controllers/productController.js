const Product = require('../models/Product');
const { getItems, searchItems } = require('../services/amazonService');
const { getAsinFromInput } = require('../utils/urlResolver');

const CACHE_EXPIRATION_HOURS = 24;

/**
 * @desc    Get all products from our DB, optionally filtered by category or search term
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
    try {
        const { category, search, isFeatured } = req.query;
        const conditions = [];

        if (category) {
            const escaped = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            conditions.push({ category: new RegExp(`^${escaped}$`, 'i') });
        }

        if (search) {
            conditions.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ],
            });
        }

        if (isFeatured === 'true') {
            conditions.push({ isFeatured: true });
        }

        const query = conditions.length > 0 ? { $and: conditions } : {};
        const products = await Product.find(query).lean();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching products', error: error.message });
    }
};

/**
 * @desc    Sync a single product from Amazon PA-API and cache in DB
 * @route   POST /api/products/sync
 * @access  Private/Admin
 */
const syncProduct = async (req, res) => {
    const { asin } = req.body;

    if (!asin) {
        return res.status(400).json({ message: 'ASIN is required' });
    }

    try {
        // 1. Fetch from Amazon API
        const paapiData = await getItems([asin]);

        // We assume data comes back correctly. In a real app we'd add deep checking.
        const items = paapiData?.ItemsResult?.Items;
        if (!items || items.length === 0) {
            return res.status(404).json({ message: 'Product not found on Amazon' });
        }

        const item = items[0];

        // Parse attributes
        const title = item.ItemInfo?.Title?.DisplayValue || 'Unknown Title';
        const description = item.ItemInfo?.Features?.DisplayValues?.join(' ') || '';
        const images = item.Images?.Variants?.map(v => v.Large?.URL) || [];
        if (item.Images?.Primary?.Large?.URL) {
            images.unshift(item.Images.Primary.Large.URL);
        }

        // Extract price
        let amount = 0;
        let currency = 'USD';
        let displayPrice = '';

        const priceListing = item.Offers?.Listings?.[0]?.Price;
        if (priceListing) {
            amount = priceListing.Amount;
            currency = priceListing.Currency;
            displayPrice = priceListing.DisplayAmount;
        }

        // 2. Cache in DB
        const updateData = {
            title,
            description,
            price: { amount, currency, displayPrice },
            images,
            lastUpdated: new Date()
        };

        if (req.body.category) {
            updateData.category = req.body.category;
        }

        const product = await Product.findOneAndUpdate(
            { asin },
            { $set: updateData },
            { new: true, upsert: true }
        );

        res.json({ message: 'Product synced successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Failed to sync product', error: error.message });
    }
};

/**
 * @desc    Bulk sync multiple products from Amazon PA-API
 * @route   POST /api/products/bulk-sync
 * @access  Private/Admin
 */
const bulkSyncProducts = async (req, res) => {
    const { inputs } = req.body; // Array of mixed strings (ASINs, urls, amzn.to links)

    if (!Array.isArray(inputs) || inputs.length === 0) {
        return res.status(400).json({ message: 'An array of inputs is required' });
    }

    try {
        // 1. Resolve all inputs to valid ASINs
        const asinsPromises = inputs.map(input => getAsinFromInput(input));
        const resolvedAsinsList = await Promise.all(asinsPromises);

        // Filter out nulls and get unique ASINs
        const validAsins = [...new Set(resolvedAsinsList.filter(asin => asin !== null))];

        if (validAsins.length === 0) {
            return res.status(400).json({ message: 'No valid Amazon links or ASINs found in the input' });
        }

        const BATCH_SIZE = 10; // Amazon PA-API GetItems limit is 10
        const results = {
            successful: [],
            failed: [],
            errors: []
        };

        // 2. Fetch from PA-API in batches
        for (let i = 0; i < validAsins.length; i += BATCH_SIZE) {
            const batch = validAsins.slice(i, i + BATCH_SIZE);
            try {
                const paapiData = await getItems(batch);
                const items = paapiData?.ItemsResult?.Items || [];

                // 3. Process each item and bulk upsert to DB
                if (items.length > 0) {
                    const bulkOps = items.map(item => {
                        const asin = item.ASIN?.trim();
                        const title = item.ItemInfo?.Title?.DisplayValue || 'Unknown Title';
                        const description = item.ItemInfo?.Features?.DisplayValues?.join(' ') || '';

                        const images = item.Images?.Variants?.map(v => v.Large?.URL) || [];
                        if (item.Images?.Primary?.Large?.URL) {
                            images.unshift(item.Images.Primary.Large.URL);
                        }

                        let amount = 0, currency = 'USD', displayPrice = '';
                        // PA-API has Offers.Listings[0].Price, our mock has Offers.Listings[0].Price
                        const priceListing = item.Offers?.Listings?.[0]?.Price;
                        if (priceListing) {
                            amount = priceListing.Amount || 0;
                            currency = priceListing.Currency || 'USD';
                            displayPrice = priceListing.DisplayAmount || '$0.00';
                        }

                        const updateData = {
                            title,
                            description,
                            price: { amount, currency, displayPrice },
                            images,
                            lastUpdated: new Date()
                        };

                        results.successful.push({ asin, title });

                        return {
                            updateOne: {
                                filter: { asin },
                                update: { $set: updateData },
                                upsert: true
                            }
                        };
                    });

                    if (bulkOps.length > 0) {
                        try {
                            await Product.bulkWrite(bulkOps);
                        } catch (writeErr) {
                            console.error('Mongoose BulkWrite Error:', writeErr);
                            throw writeErr;
                        }
                    }
                }

                // Because we emit placeholder items when scraped fail, all requested ASINs
                // should now be "returned" by the API mock and marked successful.
                const returnedAsins = items.map(t => t.ASIN?.trim());
                const missingAsins = batch.filter(asin => !returnedAsins.includes(asin));
                results.failed.push(...missingAsins);

            } catch (batchError) {
                console.error(`Error processing batch ${batch} at DB step:`, batchError.message);
                results.failed.push(...batch);
                results.errors.push(batchError.message);
            }
        }

        // We removed the all-batches-failed check since we are emitting fallback items now
        // on errors to allow the user to still track the ASIN.

        res.json({
            message: `Processed ${validAsins.length} items. Success: ${results.successful.length}, Failed: ${results.failed.length}`,
            results
        });

    } catch (error) {
        console.error('Bulk Sync Error:', error);
        res.status(500).json({ message: 'Failed to complete bulk sync operation', error: error.message });
    }
};

/**
 * @desc    Live search Amazon products (doesn't save to DB directly)
 * @route   GET /api/products/amazon-search
 * @access  Private/Admin
 */
const liveSearchAmazon = async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) return res.status(400).json({ message: 'Keyword is required' });

    try {
        const apiRes = await searchItems(keyword);
        res.json(apiRes?.SearchResult?.Items || []);
    } catch (error) {
        res.status(500).json({ message: 'Failed to search Amazon', error: error.message });
    }
};

/**
 * @desc    Get single product by ID or ASIN
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        let product;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(id).lean();
        } else {
            product = await Product.findOne({ asin: id }).lean();
        }

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Create a product manually (no PA-API needed)
 * @route   POST /api/products
 * @access  Public (add auth later)
 */
const createProduct = async (req, res) => {
    try {
        const {
            asin, title, description, price, currency, imageURL, images,
            category, amazonLink, isFeatured, rating, isStocked,
            salePrice, isOnSale, salePercentage,
        } = req.body;

        if (!asin || !title) {
            return res.status(400).json({ message: 'ASIN and title are required' });
        }

        const basePrice = typeof price === 'number' ? price : (price?.amount ?? 0);

        const productData = {
            asin: asin.trim(),
            title: title.trim(),
            description: description?.trim() || '',
            price: basePrice,
            currency: currency || 'EGP',
            amazonLink: amazonLink?.trim() || null,
            isFeatured: !!isFeatured,
            rating: rating ?? 0,
            isStocked: isStocked !== false,
        };

        const saleNum = typeof salePrice === 'number' ? salePrice : parseFloat(salePrice);
        if (!Number.isNaN(saleNum) && saleNum > 0 && basePrice > 0 && saleNum < basePrice) {
            productData.salePrice = saleNum;
            productData.isOnSale = isOnSale !== false; // default to true if valid sale
            productData.salePercentage = typeof salePercentage === 'number'
                ? salePercentage
                : Math.round(((basePrice - saleNum) / basePrice) * 100);
        } else {
            productData.salePrice = undefined;
            productData.isOnSale = false;
            productData.salePercentage = undefined;
        }

        if (imageURL) productData.imageURL = imageURL.trim();
        if (images?.length) productData.images = images;
        if (category) productData.category = category;

        const product = await Product.create(productData);
        res.status(201).json({ message: 'Product added successfully', product });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A product with this ASIN already exists' });
        }
        res.status(500).json({ message: 'Failed to add product', error: error.message });
    }
};

/**
 * @desc    Update a product manually
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            asin, title, description, price, currency, imageURL, images,
            category, amazonLink, isFeatured, rating, isStocked,
            salePrice, isOnSale, salePercentage,
        } = req.body;

        const basePrice = typeof price === 'number' ? price : (price?.amount ?? 0);

        const productData = {
            asin: asin?.trim(),
            title: title?.trim(),
            description: description?.trim() || '',
            price: basePrice,
            currency: currency || 'EGP',
            amazonLink: amazonLink?.trim() || null,
            isFeatured: !!isFeatured,
            rating: rating ?? 0,
            isStocked: isStocked !== false,
        };

        const saleNum = typeof salePrice === 'number' ? salePrice : parseFloat(salePrice);
        if (!Number.isNaN(saleNum) && saleNum > 0 && basePrice > 0 && saleNum < basePrice) {
            productData.salePrice = saleNum;
            productData.isOnSale = isOnSale !== false; // default to true if valid sale
            productData.salePercentage = typeof salePercentage === 'number'
                ? salePercentage
                : Math.round(((basePrice - saleNum) / basePrice) * 100);
        } else if (isOnSale === false) {
            // explicitly turning sale off
            productData.salePrice = undefined;
            productData.isOnSale = false;
            productData.salePercentage = undefined;
        }

        if (imageURL) productData.imageURL = imageURL.trim();
        if (images?.length) productData.images = images;
        if (category) productData.category = category;

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: productData },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A product with this ASIN already exists' });
        }
        res.status(500).json({ message: 'Failed to update product', error: error.message });
    }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product', error: error.message });
    }
};

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    syncProduct,
    bulkSyncProducts,
    liveSearchAmazon,
    getProductById
};
