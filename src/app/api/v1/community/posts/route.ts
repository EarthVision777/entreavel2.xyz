import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { fail, ok, requireUser } from "@/lib/http";
import type { CommunityPost } from "@/lib/types";

type PostRow = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date | string;
  likesCount: number | string;
  commentsCount: number | string;
  likedByMe: boolean;
  isAuthor: boolean;
  authorName: string | null;
  authorEmail: string;
};

function mapPost(row: PostRow): CommunityPost {
  const name = row.authorName?.trim() || row.authorEmail;
  return {
    id: row.id,
    content: row.content,
    imageUrl: row.imageUrl,
    createdAt: new Date(row.createdAt).toISOString(),
    likesCount: Number(row.likesCount),
    commentsCount: Number(row.commentsCount),
    likedByMe: Boolean(row.likedByMe),
    isAuthor: Boolean(row.isAuthor),
    author: { name, email: row.authorEmail },
  };
}

const selectPosts = `
  select
    p.id,
    p.content,
    p.image_url as "imageUrl",
    p.created_at as "createdAt",
    (select count(*)::int from likes l where l.post_id = p.id) as "likesCount",
    (select count(*)::int from comments c where c.post_id = p.id) as "commentsCount",
    exists(select 1 from likes l where l.post_id = p.id and l.user_id = $1) as "likedByMe",
    (p.user_id = $1) as "isAuthor",
    u.name as "authorName",
    u.email as "authorEmail"
  from posts p
  join users u on u.id = p.user_id
`;

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.user) return auth.response;
  const rows = await sql<PostRow>(
    `${selectPosts} order by p.created_at desc`,
    [auth.user.id],
  );
  return ok(rows.map(mapPost));
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.user) return auth.response;
  let body: { content?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const content = String(body.content ?? "").trim();
  if (!content || content.length > 2000) {
    return fail(400, "VALIDATION", "Escribe un mensaje para publicar");
  }
  const id = randomUUID();
  await sql(
    "insert into posts (id, user_id, content) values ($1, $2, $3)",
    [id, auth.user.id, content],
  );
  const rows = await sql<PostRow>(`${selectPosts} where p.id = $2`, [
    auth.user.id,
    id,
  ]);
  return ok(mapPost(rows[0]), 201);
}
