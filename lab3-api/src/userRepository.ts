import type Database from "better-sqlite3";

export interface User {
  id: string;
  name: string;
  email: string;
}

export class UserRepository {
  public constructor(private readonly database: Database.Database) {}

  /**
   * Returns all users ordered by name.
   *
   * @returns Every stored user.
   * @throws When the database cannot execute the query.
   */
  public findAll(): User[] {
    return this.database
      .prepare<[], User>(
        `SELECT id, name, email
         FROM users
         ORDER BY name`,
      )
      .all();
  }

  /**
   * Finds a user by their exact email address.
   *
   * @param email - The email address to look up.
   * @returns The matching user, or null when no user has that email address.
   * @throws When the database cannot execute the query.
   */
  public findByEmail(email: string): User | null {
    const user = this.database
      .prepare<[string], User>(
        `SELECT id, name, email
         FROM users
         WHERE email = ?`,
      )
      .get(email);

    return user ?? null;
  }
}