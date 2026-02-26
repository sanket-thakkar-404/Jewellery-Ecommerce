const morgan = require('morgan');

// Minimal logger using console (swap for winston in full production)
const logger = {
    info: (...args) => console.log('[INFO]', new Date().toISOString(), ...args),
    warn: (...args) => console.warn('[WARN]', new Date().toISOString(), ...args),
    error: (...args) => console.error('[ERROR]', new Date().toISOString(), ...args),
    debug: (...args) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug('[DEBUG]', new Date().toISOString(), ...args);
        }
    },
};

// HTTP request logger middleware
const httpLogger = morgan(
    process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
    {
        skip: (req) => req.path === '/health',
    }
);

module.exports = logger;
module.exports.httpLogger = httpLogger;
