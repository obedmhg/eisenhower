import jwt from 'jsonwebtoken';

function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET not set');
  return s;
}

const COOKIE_NAME = 'eh_session';
const TOKEN_TTL = '30d';

export interface SessionPayload {
  userId: number;
  email: string;
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: TOKEN_TTL });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret()) as unknown as SessionPayload & {
      iat: number;
      exp: number;
    };
    return { userId: decoded.userId, email: decoded.email };
  } catch {
    return null;
  }
}

export function readCookie(headers: Record<string, string | undefined>, name: string): string | null {
  const raw = headers.cookie || headers.Cookie;
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

export function sessionFromRequest(headers: Record<string, string | undefined>): SessionPayload | null {
  const token = readCookie(headers, COOKIE_NAME);
  if (!token) return null;
  return verifySession(token);
}

export function buildSessionCookie(token: string): string {
  const maxAge = 60 * 60 * 24 * 30;
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function buildClearCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export const COOKIE = COOKIE_NAME;
