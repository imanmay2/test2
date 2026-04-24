const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true // Indexed for faster lookups per user
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);