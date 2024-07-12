const { getSkip, getPaginationData } = require('../../utils/paginationHelper');
const { buildPipeLine } = require('./comment.functions');
const Comment = require('./comment.schema')

module.exports.create = ({ db, io }) => async (req, res, next) => {
    try {
        const { post } = req.params;
        const comment = await db.create({
            table: Comment, payload: {
                ...req.body,
                post,
                user: req.user.id,
                reactions: [],
                populate: {
                    path: 'user',
                    select: 'avatar_file_id full_name'
                }
            }
        });
        if (comment) {
            const rawComment = comment.toJSON();
            rawComment.likes = 0;
            rawComment.dislikes = 0;
            rawComment.replyCount = 0;
            io.to('user').emit('new_comment', comment);
            return res.status(201).send(rawComment);
        }
        else throw new Error('Comment not created');
    } catch (e) { next(e) }
};

module.exports.update = ({ db, io }) => async (req, res, next) => {
    try {
        const { id: _id } = req.params;
        req.body.edited = true;
        const comment = await db.updateWithSave({ table: Comment, payload: { query: { _id, user: req.user.id }, update: req.body } });
        if (!comment) return res.status(404).send({ message: 'Comment not found' });
        else {
            io.to('user').emit('comment_edited', { user_id: req.user.id, _id, content: comment.content });
            return res.status(200).send(comment);
        }
    } catch (e) { next(e) }
};

module.exports.reaction = ({ db, io }) => async (req, res, next) => {
    try {
        const { id: _id, reaction } = req.params;
        const updateRes = await db.rawUpdate({
            table: Comment,
            payload: {
                query: { _id, 'reactions.user': { $ne: req.user.id } },
                update: { $push: { reactions: { element: reaction, user: req.user.id } } }
            }
        });
        if (updateRes.modifiedCount === 1) {
            io.to('user').emit('reaction_added', { _id, user_id: req.user.id, reaction });
            return res.status(200).send({ message: 'Reaction added' });
        }
        else return res.status(404).send({ message: 'Reaction not found' });
    } catch (e) { next(e) }
};

module.exports.getAll = ({ db }) => async (req, res, next) => {
    try {
        const { page = 1, limit: queryLimit = 5, sort, ...restQueries } = req.query;
        const { skip, limit } = getSkip(page, queryLimit);
        const aggregationPipleline = buildPipeLine({ skip, limit, sort, query: restQueries });
        const [{ docs = [], totalDocs = 0 } = {}] = (await db.aggr({ table: Comment, payload: aggregationPipleline }) || []);
        const pagination = getPaginationData(page, totalDocs, limit);
        return res.status(200).send({
            docs,
            pagination
        });
    } catch (e) { next(e) }
};

module.exports.remove = ({ db, io }) => async (req, res, next) => {
    try {
        const { id: _id } = req.params;
        const removeRes = await db.remove({ table: Comment, payload: { _id, user: req.user.id } });
        if (removeRes.deletedCount === 0) return res.status(404).send({ message: 'Comment not found' });
        io.to('user').emit('comment_removed', { user_id: req.user.id, _id });
        await db.removeAll({ table: Comment, payload: { replyOf: _id } });
        return res.status(200).send({ message: "Comment removed" });

    } catch (e) { next(e) }
}