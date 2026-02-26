const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (retries = MAX_RETRIES) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    if (retries === 0) {
      logger.error('MongoDB connection failed after max retries. Exiting...');
      process.exit(1);
    }
    logger.warn(`MongoDB connection failed. Retrying in ${RETRY_DELAY_MS / 1000}s... (${retries} attempts left)`);
    await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
    return connectDB(retries - 1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting reconnect...');
});

module.exports = connectDB;
