const { model, Schema } = require('mongoose');

const userSchema = new Schema({
    full_name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    avatar_file_id: { type: Schema.Types.ObjectId }
});

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    delete obj.password;
    return obj;
};

module.exports = model('User', userSchema);