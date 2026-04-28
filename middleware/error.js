module.exports = (err, req, res, next) => {
    console.error(err.stack);

    let status = err.statusCode || err.status || 500;
    let message = err.message || 'Internal Server Error';

    if (err.name === 'SequelizeValidationError') {
        status = 400;
        message = err.errors?.[0]?.message || message;
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        status = 409;
        message = 'Email is already registered';
    }

    if (err.name === 'ValidationError') {
        status = 400;
    }

    if (err.name === 'CastError') {
        status = 400;
        message = 'Invalid resource ID';
    }

    res.status(status).json({
        error: {
            message,
            type: err.name || 'Error',
            path: req.path
        }
    });
};
