const joi = require('joi');

module.exports.validateUserRegister = {
    body: joi.object().keys({
        full_name: joi.string().required().min(1),
        email: joi.string().email().required(),
        password: joi.string().required().min(5).max(50)
    }),
};