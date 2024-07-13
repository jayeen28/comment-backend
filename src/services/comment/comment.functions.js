const mongoose = require('mongoose');

const sortDirValues = {
    asec: 1,
    desc: -1
}

module.exports.buildPipeLine = function ({ sort = 'createdAt:desc', skip = 0, limit = 5, query = {} } = {}) {
    const [sortKey, sortDir] = sort.split(':');
    return ([
        {
            $match: {
                ...query,
                post: query.post,
                replyOf: { $eq: query.replyOf ? new mongoose.Types.ObjectId(query.replyOf) : null },// match replies when replyOf came with the query.
            }
        },
        {
            $lookup: {//Get all the matched comments
                from: 'comments',
                localField: '_id',
                foreignField: '_id',
                as: 'comment'
            }
        },
        {
            $unwind: '$comment'
        },
        {
            $unwind: {
                path: '$reactions',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {//group comments by comment id and calculate likes,dislikes
                _id: '$comment._id',
                createdAt: { $first: '$comment.createdAt' },
                comment: { $first: '$comment' },
                user: { $first: '$comment.user' },
                likes: { $sum: { $cond: [{ $eq: ['$reactions.element', 'like'] }, 1, 0] } },
                dislikes: { $sum: { $cond: [{ $eq: ['$reactions.element', 'dislike'] }, 1, 0] } },
            }
        },
        {
            $lookup: {//get the users data for each comments
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: '$user'
        },
        {
            $facet: {// used facet to separate the totalDocs count and the documents in output.
                "docs": [
                    {
                        $sort: { [sortKey]: sortDirValues[sortDir] }//sort docs based on query
                    },
                    {
                        $skip: skip
                    },
                    {
                        $limit: limit
                    },
                    {//get all the replies
                        $lookup: {
                            from: 'comments',
                            localField: '_id',
                            foreignField: 'replyOf',
                            as: 'replies'
                        }
                    },
                    {
                        $project: {
                            _id: '$_id',
                            user: '$comment.user',
                            content: '$comment.content',
                            post: '$comment.post',
                            user: {
                                _id: '$user._id',
                                full_name: '$user.full_name',
                                avatar_file_id: '$user.avatar_file_id',
                            },
                            edited: '$comment.edited',
                            reactions: '$comment.reactions',
                            createdAt: 1,
                            likes: 1,
                            dislikes: 1,
                            replyOf: '$comment.replyOf',
                            replyCount: { $size: '$replies' }
                        }
                    }
                ],
                "totalDocs": [
                    {
                        $count: 'count'
                    }
                ]
            },
        },
        {
            $project: {
                docs: 1,
                totalDocs: { $arrayElemAt: ['$totalDocs.count', 0] }
            }
        }
    ]);
};