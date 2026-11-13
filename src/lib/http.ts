import "server-only";

import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireIdentity } from "../../cursor/identity";
import { sql } from "@/lib/db";
import type { SessionUser } from "@/lib/types";

const privateCache = { "cache-control": "private, no-store" };

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status, headers: privateCache });
}

export function fail(status: number, code: string, message: string) {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: privateCache },
  );
}

type Viewer =
  | { user: SessionUser; response: null; subject: string }
  | { user: null; response: Response; subject: string | null };

export async function requirePerson(request: Request): Promise<
  | { identity: Extract<Awaited<ReturnType<typeof requireIdentity>>, { kind: "person" }>; subject: string; response: null }
  | { identity: null; subject: null; response: Response }
> {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) {
    return { identity: null, subject: null, response: identity };
  }
  if (identity.kind !== "person") {
    return {
      identity: null,
      subject: null,
      response: fail(403, "FORBIDDEN", "Esta área es solo para personas."),
    };
  }
  return {
    identity,
    subject: `${identity.stage}:${identity.sub}`,
    response: null,
  };
}

function profileEmail(subject: string, email: string) {
  const normalized = email.trim().toLowerCase();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return normalized;
  const suffix = subject.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 48);
  return `visitante-${suffix || "local"}@llama-eterna.local`;
}

export async function requireUser(request: Request): Promise<Viewer> {
  const person = await requirePerson(request);
  if (!person.identity) {
    return { user: null, response: person.response, subject: null };
  }
  const subject = person.subject;
  const existing = await sql<SessionUser>(
    `select id, name, email from users where cursor_sub = $1`,
    [subject],
  );
  if (existing[0]) {
    return { user: existing[0], response: null, subject };
  }

  const name = person.identity.name.trim() || null;
  let email = profileEmail(subject, person.identity.email);
  const taken = await sql<{ cursor_sub: string | null }>(
    `select cursor_sub from users where email = $1`,
    [email],
  );
  if (taken[0] && taken[0].cursor_sub !== subject) {
    email = profileEmail(subject, "");
  }

  try {
    const created = await sql<SessionUser>(
      `insert into users (id, name, email, role, cursor_sub)
       values ($1, $2, $3, 'member', $4)
       returning id, name, email`,
      [randomUUID(), name, email, subject],
    );
    return { user: created[0], response: null, subject };
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { code?: string }).code
        : undefined;
    if (code !== "23505") throw error;
    const again = await sql<SessionUser>(
      `select id, name, email from users where cursor_sub = $1`,
      [subject],
    );
    if (again[0]) return { user: again[0], response: null, subject };
    return {
      user: null,
      response: fail(409, "EMAIL_IN_USE", "No se pudo abrir la sesión."),
      subject,
    };
  }
}
