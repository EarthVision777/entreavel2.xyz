import { sql } from "@/lib/db";
import { fail, ok, requireUser } from "@/lib/http";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; commentId: string }> },
) {
  const auth = await requireUser(request);
  if (!auth.user) return auth.response;
  const { id, commentId } = await context.params;
  const rows = await sql<{ user_id: string }>(
    "select user_id from comments where id = $1 and post_id = $2",
    [commentId, id],
  );
  const comment = rows[0];
  if (!comment) return fail(404, "NOT_FOUND", "Comentario no encontrado");
  if (comment.user_id !== auth.user.id) {
    return fail(
      403,
      "FORBIDDEN",
      "No tienes autorización para eliminar este comentario",
    );
  }
  await sql("delete from comments where id = $1", [commentId]);
  return ok(null);
}
