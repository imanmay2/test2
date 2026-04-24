const { DataTypes } = require('sequelize');
require('dotenv').config();
const { sequelize } = require('../config/db');

const User = require('./User')(sequelize, DataTypes);
const Task = require('./Task')(sequelize, DataTypes);

// Relationship: A user has many tasks
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

module.exports = { User, Task };