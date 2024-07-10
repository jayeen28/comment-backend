const joi = require('joi');

module.exports.validUpload = {
    files: joi.object().required().keys({
        file: joi.object().required().keys({
            path: joi.string().required(),
            type: joi.string().required(),
            originalFilename: joi.string().required()
        })
    }),
};

module.exports.validGetFile = {
    params: joi.object().keys({
        id: joi.string().required(),
    })
};