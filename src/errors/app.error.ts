export class ApplicationError extends Error {
  constructor(readonly statusCode: number, message?: string) {
    super(message);
  }

  static throwNotFound(message?: string): never {
    throw new ApplicationError(404, message);
  }

  static throwBadRequest(message?: string): never {
    throw new ApplicationError(400, message);
  }

  static throwUnathorized(message?: string): never {
    throw new ApplicationError(401, message);
  }

  static throwForbidden(message?: string): never {
    throw new ApplicationError(403, message);
  }
}
