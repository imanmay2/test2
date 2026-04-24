require('dotenv').config();
const express = require('express');
const { sequelize, connectMongo } = require('./config/db');
require('./models/User');

const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/error');

const app = express();

// Standard Middleware
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// 404 Fallback
app.use((req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

// Global Error Handler (Must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {

        await sequelize.authenticate();

        await sequelize.sync({ alter: false });
        console.log('✅ PostgreSQL Connected & Synced');

        await connectMongo();

        app.listen(PORT, () => {
            console.log(`🚀 Server spinning on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Startup Error:', error.message);
        process.exit(1);
    }
};

startServer();