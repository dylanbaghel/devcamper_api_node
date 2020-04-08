const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncHandler');


/**
 * @desc        Get All Reviews
 * @route       GET /api/v1/reviews
 * @route       GET /api/v1/bootcamps/:bootcampId/reviews
 * @access      Public
 */
exports.getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId }).populate({
            path: 'bootcamp user',
            select: 'name description'
        });
        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } else {
        return res.status(200).json(res.advancedResults);
    }
});

/**
 * @desc        Get Single Review
 * @route       GET /api/v1/reviews/:id
 * @access      Public
 */
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!review) {
        return next(new ErrorResponse('No Review Found With This Id', 404));
    }

    return res.status(200).json({
        success: true,
        data: review
    });
});

/**
 * @desc        Add a Review
 * @route       POST /api/v1/bootcamps/:bootcampId/reviews
 * @access      Private (user)
 */
exports.addReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user._id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse('No Bootcamp with this id exists'));
    }

    const review = await Review.create(req.body);

    return res.status(201).json({
        success: true,
        data: review
    });
});

/**
 * @desc        Update Review
 * @route       POST /api/v1/reviews/:id
 * @access      Private (user)
 */
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse('No Review With This id exist', 404));
    }

    // Make Sure Review Belongs To User or user is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not Authorized To Complete This Task', 401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    return res.status(200).json({
        success: true,
        data: review
    });
});

/**
 * @desc        Delete Review
 * @route       Delete /api/v1/reviews/:id
 * @access      Private (user)
 */
exports.deleteReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse('No Review With This id exist', 404));
    }

    // Make Sure Review Belongs To User or user is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not Authorized To Complete This Task', 401));
    }

    await review.remove();
    return res.status(200).json({
        success: true,
        data: {}
    });
});