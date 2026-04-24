const Joi = require('joi');

const taskSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().allow(''),
    dueDate: Joi.date().iso().greater('now').required(),
    status: Joi.string().valid('pending', 'completed'),
});

exports.validateTask = (req, res, next) => {
    const { error } = taskSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    next();
};

const userSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

exports.validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    next();
};