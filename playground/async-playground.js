function asyncHandler(fn) {
    function wrapper(req, res, next) {
        return Promise.resolve(fn(req, res, next)).catch(next);
    }

    return wrapper;
}

// function asyncHandler(fn) {
//     async function wrapper(req, res, next) {
//         try {
//             return fn(req, res, next);
//         }
//         catch (err) {
//             return next(err);
//         }
//     }

//     return wrapper;
// }

function next(err) {
    console.log('Error Custom: ', err.message);
}

u = asyncHandler(function (req, res) {
    throw new Error('My Custom Error');
    console.log(req, res);
});

u('req', 'res', next);