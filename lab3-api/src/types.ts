/**
 * Status values accepted by the task API.
 *
 * Valid values are `todo`, `in-progress`, and `done`.
 */
export const taskStatuses = ["todo", "in-progress", "done"] as const;

/**
 * A task's current workflow state.
 *
 * The value must be `todo`, `in-progress`, or `done`.
 */
export type TaskStatus = (typeof taskStatuses)[number];

/**
 * A task stored and returned by the API.
 */
export interface Task {
  /** Unique task identifier represented as a UUID string. */
  id: string;

  /** Non-empty task title. Leading and trailing whitespace is removed; no maximum length is enforced. */
  title: string;

  /** Task details. Empty strings are valid and no maximum length is enforced. */
  description: string;

  /** Workflow state: `todo`, `in-progress`, or `done`. */
  status: TaskStatus;

  /** Creation time as an ISO 8601 UTC timestamp. */
  createdAt: string;

  /** Most recent update time as an ISO 8601 UTC timestamp. */
  updatedAt: string;
}

/**
 * Client-provided fields used to create or fully replace a task.
 */
export interface TaskInput {
  /** Non-empty task title. Leading and trailing whitespace is removed; no maximum length is enforced. */
  title: string;

  /** Task details. Empty strings are valid and no maximum length is enforced. */
  description: string;

  /** Workflow state: `todo`, `in-progress`, or `done`. */
  status: TaskStatus;
}

/**
 * Consistent JSON error payload returned by the API.
 */
export interface ErrorResponse {
  /** Information describing the request failure. */
  error: {
    /** Stable machine-readable error identifier, such as `VALIDATION_ERROR`. */
    code: string;

    /** Human-readable description of the failure. */
    message: string;

    /** Zero or more validation messages; present only when additional error context is available. */
    details?: string[];
  };
}