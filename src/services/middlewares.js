// Required modules
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pick = require('../utils/cherryPick');
const joi = require('joi');
const localDateTimeParts = require('../utils/localDateTimeParts');
const User = require('./user/user.schema');
const jwt = require('jsonwebtoken');

// Middleware function to handle errors
module.exports.errorMiddleware = function errorMiddleware({ dataPath = path.resolve(), config }) {

  // eslint-disable-next-line no-unused-vars
  return async (err, req, res, next) => {
    // Extract year, month, and day from current date
    const [year, month, day, hours, minutes, seconds] = localDateTimeParts('Asia/Dhaka').map((n) => n.toString());

    // Create directory for storing server error logs
    const apiErrorDir = path.join(dataPath, 'server_error', year, month);

    if (!fs.existsSync(apiErrorDir)) await new Promise((resolve, reject) => {
      fs.mkdir(apiErrorDir, { recursive: true }, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });

    // Define path for error log file
    const apiErrorPath = path.join(apiErrorDir, `${day}.log`);

    // Log the error if running in development mode
    if (config.RUNNING === 'dev') console.log(err);

    // Generate unique reference ID
    const reference = `${uuidv4()}|${year}-${month}-${day}:T${hours}:${minutes}:${seconds}`;

    // Extract relevant request information
    const { method, originalUrl, query, body } = req;

    // Construct log message
    const logMessage = `\n${reference} - ${err.message}\n` +
      `Route: ${method} ${originalUrl}\n` +
      `Query: ${JSON.stringify(query)}\n` +
      `Body: ${JSON.stringify(body)}\n` +
      `${err.stack}\n`;

    // Asynchronously read existing content of the error log file
    const done = new Promise((resolve, reject) => {
      fs.readFile(apiErrorPath, 'utf8', (fileErr, data = '') => {
        if (fileErr && fileErr.code !== 'ENOENT') {
          reject(`Error reading API error file:\n${fileErr}`);
        } else {
          // Prepend new log message to existing content
          const updatedContent = logMessage + data;

          // Write updated content back to the file
          fs.writeFile(apiErrorPath, updatedContent, (writeErr) => {
            if (writeErr) {
              reject(`Error writing to API error file:\n${writeErr}`);
            } else resolve('Error saved.');
          });
        }
      });
    });

    // Handle promise resolution
    done
      .then(() => res.status(500).send({ message: 'Something went wrong', reference }))
      .catch((fileErr) => {
        res.status(500).send({ message: 'Something went wrong' });
        console.log(fileErr);
        if (config.RUNNING === 'prod') console.log('Internal server error:\n', err);
      });
  };
};

module.exports.authHandler = function ({ config, db }) {
  return () => {
    return async function (req, res, next) {
      try {
        const token = req.cookies?.[config.AUTH_COOKIE_KEY];
        if (!token) return res.status(401).send({ message: 'Unauthorized' });
        const data = jwt.verify(token, config.JWT_SECRET);
        const user = await db.findOne({ table: User, payload: { _id: data._id } });
        if (!user) return res.status(401).send({ message: 'Unauthorized' });
        req.user = user;
        next();
      }
      catch (e) {
        next(e);
      }
    }
  }
}

/**
 * This function is used for validating user role.
 * It is an express middleware.
 * It checks that the role of the user is allowed to proceed the request or not.
 * @param {Array} allowed The allowed roles.
 * @throws {Error} If the role is not allowed then it throws an error.
 */
module.exports.checkRole = function checkRole(allowed) {
  return async (req, res, next) => {
    try {
      if (allowed.includes(req.user.role)) return next();
      else throw new Error('Unauthorized.');
    }
    catch (e) {
      res.status(401).send({ status: 401, reason: 'unauthorized' });
    }
  };
};

/**
 * @module exports.validate
 * @description This module provides a middleware function for request body validation using Joi.
 *
 * @param {Object} schema - A Joi schema object defining expected request data structure and validation rules.
 * @param {boolean} [allowUnknown=false] - (Optional) Whether to allow properties in the request that are not defined in the schema. Defaults to `false`.
 *
 * @returns {Function} A middleware function that validates the request body against the provided schema.
 *
 * @example
 * ```javascript
 * const validateEmail = validate(validVerifyEmailSchema);
 *
 * this.router.get('/user/verifyemail', validateEmail, verifyEmail(this));
 * ```
 *
 * This example validates the request on the `/user/verifyemail` route using the `validVerifyEmailSchema` schema.
 */
module.exports.validate = function (schema, allowUnknown = false) {
  return (req, res, next) => {
    const validSchema = pick(schema, ['params', 'query', 'body', 'files']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object, { allowUnknown });

    if (error) {
      // const errorMessage = error.details.map((details) => details.message).join(', ');
      // console.log(errorMessage);
      return res.status(400).send({ message: 'Invalid payload' });
    }

    Object.assign(req, value);
    return next();
  };
}