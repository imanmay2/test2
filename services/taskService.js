const Task = require('../models/Task');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const ReminderService = require('./reminderService');
const WebhookService = require('./webhookService');

const ensureValidTaskId = (taskId) => {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        const error = new Error('Invalid task ID');
        error.statusCode = 400;
        throw error;
    }
};

const notFoundError = () => {
    const error = new Error('Task not found or access denied');
    error.statusCode = 404;
    return error;
};

const normalizeTaskData = (taskData) => ({
    ...taskData,
    tags: taskData.tags ? taskData.tags.map((tag) => tag.trim()).filter(Boolean) : taskData.tags
});

const ensureCategoryBelongsToUser = async (categoryId, userId) => {
    if (categoryId === undefined || categoryId === null) return;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        const error = new Error('Invalid category ID');
        error.statusCode = 400;
        throw error;
    }

    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) {
        const error = new Error('Category not found or access denied');
        error.statusCode = 404;
        throw error;
    }
};

const buildTaskQuery = async (userId, filters = {}) => {
    const query = { userId };

    if (filters.categoryId) {
        if (!mongoose.Types.ObjectId.isValid(filters.categoryId)) {
            const error = new Error('Invalid category ID');
            error.statusCode = 400;
            throw error;
        }
        query.categoryId = filters.categoryId;
    } else if (filters.category) {
        const category = await Category.findOne({ userId, name: filters.category.trim() });
        query.categoryId = category ? category._id.toString() : '__no_matching_category__';
    }

    const rawTags = filters.tags || filters.tag;
    if (rawTags) {
        const tags = Array.isArray(rawTags)
            ? rawTags
            : rawTags.split(',').map((tag) => tag.trim()).filter(Boolean);

        if (tags.length > 0) {
            query.tags = { $all: tags };
        }
    }

    return query;
};

class TaskService {
    static async createTask(userId, taskData) {
        await ensureCategoryBelongsToUser(taskData.categoryId, userId);
        const task = new Task({ ...normalizeTaskData(taskData), userId });
        const savedTask = await task.save();
        ReminderService.schedule(savedTask);
        return savedTask;
    }

    static async getAllTasks(userId, filters) {
        return await Task.find(await buildTaskQuery(userId, filters)).sort({ createdAt: -1 });
    }

    static async getTaskById(taskId, userId) {
        ensureValidTaskId(taskId);
        const task = await Task.findOne({ _id: taskId, userId });
        if (!task) throw notFoundError();
        return task;
    }

    static async updateTask(taskId, userId, updateData) {
        ensureValidTaskId(taskId);
        await ensureCategoryBelongsToUser(updateData.categoryId, userId);
        const existingTask = await Task.findOne({ _id: taskId, userId });
        if (!existingTask) throw notFoundError();

        const task = await Task.findOneAndUpdate(
            { _id: taskId, userId },
            normalizeTaskData(updateData),
            { new: true, runValidators: true }
        );
        if (!task) throw notFoundError();

        if (task.status === 'completed') {
            ReminderService.cancel(task._id);
        } else if (updateData.dueDate || existingTask.status === 'completed') {
            ReminderService.reschedule(task);
        }

        if (existingTask.status !== 'completed' && task.status === 'completed') {
            WebhookService.sendTaskCompleted(task).catch((error) => {
                console.error('[Webhook unexpected error]', error.message);
            });
        }

        return task;
    }

    static async deleteTask(taskId, userId) {
        ensureValidTaskId(taskId);
        const result = await Task.deleteOne({ _id: taskId, userId });
        if (result.deletedCount === 0) throw notFoundError();
        ReminderService.cancel(taskId);
        return true;
    }
}

module.exports = TaskService;
