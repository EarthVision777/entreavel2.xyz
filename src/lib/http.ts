import "server-only";

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Account } from "@/lib/types";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function currentUser(request: Request): Promise<Account | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const rows = await sql<Account>(
    `select u.id, u.name, u.email, u.role
     from sessions s
     join users u on u.id = s.user_id
     where s.token = $1`,
    [token],
  );
  return rows[0] ?? null;
}

export async function requireUser(request: Request) {
  const user = await currentUser(request);
  if (!user) {
    return {
      user: null,
      response: fail(401, "UNAUTHORIZED", "Inicio de sesión requerido"),
    };
  }
  return { user, response: null };
}
