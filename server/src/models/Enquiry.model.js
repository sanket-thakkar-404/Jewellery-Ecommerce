const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
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
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        phone: {
            type: String,
            trim: true,
            match: [/^[+]?[\d\s\-().]{7,20}$/, 'Please provide a valid phone number'],
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            default: null,
        },
        productName: {
            type: String, // snapshot at enquiry time in case product is deleted
            trim: true,
            default: null,
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            maxlength: [2000, 'Message cannot exceed 2000 characters'],
        },
        status: {
            type: String,
            enum: ['new', 'read', 'replied'],
            default: 'new',
            index: true,
        },
        ipAddress: String,
        userAgent: String,
    },
    { timestamps: true }
);

enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ product: 1 });

module.exports = mongoose.model('Enquiry', enquirySchema);
