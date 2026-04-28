const CategoryService = require('../services/categoryService');

exports.createCategory = async (req, res, next) => {
    try {
        const category = await CategoryService.createCategory(req.user.id, req.body);
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
};

exports.getCategories = async (req, res, next) => {
    try {
        const categories = await CategoryService.getCategories(req.user.id);
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

exports.getCategory = async (req, res, next) => {
    try {
        const category = await CategoryService.getCategory(req.params.id, req.user.id);
        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
};

exports.updateCategory = async (req, res, next) => {
    try {
        const category = await CategoryService.updateCategory(req.params.id, req.user.id, req.body);
        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        await CategoryService.deleteCategory(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
