const { model, Schema } = require('mongoose');

const commentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    post: { type: String, default: '1' },
    content: { type: String, required: true },
    reactions: [{
        element: { type: String, enum: ['like', 'dislike'], required: true },
        user: { type: Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
        _id: false
    }],
    edited: { type: Boolean, default: false },
    replyOf: { type: Schema.Types.ObjectId, ref: 'Comment' }
}, { timestamps: true });


commentSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    delete obj.updatedAt;
    delete obj.user.password;
    return obj;
};

module.exports = model('Comment', commentSchema);