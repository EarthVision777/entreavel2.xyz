import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { fail, ok, requirePerson } from "@/lib/http";
import type { SessionUser } from "@/lib/types";

export const dynamic = "force-dynamic";

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export async function POST(request: Request) {
  const person = await requirePerson(request);
  if (!person.identity) return person.response;

  let body: { email?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail(
      400,
      "VALIDATION",
      "Por favor, ingresa un correo electrónico válido",
    );
  }

  const subject = person.subject;
  const mine = await sql<SessionUser>(
    `select id, name, email from users where cursor_sub = $1`,
    [subject],
  );
  const taken = await sql<{ id: string; cursor_sub: string | null }>(
    `select id, cursor_sub from users where email = $1`,
    [email],
  );
  const other = taken[0];
  if (other && other.cursor_sub && other.cursor_sub !== subject) {
    return fail(409, "EMAIL_IN_USE", "Ese correo ya está en uso. Elige otro.");
  }
  if (other && !other.cursor_sub && other.id !== mine[0]?.id) {
    return fail(409, "EMAIL_IN_USE", "Ese correo ya está en uso. Elige otro.");
  }

  const current = mine[0];
  const name = current?.name ?? (person.identity.name.trim() || null);
  try {
    if (current) {
      const rows = await sql<SessionUser>(
        `update users set email = $1 where id = $2 returning id, name, email`,
        [email, current.id],
      );
      return ok(rows[0]);
    }
    const rows = await sql<SessionUser>(
      `insert into users (id, name, email, role, cursor_sub)
       values ($1, $2, $3, 'member', $4)
       returning id, name, email`,
      [randomUUID(), name, email, subject],
    );
    return ok(rows[0]);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return fail(409, "EMAIL_IN_USE", "Ese correo ya está en uso. Elige otro.");
    }
    throw error;
  }
}
