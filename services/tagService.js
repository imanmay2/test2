const mongoose = require('mongoose');
const Tag = require('../models/Tag');
const Task = require('../models/Task');

const ensureValidId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('Invalid tag ID');
        error.statusCode = 400;
        throw error;
    }
};

const notFoundError = () => {
    const error = new Error('Tag not found or access denied');
    error.statusCode = 404;
    return error;
};

class TagService {
    static async createTag(userId, data) {
        try {
            return await Tag.create({ userId, name: data.name });
        } catch (error) {
            if (error.code === 11000) {
                error.statusCode = 409;
                error.message = 'Tag already exists';
            }
            throw error;
        }
    }

    static async getTags(userId) {
        return await Tag.find({ userId }).sort({ name: 1 });
    }

    static async getTag(tagId, userId) {
        ensureValidId(tagId);
        const tag = await Tag.findOne({ _id: tagId, userId });
        if (!tag) throw notFoundError();
        return tag;
    }

    static async updateTag(tagId, userId, data) {
        ensureValidId(tagId);
        const tag = await Tag.findOne({ _id: tagId, userId });
        if (!tag) throw notFoundError();

        try {
            const oldName = tag.name;
            tag.name = data.name;
            await tag.save();

            await Task.updateMany(
                { userId, tags: oldName },
                { $set: { 'tags.$[tag]': tag.name } },
                { arrayFilters: [{ tag: oldName }] }
            );

            return tag;
        } catch (error) {
            if (error.code === 11000) {
                error.statusCode = 409;
                error.message = 'Tag already exists';
            }
            throw error;
        }
    }

    static async deleteTag(tagId, userId) {
        ensureValidId(tagId);
        const tag = await Tag.findOneAndDelete({ _id: tagId, userId });
        if (!tag) throw notFoundError();

        await Task.updateMany(
            { userId, tags: tag.name },
            { $pull: { tags: tag.name } }
        );

        return true;
    }
}

module.exports = TagService;
