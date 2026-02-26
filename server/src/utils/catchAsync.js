/**
 * Wraps an async route handler and forwards errors to next()
 * Eliminates the need for try/catch in every controller
 */
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
