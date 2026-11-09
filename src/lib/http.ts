import "server-only";

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

export async function requireUser(request: Request): Promise<Viewer> {
  const person = await requirePerson(request);
  if (!person.identity) {
    return { user: null, response: person.response, subject: null };
  }
  const rows = await sql<SessionUser>(
    `select id, name, email from users where cursor_sub = $1`,
    [person.subject],
  );
  const user = rows[0];
  if (!user) {
    return {
      user: null,
      response: fail(401, "PROFILE_REQUIRED", "Elige un correo para entrar"),
      subject: person.subject,
    };
  }
  return { user, response: null, subject: person.subject };
}
