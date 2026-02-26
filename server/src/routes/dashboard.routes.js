const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboard.controller');
const { verifyAccessToken, requireAdmin } = require('../middleware/auth.middleware');
const { cache } = require('../middleware/cache.middleware');

router.get('/', verifyAccessToken, requireAdmin, cache('dashboard:stats', 120), getDashboard);

module.exports = router;
