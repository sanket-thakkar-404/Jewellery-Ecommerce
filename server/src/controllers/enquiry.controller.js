const Enquiry = require('../models/Enquiry.model');
const Product = require('../models/Product.model');
const { sendMail } = require('../config/mailer');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

/**
 * HTML email template for new enquiry notification
 */
const buildEnquiryEmailHtml = (enquiry, productName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f9f9f7; margin: 0; padding: 0; }
    .card { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px;
            border: 1px solid #e0e0d8; overflow: hidden; }
    .header { background: #52573a; color: #fff; padding: 28px 32px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
    .body { padding: 28px 32px; color: #333; font-size: 15px; line-height: 1.6; }
    .row { margin: 10px 0; }
    .label { color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { font-weight: 600; color: #222; }
    .message-box { background: #f3f4ee; border-radius: 6px; padding: 16px; margin: 16px 0;
                   color: #444; font-style: italic; }
    .footer { background: #f3f4ee; padding: 16px 32px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>New Customer Enquiry — Babulal Jewellers</h1>
    </div>
    <div class="body">
      <div class="row">
        <div class="label">Customer Name</div>
        <div class="value">${enquiry.name}</div>
      </div>
      <div class="row">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${enquiry.email}">${enquiry.email}</a></div>
      </div>
      ${enquiry.phone ? `<div class="row"><div class="label">Phone</div><div class="value">${enquiry.phone}</div></div>` : ''}
      ${productName ? `<div class="row"><div class="label">Product Enquired</div><div class="value">${productName}</div></div>` : ''}
      <div class="row"><div class="label">Message</div></div>
      <div class="message-box">${enquiry.message.replace(/\n/g, '<br/>')}</div>
      <p style="margin-top: 24px; color: #666;">Received on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
    </div>
    <div class="footer">Babulal Jewellers — Admin Dashboard &bull; Do not reply to this message</div>
  </div>
</body>
</html>
`;

/**
 * POST /api/enquiries
 * Public: submit an enquiry
 */
const createEnquiry = catchAsync(async (req, res) => {
    const { name, email, phone,productName,product, message } = req.body;

    const enquiry = await Enquiry.create({
        name,
        email,
        phone,
        product,
        productName,
        message,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
    });

    // // Send notification email (fire-and-forget)
    // sendMail({
    //     to: process.env.ADMIN_EMAIL,
    //     subject: `New Enquiry from ${name}${productName ? ` — ${productName}` : ''}`,
    //     html: buildEnquiryEmailHtml(enquiry, productName),
    // }).catch((err) => logger.error(`Enquiry email failed: ${err.message}`));

    return ApiResponse.created(res, 'Your enquiry has been submitted. We will contact you shortly.', {
        id: enquiry._id,
    });
});

/**
 * GET /api/admin/enquiries
 * Admin: paginated enquiry list with optional status filter
 */
const getEnquiries = catchAsync(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [enquiries, total] = await Promise.all([
        Enquiry.find(filter)
            .populate('product', 'name slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v -userAgent'),
        Enquiry.countDocuments(filter),
    ]);

    return ApiResponse.success(res, 'Enquiries fetched', enquiries, {
        page, limit, total, totalPages: Math.ceil(total / limit),
    });
});

/**
 * PATCH /api/admin/enquiries/:id/status
 */
const updateEnquiryStatus = catchAsync(async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['new', 'read', 'replied', 'closed'];
    if (!validStatuses.includes(status)) {
        throw ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
    );
    if (!enquiry) throw ApiError.notFound('Enquiry not found');

    return ApiResponse.success(res, 'Enquiry status updated', { status: enquiry.status });
});

/**
 * DELETE /api/admin/enquiries/:id
 */
const deleteEnquiry = catchAsync(async (req, res) => {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) throw ApiError.notFound('Enquiry not found');
    await enquiry.deleteOne();
    return ApiResponse.success(res, 'Enquiry deleted');
});

module.exports = { createEnquiry, getEnquiries, updateEnquiryStatus, deleteEnquiry };
