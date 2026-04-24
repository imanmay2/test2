const UserService = require('../services/userService');

exports.register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await UserService.registerUser(email, password);
        res.status(201).json({ message: "User created", user });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await UserService.loginUser(email, password);
        res.status(200).json({ user, token });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        // req.user is populated by the auth middleware
        res.status(200).json(req.user);
    } catch (error) {
        next(error);
    }
};