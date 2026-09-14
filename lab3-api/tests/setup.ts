import request, { type Response } from "supertest";
import { createApp } from "../src/app.js";
import { clearTasks } from "../src/taskStore.js";
import type { TaskInput } from "../src/types.js";

export const app = createApp();

export const validTaskInput: TaskInput = {
  title: "Write API tests",
  description: "Cover the task API with Supertest",
  status: "todo",
};

let consoleLogSpy: jest.SpiedFunction<typeof console.log>;

beforeAll(() => {
  consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
});

beforeEach(() => {
  clearTasks();
});

afterAll(() => {
  consoleLogSpy.mockRestore();
});

/**
 * Creates a task through the public HTTP API.
 *
 * @param overrides - Fields that replace values in the default valid task input.
 * @returns The Supertest response from the create request.
 * @example const response = await createTestTask({ status: "done" });
 */
export async function createTestTask(overrides: Partial<TaskInput> = {}): Promise<Response> {
  return request(app)
    .post("/tasks")
    .send({ ...validTaskInput, ...overrides });
}

/**
 * Asserts the common shape of a validation error response.
 *
 * @param response - The Supertest response to inspect.
 * @param expectedDetail - Validation detail expected in the response.
 * @returns Nothing.
 * @example expectValidationError(response, "title must be a non-empty string");
 */
export function expectValidationError(response: Response, expectedDetail: string): void {
  expect(response.status).toBe(400);
  expect(response.body).toEqual({
    error: {
      code: "VALIDATION_ERROR",
      message: "Invalid task data",
      details: expect.arrayContaining([expectedDetail]),
    },
  });
}