const express = require('express');
const router = express.Router();
const {
    getCategories,
    getAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/category.controller');
const { verifyAccessToken, requireAdmin } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');
const { upload } = require('../config/cloudinary');
const { cache } = require('../middleware/cache.middleware');

// PUBLIC
router.get('/', cache('categories:all', 600), getCategories);

// ADMIN
router.get('/admin', verifyAccessToken, requireAdmin, getAdminCategories);

router.post(
    '/',
    verifyAccessToken,
    requireAdmin,
    upload.single('image'),
    validate(schemas.category),
    createCategory
);

router.put(
    '/:id',
    verifyAccessToken,
    requireAdmin,
    upload.single('image'),
    validate(schemas.category),
    updateCategory
);

router.delete('/:id', verifyAccessToken, requireAdmin, deleteCategory);

module.exports = router;
