const mongoose = require('mongoose');

const sortValues = {
    'createdAt': 1,
    'likes': -1,
    'dislikes': -1
}

module.exports.buildPipeLine = function ({ sort = 'createdAt', skip = 0, limit = 5, query = {} } = {}) {

    return ([
        {
            $match: {
                ...query,
                post: query.post,
                replyOf: { $eq: query.replyOf ? new mongoose.Types.ObjectId(query.replyOf) : null },
            }
        },
        {
            $lookup: {
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
            $group: {
                _id: '$comment._id',
                createdAt: { $first: '$comment.createdAt' },
                comment: { $first: '$comment' },
                user: { $first: '$comment.user' },
                likes: { $sum: { $cond: [{ $eq: ['$reactions.element', 'like'] }, 1, 0] } },
                dislikes: { $sum: { $cond: [{ $eq: ['$reactions.element', 'dislike'] }, 1, 0] } },
            }
        },
        {
            $lookup: {
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
            $facet: {
                "docs": [
                    {
                        $sort: { [sort]: sortValues[sort] }
                    },
                    {
                        $skip: skip
                    },
                    {
                        $limit: limit
                    },
                    {
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
                            reactions: '$comment.reactions',
                            createdAt: 1,
                            likes: 1,
                            dislikes: 1,
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