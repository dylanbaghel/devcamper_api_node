const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * @desc        Get All Courses
 * @route       GET /api/v1/courses
 * @route       GET /api/v1/bootcamps/:bootcampId/courses
 * @access      Public
 */
exports.getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId });
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        return res.status(200).json(res.advancedResults);
    }
});

/**
 * @desc        Get Single Courses
 * @route       GET /api/v1/courses/:id
 * @access      Public
 */
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(new ErrorResponse('No Course Found With The Given Id', 404));
    }

    return res.status(200).json({
        success: true,
        data: course
    });
});

/**
 * @desc        Add a Courses
 * @route       POST /api/v1/bootcamps/:bootcampId/courses
 * @access      Private
 */
exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user._id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp With Given Id Exists`, 404));
    }

    // Make Sure User is Bootcamp Owner
    if (bootcamp.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user._id} is not authorized to add a course to bootcamp ${bootcamp._id}`));
    }

    const course = await Course.create(req.body);

    return res.status(200).json({
        success: true,
        data: course
    });
});

/**
 * @desc        Update a Courses
 * @route       PUT /api/v1/courses/:id
 * @access      Private
 */
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`No Course With Given Id Exists`, 404));
    }

    // Make Sure User is Bootcamp Owner
    if (course.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user._id} is not authorized to update course ${course._id}`));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    return res.status(200).json({
        success: true,
        data: course
    });
});

/**
 * @desc        Delete a Courses
 * @route       DELETE /api/v1/courses/:id
 * @access      Private
 */
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`No Course With Given Id Exists`, 404));
    }

    // Make Sure User is Bootcamp Owner
    if (course.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user._id} is not authorized to delete course ${course._id}`));
    }

    await course.remove();

    return res.status(200).json({
        success: true,
        data: course
    });
});