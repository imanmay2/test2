const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class UserService {
    static async registerUser(email, password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        return await User.create({ email, password: hashedPassword });
    }

    static async loginUser(email, password) {
        const user = await User.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid credentials');
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return { user: { id: user.id, email: user.email }, token };
    }
}

module.exports = UserService;