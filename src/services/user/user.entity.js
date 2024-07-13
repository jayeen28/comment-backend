const bcrypt = require('bcrypt');
const User = require('./user.schema');
const jwt = require('jsonwebtoken');

/**
 * Hashes the user's password and store user in database.
 */
module.exports.register = ({ db }) => async (req, res, next) => {
  try {
    req.body.password = await bcrypt.hash(req.body.password, 8);
    const user = await db.create({ table: User, payload: req.body });
    if (user.id) return res.status(201).send({ message: 'User registration successful' });
    else throw new Error('User registration failed');
  } catch (e) { next(e) }
};

/**
 * Logout the current user by removing cookie.
 */
module.exports.logout = ({ config }) => async (req, res, next) => {
  try {
    res.clearCookie(config.AUTH_COOKIE_KEY);
    return res.status(200).send({ message: 'Logout successful' });
  } catch (e) { next(e) }
};

/**
 * Login the user by checking credentials and set jwt token as cookie in the client.
 */
module.exports.login = ({ db, config }) => async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await db.findOne({ table: User, payload: { email } })
    if (!user) return res.status(401).send({ message: 'Unauthorized' });
    const validPass = await bcrypt.compare(password, user.password);
    if (validPass) {
      const authToken = jwt.sign({ _id: user._id }, config.JWT_SECRET);
      res.cookie(config.AUTH_COOKIE_KEY, authToken, {
        httpOnly: true,
        sameSite: config.RUNNING === 'prod' ? "none" : false,
        secure: config.RUNNING === 'prod' ? true : false,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days from now
      });
      return res.status(200).send(user);
    }
    else return res.status(401).send({ message: 'Unauthorized' });
  } catch (e) { next(e) }
};

/**
 * Validating user with jwt token from cookie.
 */
module.exports.me = () => (req, res, next) => {
  try {
    return res.status(200).send(req.user);
  } catch (e) { next(e) }
};