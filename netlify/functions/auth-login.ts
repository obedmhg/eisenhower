import type { Handler } from '@netlify/functions';
import bcrypt from 'bcryptjs';
import { sql } from './_lib/db';
import { signSession, buildSessionCookie } from './_lib/auth';
import { badRequest, json, methodNotAllowed, serverError, unauthorized } from './_lib/http';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  let body: { email?: string; password?: string };
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return badRequest('invalid_json');
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  if (!email || !password) return badRequest('missing_credentials');

  try {
    const rows = await sql`SELECT id, email, password_hash FROM users WHERE email = ${email} LIMIT 1`;
    if (rows.length === 0) return unauthorized();

    const user = rows[0] as { id: number; email: string; password_hash: string };
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return unauthorized();

    const token = signSession({ userId: user.id, email: user.email });
    return json(
      200,
      { user: { id: user.id, email: user.email } },
      { 'set-cookie': buildSessionCookie(token) }
    );
  } catch (err) {
    console.error('login_error', err);
    return serverError();
  }
};
