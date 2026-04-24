const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
require('dotenv').config();

// 1. PostgreSQL Connection (Users)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

// 2. MongoDB Connection (Tasks)
const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected (Task Management)');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectMongo };