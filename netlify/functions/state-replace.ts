import type { Handler } from '@netlify/functions';
import { sql } from './_lib/db';
import { sessionFromRequest } from './_lib/auth';
import { badRequest, json, methodNotAllowed, unauthorized, serverError } from './_lib/http';

const QUADRANTS = new Set([
  'urgent-important',
  'urgent-not-important',
  'not-urgent-important',
  'not-urgent-not-important',
]);

interface Task {
  id: number;
  text: string;
  quadrant: string;
  completed: boolean;
  hours?: number;
}

interface SavedMatrix {
  id: number;
  title: string;
  tasks: Task[];
}

function validTask(t: any): t is Task {
  if (
    !t ||
    typeof t.id !== 'number' ||
    !Number.isFinite(t.id) ||
    typeof t.text !== 'string' ||
    t.text.length > 2000 ||
    typeof t.quadrant !== 'string' ||
    !QUADRANTS.has(t.quadrant) ||
    typeof t.completed !== 'boolean'
  ) {
    return false;
  }
  if (t.hours !== undefined && t.hours !== null) {
    if (typeof t.hours !== 'number' || !Number.isFinite(t.hours) || t.hours < 0) {
      return false;
    }
  }
  return true;
}

function validMatrix(m: any): m is SavedMatrix {
  return (
    m &&
    typeof m.id === 'number' &&
    Number.isFinite(m.id) &&
    typeof m.title === 'string' &&
    m.title.length <= 200 &&
    Array.isArray(m.tasks) &&
    m.tasks.every(validTask)
  );
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'PUT') return methodNotAllowed();
  const session = sessionFromRequest(event.headers as Record<string, string | undefined>);
  if (!session) return unauthorized();

  let body: { tasks?: unknown; savedMatrices?: unknown };
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return badRequest('invalid_json');
  }

  const tasks = Array.isArray(body.tasks) ? body.tasks : [];
  const matrices = Array.isArray(body.savedMatrices) ? body.savedMatrices : [];

  if (tasks.length > 10000) return badRequest('too_many_tasks');
  if (matrices.length > 1000) return badRequest('too_many_matrices');
  if (!tasks.every(validTask)) return badRequest('invalid_task');
  if (!matrices.every(validMatrix)) return badRequest('invalid_matrix');

  const userId = session.userId;

  try {
    await sql`DELETE FROM tasks WHERE user_id = ${userId}`;
    await sql`DELETE FROM saved_matrices WHERE user_id = ${userId}`;

    for (const t of tasks as Task[]) {
      const hours = t.hours === undefined || t.hours === null ? null : t.hours;
      await sql`
        INSERT INTO tasks (id, user_id, text, quadrant, completed, hours)
        VALUES (${t.id}, ${userId}, ${t.text}, ${t.quadrant}, ${t.completed}, ${hours})
      `;
    }
    for (const m of matrices as SavedMatrix[]) {
      await sql`
        INSERT INTO saved_matrices (id, user_id, title, tasks)
        VALUES (${m.id}, ${userId}, ${m.title}, ${JSON.stringify(m.tasks)})
      `;
    }

    return json(200, { ok: true, taskCount: tasks.length, matrixCount: matrices.length });
  } catch (err) {
    console.error('state_replace_error', err);
    return serverError();
  }
};
