const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const { validateCreateTask, validateUpdateTask } = require('../middleware/validators');

router.use(auth); // Protect all task routes

router.route('/')
    .get(taskController.getTasks)
    .post(validateCreateTask, taskController.createTask);

router.route('/:id')
    .get(taskController.getTaskById)
    .patch(validateUpdateTask, taskController.updateTask)
    .delete(taskController.deleteTask);

module.exports = router;
