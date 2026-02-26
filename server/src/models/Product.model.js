const mongoose = require('mongoose');
const slugify = require('slugify');

const imageSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        alt: { type: String, default: '' },
    },
    { _id: false }
);

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [200, 'Name cannot exceed 200 characters'],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            maxlength: [5000, 'Description cannot exceed 5000 characters'],
        },
        shortDescription: {
            type: String,
            maxlength: [300, 'Short description cannot exceed 300 characters'],
        },
        category: {
            type: String,
            required: true
        },
        images: {
            type: [imageSchema],
            validate: {
                validator: function (value) {
                    return value.length > 0;
                },
                message: 'At least one image is required'
            }
        },

        price: {
            type: Number,
            min: [0, 'Price cannot be negative'],
        },
        priceOnRequest: {
            type: Boolean,
            default: false,
        },
        material: {
            type: String,
            trim: true,
        },
        weight: {
            type: String, // e.g., "10g", "1 tola"
            trim: true,
        },
        tags: [{ type: String, trim: true, lowercase: true }],
        featured: {
            type: Boolean,
            default: false,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        stock: {
            type: Number,
            default: 1,
            min: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Auto-generate slug from name
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    // price XOR priceOnRequest must be set
    if (!this.priceOnRequest && (this.price === undefined || this.price === null)) {
        return next(new Error('Either price or priceOnRequest must be provided'));
    }
    next();
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ featured: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
