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
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const user = await UserService.getProfile(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};
