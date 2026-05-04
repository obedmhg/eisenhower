import type { Handler } from '@netlify/functions';
import bcrypt from 'bcryptjs';
import { sql } from './_lib/db';
import { signSession, buildSessionCookie } from './_lib/auth';
import { badRequest, json, methodNotAllowed, serverError } from './_lib/http';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  if (!EMAIL_RE.test(email)) return badRequest('invalid_email');
  if (password.length < 8) return badRequest('password_too_short');
  if (password.length > 200) return badRequest('password_too_long');

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) return json(409, { error: 'email_taken' });

    const hash = await bcrypt.hash(password, 12);
    const inserted = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, ${hash})
      RETURNING id, email
    `;
    const user = inserted[0] as { id: number; email: string };
    const token = signSession({ userId: user.id, email: user.email });

    return json(
      200,
      { user: { id: user.id, email: user.email } },
      { 'set-cookie': buildSessionCookie(token) }
    );
  } catch (err) {
    console.error('signup_error', err);
    return serverError();
  }
};
