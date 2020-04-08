const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = {...err};
    error.message = err.message;
    // Log To Console For Dev
    console.log(err.stack.red);

    // Mongoose Bad Object Id
    if (err.name === 'CastError') {
        const message = `Resource Not Found With This Id`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose Bad Value
    if (err.code === 2 && err.codeName === 'BadValue') {
        const message = 'Invalid Parameters For Querying';
        error = new ErrorResponse(message, 400);
    }

    // Duplicate Key Error
    if (err.code === 11000) {
        const message = 'Duplicate Resource Not Allowed';
        error = new ErrorResponse(message, 400);
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }
    return res.status(error.statusCode || 500).json({
        success: false,
        msg: error.message || 'Server Error'
    });
}

module.exports = errorHandler