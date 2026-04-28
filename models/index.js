const { DataTypes } = require('sequelize');
require('dotenv').config();
const { sequelize } = require('../config/db');

const User = require('./User')(sequelize, DataTypes);

module.exports = { User };
