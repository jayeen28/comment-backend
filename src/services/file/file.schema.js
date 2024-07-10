const { model, Schema } = require('mongoose');

const fileSchema = new Schema({
    filename: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    org_filename: { type: String, required: true },
}, { timestamps: true });

fileSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    delete obj.updatedAt;
    return obj;
};

module.exports = model('File', fileSchema);