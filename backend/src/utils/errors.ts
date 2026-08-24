export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code: string = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', code: string = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden', code: string = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', code: string = 'VALIDATION_ERROR') {
    super(message, 400, code);
  }
}

export class InvalidStatusTransitionError extends AppError {
  constructor(message: string = 'Invalid order status transition', code: string = 'INVALID_STATUS_TRANSITION') {
    super(message, 400, code);
  }
}

export class NoAvailableAgentError extends AppError {
  constructor(message: string = 'No available delivery agents found for auto-assignment', code: string = 'NO_AVAILABLE_AGENT') {
    super(message, 404, code);
  }
}
