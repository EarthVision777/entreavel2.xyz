import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { fail, ok, requireUser } from "@/lib/http";
import type { Comment } from "@/lib/types";

type CommentRow = {
  id: string;
  content: string;
  createdAt: Date | string;
  isAuthor: boolean;
  authorName: string | null;
  authorEmail: string;
};

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    content: row.content,
    createdAt: new Date(row.createdAt).toISOString(),
    isAuthor: Boolean(row.isAuthor),
    author: {
      name: row.authorName?.trim() || row.authorEmail,
      email: row.authorEmail,
    },
  };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser(request);
  if (!auth.user) return auth.response;
  const { id } = await context.params;
  const rows = await sql<CommentRow>(
    `select c.id, c.content, c.created_at as "createdAt",
            (c.user_id = $2) as "isAuthor",
            u.name as "authorName", u.email as "authorEmail"
     from comments c
     join users u on u.id = c.user_id
     where c.post_id = $1
     order by c.created_at desc`,
    [id, auth.user.id],
  );
  return ok(rows.map(mapComment));
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser(request);
  if (!auth.user) return auth.response;
  const { id } = await context.params;
  const posts = await sql("select id from posts where id = $1", [id]);
  if (!posts[0]) return fail(404, "NOT_FOUND", "Publicación no encontrada");

  let body: { content?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const content = String(body.content ?? "").trim();
  if (!content || content.length > 1000) {
    return fail(400, "VALIDATION", "Escribe un comentario");
  }
  const commentId = randomUUID();
  await sql(
    "insert into comments (id, post_id, user_id, content) values ($1, $2, $3, $4)",
    [commentId, id, auth.user.id, content],
  );
  const rows = await sql<CommentRow>(
    `select c.id, c.content, c.created_at as "createdAt",
            true as "isAuthor",
            u.name as "authorName", u.email as "authorEmail"
     from comments c
     join users u on u.id = c.user_id
     where c.id = $1`,
    [commentId],
  );
  return ok(mapComment(rows[0]), 201);
}
