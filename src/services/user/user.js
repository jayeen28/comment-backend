const { validate } = require('../middlewares');
const { register, login, me } = require('./user.entity');
const { validateUserRegister, validLogin } = require('./user.validate');

/**
 * INSTRUCTIONS:
 * 1. Call api and socket handler functions from entity file (ex: user.entity.js).
 */

/**
 * Define API routes for user management.
 */
function userApi() {

  /**
   * POST /user/register
   * @description This route is used to create a user.
   * @response {Object} 201 - The new user.
   * @respose {Object} 400 - If somthing is wrong from the client side.
   * @respose {Object} 500 - If somthing is wrong from the backend.
   * @body {Object} - The data to create a user.
  */
  this.router.post('/user/register', validate(validateUserRegister), register(this));

  /**
   * POST /user/login
   * @description This route is for login users by checking credentials.
   * @response {Object} 200 - If credentials are valid.
   * @response {Object} 401 - If credentials are not valid.
   * @respose {Object} 500 - If somthing is wrong from the backend.
   */
  this.router.post('/user/login', validate(validLogin), login(this));

  /**
   * GET /user/me
   * @description This route is for getting user's own data using auth token.
   * @response {Object} 200 - If a valid token found.
   * @response {Object} 401 - If token is not valid or token not found.
   * @respose {Object} 500 - If somthing is wrong from the backend.
   */
  this.router.get('/user/me', this.auth(), me(this));
}

/**
 * Register event handlers for user related events.
 */
function userSocket() {

  // this.socket.on('demo', demoHandlerFromEntity(this));
}

module.exports = { userApi, userSocket };