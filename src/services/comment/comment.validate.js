const joi = require("joi");

module.exports.validComment = {
    params: joi.object().keys({
        post: joi.string().required(),
    }),
    body: {
        content: joi.string().required().max(900),
        replyOf: joi.string(),
    }
};