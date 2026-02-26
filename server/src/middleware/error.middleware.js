const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const path = require('path')

/**
 * Centralized error-handling middleware.
 * Must be registered LAST in express app.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let error = err;

    // Mongoose CastError → 400
    if (err.name === 'CastError') {
        error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
    }

    // Mongoose duplicate key → 409
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        error = ApiError.conflict(`Duplicate value for ${field}`);
    }

    // Mongoose validation error → 400
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        error = ApiError.badRequest('Validation failed', messages);
    }

    // JWT errors (not caught by middleware for some reason) → 401
    if (err.name === 'JsonWebTokenError') {
        error = ApiError.unauthorized('Invalid token');
    }
    if (err.name === 'TokenExpiredError') {
        error = ApiError.unauthorized('Token expired');
    }

    const statusCode = error.statusCode || 500;
    const message = error.isOperational ? error.message : 'Internal server error';

    if (statusCode >= 500) {
        logger.error(`[${statusCode}] ${err.message}`, {
            stack: err.stack,
            path: req.path,
            method: req.method,
        });
    }

    res.status(statusCode).json({
        success: false,
        message,
        errors: error.errors || [],
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

/**
 * 404 handler — mount before errorHandler
 */

console.log(path.join(__dirname,"../../public/index.html"))
const notFound = (req, res, next) => {
res.sendFile(path.join(__dirname,"../../public/index.html"))
};

module.exports = { errorHandler, notFound };
