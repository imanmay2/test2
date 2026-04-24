const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const { validateTask } = require('../middleware/validators');

router.use(auth); // Protect all task routes

router.route('/')
    .get(taskController.getTasks)
    .post(validateTask, taskController.createTask);

router.route('/:id')
    .get(taskController.getTaskById)
    .patch(validateTask, taskController.updateTask)
    .delete(taskController.deleteTask);

module.exports = router;