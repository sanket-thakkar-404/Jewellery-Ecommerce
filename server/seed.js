require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User.model');
const logger = require('./src/utils/logger');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.info('Connected to MongoDB for seeding...');

        const existing = await User.findOne({ email: process.env.SEED_ADMIN_EMAIL });
        if (existing) {
            logger.info(`Admin user already exists: ${existing.email}`);
            process.exit(0);
        }

        await User.create({
            name: 'Babulal Admin',
            email: process.env.SEED_ADMIN_EMAIL || 'admin@babulaljewellers.com',
            password: process.env.SEED_ADMIN_PASSWORD || 'StrongPass@123',
            role: 'superadmin',
        });

        logger.info(`✅ Admin user created: ${process.env.SEED_ADMIN_EMAIL}`);
        process.exit(0);
    } catch (err) {
        logger.error(`Seed failed: ${err.message}`);
        process.exit(1);
    }
};

seedAdmin();
