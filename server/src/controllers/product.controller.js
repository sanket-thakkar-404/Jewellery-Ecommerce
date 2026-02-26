const Product = require('../models/Product.model');
const { cloudinary } = require('../config/cloudinary');
const { invalidateCache } = require('../middleware/cache.middleware');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

const CACHE_PATTERN = 'products:*';

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/products
 * Query params: page, limit, category, search, featured, sort
 */
const getProducts = catchAsync(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === 'true') filter.featured = true;
    if (req.query.search) {
        filter.$text = { $search: req.query.search };
    }

    const sortMap = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        popular: { viewCount: -1 },
        'price-asc': { price: 1 },
        'price-desc': { price: -1 },
    };
    const sort = sortMap[req.query.sort] || { createdAt: -1 };

    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate('category', 'name slug')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('-__v'),
        Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return ApiResponse.success(
        res,
        'Products fetched',
        products,
        { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
    );
});

/**
 * GET /api/products/:slug
 * Increments view count atomically
 */
const getProductBySlug = catchAsync(async (req, res) => {
    const product = await Product.findOneAndUpdate(
        { slug: req.params.slug, isActive: true },
        { $inc: { viewCount: 1 } },
        { new: true }
    )
        .populate('category', 'name slug')
        .select('-__v');

    if (!product) throw ApiError.notFound('Product not found');

    return ApiResponse.success(res, 'Product fetched', product);
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/products
 */
const getAdminProducts = catchAsync(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured !== undefined) filter.featured = req.query.featured === 'true';
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) filter.$text = { $search: req.query.search };

    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v'),
        Product.countDocuments(filter),
    ]);

    return ApiResponse.success(res, 'Admin products fetched', products, {
        page, limit, total, totalPages: Math.ceil(total / limit),
    });
});

/**
 * POST /api/admin/products
 */
const createProduct = catchAsync(async (req, res) => {

    const images = (req.files || []).map((file) => ({
        url: file.path,
        publicId: file.filename,
        alt: req.body.name || '',
    }));

    console.log(images.length)

    if (images.length === 0) {
        throw ApiError.badRequest('At least one product image is required');
    }

    const product = await Product.create({ ...req.body, images });

    await invalidateCache(CACHE_PATTERN);

    const populated = await product.populate('category', 'name slug');
    return ApiResponse.created(res, 'Product created', populated);
});

/**
 * PUT /api/products/:id
 */
const updateProduct = catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw ApiError.notFound('Product not found');

    // Handle newly uploaded images
    const newImages = (req.files || []).map((file) => ({
        url: file.path,
        publicId: file.filename,
        alt: req.body.name || product.name,
    }));

    // Parse existing images array (client sends existing publicIds to keep)
    let existingImages = product.images;
    if (req.body.keepImages) {
        const keepIds = JSON.parse(req.body.keepImages);
        // Delete removed images from Cloudinary
        const removedImages = product.images.filter((img) => !keepIds.includes(img.publicId));
        await Promise.all(removedImages.map((img) => cloudinary.uploader.destroy(img.publicId)));
        existingImages = product.images.filter((img) => keepIds.includes(img.publicId));
    }

    const images = [...existingImages, ...newImages];
    if (images.length === 0) throw ApiError.badRequest('Product must have at least one image');

    Object.assign(product, req.body, { images });
    product.markModified('images');
    await product.save();

    await invalidateCache(CACHE_PATTERN);

    const populated = await product.populate('category', 'name slug');
    return ApiResponse.success(res, 'Product updated', populated);
});

/**
 * DELETE /api/admin/products/:id
 */
const deleteProduct = catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw ApiError.notFound('Product not found');

    // Remove all images from Cloudinary
    await Promise.all(product.images.map((img) => cloudinary.uploader.destroy(img.publicId)));

    await product.deleteOne();
    await invalidateCache(CACHE_PATTERN);

    return ApiResponse.success(res, 'Product deleted');
});

/**
 * PATCH /api/admin/products/:id/featured
 */
const toggleFeatured = catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw ApiError.notFound('Product not found');

    product.featured = !product.featured;
    await product.save();
    await invalidateCache(CACHE_PATTERN);

    return ApiResponse.success(res, `Product ${product.featured ? 'featured' : 'unfeatured'}`, {
        featured: product.featured,
    });
});

module.exports = {
    getProducts,
    getProductBySlug,
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleFeatured,
};
