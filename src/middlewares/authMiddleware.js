const User = require('../services/user/user.schema');
const jwt = require('jsonwebtoken');

module.exports = function ({ config, db }) {
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