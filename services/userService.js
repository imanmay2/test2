const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class UserService {
    static async registerUser(email, password) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            const error = new Error('Email is already registered');
            error.statusCode = 409;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        return await User.create({ email, password: hashedPassword });
    }

    static async loginUser(email, password) {
        const user = await User.scope(null).findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return { user: { id: user.id, email: user.email }, token };
    }

    static async getProfile(userId) {
        const user = await User.findByPk(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        return user;
    }
}

module.exports = UserService;
