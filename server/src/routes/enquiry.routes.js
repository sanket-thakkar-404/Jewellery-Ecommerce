const express = require('express');
const router = express.Router();
const {
    createEnquiry,
    getEnquiries,
    updateEnquiryStatus,
    deleteEnquiry,
} = require('../controllers/enquiry.controller');
const { verifyAccessToken, requireAdmin } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');

// PUBLIC
router.post('/', validate(schemas.enquiry), createEnquiry);

// ADMIN
router.get('/', verifyAccessToken, requireAdmin, getEnquiries);
router.patch('/:id/status', verifyAccessToken, requireAdmin, updateEnquiryStatus);
router.delete('/:id', verifyAccessToken, requireAdmin, deleteEnquiry);

module.exports = router;
