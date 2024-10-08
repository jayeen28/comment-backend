const validate = require('../../middlewares/validateMiddleware');
const { create, get, getAll, update, remove, reaction } = require('./comment.entity');
const { validComment, validEdit, validReaction, validGetAll } = require('./comment.validate');

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

    /**
     * GET /comment
     * @description This route is used to get all comments.
     * @response {Object} 200 - The paginated comments.
     * @response {Array} 200 - The comments with pagination.
    */
    this.router.get('/comment', this.auth(), validate(validGetAll), getAll(this));

    /**
     * PATCH /comment/:id
     * @description This route is used to update a comment.
     * @response {Object} 200 - The updated comment.
     * @body {Object} - The data to update a comment.
    */
    this.router.patch('/comment/edit/:id', this.auth(), validate(validEdit), update(this));

    /**
     * PATCH /comment/:id
     * @description This route is used to update a comment.
     * @response {Object} 200 - The updated comment.
     * @body {Object} - The data to update a comment.
    */
    this.router.patch('/comment/react/:id/:reaction', this.auth(), validate(validReaction), reaction(this));

    /**
     * DELETE /comment/:id
     * @description This route is used to remove a comment.
     * @response {Object} 200 - The removed comment.
    */
    this.router.delete('/comment/:id', this.auth(), remove(this));
}

/**
 * Register event handlers for comment related events.
 */
function commentSocket() {

    // this.socket.on('demo', demoHandlerFromEntity(this));
}

module.exports = { commentApi, commentSocket };