import { sql } from "@/lib/db";
import { fail, ok, requireUser } from "@/lib/http";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser(request);
  if (!auth.user) return auth.response;
  const { id } = await context.params;
  const rows = await sql<{ user_id: string }>(
    "select user_id from posts where id = $1",
    [id],
  );
  const post = rows[0];
  if (!post) return fail(404, "NOT_FOUND", "Publicación no encontrada");
  if (post.user_id !== auth.user.id) {
    return fail(
      403,
      "FORBIDDEN",
      "No tienes autorización para eliminar esta publicación",
    );
  }
  await sql("delete from posts where id = $1", [id]);
  return ok(null);
}
