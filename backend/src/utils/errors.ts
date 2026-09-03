export class ApiError extends Error {
  public statusCode: number;
  public errors?: any[];

  constructor(statusCode: number, message: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: any[]) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message: string = 'Authentication required') {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Access denied') {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message: string) {
    return new ApiError(409, message);
  }

  static unprocessable(message: string, errors?: any[]) {
    return new ApiError(422, message, errors);
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(500, message);
  }
}
