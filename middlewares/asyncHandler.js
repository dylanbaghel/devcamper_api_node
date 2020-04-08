function asyncHandler(fn) {
    function wrapper(req, res, next) {
        return Promise.resolve(fn(req, res, next)).catch(next);
    }

    return wrapper;
}

module.exports = asyncHandler;