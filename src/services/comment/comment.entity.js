const Comment = require('./comment.schema')

module.exports.create = ({ db }) => async (req, res, next) => {
    try {
        const comment = await db.create({ table: Comment, payload: { ...req.body, user: req.user.id, reactions: [] } });
        if (comment) return res.status(201).send(comment);
        else throw new Error('Comment not created');
    } catch (e) { next(e) }
};

module.exports.update = ({ db }) => async (req, res, next) => {
    try {
        const { id: _id } = req.params;
        req.body.edited = true;
        const comment = await db.update({ table: Comment, payload: { query: { _id }, update: req.body } });
        if (!comment) return res.status(404).send({ message: 'Comment not found' });
        else return res.status(200).send(comment);
    } catch (e) { next(e) }
};