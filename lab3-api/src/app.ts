import express, { type Request, type Response } from "express";
import { AppError, errorHandler, notFoundHandler } from "./errors.js";
import { requestLogger } from "./requestLogger.js";
import { createTask, deleteTask, findTask, listTasks, updateTask } from "./taskStore.js";
import type { TaskInput } from "./types.js";
import { validateTask } from "./validation.js";

/**
 * Creates the configured Express application.
 *
 * @returns An Express application with health and task routes.
 * @example const app = createApp();
 */
export function createApp(): express.Express {
  const app = express();
  app.use(requestLogger);
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.get("/tasks", (_request, response) => {
    response.json(listTasks());
  });

  app.get("/tasks/:id", (request: Request<{ id: string }>, response) => {
    const task = findTask(request.params.id);
    if (task === undefined) {
      throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
    }
    response.json(task);
  });

  app.post("/tasks", validateTask, (request: Request<object, object, TaskInput>, response: Response) => {
    response.status(201).json(createTask(request.body));
  });

  app.put(
    "/tasks/:id",
    validateTask,
    (request: Request<{ id: string }, object, TaskInput>, response: Response) => {
      const task = updateTask(request.params.id, request.body);
      if (task === undefined) {
        throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
      }
      response.json(task);
    },
  );

  app.delete("/tasks/:id", (request: Request<{ id: string }>, response) => {
    if (!deleteTask(request.params.id)) {
      throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
    }
    response.status(204).send();
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}