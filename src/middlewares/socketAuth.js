const cookie = require('cookie');
const User = require('../services/user/user.schema');
const jwt = require('jsonwebtoken');

/**
 * This function is the middleware of socketauth.
 */
module.exports = function socketAuth({ config, db }) {
    return async (socket, next) => {
        try {
            const token = cookie.parse(socket.handshake?.headers?.cookie || '')[config.AUTH_COOKIE_KEY];
            if (!token) throw new Error('No token provided');
            const data = jwt.verify(token, config.JWT_SECRET);
            const user = await db.findOne({ table: User, payload: { _id: data._id } });
            if (!user) throw new Error('User not found');

            socket.user = user;
            socket.join(user._id);
            socket.join(user.role || 'user'); // This is role based room.
            next();
        } catch (e) {
            console.log(e);
            next(new Error('Unauthorized'));
        }
    }
}