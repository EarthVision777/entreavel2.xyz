import { sql } from "@/lib/db";
import { fail, ok, requireUser } from "@/lib/http";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser(request);
  if (!auth.user) return auth.response;
  const { id } = await context.params;
  const posts = await sql("select id from posts where id = $1", [id]);
  if (!posts[0]) return fail(404, "NOT_FOUND", "Publicación no encontrada");

  const existing = await sql(
    "select 1 from likes where post_id = $1 and user_id = $2",
    [id, auth.user.id],
  );
  if (existing[0]) {
    await sql("delete from likes where post_id = $1 and user_id = $2", [
      id,
      auth.user.id,
    ]);
  } else {
    await sql("insert into likes (post_id, user_id) values ($1, $2)", [
      id,
      auth.user.id,
    ]);
  }
  const counts = await sql<{ count: number | string }>(
    "select count(*)::int as count from likes where post_id = $1",
    [id],
  );
  return ok({
    liked: !existing[0],
    likesCount: Number(counts[0]?.count ?? 0),
  });
}
