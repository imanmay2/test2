const mongoose = require('mongoose');
const Category = require('../models/Category');
const Task = require('../models/Task');

const ensureValidId = (id, label = 'category') => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error(`Invalid ${label} ID`);
        error.statusCode = 400;
        throw error;
    }
};

const notFoundError = () => {
    const error = new Error('Category not found or access denied');
    error.statusCode = 404;
    return error;
};

class CategoryService {
    static async createCategory(userId, data) {
        try {
            return await Category.create({ userId, name: data.name });
        } catch (error) {
            if (error.code === 11000) {
                error.statusCode = 409;
                error.message = 'Category already exists';
            }
            throw error;
        }
    }

    static async getCategories(userId) {
        return await Category.find({ userId }).sort({ name: 1 });
    }

    static async getCategory(categoryId, userId) {
        ensureValidId(categoryId);
        const category = await Category.findOne({ _id: categoryId, userId });
        if (!category) throw notFoundError();
        return category;
    }

    static async updateCategory(categoryId, userId, data) {
        ensureValidId(categoryId);
        try {
            const category = await Category.findOneAndUpdate(
                { _id: categoryId, userId },
                { name: data.name },
                { new: true, runValidators: true }
            );
            if (!category) throw notFoundError();
            return category;
        } catch (error) {
            if (error.code === 11000) {
                error.statusCode = 409;
                error.message = 'Category already exists';
            }
            throw error;
        }
    }

    static async deleteCategory(categoryId, userId) {
        ensureValidId(categoryId);
        const category = await Category.findOneAndDelete({ _id: categoryId, userId });
        if (!category) throw notFoundError();

        await Task.updateMany(
            { userId, categoryId },
            { $unset: { categoryId: '' } }
        );

        return true;
    }
}

module.exports = CategoryService;
