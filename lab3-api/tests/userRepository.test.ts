import Database from "better-sqlite3";
import { UserRepository } from "../src/userRepository.js";

describe("UserRepository.findAll", () => {
  it("returns all users ordered by name", () => {
    const database = new Database(":memory:");
    database.exec(`
      CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE);
      INSERT INTO users (id, name, email) VALUES
        ('user-2', 'Grace Hopper', 'grace@example.com'),
        ('user-1', 'Ada Lovelace', 'ada@example.com');
    `);

    expect(new UserRepository(database).findAll()).toEqual([
      { id: "user-1", name: "Ada Lovelace", email: "ada@example.com" },
      { id: "user-2", name: "Grace Hopper", email: "grace@example.com" },
    ]);
    database.close();
  });

  it("returns an empty array when there are no users", () => {
    const database = new Database(":memory:");
    database.exec(
      "CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE)",
    );

    expect(new UserRepository(database).findAll()).toEqual([]);
    database.close();
  });

  it("throws when the database query fails", () => {
    const database = new Database(":memory:");
    const repository = new UserRepository(database);

    expect(() => repository.findAll()).toThrow();
    database.close();
  });
});

describe("UserRepository.findByEmail", () => {
  let database: Database.Database;
  let repository: UserRepository;

  beforeEach(() => {
    database = new Database(":memory:");
    database.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
      );
      INSERT INTO users (id, name, email)
      VALUES ('user-1', 'Ada Lovelace', 'ada@example.com');
    `);
    repository = new UserRepository(database);
  });

  afterEach(() => {
    database.close();
  });

  it("returns the user with the requested email", () => {
    expect(repository.findByEmail("ada@example.com")).toEqual({
      id: "user-1",
      name: "Ada Lovelace",
      email: "ada@example.com",
    });
  });

  it("returns null when the email does not exist", () => {
    expect(repository.findByEmail("missing@example.com")).toBeNull();
  });

  it("treats SQL syntax in the email as data", () => {
    expect(repository.findByEmail("' OR 1 = 1 --")).toBeNull();
  });
});