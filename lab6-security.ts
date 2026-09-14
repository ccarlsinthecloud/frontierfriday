import Database from 'better-sqlite3';
import type { Application } from 'express';

export interface SearchUsersRequest {
	query: {
		term?: string | string[];
	};
}

export interface JsonResponse {
	type(type: string): JsonResponse;
	status(code: number): JsonResponse;
	json(body: unknown): void;
}

export interface User {
	id: number;
	name: string;
	email: string;
}

/**
 * Registers the user search endpoint on an Express application.
 *
 * @param app - Express application receiving the route.
 * @param database - Open better-sqlite3 database connection.
 */
export function registerUserSearchEndpoint(
	app: Application,
	database: Database.Database,
): void {
	app.get('/api/users/search', (request, response) => {
		const q = request.query.q;
		const term = typeof q === 'string' ? q : undefined;

		searchUsers({ query: { term } }, response, database);
	});
}

/**
 * Finds users whose name or email contains the request's `term` query value.
 *
 * @param request - Web request containing the search term in `query.term`.
 * @param response - Web response used to return JSON.
 * @param database - Open better-sqlite3 database connection.
 */
export function searchUsers(
	request: SearchUsersRequest,
	response: JsonResponse,
	database: Database.Database,
): void {
	const term = request.query.term;
	response.type('application/json');

	if (typeof term !== 'string' || term.trim().length === 0) {
		response.status(400).json({ error: 'A non-empty search term is required.' });
		return;
	}

	const escapedTerm = term.trim().replace(/[\\%_]/g, '\\$&');
	const pattern = `%${escapedTerm}%`;

	try {
		const users = database
			.prepare<[string, string], User>(
				`SELECT id, name, email
				 FROM users
				 WHERE name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\'
				 ORDER BY name`,
			)
			.all(pattern, pattern);

		response.status(200).json(users);
	} catch {
		response.status(500).json({ error: 'Unable to search users.' });
	}
}
