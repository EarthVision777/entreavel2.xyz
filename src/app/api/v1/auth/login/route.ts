import { randomBytes, randomUUID } from "node:crypto";
import { ownerEmail } from "@/lib/config";
import { sql } from "@/lib/db";
import { fail, ok } from "@/lib/http";

export async function POST(request: Request) {
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

  const existing = await sql<{
    id: string;
    name: string | null;
    email: string;
  }>("select id, name, email from users where email = $1", [email]);

  let user = existing[0];
  if (!user) {
    const id = randomUUID();
    const role = email === ownerEmail ? "owner" : "member";
    const created = await sql<{
      id: string;
      name: string | null;
      email: string;
    }>(
      `insert into users (id, email, role)
       values ($1, $2, $3)
       returning id, name, email`,
      [id, email, role],
    );
    user = created[0];
  }

  const token = randomBytes(32).toString("hex");
  await sql("insert into sessions (token, user_id) values ($1, $2)", [
    token,
    user.id,
  ]);

  return ok({ token, user });
}
