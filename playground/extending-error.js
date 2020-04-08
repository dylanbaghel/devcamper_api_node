class ErrorResponse extends Error {
    constructor(message, code) {
        super(message);
        this.code = code
    }
}

err = new ErrorResponse('This is custom error', 222);
console.log(Object.entries(err));
console.log(err.message);
console.log(err instanceof ErrorResponse);

err2 = Error('This is built in error');
console.log(Object.entries(err2));