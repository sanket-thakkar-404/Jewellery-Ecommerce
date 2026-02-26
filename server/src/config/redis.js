const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = () => {
    redisClient = new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
            if (times > 5) {
                logger.warn('Redis max retries reached. Running without cache.');
                return null; // stop retrying
            }
            return Math.min(times * 200, 2000);
        },
    });

    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => logger.warn(`Redis error: ${err.message}`));

    redisClient.connect().catch((err) => {
        logger.warn(`Redis initial connect failed: ${err.message}. Caching disabled.`);
    });

    return redisClient;
};

const getRedis = () => redisClient;

module.exports = { connectRedis, getRedis };
