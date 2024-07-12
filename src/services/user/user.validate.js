const joi = require('joi');

module.exports.validateUserRegister = {
    body: joi.object().keys({
        full_name: joi.string().required(),
        avatar_file_id: joi.string(),
        email: joi.string().email().required(),
        password: joi.string().required().min(5).max(50)
    }),
};

module.exports.validLogin = {
    body: joi.object().keys({
        email: joi.string().email().required(),
        password: joi.string().required().min(5).max(50)
    }),
};