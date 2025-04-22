export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details: any;

  constructor(
    message: string,
    statusCode = 500,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Not found Error
export class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(message, 404, true);
  }
}

// Validation Error
export class ValidationError extends AppError {
  constructor(message = "Invalid Request Data") {
    super(message, 400, true);
  }
}

// Authentication Error
export class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, true);
  }
}

// Forbidden Error
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, true);
  }
}

// Server Error
export class ServerError extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, 500, false);
  }
}

// Rate Limit Error
export class RateLimitError extends AppError {
  constructor(message = "Rate Limit Exceeded") {
    super(message, 429, true);
  }
}

// Database Error
export class DatabaseError extends AppError {
  constructor(message = "Database Error") {
    super(message, 500, false);
  }
}
