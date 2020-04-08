const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer')) {
        return next(new ErrorResponse('Not Authorized to Access This route', 401));
    }

    token = header.replace('Bearer ', '');
    if (!token) {
        return next(new ErrorResponse('Not Authorized To Access This Route', 401));
    }

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded._id);

    next();
});

// Grant Access To Specific Roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User Role ${req.user.role} is unauthorized to access this route`, 403));
        }

        next();
    }
}