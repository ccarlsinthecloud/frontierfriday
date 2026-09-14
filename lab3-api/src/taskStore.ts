import { randomUUID } from "node:crypto";
import type { Task, TaskInput } from "./types.js";

const tasks: Task[] = [];

/**
 * Returns all tasks currently in memory.
 *
 * @returns A snapshot of the task collection.
 * @example const tasks = listTasks();
 */
export function listTasks(): Task[] {
  return [...tasks];
}

/**
 * Finds a task by identifier.
 *
 * @param id - The task identifier.
 * @returns The matching task, or undefined.
 * @example const task = findTask("task-id");
 */
export function findTask(id: string): Task | undefined {
  return tasks.find((task) => task.id === id);
}

/**
 * Creates and stores a task.
 *
 * @param input - Validated task fields.
 * @returns The newly created task.
 * @example const task = createTask({ title: "Ship", description: "Deploy", status: "todo" });
 */
export function createTask(input: TaskInput): Task {
  const timestamp = new Date().toISOString();
  const task: Task = {
    id: randomUUID(),
    ...input,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  tasks.push(task);
  return task;
}

/**
 * Replaces the editable fields of an existing task.
 *
 * @param id - The task identifier.
 * @param input - Validated replacement fields.
 * @returns The updated task, or undefined.
 * @example const task = updateTask("task-id", { title: "Ship", description: "Done", status: "done" });
 */
export function updateTask(id: string, input: TaskInput): Task | undefined {
  const index = tasks.findIndex((task) => task.id === id);
  const currentTask = tasks[index];

  if (index === -1 || currentTask === undefined) {
    return undefined;
  }

  const updatedTask: Task = {
    ...currentTask,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  tasks[index] = updatedTask;
  return updatedTask;
}

/**
 * Deletes a task by identifier.
 *
 * @param id - The task identifier.
 * @returns True when a task was deleted.
 * @example const deleted = deleteTask("task-id");
 */
export function deleteTask(id: string): boolean {
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return false;
  }

  tasks.splice(index, 1);
  return true;
}

/**
 * Removes all tasks from the in-memory store.
 *
 * @returns Nothing.
 * @example clearTasks();
 */
export function clearTasks(): void {
  tasks.splice(0, tasks.length);
}