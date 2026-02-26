const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/User.model');
const catchAsync = require('../utils/catchAsync');

/**
 * Verifies the JWT access token from the Authorization header.
 * Attaches the decoded user payload to req.user.
 */
const verifyAccessToken = catchAsync(async (req, res, next) => {
  let token;

  // Check header
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check cookie
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw ApiError.unauthorized("No authentication token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Access token has expired");
    }
    throw ApiError.unauthorized("Invalid access token");
  }

  const user = await User.findById(decoded.id).select("+isActive");

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("User not found or account deactivated");
  }

  req.user = user;
  next();
});
/**
 * Ensures the authenticated user has admin or superadmin role.
 * Must be used after verifyAccessToken.
 */
const requireAdmin = (req, res, next) => {
    if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
        throw ApiError.forbidden('Administrator access required');
    }
    next();
};

/**
 * Generate access + refresh token pair
 */
const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRY || '30d',
    });

    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    });

    return { accessToken, refreshToken };
};

/**
 * Set the refresh and access token as an httpOnly cookie
 */
const setRefreshCookie = (res, refreshToken,accessToken) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 1 month in ms
    });
};

const clearRefreshCookie = (res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
};

module.exports = { verifyAccessToken, requireAdmin, generateTokens, setRefreshCookie, clearRefreshCookie };
