import type { RequestHandler } from "express";

/**
 * Logs request and response details after each response is sent.
 *
 * @param request - The incoming Express request.
 * @param response - The outgoing Express response.
 * @param next - Continues to the next middleware or route handler.
 * @returns Nothing.
 * @example app.use(requestLogger);
 */
export const requestLogger: RequestHandler = (request, response, next): void => {
  const timestamp = new Date().toISOString();
  const startTime = process.hrtime.bigint();

  response.once("finish", () => {
    const elapsedNanoseconds = process.hrtime.bigint() - startTime;
    const responseTimeMilliseconds = Number(elapsedNanoseconds) / 1_000_000;

    console.log(
      `${timestamp} ${request.method} ${request.originalUrl} ${response.statusCode} ${responseTimeMilliseconds.toFixed(2)}ms`,
    );
  });

  next();
};