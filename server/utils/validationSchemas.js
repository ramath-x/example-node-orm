export const createUserValidationSchema = {
    name: {
        notEmpty: {
            errorMessage: 'name is required'
        },
        isLength: {
            options: {
                min: 3,
                max: 10
            },
            errorMessage: 'name must be between 3 and 10 characters',
        }
    },
    email: {
        notEmpty: {
            errorMessage: 'email is required'
        },
        isEmail: {
            errorMessage: 'email must be valid'
        }
    }
}