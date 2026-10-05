import request from "supertest";
import { createApp } from "../src/app.js";
import type { UserRepository } from "../src/userRepository.js";

describe("GET /users", () => {
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;

  beforeAll(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it("returns all users from the repository", async () => {
    const users = [{ id: "user-1", name: "Ada Lovelace", email: "ada@example.com" }];
    const userRepository: Pick<UserRepository, "findAll"> = {
      findAll: jest.fn().mockReturnValue(users),
    };

    const response = await request(createApp(userRepository)).get("/users");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(users);
    expect(userRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it("returns an empty array when the repository has no users", async () => {
    const userRepository: Pick<UserRepository, "findAll"> = {
      findAll: jest.fn().mockReturnValue([]),
    };

    const response = await request(createApp(userRepository)).get("/users");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns a structured error when the database query fails", async () => {
    const userRepository: Pick<UserRepository, "findAll"> = {
      findAll: jest.fn().mockImplementation(() => {
        throw new Error("Database unavailable");
      }),
    };

    const response = await request(createApp(userRepository)).get("/users");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    });
  });
});