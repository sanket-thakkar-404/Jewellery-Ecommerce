const Joi = require('joi');
const ApiError = require('../utils/ApiError');

/**
 * Middleware factory: validates req.body against a Joi schema.
 * On failure, passes a 400 ApiError with field-level messages.
 *
 * Usage:
 *   router.post('/products', validate(productSchema), controller)
 */
const validate = (schema, source = 'body') => (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
    });

    if (error) {
        const messages = error.details.map((d) => d.message.replace(/"/g, "'"));
        return next(ApiError.badRequest('Validation error', messages));
    }

    req[source] = value; // replace with validated + sanitized value
    next();
};

// ─────────────────────────────────────────────────────────────────────────────
// Reusable Joi schemas
// ─────────────────────────────────────────────────────────────────────────────

const schemas = {
    login: Joi.object({
        email: Joi.string()
            .email()
            .lowercase()
            .trim()
            .required()
            .messages({
                "string.email": "Please provide a valid email",
                "string.empty": "Email is required",
            }),
        password: Joi.string()
            .min(8)
            .max(50)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .required()
            .messages({
                "string.min": "Password must be at least 8 characters",
                "string.pattern.base":
                    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
            }),
    }),
    signup: Joi.object({
        name: Joi.string()
            .trim()
            .min(2)
            .max(100)
            .required()
            .messages({
                "string.empty": "Name is required",
                "string.min": "Name must be at least 2 characters",
                "string.max": "Name cannot exceed 100 characters",
            }),
        email: Joi.string()
            .email()
            .lowercase()
            .trim()
            .required()
            .messages({
                "string.email": "Please provide a valid email",
                "string.empty": "Email is required",
            }),
        password: Joi.string()
            .min(8)
            .max(50)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .required()
            .messages({
                "string.min": "Password must be at least 8 characters",
                "string.pattern.base":
                    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
            }),
        role: Joi.string()
            .valid("admin", "superadmin")
            .optional(),

    }),

    product: Joi.object({
        name: Joi.string().trim().max(200).required(),
        description: Joi.string().trim().max(5000).required(),
        shortDescription: Joi.string().trim().max(300).allow('', null),
        category: Joi.string()
            .valid('All', 'Necklaces', 'Rings', 'Earrings', 'Bangles', 'Bracelets', 'Pendants', 'Chains')
            .required(),
        price: Joi.number().min(0).when('priceOnRequest', {
            is: true,
            then: Joi.forbidden(),
            otherwise: Joi.required(),
        }),
        priceOnRequest: Joi.boolean().default(false),
        material: Joi.string().trim().max(100).allow('', null),
        weight: Joi.string().trim().max(50).allow('', null),
        tags: Joi.array().items(Joi.string().trim().lowercase()).default([]),
        featured: Joi.boolean().default(false),
        isActive: Joi.boolean().default(true),
        stock: Joi.number().integer().min(0).default(1),
    }),

    productUpdate: Joi.object({
        name: Joi.string().trim().max(200),
        description: Joi.string().trim().max(5000),
        shortDescription: Joi.string().trim().max(300).allow('', null),
        category: Joi.string()
            .valid('All', 'Necklaces', 'Rings', 'Earrings', 'Bangles', 'Bracelets', 'Pendants', 'Chains')
            .required(),
        price: Joi.number().min(0).allow(null),
        priceOnRequest: Joi.boolean(),
        material: Joi.string().trim().max(100).allow('', null),
        weight: Joi.string().trim().max(50).allow('', null),
        tags: Joi.array().items(Joi.string().trim().lowercase()),
        featured: Joi.boolean(),
        isActive: Joi.boolean(),
        stock: Joi.number().integer().min(0),
    }),

    category: Joi.object({
        name: Joi.string().trim().max(100).required(),
        description: Joi.string().trim().max(500).allow('', null),
        sortOrder: Joi.number().integer().default(0),
        isActive: Joi.boolean().default(true),
    }),

    enquiry: Joi.object({
        name: Joi.string().trim().max(100).required(),
        email: Joi.string().email().lowercase().required(),
        phone: Joi.string()
            .trim()
            .pattern(/^[+]?[\d\s\-().]{7,20}$/)
            .allow('', null),
        message: Joi.string().trim().max(2000).required(),
        product: Joi.string().required(),
        productName: Joi.string().optional(),
    }),
};

module.exports = { validate, schemas };
