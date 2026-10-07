export function json(data: unknown, status = 200): Response {
  const body = JSON.stringify(data);
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export function notFound(message = "Not Found"): Response {
  return json({ error: message }, 404);
}

export function badRequest(message: string): Response {
  return json({ error: message }, 400);
}

export function serverError(message = "Internal Server Error"): Response {
  return json({ error: message }, 500);
}
