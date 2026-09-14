import request from "supertest";
import type { TaskInput } from "../src/types.js";
import { app, createTestTask, expectValidationError, validTaskInput } from "./setup.js";

describe("health endpoint", () => {
  it("returns the service health", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("task CRUD endpoints", () => {
  it("creates a task", async () => {
    const response = await createTestTask();

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(validTaskInput);
    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.createdAt).toEqual(expect.any(String));
    expect(response.body.updatedAt).toBe(response.body.createdAt);
    expect(new Date(response.body.createdAt).toISOString()).toBe(response.body.createdAt);
  });

  it("lists all tasks", async () => {
    const firstTask = await createTestTask({ title: "First task" });
    const secondTask = await createTestTask({ title: "Second task", status: "in-progress" });

    const response = await request(app).get("/tasks");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([firstTask.body, secondTask.body]);
  });

  it("gets a task by ID", async () => {
    const createdTask = await createTestTask();

    const response = await request(app).get(`/tasks/${createdTask.body.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(createdTask.body);
  });

  it("fully updates a task", async () => {
    const createdTask = await createTestTask();
    const update: TaskInput = {
      title: "Updated title",
      description: "Updated description",
      status: "done",
    };

    const response = await request(app).put(`/tasks/${createdTask.body.id}`).send(update);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: createdTask.body.id, ...update });
    expect(response.body.createdAt).toBe(createdTask.body.createdAt);
    expect(new Date(response.body.updatedAt).toISOString()).toBe(response.body.updatedAt);
  });

  it("deletes a task", async () => {
    const createdTask = await createTestTask();

    const deleteResponse = await request(app).delete(`/tasks/${createdTask.body.id}`);
    const getResponse = await request(app).get(`/tasks/${createdTask.body.id}`);

    expect(deleteResponse.status).toBe(204);
    expect(deleteResponse.text).toBe("");
    expect(getResponse.status).toBe(404);
  });
});

describe("task validation", () => {
  it.each([
    ["title", { description: "Description", status: "todo" }, "title must be a non-empty string"],
    ["description", { title: "Title", status: "todo" }, "description must be a string"],
    [
      "status",
      { title: "Title", description: "Description" },
      "status must be one of: todo, in-progress, done",
    ],
  ])("rejects a missing %s", async (_field, body, expectedDetail) => {
    const response = await request(app).post("/tasks").send(body);

    expectValidationError(response, expectedDetail);
  });

  it.each([
    ["title", { ...validTaskInput, title: 42 }, "title must be a non-empty string"],
    ["description", { ...validTaskInput, description: false }, "description must be a string"],
    ["status", { ...validTaskInput, status: "blocked" }, "status must be one of"],
  ])("rejects an invalid %s type or value", async (_field, body, expectedDetail) => {
    const response = await request(app).post("/tasks").send(body);

    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([expect.stringContaining(expectedDetail)]),
    );
  });

  it.each(["", "   "])("rejects an empty title %#", async (title) => {
    const response = await request(app).post("/tasks").send({ ...validTaskInput, title });

    expectValidationError(response, "title must be a non-empty string");
  });

  it("accepts a very long description", async () => {
    const description = "x".repeat(50_000);

    const response = await createTestTask({ description });

    expect(response.status).toBe(201);
    expect(response.body.description).toBe(description);
  });

  it("rejects an invalid update without changing the task", async () => {
    const createdTask = await createTestTask();

    const updateResponse = await request(app)
      .put(`/tasks/${createdTask.body.id}`)
      .send({ ...validTaskInput, title: "" });
    const getResponse = await request(app).get(`/tasks/${createdTask.body.id}`);

    expectValidationError(updateResponse, "title must be a non-empty string");
    expect(getResponse.body).toEqual(createdTask.body);
  });
});

describe("missing resources", () => {
  const missingId = "00000000-0000-4000-8000-000000000000";

  it.each([
    ["GET", () => request(app).get(`/tasks/${missingId}`)],
    ["PUT", () => request(app).put(`/tasks/${missingId}`).send(validTaskInput)],
    ["DELETE", () => request(app).delete(`/tasks/${missingId}`)],
  ])("returns 404 for %s on a non-existent task", async (_method, makeRequest) => {
    const response = await makeRequest();

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "TASK_NOT_FOUND",
        message: "Task not found",
      },
    });
  });
});