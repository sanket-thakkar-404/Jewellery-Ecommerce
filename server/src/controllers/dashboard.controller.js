const Product = require('../models/Product.model');
const Enquiry = require('../models/Enquiry.model');
const Category = require('../models/Category.model');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/admin/dashboard
 * Returns: KPI summary, top viewed product, monthly enquiries chart data
 */
const getDashboard = catchAsync(async (req, res) => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
        totalProducts,
        totalEnquiries,
        totalCategories,
        newEnquiries,
        featuredProducts,
        topProduct,
        monthlyEnquiries,
        recentEnquiries,
    ] = await Promise.all([
        // KPIs
        Product.countDocuments({ isActive: true }),
        Enquiry.countDocuments(),
        Category.countDocuments({ isActive: true }),
        Enquiry.countDocuments({ status: 'new' }),
        Product.countDocuments({ featured: true }),

        // Most viewed product
        Product.findOne({ isActive: true })
            .sort({ viewCount: -1 })
            .select('name slug images viewCount price priceOnRequest')
            .populate('category', 'name'),

        // Monthly enquiries chart — current year, grouped by month
        Enquiry.aggregate([
            { $match: { createdAt: { $gte: yearStart } } },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                    count: { $sum: 1 },
                    newCount: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),

        // 5 most recent enquiries
        Enquiry.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('product', 'name slug')
            .select('name email productName status createdAt'),
    ]);

    // Build full 12-month chart data with 0-filled gaps
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = monthNames.map((month, idx) => {
        const found = monthlyEnquiries.find((m) => m._id.month === idx + 1);
        return {
            month,
            total: found?.count || 0,
            new: found?.newCount || 0,
        };
    });

    return ApiResponse.success(res, 'Dashboard data', {
        kpis: {
            totalProducts,
            totalEnquiries,
            totalCategories,
            newEnquiries,
            featuredProducts,
        },
        topProduct,
        chartData,
        recentEnquiries,
    });
});

module.exports = { getDashboard };
