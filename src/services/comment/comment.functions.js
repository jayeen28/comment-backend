module.exports.buildPipeLine = function ({ post = '1', sort = 'createdAt', skip = 0, limit = 5, query = {} } = {}) {
    return ([
        {
            $match: query
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
            $unwind: '$reactions'
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
                        $sort: { [sort]: 1 }
                    },
                    {
                        $skip: skip
                    },
                    {
                        $limit: limit
                    },
                    {
                        $project: {
                            _id: '$_id',
                            user: '$comment.user',
                            content: '$comment.content',
                            user: {
                                _id: '$user._id',
                                fullname: '$user.full_name',
                                avatar_file_id: '$user.avatar_file_id',
                            },
                            reactions: '$comment.reactions',
                            createdAt: 1,
                            likes: 1,
                            dislikes: 1
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