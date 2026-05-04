export function json(status: number, body: unknown, extraHeaders: Record<string, string> = {}) {
  return {
    statusCode: status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
    body: JSON.stringify(body),
  };
}

export function methodNotAllowed() {
  return json(405, { error: 'method_not_allowed' });
}

export function unauthorized() {
  return json(401, { error: 'unauthorized' });
}

export function badRequest(msg = 'bad_request') {
  return json(400, { error: msg });
}

export function serverError(msg = 'server_error') {
  return json(500, { error: msg });
}
