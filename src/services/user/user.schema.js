const { model, Schema } = require('mongoose');

const userSchema = new Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    delete obj.password;
    return obj;
};

module.exports = model('User', userSchema);