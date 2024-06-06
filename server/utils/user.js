const { check } = require('express-validator')
const { post } = require('../routers')

// module.exports = {
//     post: [
//         check('name')
//             .notEmpty().withMessage('name is required')
//             .isLength({ min: 3, max: 10 }).withMessage('name must be between 3 and 10 characters'),

//         check('email')
//             .notEmpty().withMessage('email is required')
//             .isEmail().withMessage('email must be valid')
//     ]
// }

const userValidationRules = () => {
    return [
        check('name')
            .notEmpty().withMessage('name is required')
            .isLength({ min: 3, max: 10 }).withMessage('name must be between 3 and 10 characters'),
        check('email')
            .notEmpty().withMessage('email is required')
            .isEmail().withMessage('email must be valid'),
    ];
};

module.exports = {
    userValidationRules
};