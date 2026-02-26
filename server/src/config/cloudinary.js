const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const slugify = require('slugify');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const baseName = slugify(
      file.originalname.split('.')[0],
      { lower: true, strict: true }
    );

    return {
      folder: process.env.CLOUDINARY_FOLDER || 'babulal-jewellers',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
      ],
      public_id: `${Date.now()}-${baseName}`,
    };
  },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG and WebP images are allowed'), false);
        }
    },
});

module.exports = { cloudinary, upload };
