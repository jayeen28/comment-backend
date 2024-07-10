const { validUpload, validGetFile } = require('./file.validate');
const { validate } = require('../middlewares');
const { create, get } = require('./file.entity');

/**
 * INSTRUCTIONS:
 * 1. Call api and socket handler functions from entity file (ex: file.entity.js).
 */

/**
 * Define API routes for file management.
 */
function fileApi() {

    /**
     * POST /file
     * @description This route is used to create a file.
     * @response {Object} 201 - The new file.
     * @body {Object} - The data to create a file.
    */
    this.router.post('/file', validate(validUpload, true), create(this));

    /**
     * GET /file/:id
     * @description This route is used to get a file.
     * @response {Object} 200 - The file.
    */
    this.router.get('/file/:id', this.auth(), validate(validGetFile), get(this));
}

/**
 * Register event handlers for file related events.
 */
function fileSocket() {

    // this.socket.on('demo', demoHandlerFromEntity(this));
}

module.exports = { fileApi, fileSocket };