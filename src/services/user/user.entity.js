const bcrypt = require('bcrypt');
const User = require('./user.schema');

module.exports.register = ({ db }) => async (req, res, next) => {
  try {
    req.body.password = await bcrypt.hash(req.body.password, 8);
    const user = await db.create({ table: User, payload: req.body });
    if (user.id) return res.status(201).send({ message: 'User registration successful' });
    else throw new Error('User registration failed');
  } catch (e) { next(e) }
};