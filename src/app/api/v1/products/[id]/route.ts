import { findProduct, presentModule } from "@/lib/catalog";
import { fail, ok, requireUser } from "@/lib/http";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser(request);
  if (!auth.user) return auth.response;
  const { id } = await context.params;
  const found = findProduct(id);
  if (!found) return fail(404, "NOT_FOUND", "Archivo no encontrado");
  const entry = presentModule(auth.user, found.module);
  if (!entry.hasAccess) {
    return fail(403, "FORBIDDEN", "No tienes acceso a este producto");
  }
  return ok(found.product);
}
