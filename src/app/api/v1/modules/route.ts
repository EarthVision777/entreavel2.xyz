import { listCatalog, presentModule } from "@/lib/catalog";
import { ok, requireUser } from "@/lib/http";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.user) return auth.response;
  const modules = listCatalog()
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((module) => presentModule(module));
  return ok(modules);
}
