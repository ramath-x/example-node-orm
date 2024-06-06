const { validationResult } = require('express-validator');

const validationHandler = async (req, res, next) => {
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
        // console.log(errors)
        const customError = errors.array().map(err => ({
            type: 'field',
            msg: err.msg,
            path: err.path,
            location: err.location
        }));

        // Throw a custom error object
        const error = new Error('Validation Error');
        error.status = 400;
        error.details = customError;
        return next(error);
    }
    return next();
}

module.exports = validationHandler