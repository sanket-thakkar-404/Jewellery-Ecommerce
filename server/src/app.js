require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { httpLogger } = require('./utils/logger');
const path = require("path")

// Import routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const enquiryRoutes = require('./routes/enquiry.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// Import error handlers
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("./public"))

// ─── Security middleware ─────────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
    origin: (origin, callback) => {
        const whitelist = (process.env.CLIENT_URL || '').split(',').map((u) => u.trim());
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: origin ${origin} not allowed`));
        }
    },

    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate limiting ───────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many login attempts, please wait 15 minutes.' },
});

const enquiryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { success: false, message: 'Too many enquiries submitted. Please try again later.' },
});

app.use(globalLimiter);

// ─── Body parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(httpLogger);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// ─── API routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/enquiries',enquiryLimiter,enquiryRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);

app.use("/*", (req, res) => {
    res.sendFile(path.join(__dirname , "../public/index.html"))
})

// ─── Error handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);


module.exports = app;
