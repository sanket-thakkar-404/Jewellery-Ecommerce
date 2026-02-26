const Category = require('../models/Category.model');
const Product = require('../models/Product.model');
const { cloudinary } = require('../config/cloudinary');
const { invalidateCache } = require('../middleware/cache.middleware');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/categories
 * Public: returns active categories sorted by sortOrder
 */
const getCategories = catchAsync(async (req, res) => {
    const categories = await Category.find({ isActive: true })
        .sort({ sortOrder: 1, name: 1 })
        .select('-__v');

    return ApiResponse.success(res, 'Categories fetched', categories);
});

/**
 * GET /api/admin/categories
 */
const getAdminCategories = catchAsync(async (req, res) => {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 }).select('-__v');
    return ApiResponse.success(res, 'Categories fetched', categories);
});

/**
 * POST /api/admin/categories
 */
const createCategory = catchAsync(async (req, res) => {
    const imageData = req.file
        ? { url: req.file.path, publicId: req.file.filename }
        : undefined;

    const category = await Category.create({ ...req.body, ...(imageData && { image: imageData }) });
    await invalidateCache('categories:*');

    return ApiResponse.created(res, 'Category created', category);
});

/**
 * PUT /api/admin/categories/:id
 */
const updateCategory = catchAsync(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) throw ApiError.notFound('Category not found');

    if (req.file) {
        // Delete old image from Cloudinary
        if (category.image?.publicId) {
            await cloudinary.uploader.destroy(category.image.publicId);
        }
        category.image = { url: req.file.path, publicId: req.file.filename };
    }

    Object.assign(category, req.body);
    await category.save();
    await invalidateCache('categories:*');

    return ApiResponse.success(res, 'Category updated', category);
});

/**
 * DELETE /api/admin/categories/:id
 */
const deleteCategory = catchAsync(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) throw ApiError.notFound('Category not found');

    // Prevent deletion if products exist in this category
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
        throw ApiError.conflict(
            `Cannot delete category — ${productCount} product(s) still reference it.`
        );
    }

    if (category.image?.publicId) {
        await cloudinary.uploader.destroy(category.image.publicId);
    }

    await category.deleteOne();
    await invalidateCache('categories:*');

    return ApiResponse.success(res, 'Category deleted');
});

module.exports = {
    getCategories,
    getAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
