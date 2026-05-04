import type { Handler } from '@netlify/functions';
import { sessionFromRequest } from './_lib/auth';
import { json, methodNotAllowed } from './_lib/http';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return methodNotAllowed();
  const session = sessionFromRequest(event.headers as Record<string, string | undefined>);
  if (!session) return json(200, { user: null });
  return json(200, { user: { id: session.userId, email: session.email } });
};
