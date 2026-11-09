import { sql } from "@/lib/db";
import { fail, ok, requireUser } from "@/lib/http";
import type { SessionUser } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.user) return auth.response;
  return ok(auth.user);
}

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

  const rows = await sql<SessionUser>(
    `update users set name = $1 where id = $2 and cursor_sub = $3 returning id, name, email`,
    [name, auth.user.id, auth.subject],
  );
  return ok(rows[0]);
}

export async function DELETE(request: Request) {
  const auth = await requireUser(request);
  if (!auth.user) return auth.response;
  await sql(`delete from users where id = $1 and cursor_sub = $2`, [
    auth.user.id,
    auth.subject,
  ]);
  return ok(null);
}
