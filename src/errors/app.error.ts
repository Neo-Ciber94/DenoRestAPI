export class ApplicationError extends Error {
  constructor(readonly statusCode: number, message?: string) {
    super(message);
  }

  static throwBadRequest(message?: string): never {
    throw new ApplicationError(400, message);
  }

  static throwUnauthorized(message?: string): never {
    throw new ApplicationError(401, message);
  }

  static throwForbidden(message?: string): never {
    throw new ApplicationError(403, message);
  }

  static throwNotFound(message?: string): never {
    throw new ApplicationError(404, message);
  }

  static throwTooManyRequests(message?: string): never {
    throw new ApplicationError(429, message);
  }

  static internalServerError(message?: string): never {
    throw new ApplicationError(500, message);
  }
}
