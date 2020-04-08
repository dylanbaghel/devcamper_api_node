const path = require('path');

const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncHandler');
const geocoder = require('../utils/geocoder');
/**
 * @desc        Get All Bootcamps
 * @route       GET /api/v1/bootcamps
 * @access      Public
 */
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    
    return res.status(200).json(res.advancedResults);
});

/**
 * @desc        Get Bootcamp
 * @route       GET /api/v1/bootcamps/:id
 * @access      Public
 */
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse('Bootcamp with this id not found', 404));
    }

    return res.status(200).json({
        success: true,
        data: bootcamp
    });
});


/**
 * @desc        Create New Bootcamp
 * @route       POST /api/v1/bootcamps
 * @access      Private
 */
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    req.body.user = req.user._id;

    // Check If The Current Publisher Already Created a Bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user._id });

    // If the user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User With Id${req.user.id} has already published a bootcamp`, 400));
    }

    const newBootcamp = await Bootcamp.create(req.body);

    return res.status(201).json({
        success: true,
        data: newBootcamp
    });
});

/**
 * @desc        Update Bootcamp
 * @route       PUT /api/v1/bootcamps/:id
 * @access      Private
 */
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse('Bootcamp with this id not found', 404));
    }

    // Make Sure User Is Bootcamp Owner
    if (bootcamp.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user._id} is not authorized to update this bootcamp`));
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    return res.status(200).json({
        success: true,
        data: bootcamp
    });
});

/**
 * @desc        Delete Bootcamp
 * @route       DELETE /api/v1/bootcamps/:id
 * @access      Private
 */
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse('Bootcamp with this id not found', 404));
    }

      // Make Sure User Is Bootcamp Owner
      if (bootcamp.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user._id} is not authorized to delete this bootcamp`));
    }

    await bootcamp.remove();

    return res.status(200).json({
        success: true,
        data: bootcamp
    });
});

/**
 * @desc        Get Bootcamps With In a radius
 * @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
 * @access      Private
 */
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const locationResponse = await geocoder.geocode(zipcode);
    const lat = locationResponse[0].latitude;
    const lng = locationResponse[0].longitude;

    // Calculate radius using radians
    // Divide distance by radius of Earth
    // Earth Radius = 3,963mi / 6,378 kms
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    });

    return res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});

/**
 * @desc        Upload Photo For Bootcamp
 * @route       GET /api/v1/bootcamps/:id/photo
 * @access      Private
 */
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse('Bootcamp With This Id does not exist', 404));
    }

    // Make Sure User Is Bootcamp Owner
    if (bootcamp.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user._id} is not authorized to update this bootcamp`));
    }

    if (!req.files) {
        return next(new ErrorResponse('Please Upload a File', 400));
    }

    const file = req.files.file;

    // Make sure the image is photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please Upload a Valid Image File', 400));
    }

    // Check File Size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please Upload an image less than 1 MB`, 400));
    }

    // Create Custom Filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse('Problem With File Upload', 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    });

    return res.status(200).json({
        success: true,
        data: file.name
    });
});
