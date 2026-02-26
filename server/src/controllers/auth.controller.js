const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const { generateTokens, setRefreshCookie, clearRefreshCookie } = require('../middleware/auth.middleware');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const jwt = require('jsonwebtoken');



/**
 * POST /api/auth/signup
 */
const signup = catchAsync(async (req, res) => {
    const { name, email, password, role } = req.body;

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw ApiError.conflict('Email already registered');
    }

    // 3️⃣ Create user (password auto-hashed by mongoose pre-save)
    const user = await User.create({
        name,
        email,
        password,
        role,
    });

    return ApiResponse.created(res, 'Signup successful', {
        admin: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
});
/**
 * POST /api/auth/login
 */
const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true }).select('+password +refreshTokens');
    if (!user || !(await user.comparePassword(password))) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());


    // Store refresh token hash (store max 5 sessions)
    user.refreshTokens = [...(user.refreshTokens.slice(-4)), refreshToken];
    user.lastLogin = new Date();
    await user.save();

    setRefreshCookie(res, refreshToken, accessToken);

    return ApiResponse.success(res, 'Login successful', {
        accessToken,
        admin: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            bio: user.bio,
            profilePic: user.profilePic,
            address: user.address,
            number: user.number
        },
    });
});

/**
 * POST /api/auth/refresh
 * Uses the httpOnly refresh token cookie to rotate tokens
 */
const refresh = catchAsync(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) throw ApiError.unauthorized('Refresh token not found');

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
        throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id).select('+refreshTokens +isActive');
    if (!user || !user.isActive) throw ApiError.unauthorized('User not found');

    // Token rotation: ensure provided refresh token is in the stored list
    if (!user.refreshTokens.includes(token)) {
        // Reuse detected — invalidate all sessions
        user.refreshTokens = [];
        await user.save();
        throw ApiError.unauthorized('Refresh token reuse detected. Please log in again.');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString());

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    setRefreshCookie(res, newRefreshToken);

    return ApiResponse.success(res, 'Token refreshed', { accessToken });
});

/**
 * POST /api/auth/logout
 */
const logout = catchAsync(async (req, res) => {
    const token = req.cookies?.refreshToken;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            const user = await User.findById(decoded.id).select('+refreshTokens');
            if (user) {
                user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
                await user.save();
            }
        } catch {
            // Token invalid — still clear cookie
        }
    }

    clearRefreshCookie(res);
    return ApiResponse.success(res, 'Logged out successfully');
});

/**
 * GET /api/auth/me — return current user profile
 */
const getMe = catchAsync(async (req, res) => {
    return ApiResponse.success(res, 'User profile', req.user);
});

const getAllUsers = async (req, res) => {

    // Optional: restrict to superadmin
    if (req.user.role !== "superadmin") {
        throw ApiError.forbidden("You are not allowed to access this resource");
    }

    const users = await User.find()
        .select("-password -refreshTokens") // remove sensitive fields
        .sort({ createdAt: -1 });

    return ApiResponse.success(res, "Users fetched successfully", users);
};

const checkAuth = catchAsync(async (req, res) => {
    const user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profilePic: req.user.profilePic,
        bio: req.user.bio,
        profilePic: req.user.profilePic,
        address: req.user.address,
        number: req.user.number
    };

    return ApiResponse.success(res, 'You are Authorized profile', user);
});

const updateProfile = catchAsync(async (req, res) => {
    const { name, number, address, bio } = req.body;

    console.log(req.body)

    if (!req.user || !req.user._id) {
        throw ApiError.unauthorized("User not authenticated");
    }

    const updateData = {};


    if (name !== undefined) updateData.name = name;
    if (number !== undefined) updateData.number = number;
    if (bio !== undefined) updateData.bio = bio;
    if (address !== undefined) updateData.address = address;

    const admin = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        {
            new: true,
            runValidators: true,   // important
        }
    ).select("-password -refreshTokens");

    if (!admin) {
        throw ApiError.notFound("User not found");
    }

    return ApiResponse.success(res, "Profile updated successfully", admin);
});

module.exports = { login, refresh, logout, getMe, signup, getAllUsers, checkAuth, updateProfile };
