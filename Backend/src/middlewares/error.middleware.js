/**
 * Global async error handler middleware.
 * Catches errors thrown from async route handlers and formats them consistently.
 */
function errorMiddleware(err, req, res, _next) {
    console.error(`[Error] ${req.method} ${req.path}:`, err.message);

    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                message: 'Resume file is too large. Please upload a PDF smaller than 5MB.',
            });
        }

        return res.status(400).json({
            success: false,
            message: err.message || 'There was a problem processing the uploaded file.',
        });
    }

    if (err.code === 'UNSUPPORTED_FILE_TYPE') {
        return res.status(400).json({
            success: false,
            message: err.message || 'Please upload a PDF resume.',
        });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        return res.status(400).json({
            success: false,
            message: `An account with this ${field} already exists.`,
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors)
            .map(e => e.message)
            .join(', ');
        return res.status(400).json({ success: false, message });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }

    // Default
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        success: false,
        message: err.message || 'Internal server error.',
    });
}

module.exports = errorMiddleware;
