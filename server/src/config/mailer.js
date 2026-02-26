const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

const createTransporter = () => {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        pool: true,
        maxConnections: 5,
        rateDelta: 1000,
        rateLimit: 5,
    });

    transporter.verify((err) => {
        if (err) {
            logger.warn(`SMTP connection failed: ${err.message}. Email sending disabled.`);
        } else {
            logger.info('SMTP connection established');
        }
    });

    return transporter;
};

const getTransporter = () => transporter;

/**
 * Send an email — fails silently so it never crashes the app
 */
const sendMail = async ({ to, subject, html }) => {
    if (!transporter) return;
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject,
            html,
        });
        logger.info(`Email sent → ${to}`);
    } catch (err) {
        logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
};

module.exports = { createTransporter, getTransporter, sendMail };
