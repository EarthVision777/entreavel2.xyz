import { fail, ok, requireUser } from "@/lib/http";
import { sql } from "@/lib/db";

export async function PATCH(request: Request) {
  const auth = await requireUser(request);
  if (!auth.user) return auth.response;

  let body: { name?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const name = String(body.name ?? "").trim();
  if (!name || name.length > 80) {
    return fail(400, "VALIDATION", "Por favor, ingresa tu nombre");
  }

  const rows = await sql<{ id: string; name: string | null; email: string }>(
    `update users set name = $1 where id = $2 returning id, name, email`,
    [name, auth.user.id],
  );
  return ok(rows[0]);
}
