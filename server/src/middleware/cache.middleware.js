const { getRedis } = require('../config/redis');
const logger = require('../utils/logger');

const DEFAULT_TTL = 300; // 5 minutes

/**
 * Cache-aside middleware factory.
 * Usage: router.get('/products', cache('products:list', 300), controller)
 *
 * @param {string | function} keyFn - Cache key string or function (req) => string
 * @param {number} ttl - Time-to-live in seconds (default: 300)
 */
const cache = (keyFn, ttl = DEFAULT_TTL) => async (req, res, next) => {
    const redis = getRedis();

    // If Redis is unavailable or not connected, skip caching
    if (!redis || redis.status !== 'ready') {
        return next();
    }

    const key = typeof keyFn === 'function' ? keyFn(req) : keyFn;

    try {
        const cached = await redis.get(key);
        if (cached) {
            logger.debug(`Cache HIT: ${key}`);
            return res.json(JSON.parse(cached));
        }
        logger.debug(`Cache MISS: ${key}`);
    } catch (err) {
        logger.warn(`Redis GET failed for key ${key}: ${err.message}`);
        return next();
    }

    // Intercept res.json to store the response in cache
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        if (res.statusCode === 200) {
            redis.setex(key, ttl, JSON.stringify(body)).catch((err) => {
                logger.warn(`Redis SET failed for key ${key}: ${err.message}`);
            });
        }
        return originalJson(body);
    };

    next();
};

/**
 * Invalidate one or more cache keys (supports glob patterns via SCAN)
 */
const invalidateCache = async (...patterns) => {
    const redis = getRedis();
    if (!redis || redis.status !== 'ready') return;

    try {
        for (const pattern of patterns) {
            if (pattern.includes('*')) {
                // Use SCAN for wildcard patterns — safe for production
                const keys = await scanKeys(redis, pattern);
                if (keys.length > 0) {
                    await redis.del(...keys);
                    logger.debug(`Cache invalidated ${keys.length} keys matching: ${pattern}`);
                }
            } else {
                await redis.del(pattern);
                logger.debug(`Cache invalidated: ${pattern}`);
            }
        }
    } catch (err) {
        logger.warn(`Cache invalidation error: ${err.message}`);
    }
};

const scanKeys = async (redis, pattern) => {
    const results = [];
    let cursor = '0';
    do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        results.push(...keys);
        cursor = nextCursor;
    } while (cursor !== '0');
    return results;
};

module.exports = { cache, invalidateCache };
