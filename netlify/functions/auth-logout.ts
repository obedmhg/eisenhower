import type { Handler } from '@netlify/functions';
import { buildClearCookie } from './_lib/auth';
import { json, methodNotAllowed } from './_lib/http';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  return json(200, { ok: true }, { 'set-cookie': buildClearCookie() });
};
