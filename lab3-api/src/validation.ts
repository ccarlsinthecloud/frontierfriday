import type { RequestHandler } from "express";
import { AppError } from "./errors.js";
import { taskStatuses, type TaskInput, type TaskStatus } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && taskStatuses.includes(value as TaskStatus);
}

function validateTaskBody(body: unknown): { input?: TaskInput; errors: string[] } {
  if (!isRecord(body)) {
    return { errors: ["Request body must be a JSON object"] };
  }

  const errors: string[] = [];
  const allowedFields = new Set(["title", "description", "status"]);
  const unknownFields = Object.keys(body).filter((field) => !allowedFields.has(field));

  if (unknownFields.length > 0) {
    errors.push(`Unknown fields: ${unknownFields.join(", ")}`);
  }
  if (typeof body.title !== "string" || body.title.trim().length === 0) {
    errors.push("title must be a non-empty string");
  }
  if (typeof body.description !== "string") {
    errors.push("description must be a string");
  }
  if (!isTaskStatus(body.status)) {
    errors.push(`status must be one of: ${taskStatuses.join(", ")}`);
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors,
    input: {
      title: (body.title as string).trim(),
      description: body.description as string,
      status: body.status as TaskStatus,
    },
  };
}

/**
 * Validates and normalizes a task request body.
 *
 * @param request - The Express request containing task input.
 * @param _response - The Express response.
 * @param next - Continues processing or receives a validation error.
 * @returns Nothing.
 * @example app.post("/tasks", validateTask, createTaskHandler);
 */
export const validateTask: RequestHandler = (request, _response, next): void => {
  const result = validateTaskBody(request.body);

  if (result.input === undefined) {
    next(new AppError(400, "VALIDATION_ERROR", "Invalid task data", result.errors));
    return;
  }

  request.body = result.input;
  next();
};