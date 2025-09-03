const ErrorResponse = require('../utils/errorResponse'); // Add this at the top

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    // If the error is already an ErrorResponse, send it directly
    if (err instanceof ErrorResponse) {
      return err.send(res);
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return new ErrorResponse(messages, 400).send(res);
    }

    // Handle Mongoose duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const message = `Duplicate field value entered for ${field}`;
      return new ErrorResponse(message, 400).send(res);
    }

    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
      const message = `Resource not found with id of ${err.value}`;
      return new ErrorResponse(message, 404).send(res);
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
      return new ErrorResponse('Not authorized', 401).send(res);
    }

    if (err.name === 'TokenExpiredError') {
      return new ErrorResponse('Token expired', 401).send(res);
    }

    // Default to 500 server error
    console.error(`Error: ${err.message}`.red);
    console.error(err.stack);

    // In development, send the full error
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({
        success: false,
        error: err.message,
        stack: err.stack
      });
    }

    // In production, send generic message
    return new ErrorResponse('Server Error', 500).send(res);
  });
};

module.exports = asyncHandler;