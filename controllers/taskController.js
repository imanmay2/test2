const TaskService = require('../services/taskService');

exports.createTask = async (req, res, next) => {
    try {
        const task = await TaskService.createTask(req.user.id, req.body);
        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
};

exports.getTasks = async (req, res, next) => {
    try {
        const tasks = await TaskService.getAllTasks(req.user.id);
        res.status(200).json(tasks);
    } catch (error) {
        next(error);
    }
};

exports.getTaskById = async (req, res, next) => {
    try {
        const task = await TaskService.getTaskById(req.params.id, req.user.id);
        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
};

exports.updateTask = async (req, res, next) => {
    try {
        const task = await TaskService.updateTask(req.params.id, req.user.id, req.body);
        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
};

exports.deleteTask = async (req, res, next) => {
    try {
        await TaskService.deleteTask(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};