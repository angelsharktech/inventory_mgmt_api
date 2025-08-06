class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorResponse);
    }

    this.name = this.constructor.name;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
  }

  // Static method to create common error types
  static badRequest(msg = 'Bad Request') {
    return new ErrorResponse(msg, 400);
  }

  static unauthorized(msg = 'Unauthorized') {
    return new ErrorResponse(msg, 401);
  }

  static forbidden(msg = 'Forbidden') {
    return new ErrorResponse(msg, 403);
  }

  static notFound(msg = 'Resource not found') {
    return new ErrorResponse(msg, 404);
  }

  static conflict(msg = 'Conflict') {
    return new ErrorResponse(msg, 409);
  }

  static internalError(msg = 'Internal Server Error') {
    return new ErrorResponse(msg, 500);
  }

  // Method to send error response
  send(res) {
    res.status(this.statusCode).json({
      success: false,
      error: this.message,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    });
  }
}

module.exports = ErrorResponse;