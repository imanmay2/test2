module.exports = (err, req, res, next) => {
    console.error(err.stack);

    const status = err.name === 'SequelizeValidationError' ? 400 : 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        error: {
            message,
            type: err.name,
            path: req.path
        }
    });
};