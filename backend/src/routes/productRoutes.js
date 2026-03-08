const express = require('express');
const router = express.Router();
const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    syncProduct,
    bulkSyncProducts,
    liveSearchAmazon,
    getProductById
} = require('../controllers/productController');

const adminAuth = require('../middleware/adminAuth');

router.route('/').get(getProducts).post(adminAuth, createProduct);
router.route('/sync').post(adminAuth, syncProduct);
router.route('/bulk-sync').post(adminAuth, bulkSyncProducts);
router.route('/amazon-search').get(adminAuth, liveSearchAmazon);
router.route('/:id')
    .get(getProductById)
    .put(adminAuth, updateProduct)
    .delete(adminAuth, deleteProduct);

module.exports = router;
