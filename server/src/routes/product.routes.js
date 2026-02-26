const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductBySlug,
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleFeatured,
} = require('../controllers/product.controller');
const { verifyAccessToken, requireAdmin } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');
const { cache } = require('../middleware/cache.middleware')

const { upload } = require('../config/cloudinary');

// ───── PUBLIC ─────
router.get(
    '/',
    cache((req) => `products:list:${JSON.stringify(req.query)}`, 300),
    getProducts
);
router.get('/:slug', getProductBySlug);

// ───── ADMIN ─────
router.use(verifyAccessToken, requireAdmin);

router.get('/admin/list', getAdminProducts);

router.post(
    '/',
    upload.array('images', 8),
    (req, res, next) => {
        // parse body fields that arrive as form-data strings
        if (req.body.tags && typeof req.body.tags === 'string') {
            try { req.body.tags = JSON.parse(req.body.tags); } catch { req.body.tags = [req.body.tags]; }
        }
        if (req.body.priceOnRequest) req.body.priceOnRequest = req.body.priceOnRequest === 'true';
        if (req.body.featured) req.body.featured = req.body.featured === 'true';
        if (req.body.isActive) req.body.isActive = req.body.isActive === 'true';
        if (req.body.price) req.body.price = parseFloat(req.body.price);
        next();
    },
    validate(schemas.product),
    createProduct
);

router.put(
    '/:id',
    upload.array('images', 8),
    (req, res, next) => {
        if (req.body.tags && typeof req.body.tags === 'string') {
            try { req.body.tags = JSON.parse(req.body.tags); } catch { req.body.tags = [req.body.tags]; }
        }
        if (req.body.priceOnRequest !== undefined) req.body.priceOnRequest = req.body.priceOnRequest === 'true';
        if (req.body.featured !== undefined) req.body.featured = req.body.featured === 'true';
        if (req.body.isActive !== undefined) req.body.isActive = req.body.isActive === 'true';
        if (req.body.price) req.body.price = parseFloat(req.body.price);
        next();
    },
    validate(schemas.productUpdate),
    updateProduct
);

router.delete('/:id', deleteProduct);
router.patch('/:id/featured', toggleFeatured);

module.exports = router;
