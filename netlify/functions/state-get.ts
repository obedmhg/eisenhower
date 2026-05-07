import type { Handler } from '@netlify/functions';
import { sql } from './_lib/db';
import { sessionFromRequest } from './_lib/auth';
import { json, methodNotAllowed, unauthorized, serverError } from './_lib/http';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return methodNotAllowed();
  const session = sessionFromRequest(event.headers as Record<string, string | undefined>);
  if (!session) return unauthorized();

  try {
    const tasks = await sql`
      SELECT id, text, quadrant, completed, hours
      FROM tasks
      WHERE user_id = ${session.userId}
      ORDER BY id ASC
    `;
    const matrices = await sql`
      SELECT id, title, tasks
      FROM saved_matrices
      WHERE user_id = ${session.userId}
      ORDER BY id ASC
    `;
    return json(200, {
      tasks: tasks.map((t: any) => {
        const out: any = {
          id: Number(t.id),
          text: t.text,
          quadrant: t.quadrant,
          completed: t.completed,
        };
        if (t.hours !== null && t.hours !== undefined) out.hours = Number(t.hours);
        return out;
      }),
      savedMatrices: matrices.map((m: any) => ({
        id: Number(m.id),
        title: m.title,
        tasks: m.tasks,
      })),
    });
  } catch (err) {
    console.error('state_get_error', err);
    return serverError();
  }
};
