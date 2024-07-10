const { validate } = require('../middlewares');
const { create, get, getAll, update, remove } = require('./comment.entity');
const { validComment, validEdit } = require('./comment.validate');

/**
 * INSTRUCTIONS:
 * 1. Call api and socket handler functions from entity file (ex: comment.entity.js).
 */

/**
 * Define API routes for comment management.
 */
function commentApi() {

    /**
     * POST /comment
     * @description This route is used to create a comment.
     * @response {Object} 201 - The new comment.
     * @body {Object} - The data to create a comment.
    */
    this.router.post('/comment/:post', this.auth(), validate(validComment), create(this));

    // /**
    //  * GET /comment
    //  * @description This route is used to get all comments.
    //  * @response {Object} 200 - The paginated comments.
    //  * @response {Array} 200 - The comments without paginations.
    // */
    // this.router.get('/comment', getAll(this));

    // /**
    //  * GET /comment/:id
    //  * @description This route is used to get a comment.
    //  * @response {Object} 200 - The comment.
    // */
    // this.router.get('/comment/:id', get(this));

    /**
     * PATCH /comment/:id
     * @description This route is used to update a comment.
     * @response {Object} 200 - The updated comment.
     * @body {Object} - The data to update a comment.
    */
    this.router.patch('/comment/edit/:id', this.auth(), validate(validEdit), update(this));

    // /**
    //  * PATCH /comment/:id
    //  * @description This route is used to update a comment.
    //  * @response {Object} 200 - The updated comment.
    //  * @body {Object} - The data to update a comment.
    // */
    // this.router.patch('/comment/react/:reaction', update(this));

    // /**
    //  * DELETE /comment/:id
    //  * @description This route is used to remove a comment.
    //  * @response {Object} 200 - The removed comment.
    // */
    // this.router.delete('/comment/:id', remove(this));
}

/**
 * Register event handlers for comment related events.
 */
function commentSocket() {

    // this.socket.on('demo', demoHandlerFromEntity(this));
}

module.exports = { commentApi, commentSocket };