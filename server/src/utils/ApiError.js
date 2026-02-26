class ApiError extends Error {
    constructor(statusCode, message, errors = [], stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true; // used to distinguish known vs unexpected errors

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    static badRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }

    static unauthorized(message = 'Authentication required') {
        return new ApiError(401, message);
    }

    static forbidden(message = 'Access denied') {
        return new ApiError(403, message);
    }

    static notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    }

    static conflict(message = 'Conflict') {
        return new ApiError(409, message);
    }

    static tooManyRequests(message = 'Too many requests, please try again later') {
        return new ApiError(429, message);
    }

    static internal(message = 'Internal server error') {
        return new ApiError(500, message);
    }
}

module.exports = ApiError;
