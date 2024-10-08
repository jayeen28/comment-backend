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

module.exports.validEdit = {
    params: joi.object().keys({
        id: joi.string().required(),
    }),
    body: {
        content: joi.string().required().max(900),
    }
};

module.exports.validReaction = {
    params: joi.object().keys({
        reaction: joi.string().required().valid('like', 'dislike'),
        id: joi.string().required(),
    })
};

module.exports.validGetAll = {
    query: joi.object().keys({
        page: joi.number(),
        limit: joi.number(),
        replyOf: joi.string(),
        sort: joi.string(),
        post: joi.string().required(),
    })
};

module.exports.validRemove = {
    params: joi.object().keys({
        id: joi.string().required(),
    })
};