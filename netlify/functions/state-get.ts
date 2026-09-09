import type { Handler } from '@netlify/functions';
import { sessionFromRequest } from './_lib/auth';
import { json, methodNotAllowed, unauthorized, serverError } from './_lib/http';
import { loadSnapshot } from './_lib/state';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return methodNotAllowed();
  const session = sessionFromRequest(event.headers as Record<string, string | undefined>);
  if (!session) return unauthorized();

  try {
    return json(200, await loadSnapshot(session.userId));
  } catch (err) {
    console.error('state_get_error', err);
    return serverError();
  }
};
