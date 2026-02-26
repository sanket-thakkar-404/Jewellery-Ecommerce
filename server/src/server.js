require('dotenv').config();
require('express-async-errors');
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const { createTransporter } = require('./config/mailer');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Connect to Redis (non-blocking — app works without it)
        connectRedis();

        // Initialize mailer (non-blocking — verified asynchronously)
        createTransporter();

        const server = http.createServer(app);

        server.listen(PORT, () => {
            logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            logger.info(`Health check: http://localhost:${PORT}/health`);
        });

        // Graceful shutdown
        const shutdown = async (signal) => {
            logger.info(`${signal} received — shutting down gracefully`);
            server.close(async () => {
                const mongoose = require('mongoose');
                await mongoose.connection.close();
                logger.info('MongoDB connection closed');
                process.exit(0);
            });

            // Force exit if cleanup takes too long
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        // Handle uncaught errors
        process.on('uncaughtException', (err) => {
            logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
            process.exit(1);
        });

        process.on('unhandledRejection', (err) => {
            logger.error(`Unhandled Rejection: ${err?.message}`, { stack: err?.stack });
            server.close(() => process.exit(1));
        });
    } catch (err) {
        logger.error(`Failed to start server: ${err.message}`);
        process.exit(1);
    }
};

startServer();
