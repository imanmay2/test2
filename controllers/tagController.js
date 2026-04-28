const TagService = require('../services/tagService');

exports.createTag = async (req, res, next) => {
    try {
        const tag = await TagService.createTag(req.user.id, req.body);
        res.status(201).json(tag);
    } catch (error) {
        next(error);
    }
};

exports.getTags = async (req, res, next) => {
    try {
        const tags = await TagService.getTags(req.user.id);
        res.status(200).json(tags);
    } catch (error) {
        next(error);
    }
};

exports.getTag = async (req, res, next) => {
    try {
        const tag = await TagService.getTag(req.params.id, req.user.id);
        res.status(200).json(tag);
    } catch (error) {
        next(error);
    }
};

exports.updateTag = async (req, res, next) => {
    try {
        const tag = await TagService.updateTag(req.params.id, req.user.id, req.body);
        res.status(200).json(tag);
    } catch (error) {
        next(error);
    }
};

exports.deleteTag = async (req, res, next) => {
    try {
        await TagService.deleteTag(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
