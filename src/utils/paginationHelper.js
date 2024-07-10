module.exports.getSkip = function (page, limit) {
    return { skip: (Number(page) - 1) * Number(limit), limit: Number(limit) };
}

module.exports.getPaginationData = function (page, totalDocs, limit) {
    return ({
        totalDocs,
        limit,
        page,
        totalPages: Math.ceil(totalDocs / limit),
        hasNextPage: totalDocs > (page * limit),
        nextPage: totalDocs > (page * limit) ? page + 1 : null,
        hasPrevPage: page > 1,
        prevPage: page > 1 ? page - 1 : null,
    });
}