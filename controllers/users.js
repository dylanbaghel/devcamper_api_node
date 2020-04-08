const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * @desc        Get All Users
 * @route       GET /api/v1/users
 * @access      Private/Admin
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
    return res.status(200).json(res.advancedResults);
});

/**
 * @desc        Get Single User
 * @route       GET /api/v1/users/:id
 * @access      Private/Admin
 */
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    return res.status(200).json({
        success: true,
        data: user
    });
});

/**
 * @desc        Create User
 * @route       POST /api/v1/users
 * @access      Private/Admin
 */
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);
    return res.status(201).json({
        success: true,
        data: user
    });
});

/**
 * @desc        Update User
 * @route       PUT /api/v1/users/:id
 * @access      Private/Admin
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new ErrorResponse('There Is No User With This Id', 404));
    }
    return res.status(200).json({
        success: true,
        data: user
    });
});

/**
 * @desc        Delete User
 * @route       DELETE /api/v1/users/:id
 * @access      Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new ErrorResponse('There Is No User With This Id', 404));
    }
    return res.status(200).json({
        success: true,
        data: user
    });
});

