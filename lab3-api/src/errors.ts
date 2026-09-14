import type { ErrorRequestHandler, RequestHandler } from "express";
import type { ErrorResponse } from "./types.js";

export class AppError extends Error {
  public constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: string[],
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Converts unmatched routes into a structured not-found error.
 *
 * @param request - The unmatched Express request.
 * @param _response - The Express response.
 * @param next - Passes the error to the error handler.
 * @returns Nothing.
 * @example app.use(notFoundHandler);
 */
export const notFoundHandler: RequestHandler = (request, _response, next): void => {
  next(new AppError(404, "NOT_FOUND", `Route ${request.method} ${request.path} not found`));
};

/**
 * Produces a consistent JSON response for application and unexpected errors.
 *
 * @param error - The error raised while handling the request.
 * @param _request - The Express request.
 * @param response - The Express response.
 * @param _next - The next middleware callback.
 * @returns Nothing.
 * @example app.use(errorHandler);
 */
export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
): void => {
  const appError =
    error instanceof AppError
      ? error
      : new AppError(500, "INTERNAL_ERROR", "An unexpected error occurred");

  const body: ErrorResponse = {
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details === undefined ? {} : { details: appError.details }),
    },
  };

  response.status(appError.statusCode).json(body);
};