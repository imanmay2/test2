const Joi = require('joi');

const tagsSchema = Joi.array().items(Joi.string().trim().min(1).max(60)).unique().max(20);

const createTaskSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().allow(''),
    dueDate: Joi.date().iso().greater('now').required(),
    categoryId: Joi.string().hex().length(24).allow(null),
    tags: tagsSchema,
    status: Joi.string().valid('pending', 'completed'),
});

const updateTaskSchema = Joi.object({
    title: Joi.string().min(3).max(100),
    description: Joi.string().allow(''),
    dueDate: Joi.date().iso().greater('now'),
    categoryId: Joi.string().hex().length(24).allow(null),
    tags: tagsSchema,
    status: Joi.string().valid('pending', 'completed'),
}).min(1);

const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });
    req.body = value;
    next();
};

const userSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

const nameSchema = Joi.object({
    name: Joi.string().trim().min(2).max(60).required(),
});

exports.validateCreateTask = validate(createTaskSchema);
exports.validateUpdateTask = validate(updateTaskSchema);
exports.validateUser = validate(userSchema);
exports.validateName = validate(nameSchema);
