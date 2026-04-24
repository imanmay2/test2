const Task = require('../models/Task');

class TaskService {
    static async createTask(userId, taskData) {
        const task = new Task({ ...taskData, userId });
        return await task.save();
    }

    static async getAllTasks(userId) {
        return await Task.find({ userId }).sort({ createdAt: -1 });
    }

    static async getTaskById(taskId, userId) {
        const task = await Task.findOne({ _id: taskId, userId });
        if (!task) throw new Error('Task not found or access denied');
        return task;
    }

    static async updateTask(taskId, userId, updateData) {
        const task = await Task.findOneAndUpdate(
            { _id: taskId, userId },
            updateData,
            { new: true, runValidators: true }
        );
        if (!task) throw new Error('Task not found or unauthorized');
        return task;
    }

    static async deleteTask(taskId, userId) {
        const result = await Task.deleteOne({ _id: taskId, userId });
        if (result.deletedCount === 0) throw new Error('Task not found or unauthorized');
        return true;
    }
}

module.exports = TaskService;