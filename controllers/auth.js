const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncHandler');
const sendEmail = require('../utils/sendEmail');
/**
 * @desc        Register User
 * @route       POST /api/v1/auth/register
 * @access      Public
 */
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Create User
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendTokenResponse(user, 200, res);
});

/**
 * @desc        Login User
 * @route       POST /api/v1/auth/login
 * @access      Public
 */
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate Email & Password
    if (!email) {
        return next(new ErrorResponse('Please Enter Email', 400));
    }
    if (!password) {
        return next(new ErrorResponse('Please Enter Password', 400));
    }

    const user = await User.findByEmailAndPassword(email, password);

    sendTokenResponse(user, 200, res);
});

/**
 * @desc        Get Current Logged In User
 * @route       POST /api/v1/auth/me
 * @access      Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
        success: true,
        data: user
    });
});

/**
 * @desc        Forgot Password
 * @route       POST /api/v1/auth/forgotpassword
 * @access      Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    console.log(req.body)
    if (!user) {
        return next(new ErrorResponse('There is no user with this email', 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `Use This Link To Make PUT Request In Order To Change Your Password: \n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset',
            message
        });
        return res.status(200).json({
            success: true,
            data: 'Email Sent'
        });
    } catch(err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be send', 500));
    }
});

/**
 * @desc        Reset Password
 * @route       PUT /api/v1/auth/resetpassword/:resetToken
 * @access      Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
    console.log(req.params.resetToken)
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse('Invalid Token', 400));
    }

    // Set New Password 
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json({
        success: true,
        data: 'Password Changed'
    });
});

/**
 * @desc        Update User Details
 * @route       PUT /api/v1/auth/updateDetails
 * @access      Private
 */
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    return res.status(200).json({
        success: true,
        data: user
    });
});

/**
 * @desc        Update Password
 * @route       PUT /api/v1/auth/updatePassword
 * @access      Private
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
    if (!req.body.currentPassword || !req.body.newPassword) {
        return next(new ErrorResponse('Please Provide Current and New Password In order to change the password', 400));
    }
    const user = await User.findById(req.user._id);

    // Check Current Password
    if (!(await user.comparePassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password Incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
});


// Get Token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.generateAuthToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            data: user
        });
}