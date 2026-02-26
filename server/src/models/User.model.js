const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { string } = require('joi');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false,
        },
        role: {
            type: String,
            enum: ['admin', 'superadmin'],
            default: 'admin',
        },
        refreshTokens: {
            type: [String],
            default: [],
            select: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        number: {
            type: Number,
            default: null,
            minlength: 10,
            maxlength: 10,
            match: /^[0-9]{10}$/,
        },
        address: {
            type: String,
            default: ""
        },
        bio: {
            type: String,
            default: ""
        },
        profilePic: {
            type: String,
            default: "https://www.babulaljewellers.com/images/favicon.png",
        },
        lastLogin: Date,
    },
    { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare plain password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshTokens;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
