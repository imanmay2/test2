const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

TagSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Tag', TagSchema);
