const Comment = require('./comment.schema')

module.exports.create = ({ db }) => async (req, res, next) => {
    try {
        const comment = await db.create({ table: Comment, payload: { ...req.body, user: req.user.id, reactions: [] } });
        if (comment) return res.status(201).send(comment);
        else throw new Error('Comment not created');
    } catch (e) { next(e) }
};