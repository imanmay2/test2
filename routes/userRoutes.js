const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateUser } = require('../middleware/validators');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', validateUser, userController.register);
router.post('/login', validateUser, userController.login);

// Private route
router.get('/me', auth, userController.getProfile);

module.exports = router;
